#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""快速测试parser"""

import sys
sys.path.insert(0, 'backend')

from backend.parser import parse_gaussian_log

# 测试解析
files = ['Tetracyanoethylene.log', 'NH3.log', 'Biphenyl.log']

for filename in files:
    print(f"\n{'='*60}")
    print(f"测试文件: {filename}")
    print('='*60)
    try:
        result = parse_gaussian_log(filename)
        print(f"✓ 解析到 {len(result['atoms'])} 个原子")
        if result['atoms']:
            print(f"  第1个原子: {result['atoms'][0]}")
            print(f"  第2个原子: {result['atoms'][1]}")
        print(f"✓ 密度矩阵大小: {len(result['density_matrix'])}x{len(result['density_matrix'][0]) if result['density_matrix'] else 0}")
    except Exception as e:
        print(f"✗ 错误: {e}")
        import traceback
        traceback.print_exc()

