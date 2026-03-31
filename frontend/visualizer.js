/**
 * 分子3D可视化模块
 * 使用Three.js进行3D渲染
 */

// 全局变量
let scene, camera, renderer, controls;
let moleculeGroup; // 存储当前分子的所有对象
let atomMeshes = []; // 存储原子网格对象
let bondMeshes = []; // 存储化学键网格对象
let isosurfaceMeshes = {}; // 存储等值面网格对象

// 元素颜色配置（CPK着色方案）
const ELEMENT_COLORS = {
    'H': 0xFFFFFF,  // 白色
    'C': 0x909090,  // 灰色
    'N': 0x3050F8,  // 蓝色
    'O': 0xFF0D0D,  // 红色
    'F': 0x90E050,  // 绿色
    'P': 0xFF8000,  // 橙色
    'S': 0xFFFF30,  // 黄色
    'Cl': 0x1FF01F, // 绿色
    'Br': 0xA62929, // 棕色
    'I': 0x940094,  // 紫色
};

// 元素半径配置（Van der Waals半径，单位：埃）
const ELEMENT_RADII = {
    'H': 0.31,
    'C': 0.76,
    'N': 0.71,
    'O': 0.66,
    'F': 0.64,
    'P': 1.07,
    'S': 1.05,
    'Cl': 1.02,
    'Br': 1.20,
    'I': 1.39,
};

/**
 * 初始化Three.js场景
 */
function initScene() {
    // 获取canvas元素
    const canvas = document.getElementById('canvas3d');
    
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // 创建相机
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 0, 15);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    
    // 添加光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // 创建分子组
    moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    
    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize, false);
    
    // 开始渲染循环
    animate();
    
    console.log('Three.js场景初始化完成');
}

/**
 * 窗口大小变化处理
 */
