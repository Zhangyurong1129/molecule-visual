"""
完整流程测试：从文件解析到化学键计算
"""

import sys
import os

# 添加backend目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from parser import parse_molecule_file
from calculator import calculate_bonds

def test_complete_flow(file_path):
    """测试完整的处理流程"""
    print(f"\n{'='*70}")
    print(f"完整流程测试: {file_path}")
    print(f"{'='*70}")
    
    if not os.path.exists(file_path):
        print(f"❌ 文件不存在: {file_path}")
        return False
    
    try:
        # 步骤1: 解析文件
        print("\n[步骤1] 解析分子文件...")
        result = parse_molecule_file(file_path)
        atoms = result['atoms']
        print(f"  ✓ 成功解析 {len(atoms)} 个原子")
        
        if len(atoms) == 0:
            print(f"  ⚠️ 警告: 未解析到原子")
            return True
        
        # 步骤2: 计算化学键
        print("\n[步骤2] 计算化学键...")
        bonds = calculate_bonds(atoms)
        print(f"  ✓ 计算出 {len(bonds)} 个化学键")
        
        # 统计键类型
        bond_types = {}
        for bond in bonds:
            bond_type = bond['type']
            bond_types[bond_type] = bond_types.get(bond_type, 0) + 1
        
        if bond_types:
            print(f"\n  键类型分布:")
            for bond_type, count in sorted(bond_types.items()):
                print(f"    - {bond_type}: {count}")
        
        # 显示前几个化学键
        if bonds:
            print(f"\n  前3个化学键:")
            for i, bond in enumerate(bonds[:3]):
                atom1 = atoms[bond['atom1_idx']]
                atom2 = atoms[bond['atom2_idx']]
                print(f"    {i+1}. {atom1['element']}-{atom2['element']} ({bond['type']})")
        
        print(f"\n✅ 完整流程测试通过!")
        return True
        
    except Exception as e:
        print(f"\n❌ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主测试函数"""
    print("\n" + "="*70)
    print("多格式分子文件完整流程测试")
    print("="*70)
    
    # 测试文件列表
    test_files = [
        'backend/uploads/NH3.log',  # 小分子 - 氨气
        'data/71358.mol',            # MOL格式 - 有机小分子
        'data/AP.log',               # 中等分子
    ]
    
    results = []
    for file_path in test_files:
        success = test_complete_flow(file_path)
        results.append((file_path, success))
    
    # 总结
    print(f"\n{'='*70}")
    print("测试总结")
    print(f"{'='*70}")
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for file_path, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {file_path}")
    
    print(f"\n总计: {success_count}/{total_count} 个测试通过")
    
    if success_count == total_count:
        print("\n🎉 所有测试通过!")
    else:
        print(f"\n⚠️ {total_count - success_count} 个测试失败")


if __name__ == '__main__':
    main()

