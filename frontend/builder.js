/**
 * 分子构建器模块
 * 允许用户交互式构建分子并验证化学结构
 */

// 构建器状态
let builderMode = false;
let selectedAtomType = null; // 当前选择的原子类型
let selectedAtoms = []; // 用户选择的原子（用于创建化学键）
let builtMolecule = {
    atoms: [],
    bonds: []
}; // 构建的分子数据

// 元素的最大化合价
const MAX_VALENCY = {
    'H': 1,
    'C': 4,
    'N': 3,
    'O': 2,
    'F': 1,
    'P': 5,
    'S': 6,
    'Cl': 1,
    'Br': 1,
    'I': 1
};

// 元素典型成键数 / 化合价绝对值（用于智能键型识别）
const VALENCE_TARGET = {
    'H': 1,
    'O': 2,
    'N': 3,
    'C': 4
};

// 键型对应的键值（用于计算总成键数）
const BOND_ORDER_VALUE = {
    'single': 1,
    'double': 2,
    'triple': 3
};

/**
 * 切换构建模式
 */
function toggleBuilderMode() {
    builderMode = !builderMode;
    const builderControls = document.getElementById('builderControls');
    const toggleBtn = document.getElementById('toggleBuilderMode');
    
    if (builderMode) {
        builderControls.classList.add('active');
        toggleBtn.querySelector('span').textContent = getText('builderModeTextActive');
        showInfo(getText('selectAtomText'), 'info');
        
        // 添加点击监听器
        renderer.domElement.addEventListener('click', onCanvasClick);
    } else {
        builderControls.classList.remove('active');
        toggleBtn.querySelector('span').textContent = getText('builderModeText');
        selectedAtomType = null;
        selectedAtoms = [];
        
        // 移除高亮
        clearAtomHighlights();
        
        // 移除点击监听器
        renderer.domElement.removeEventListener('click', onCanvasClick);
    }
}

/**
 * 选择原子类型（从按钮）
 */
document.addEventListener('DOMContentLoaded', function() {
    // 原子选择按钮
    document.querySelectorAll('.atom-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他按钮的选中状态
            document.querySelectorAll('.atom-btn').forEach(b => b.classList.remove('selected'));
            
            // 设置当前按钮为选中
            this.classList.add('selected');
            selectedAtomType = this.getAttribute('data-element');
            
            showInfo(getText('builderClickToAdd', { element: selectedAtomType }), 'info');
        });
    });
    
    // 创建化学键按钮
    document.getElementById('createBondBtn').addEventListener('click', function() {
        if (selectedAtoms.length !== 2) {
            showInfo(getText('selectTwoAtoms'), 'error');
            return;
        }
        
        createBond(selectedAtoms[0], selectedAtoms[1]);
    });
    
    // 删除原子按钮
    document.getElementById('deleteAtomBtn').addEventListener('click', function() {
        if (selectedAtoms.length === 0) {
            showInfo(getText('selectOneAtom'), 'error');
            return;
        }
        
        deleteAtom(selectedAtoms[0]);
    });
    
    // 清空全部按钮
    document.getElementById('clearAllBtn').addEventListener('click', function() {
        clearAllAtoms();
    });
});

/**
 * 画布点击事件处理
 */
function onCanvasClick(event) {
    if (!builderMode) return;
    
    // 计算鼠标位置
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // 射线检测
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // 检测与原子的交互
    const intersects = raycaster.intersectObjects(atomMeshes);
    
    if (intersects.length > 0) {
        // 点击到了原子
        const clickedMesh = intersects[0].object;
        const atomIndex = clickedMesh.userData.index;
        
        toggleAtomSelection(atomIndex, clickedMesh);
    } else if (selectedAtomType) {
        // 在空白处点击，添加新原子
        addAtomAt3DPosition(mouse, raycaster);
    }
}

/**
 * 在3D空间中添加原子
 */
function addAtomAt3DPosition(mouse, raycaster) {
    // 在相机前方固定距离处创建原子
    const distance = 10;
    const direction = new THREE.Vector3();
    raycaster.ray.direction.clone().normalize();
    
    const position = camera.position.clone().add(
        raycaster.ray.direction.clone().multiplyScalar(distance)
    );
    
    addAtom(selectedAtomType, [position.x, position.y, position.z]);
}

/**
 * 添加原子
 * @param {String} element - 元素符号
 * @param {Array} position - 位置 [x, y, z]
 */
function addAtom(element, position) {
    const atomIndex = builtMolecule.atoms.length;
    
    // 添加到数据结构
    builtMolecule.atoms.push({
        element: element,
        position: position
    });
    
    // 创建视觉对象
    const color = ELEMENT_COLORS[element] || 0xCCCCCC;
    const radius = (ELEMENT_RADII[element] || 0.7) * 0.4;
    
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.4
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.userData = {
        type: 'atom',
        element: element,
        index: atomIndex,
        built: true // 标记为构建模式创建的
    };
    
    moleculeGroup.add(mesh);
    atomMeshes.push(mesh);
    
    showInfo(getText('atomAdded') + ': ' + element, 'success');
    
    // 清除原子类型选择
    selectedAtomType = null;
    document.querySelectorAll('.atom-btn').forEach(b => b.classList.remove('selected'));
}