function onWindowResize() {
    const canvas = document.getElementById('canvas3d');
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

/**
 * 动画循环
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * 清除当前场景中的分子
 */
function clearMolecule() {
    // 移除所有原子
    atomMeshes.forEach(mesh => {
        moleculeGroup.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    atomMeshes = [];
    
    // 移除所有化学键
    bondMeshes.forEach(mesh => {
        moleculeGroup.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    bondMeshes = [];
    
    // 移除所有等值面
    Object.values(isosurfaceMeshes).forEach(mesh => {
        moleculeGroup.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    isosurfaceMeshes = {};
    
    console.log('场景已清除');
}

/**
 * 渲染分子
 * @param {Object} data - 包含atoms、bonds、isosurfaces的数据对象
 */
function renderMolecule(data) {
    console.log('开始渲染分子...', data);
    
    // 清除现有分子
    clearMolecule();
    
    if (!data.atoms || data.atoms.length === 0) {
        console.warn('没有原子数据');
        return;
    }
    
    // 渲染原子
    renderAtoms(data.atoms);
    
    // 渲染化学键
    if (data.bonds && data.bonds.length > 0) {
        renderBonds(data.atoms, data.bonds);
    }
    
    // 渲染等值面
    if (data.isosurfaces) {
        renderIsosurfaces(data.isosurfaces);
    }
    
    // 调整相机视角以适应分子
    fitCameraToMolecule();
    
    console.log(`分子渲染完成: ${atomMeshes.length}个原子, ${bondMeshes.length}个化学键`);
}

/**
 * 渲染原子
 * @param {Array} atoms - 原子数组
 */
function renderAtoms(atoms) {
    atoms.forEach((atom, index) => {
        const element = atom.element;
        const position = atom.position;
        
        // 获取颜色和半径
        const color = ELEMENT_COLORS[element] || 0xCCCCCC;
        const radius = (ELEMENT_RADII[element] || 0.7) * 0.4; // 缩放因子
        
        // 创建球体几何体
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1], position[2]);
        
        // 存储原子信息到userData
        mesh.userData = {
            type: 'atom',
            element: element,
            index: index
        };
        
        moleculeGroup.add(mesh);
        atomMeshes.push(mesh);
    });
}

/**
 * 渲染化学键
 * @param {Array} atoms - 原子数组
 * @param {Array} bonds - 化学键数组
 */
function renderBonds(atoms, bonds) {
    bonds.forEach(bond => {
        const atom1 = atoms[bond.atom1_idx];
        const atom2 = atoms[bond.atom2_idx];
        
        if (!atom1 || !atom2) {
            console.warn('化学键引用的原子不存在:', bond);
            return;
        }
        
        const pos1 = new THREE.Vector3(...atom1.position);
        const pos2 = new THREE.Vector3(...atom2.position);
        
        // 根据键的类型渲染不同数量的圆柱体
        if (bond.type === 'single') {
            createBondCylinder(pos1, pos2, 0.1, 0x808080);
        } else if (bond.type === 'double') {
            // 双键：两条平行的圆柱体
            const offset = 0.15;
            createBondCylinder(pos1, pos2, 0.08, 0x808080, offset);
            createBondCylinder(pos1, pos2, 0.08, 0x808080, -offset);
        } else if (bond.type === 'triple') {
            // 三键：三条平行的圆柱体
            const offset = 0.15;
            createBondCylinder(pos1, pos2, 0.08, 0x808080, 0);
            createBondCylinder(pos1, pos2, 0.08, 0x808080, offset);
            createBondCylinder(pos1, pos2, 0.08, 0x808080, -offset);
        }
    });
}

/**
 * 创建单个化学键圆柱体
 * @param {THREE.Vector3} pos1 - 起点位置
 * @param {THREE.Vector3} pos2 - 终点位置
 * @param {Number} radius - 圆柱体半径
 * @param {Number} color - 颜色
 * @param {Number} offset - 偏移量（用于双键和三键）
 */
function createBondCylinder(pos1, pos2, radius, color, offset = 0) {
    const direction = new THREE.Vector3().subVectors(pos2, pos1);
    const length = direction.length();
    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    
    // 创建圆柱体
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.5
    });
    
    const cylinder = new THREE.Mesh(geometry, material);
    
    // 定位和旋转圆柱体
    cylinder.position.copy(midpoint);
    
    // 如果有偏移，计算偏移方向
    if (offset !== 0) {
        const perpendicular = new THREE.Vector3(1, 0, 0);
        if (Math.abs(direction.dot(perpendicular)) > 0.9) {
            perpendicular.set(0, 1, 0);
        }
        perpendicular.crossVectors(direction, perpendicular).normalize();
        cylinder.position.add(perpendicular.multiplyScalar(offset));
    }
    
    // 旋转圆柱体使其指向正确的方向
    const axis = new THREE.Vector3(0, 1, 0);
    cylinder.quaternion.setFromUnitVectors(axis, direction.normalize());
    
    moleculeGroup.add(cylinder);
    bondMeshes.push(cylinder);
}

/**
 * 渲染等值面
 * @param {Object} isosurfaces - 等值面数据
 */
function renderIsosurfaces(isosurfaces) {
    // 低密度等值面（绿色）
    if (isosurfaces.low_density && isosurfaces.low_density.verts.length > 0) {
        const mesh = createIsosurfaceMesh(
            isosurfaces.low_density.verts,
            isosurfaces.low_density.faces,
            0x00ff00,
            0.2
        );
        mesh.userData = { type: 'isosurface', level: 'low' };
        moleculeGroup.add(mesh);
        isosurfaceMeshes.low_density = mesh;
    }
    
    // 高密度等值面（紫色）
    if (isosurfaces.high_density && isosurfaces.high_density.verts.length > 0) {
        const mesh = createIsosurfaceMesh(
            isosurfaces.high_density.verts,
            isosurfaces.high_density.faces,
            0x8000ff,
            0.3
        );
        mesh.userData = { type: 'isosurface', level: 'high' };
        moleculeGroup.add(mesh);
        isosurfaceMeshes.high_density = mesh;
    }
}

/**
 * 创建等值面网格
 * @param {Array} vertices - 顶点数组
 * @param {Array} faces - 面数组
 * @param {Number} color - 颜色
 * @param {Number} opacity - 透明度
 * @returns {THREE.Mesh} 网格对象
 */
function createIsosurfaceMesh(vertices, faces, color, opacity) {
    const geometry = new THREE.BufferGeometry();
    
    // 转换顶点数据
    const positions = [];
    vertices.forEach(v => {
        positions.push(v[0], v[1], v[2]);
    });
    
    // 转换面数据（索引）
    const indices = [];
    faces.forEach(f => {
        indices.push(f[0], f[1], f[2]);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        metalness: 0.2,
        roughness: 0.8
    });
    
    return new THREE.Mesh(geometry, material);
}

/**
 * 调整相机以适应分子
 */
function fitCameraToMolecule() {
    if (atomMeshes.length === 0) return;
    
    // 计算包围盒
    const box = new THREE.Box3();
    atomMeshes.forEach(mesh => {
        box.expandByObject(mesh);
    });
    
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // 设置相机位置
    const distance = maxDim * 2.5;
    camera.position.set(center.x + distance, center.y + distance * 0.5, center.z + distance);
    camera.lookAt(center);
    
    // 设置控制器目标
    controls.target.copy(center);
    controls.update();
}

/**
 * 重置相机视角
 */
function resetCamera() {
    fitCameraToMolecule();
}

/**
 * 保存截图
 */
function saveScreenshot() {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.download = 'molecule_screenshot.png';
        link.href = URL.createObjectURL(blob);
        link.click();
    });
    console.log('截图已保存');
}

/**
 * 切换等值面可见性
 * @param {String} level - 'low_density' 或 'high_density'
 * @param {Boolean} visible - 是否可见
 */
function toggleIsosurface(level, visible) {
    if (isosurfaceMeshes[level]) {
        isosurfaceMeshes[level].visible = visible;
    }
}

/**
 * 切换原子可见性
 * @param {Boolean} visible - 是否可见
 */
function toggleAtoms(visible) {
    atomMeshes.forEach(mesh => {
        mesh.visible = visible;
    });
}

/**
 * 切换化学键可见性
 * @param {Boolean} visible - 是否可见
 */
function toggleBonds(visible) {
    bondMeshes.forEach(mesh => {
        mesh.visible = visible;
    });
}

// 页面加载完成后初始化场景
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScene);
} else {
    initScene();
}

