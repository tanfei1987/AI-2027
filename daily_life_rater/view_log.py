#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
查看每日评分日志
"""

import sys
import os
from datetime import datetime

# 添加技能目录到路径
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

LOGS_DIR = os.path.join(script_dir, 'logs')


def get_log_filename(date: str = None):
    """获取日志文件名"""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    return f"output_{date}.txt"


def show_log(date: str = None):
    """显示指定日期的日志"""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    log_filename = get_log_filename(date)
    log_path = os.path.join(LOGS_DIR, log_filename)

    if not os.path.exists(log_path):
        print(f"日志文件不存在：{log_filename}")
        return

    print("=" * 60)
    print(f"日志文件：{log_filename}")
    print("=" * 60)
    print()

    with open(log_path, 'r', encoding='utf-8') as f:
        content = f.read()
        print(content)


def list_logs():
    """列出所有日志文件"""
    if not os.path.exists(LOGS_DIR):
        print("logs 文件夹不存在")
        return

    log_files = [f for f in os.listdir(LOGS_DIR) if f.startswith('output_') and f.endswith('.txt')]

    if not log_files:
        print("暂无日志文件")
        return

    log_files.sort(reverse=True)  # 按日期降序排列

    print("可用日志文件：")
    print("-" * 60)
    for log_file in log_files:
        date = log_file.replace('output_', '').replace('.txt', '')
        print(f"  {date}")
    print()


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description='查看每日作息评分日志')
    parser.add_argument('--date', '-d', type=str, help='指定日期 (YYYY-MM-DD)')
    parser.add_argument('--list', '-l', action='store_true', help='列出所有日志文件')

    args = parser.parse_args()

    if args.list:
        list_logs()
    elif args.date:
        show_log(args.date)
    else:
        # 默认显示今天的日志
        show_log()


if __name__ == "__main__":
    # 确保 Windows 环境下正确处理 UTF-8
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    main()