/**
 * 切换原子选择状态
 */
function toggleAtomSelection(atomIndex, mesh) {
    const existingIndex = selectedAtoms.indexOf(atomIndex);
    
    if (existingIndex >= 0) {
        // 取消选择
        selectedAtoms.splice(existingIndex, 1);
        unhighlightAtom(mesh);
    } else {
        // 选择原子
        if (selectedAtoms.length >= 2) {
            // 如果已经选择了2个原子，取消第一个的选择
            const firstAtomMesh = atomMeshes[selectedAtoms[0]];
            unhighlightAtom(firstAtomMesh);
            selectedAtoms.shift();
        }
        
        selectedAtoms.push(atomIndex);
        highlightAtom(mesh);
    }
    
    showInfo(getText('atomsSelected', { count: selectedAtoms.length }), 'info');
}

/**
 * 高亮原子
 */
function highlightAtom(mesh) {
    mesh.material.emissive = new THREE.Color(0xffff00);
    mesh.material.emissiveIntensity = 0.5;
}

/**
 * 取消高亮原子
 */
function unhighlightAtom(mesh) {
    mesh.material.emissive = new THREE.Color(0x000000);
    mesh.material.emissiveIntensity = 0;
}

/**
 * 清除所有原子高亮
 */
function clearAtomHighlights() {
    atomMeshes.forEach(mesh => {
        unhighlightAtom(mesh);
    });
    selectedAtoms = [];
}

/**
 * 智能调整键型（根据化合价规则）
 * 在已有单键骨架的基础上，根据典型化合价把部分单键升级成双键/三键
 */
function refineBondOrders() {
    if (!builtMolecule.bonds || builtMolecule.bonds.length === 0) {
        return;
    }
    
    const n_atoms = builtMolecule.atoms.length;
    if (n_atoms === 0) return;
    
    // 1. 目标成键数（化合价绝对值）
    const targetValence = builtMolecule.atoms.map(atom => {
        return VALENCE_TARGET[atom.element] || 0;
    });
    
    // 2. 当前成键数：统计每个原子的当前成键数
    const currentValence = new Array(n_atoms).fill(0);
    builtMolecule.bonds.forEach(bond => {
        const order = BOND_ORDER_VALUE[bond.type] || 1;
        currentValence[bond.atom1_idx] += order;
        currentValence[bond.atom2_idx] += order;
    });
    
    // 3. 计算缺口
    const deficit = currentValence.map((current, i) => {
        return Math.max(targetValence[i] - current, 0);
    });
    
    // 4. 迭代升级键阶（最多循环10轮，避免死循环）
    const MAX_ITER = 10;
    for (let iter = 0; iter < MAX_ITER; iter++) {
        let changed = false;
        
        for (let i = 0; i < builtMolecule.bonds.length; i++) {
            const bond = builtMolecule.bonds[i];
            const atom1Idx = bond.atom1_idx;
            const atom2Idx = bond.atom2_idx;
            const order = BOND_ORDER_VALUE[bond.type] || 1;
            
            // 已经是三键了，不能再升
            if (order >= 3) continue;
            
            // 至少两端都有"缺口"，才考虑升级这根键
            if (deficit[atom1Idx] <= 0 || deficit[atom2Idx] <= 0) continue;
            
            // 氢原子不允许形成多键（只允许单键）
            const elem1 = builtMolecule.atoms[atom1Idx].element;
            const elem2 = builtMolecule.atoms[atom2Idx].element;
            if (elem1 === 'H' || elem2 === 'H') continue;
            
            // 升一级：single->double 或 double->triple
            const newOrder = order + 1;
            if (newOrder > 3) continue;
            
            // 实际升级
            if (newOrder === 2) {
                bond.type = 'double';
            } else if (newOrder === 3) {
                bond.type = 'triple';
            }
            
            // 更新当前成键数 & 缺口
            currentValence[atom1Idx] += 1;
            currentValence[atom2Idx] += 1;
            deficit[atom1Idx] = Math.max(targetValence[atom1Idx] - currentValence[atom1Idx], 0);
            deficit[atom2Idx] = Math.max(targetValence[atom2Idx] - currentValence[atom2Idx], 0);
            
            changed = true;
        }
        
        if (!changed) break;
    }
}

/**
 * 创建化学键（智能识别键型）
 * @param {Number} atom1Index - 原子1的索引
 * @param {Number} atom2Index - 原子2的索引
 */
