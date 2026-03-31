"""
测试多格式分子文件解析功能
支持 .log, .mol, .cif 格式
"""

import sys
import os

# 添加backend目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from parser import parse_molecule_file

def test_file(file_path):
    """测试解析单个文件"""
    print(f"\n{'='*60}")
    print(f"测试文件: {file_path}")
    print(f"{'='*60}")
    
    if not os.path.exists(file_path):
        print(f"❌ 文件不存在: {file_path}")
        return False
    
    try:
        result = parse_molecule_file(file_path)
        
        print(f"✓ 文件类型: {result.get('file_type', 'unknown')}")
        print(f"✓ 原子数量: {len(result['atoms'])}")
        
        if result['atoms']:
            # 统计元素类型
            elements = {}
            for atom in result['atoms']:
                elem = atom['element']
                elements[elem] = elements.get(elem, 0) + 1
            
            print(f"✓ 元素组成:")
            for elem, count in sorted(elements.items()):
                print(f"  - {elem}: {count}")
            
            # 显示前几个原子
            print(f"✓ 前3个原子:")
            for i, atom in enumerate(result['atoms'][:3]):
                pos = atom['position']
                print(f"  {i+1}. {atom['element']}: ({pos[0]:.4f}, {pos[1]:.4f}, {pos[2]:.4f})")
        
        print(f"✓ 密度矩阵: {len(result['density_matrix'])}x{len(result['density_matrix'][0]) if result['density_matrix'] else 0}")
        print(f"✅ 解析成功!")
        return True
        
    except Exception as e:
        print(f"❌ 解析失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主测试函数"""
    print("\n" + "="*60)
    print("多格式分子文件解析器测试")
    print("="*60)
    
    # 测试文件列表
    test_files = [
        # .log 文件
        'backend/uploads/NH3.log',
        'data/AP.log',
        'data/AR.log',
        # .mol 文件
        'data/71358.mol',
        # .cif 文件
        'data/1e7u.cif',
    ]
    
    results = []
    for file_path in test_files:
        success = test_file(file_path)
        results.append((file_path, success))
    
    # 总结
    print(f"\n{'='*60}")
    print("测试总结")
    print(f"{'='*60}")
    
    success_count = sum(1 for _, success in results if success)
    total_count = len(results)
    
    for file_path, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {file_path}")
    
    print(f"\n总计: {success_count}/{total_count} 个文件解析成功")
    
    if success_count == total_count:
        print("\n🎉 所有测试通过!")
    else:
        print(f"\n⚠️ {total_count - success_count} 个文件解析失败")


if __name__ == '__main__':
    main()

