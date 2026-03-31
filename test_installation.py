#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
安装测试脚本
用于检查所有依赖是否正确安装
"""

import sys

def test_imports():
    """测试所有必需的包是否可以导入"""
    print("="*60)
    print("测试Python包导入 / Testing Python Package Imports")
    print("="*60)
    
    packages = [
        ('flask', 'Flask'),
        ('flask_cors', 'Flask-CORS'),
        ('numpy', 'NumPy'),
        ('scipy', 'SciPy'),
        ('skimage', 'scikit-image'),
    ]
    
    all_success = True
    
    for package, name in packages:
        try:
            __import__(package)
            print(f"✓ {name:20s} - 安装成功 / Installed")
        except ImportError as e:
            print(f"✗ {name:20s} - 未安装 / Not installed")
            print(f"  错误信息 / Error: {e}")
            all_success = False
    
    print("="*60)
    
    if all_success:
        print("✓ 所有依赖包安装成功！")
        print("✓ All dependencies installed successfully!")
        print("\n可以运行以下命令启动服务器：")
        print("You can start the server with:")
        print("  cd backend")
        print("  python app.py")
    else:
        print("✗ 部分依赖包未安装，请运行：")
        print("✗ Some dependencies not installed, please run:")
        print("  pip install -r requirements.txt")
        return False
    
    print("="*60)
    return True


def test_files():
    """测试必要的文件是否存在"""
    import os
    
    print("\n测试文件结构 / Testing File Structure")
    print("="*60)
    
    required_files = [
        'backend/app.py',
        'backend/parser.py',
        'backend/calculator.py',
        'frontend/index.html',
        'frontend/visualizer.js',
        'frontend/ui.js',
        'frontend/builder.js',
        'requirements.txt',
        'README.md'
    ]
    
    all_exist = True
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✓ {file_path:40s} - 存在 / Exists")
        else:
            print(f"✗ {file_path:40s} - 缺失 / Missing")
            all_exist = False
    
    print("="*60)
    
    if all_exist:
        print("✓ 所有必需文件都存在！")
        print("✓ All required files exist!")
    else:
        print("✗ 部分文件缺失")
        print("✗ Some files are missing")
    
    print("="*60)
    return all_exist


def test_example_files():
    """检查示例文件"""
    import os
    
    print("\n检查示例文件 / Checking Example Files")
    print("="*60)
    
    example_files = [
        'Tetracyanoethylene.log',
        'NH3.log',
        'Biphenyl.log',
        'Non-opt.log'
    ]
    
    for file_path in example_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✓ {file_path:30s} - {size:,} bytes")
        else:
            print(f"○ {file_path:30s} - 未找到 / Not found (可选 / Optional)")
    
    print("="*60)


if __name__ == '__main__':
    print("\n")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║      分子可视化工具 - 安装测试                              ║")
    print("║      Molecular Visualizer - Installation Test             ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print("\n")
    
    # 测试Python版本
    print(f"Python版本 / Python Version: {sys.version}")
    print("="*60)
    
    # 运行测试
    import_ok = test_imports()
    files_ok = test_files()
    test_example_files()
    
    print("\n")
    print("="*60)
    if import_ok and files_ok:
        print("✓✓✓ 安装测试全部通过！ ✓✓✓")
        print("✓✓✓ Installation Test Passed! ✓✓✓")
        print("\n准备就绪，可以开始使用！")
        print("Ready to use!")
        print("\n启动方法 / How to start:")
        print("  Windows: 双击 start_server.bat")
        print("  Others:  cd backend && python app.py")
    else:
        print("✗✗✗ 安装测试未通过 ✗✗✗")
        print("✗✗✗ Installation Test Failed ✗✗✗")
        print("\n请检查上述错误信息")
        print("Please check the error messages above")
    print("="*60)
    print("\n")