function createBond(atom1Index, atom2Index) {
    const atom1 = builtMolecule.atoms[atom1Index];
    const atom2 = builtMolecule.atoms[atom2Index];
    
    if (!atom1 || !atom2) {
        showInfo(getText('invalidBond'), 'error');
        return;
    }
    
    // 检查是否已存在化学键
    const existingBond = builtMolecule.bonds.find(b =>
        (b.atom1_idx === atom1Index && b.atom2_idx === atom2Index) ||
        (b.atom1_idx === atom2Index && b.atom2_idx === atom1Index)
    );
    
    if (existingBond) {
        showInfo(getText('bondExists'), 'error');
        return;
    }
    
    // 添加化学键（先创建单键）
    builtMolecule.bonds.push({
        atom1_idx: atom1Index,
        atom2_idx: atom2Index,
        type: 'single'
    });
    
    // 智能调整键型（根据化合价规则自动升级为双键/三键）
    refineBondOrders();
    
    // 重新渲染分子
    renderBuiltMolecule();
    
    // 验证分子
    validateMolecule();
    
    // 清除选择
    clearAtomHighlights();
    
    // 显示键型信息
    const finalBond = builtMolecule.bonds[builtMolecule.bonds.length - 1];
    let bondTypeText = '';
    if (finalBond.type === 'double') {
        bondTypeText = ' (双键)';
    } else if (finalBond.type === 'triple') {
        bondTypeText = ' (三键)';
    }
    showInfo(getText('bondCreated') + bondTypeText, 'success');
}

/**
 * 删除原子
 * @param {Number} atomIndex - 原子索引
 */
function deleteAtom(atomIndex) {
    // 删除与该原子相关的所有化学键
    builtMolecule.bonds = builtMolecule.bonds.filter(bond =>
        bond.atom1_idx !== atomIndex && bond.atom2_idx !== atomIndex
    );
    
    // 删除原子
    builtMolecule.atoms.splice(atomIndex, 1);
    
    // 更新所有化学键的索引
    builtMolecule.bonds.forEach(bond => {
        if (bond.atom1_idx > atomIndex) bond.atom1_idx--;
        if (bond.atom2_idx > atomIndex) bond.atom2_idx--;
    });
    
    // 重新渲染
    renderBuiltMolecule();
    
    // 清除选择
    clearAtomHighlights();
    
    showInfo(getText('atomDeleted'), 'success');
}

/**
 * 清空所有原子
 */
function clearAllAtoms() {
    builtMolecule = {
        atoms: [],
        bonds: []
    };
    
    clearMolecule();
    clearAtomHighlights();
    
    showInfo(getText('allCleared'), 'success');
}

/**
 * 渲染构建的分子
 */
function renderBuiltMolecule() {
    clearMolecule();
    
    if (builtMolecule.atoms.length > 0) {
        renderAtoms(builtMolecule.atoms);
        
        if (builtMolecule.bonds.length > 0) {
            renderBonds(builtMolecule.atoms, builtMolecule.bonds);
        }
    }
}

/**
 * 验证分子结构
 * @returns {Boolean} 是否有效
 */
function validateMolecule() {
    if (builtMolecule.atoms.length === 0) return true;
    
    let isValid = true;
    let errors = [];
    
    // 计算每个原子的化合价
    const valencies = new Array(builtMolecule.atoms.length).fill(0);
    
    builtMolecule.bonds.forEach(bond => {
        let bondValue = 1;
        if (bond.type === 'double') bondValue = 2;
        if (bond.type === 'triple') bondValue = 3;
        
        valencies[bond.atom1_idx] += bondValue;
        valencies[bond.atom2_idx] += bondValue;
    });
    
    // 检查每个原子的化合价
    builtMolecule.atoms.forEach((atom, index) => {
        const element = atom.element;
        const maxVal = MAX_VALENCY[element] || 4;
        const currentVal = valencies[index];
        
        if (currentVal > maxVal) {
            isValid = false;
            
            // 高亮问题原子
            if (atomMeshes[index]) {
                atomMeshes[index].material.color.setHex(0xff0000); // 红色
            }
            
            // 生成错误消息
            let errorMsg = '';
            if (element === 'H') {
                errorMsg = getText('hydrogenError');
            } else if (element === 'C') {
                errorMsg = getText('carbonError');
            } else if (element === 'N') {
                errorMsg = getText('nitrogenError');
            } else if (element === 'O') {
                errorMsg = getText('oxygenError');
            } else {
                errorMsg = getText('valencyError', { element: element, max: maxVal });
            }
            
            errors.push(errorMsg);
        } else {
            // 恢复正常颜色
            if (atomMeshes[index]) {
                const normalColor = ELEMENT_COLORS[element] || 0xCCCCCC;
                atomMeshes[index].material.color.setHex(normalColor);
            }
        }
    });
    
    if (!isValid) {
        showInfo(getText('validationError') + ': ' + errors.join('; '), 'error');
    } else {
        showInfo(getText('validationPassed'), 'success');
    }
    
    return isValid;
}

/**
 * 获取射线与平面的交点（用于在3D空间中放置原子）
 */
function getRayPlaneIntersection(raycaster, planeNormal, planePoint) {
    const ray = raycaster.ray;
    const denom = planeNormal.dot(ray.direction);
    
    if (Math.abs(denom) > 0.0001) {
        const t = planePoint.clone().sub(ray.origin).dot(planeNormal) / denom;
        if (t >= 0) {
            return ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
        }
    }
    
    return null;
}

console.log('分子构建器模块已加载');

