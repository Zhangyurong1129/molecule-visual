/**
 * UI交互和多语言支持模块
 */

// 当前语言
let currentLanguage = 'zh';

// 多语言文本
const languages = {
    zh: {
        title: '🧬 分子可视化工具',
        subtitle: 'Molecular Visualization Tool',
        langSwitchText: 'Switch to English',
        loadSectionTitle: '📂 加载分子',
        fileLoadBtnText: '选择分子文件',
        supportedFormatsText: '支持格式: .log, .mol, .cif',
        displaySectionTitle: '👁️ 显示控制',
        showLowDensityLabel: '显示低密度电子云',
        showHighDensityLabel: '显示高密度电子云',
        showAtomsLabel: '显示原子',
        showBondsLabel: '显示化学键',
        builderSectionTitle: '🔨 分子构建器',
        builderModeText: '启用构建模式',
        builderModeTextActive: '退出构建模式',
        selectAtomText: '选择要添加的原子:',
        createBondText: '创建化学键',
        deleteAtomText: '删除选中原子',
        clearAllText: '清空全部',
        actionsSectionTitle: '⚡ 操作',
        screenshotText: '📷 保存截图 (按S键)',
        resetViewText: '🔄 重置视角',
        infoSectionTitle: 'ℹ️ 信息',
        hintTitle: '💡 操作提示',
        hint1: '左键拖拽：旋转视图',
        hint2: '滚轮：缩放',
        hint3: '右键拖拽：平移',
        hint4: '按S键：保存截图',
        loadingText: '正在加载...',
        errorLoad: '加载文件时出错',
        errorParse: '解析文件失败',
        successLoad: '文件加载成功！',
        moleculeInfo: '原子数: {atoms}, 化学键数: {bonds}',
        validationError: '分子结构验证失败',
        atomAdded: '已添加原子',
        bondCreated: '化学键已创建',
        selectTwoAtoms: '请选择两个原子来创建化学键',
        selectOneAtom: '请选择一个原子',
        bondExists: '化学键已存在',
        invalidBond: '无效的化学键',
        atomDeleted: '原子已删除',
        allCleared: '场景已清空',
        atomsSelected: '已选择 {count} 个原子',
        validationPassed: '分子结构验证通过',
        builderClickToAdd: '点击场景添加 {element} 原子',
        valencyError: '{element}原子的化合价超过限制（最大{max}）',
        hydrogenError: '氢原子只能形成一个化学键',
        carbonError: '碳原子最多形成4个化学键',
        nitrogenError: '氮原子最多形成3个化学键',
        oxygenError: '氧原子最多形成2个化学键'
    },
    en: {
        title: '🧬 Molecular Visualizer',
        subtitle: '分子可视化工具',
        langSwitchText: '切换到中文',
        loadSectionTitle: '📂 Load Molecule',
        fileLoadBtnText: 'Choose Molecule File',
        supportedFormatsText: 'Supported: .log, .mol, .cif',
        displaySectionTitle: '👁️ Display Control',
        showLowDensityLabel: 'Show Low Density Cloud',
        showHighDensityLabel: 'Show High Density Cloud',
        showAtomsLabel: 'Show Atoms',
        showBondsLabel: 'Show Bonds',
        builderSectionTitle: '🔨 Molecule Builder',
        builderModeText: 'Enable Builder Mode',
        builderModeTextActive: 'Exit Builder Mode',
        selectAtomText: 'Select atom to add:',
        createBondText: 'Create Bond',
        deleteAtomText: 'Delete Selected Atom',
        clearAllText: 'Clear All',
        actionsSectionTitle: '⚡ Actions',
        screenshotText: '📷 Save Screenshot (Press S)',
        resetViewText: '🔄 Reset View',
        infoSectionTitle: 'ℹ️ Information',
        hintTitle: '💡 Controls',
        hint1: 'Left Click Drag: Rotate',
        hint2: 'Scroll: Zoom',
        hint3: 'Right Click Drag: Pan',
        hint4: 'Press S: Screenshot',
        loadingText: 'Loading...',
        errorLoad: 'Error loading file',
        errorParse: 'Failed to parse file',
        successLoad: 'File loaded successfully!',
        moleculeInfo: 'Atoms: {atoms}, Bonds: {bonds}',
        validationError: 'Molecule structure validation failed',
        atomAdded: 'Atom added',
        bondCreated: 'Bond created',
        selectTwoAtoms: 'Please select two atoms to create a bond',
        selectOneAtom: 'Please select one atom',
        bondExists: 'Bond already exists',
        invalidBond: 'Invalid bond',
        atomDeleted: 'Atom deleted',
        allCleared: 'Scene cleared',
        atomsSelected: '{count} atom(s) selected',
        validationPassed: 'Molecule structure validation passed',
        builderClickToAdd: 'Click scene to add {element} atom',
        valencyError: '{element} atom exceeds valency limit (max {max})',
        hydrogenError: 'Hydrogen can only form one bond',
        carbonError: 'Carbon can form at most 4 bonds',
        nitrogenError: 'Nitrogen can form at most 3 bonds',
        oxygenError: 'Oxygen can form at most 2 bonds'
    }
};

/**
 * 设置语言
 * @param {String} lang - 'zh' 或 'en'
 */
function setLanguage(lang) {
    currentLanguage = lang;
    const texts = languages[lang];
    
    // 更新所有文本元素
    document.getElementById('title').textContent = texts.title;
    document.getElementById('subtitle').textContent = texts.subtitle;
    document.getElementById('langSwitchText').textContent = texts.langSwitchText;
    document.getElementById('loadSectionTitle').textContent = texts.loadSectionTitle;
    document.getElementById('fileLoadBtnText').textContent = texts.fileLoadBtnText;
    document.getElementById('supportedFormatsText').textContent = texts.supportedFormatsText;
    document.getElementById('displaySectionTitle').textContent = texts.displaySectionTitle;
    document.getElementById('showLowDensityLabel').textContent = texts.showLowDensityLabel;
    document.getElementById('showHighDensityLabel').textContent = texts.showHighDensityLabel;
    document.getElementById('showAtomsLabel').textContent = texts.showAtomsLabel;
    document.getElementById('showBondsLabel').textContent = texts.showBondsLabel;
    document.getElementById('builderSectionTitle').textContent = texts.builderSectionTitle;
    
    // 构建模式按钮文本需要根据当前状态
    const builderModeBtn = document.getElementById('toggleBuilderMode');
    const isBuilderActive = document.getElementById('builderControls').classList.contains('active');
    builderModeBtn.querySelector('span').textContent = isBuilderActive ? texts.builderModeTextActive : texts.builderModeText;
    
    document.getElementById('selectAtomText').textContent = texts.selectAtomText;
    document.getElementById('createBondText').textContent = texts.createBondText;
    document.getElementById('deleteAtomText').textContent = texts.deleteAtomText;
    document.getElementById('clearAllText').textContent = texts.clearAllText;
    document.getElementById('actionsSectionTitle').textContent = texts.actionsSectionTitle;
    document.getElementById('screenshotText').textContent = texts.screenshotText;
    document.getElementById('resetViewText').textContent = texts.resetViewText;
    document.getElementById('infoSectionTitle').textContent = texts.infoSectionTitle;
    document.getElementById('hintTitle').textContent = texts.hintTitle;
    document.getElementById('hint1').textContent = texts.hint1;
    document.getElementById('hint2').textContent = texts.hint2;
    document.getElementById('hint3').textContent = texts.hint3;
    document.getElementById('hint4').textContent = texts.hint4;
    document.getElementById('loadingText').textContent = texts.loadingText;
}

/**
 * 获取当前语言的文本
 * @param {String} key - 文本键
 * @param {Object} params - 参数对象
 * @returns {String} 文本
 */
function getText(key, params = {}) {
    let text = languages[currentLanguage][key] || key;
    
    // 替换参数
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
}

/**
 * 显示信息
 * @param {String} message - 消息内容
 * @param {String} type - 'info', 'error', 'success'
 */
function showInfo(message, type = 'info') {
    const infoBox = document.getElementById('infoBox');
    infoBox.textContent = message;
    infoBox.className = 'info-box';
    
    if (type === 'error') {
        infoBox.classList.add('error');
    } else if (type === 'success') {
        infoBox.classList.add('success');
    }
}

/**
 * 显示加载动画
 * @param {Boolean} show - 是否显示
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

/**
 * 加载文件（通过上传）
 * @param {File} file - 文件对象
 */
async function loadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    showLoading(true);
    showInfo(getText('loadingText'), 'info');
    
    try {
        const response = await fetch('http://localhost:5000/api/parse', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 渲染分子
        renderMolecule(data);
        
        // 显示成功信息
        const atomCount = data.atoms.length;
        const bondCount = data.bonds.length;
        console.log('Current language:', currentLanguage);
        console.log('moleculeInfo text:', getText('moleculeInfo', { atoms: atomCount, bonds: bondCount }));
        showInfo(getText('moleculeInfo', { atoms: atomCount, bonds: bondCount }), 'success');
        
    } catch (error) {
        console.error('加载文件错误:', error);
        showInfo(getText('errorLoad') + ': ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============= 事件监听器设置 =============

document.addEventListener('DOMContentLoaded', function() {
    // 语言切换按钮
    document.getElementById('langSwitch').addEventListener('click', function() {
        const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
        setLanguage(newLang);
    });
    
    // 文件加载按钮
    document.getElementById('fileLoadBtn').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    // 文件输入变化
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            loadFile(file);
        }
    });
    
    // 显示控制复选框
    document.getElementById('showLowDensity').addEventListener('change', function(e) {
        toggleIsosurface('low_density', e.target.checked);
    });
    
    document.getElementById('showHighDensity').addEventListener('change', function(e) {
        toggleIsosurface('high_density', e.target.checked);
    });
    
    document.getElementById('showAtoms').addEventListener('change', function(e) {
        toggleAtoms(e.target.checked);
    });
    
    document.getElementById('showBonds').addEventListener('change', function(e) {
        toggleBonds(e.target.checked);
    });
    
    // 截图按钮
    document.getElementById('screenshotBtn').addEventListener('click', function() {
        saveScreenshot();
        showInfo(getText('screenshotText'), 'success');
    });
    
    // 重置视角按钮
    document.getElementById('resetViewBtn').addEventListener('click', function() {
        resetCamera();
    });
    
    // 键盘事件：S键截图
    document.addEventListener('keydown', function(e) {
        if (e.key === 's' || e.key === 'S') {
            saveScreenshot();
            showInfo(getText('screenshotText'), 'success');
        }
    });
    
    // 构建模式切换按钮
    document.getElementById('toggleBuilderMode').addEventListener('click', function() {
        toggleBuilderMode();
    });
    
    console.log('UI事件监听器已设置');
});

