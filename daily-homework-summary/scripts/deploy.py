#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
作业汇总在线部署脚本
自动将生成的HTML部署到 surge.sh，并生成分享链接
"""

import os
import sys
import subprocess
from datetime import datetime

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def read_surge_config():
    """读取 surge 配置文件"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        skill_dir = os.path.dirname(script_dir)
        config_file = os.path.join(skill_dir, 'config', 'surge_config.txt')
        
        if not os.path.exists(config_file):
            return None, None
        
        email = None
        password = None
        
        with open(config_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and not line.startswith('['):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip()
                        
                        if key == 'email':
                            email = value
                        elif key == 'password':
                            password = value
        
        return email, password
    
    except Exception as e:
        print(f"读取配置文件失败: {str(e)}")
        return None, None


def surge_login(email, password):
    """登录 surge"""
    try:
        print(f"正在登录 surge...")
        print(f"   账号: {email}")
        
        process = subprocess.Popen(
            ['surge', 'login'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        output, error = process.communicate(input=f"{email}\n{password}\n", timeout=30)
        
        if process.returncode == 0 or "Success" in output or "logged in" in output.lower():
            print("surge 登录成功！")
            return True
        else:
            print(f"surge 登录失败")
            if error:
                print(f"   错误: {error}")
            return False
    
    except subprocess.TimeoutExpired:
        print("surge 登录超时")
        return False
    except Exception as e:
        print(f"surge 登录失败: {str(e)}")
        return False


def check_surge_login():
    """检查 surge 是否已登录"""
    try:
        result = subprocess.run(
            ['surge', 'whoami'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.strip():
            return True
        return False
    except:
        return False


def get_weekday_cn(date):
    """获取中文星期"""
    weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    return weekdays[date.weekday()]


def get_weekday_en(date):
    """获取英文星期缩写"""
    weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    return weekdays[date.weekday()]


def check_surge_installed():
    """检查 surge 是否已安装"""
    try:
        result = subprocess.run(['surge', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def install_surge():
    """安装 surge"""
    print("正在安装 surge...")
    try:
        subprocess.run(['npm', 'install', '-g', 'surge'], 
                      check=True, 
                      timeout=60)
        print("surge 安装成功！")
        return True
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        print("surge 安装失败")
        return False


def deploy_to_surge(html_file, domain):
    """部署到 surge.sh"""
    try:
        print(f"正在部署到 {domain}...")
        
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        temp_index = os.path.join(temp_dir, 'index.html')
        shutil.copy2(html_file, temp_index)
        
        try:
            result = subprocess.run(
                ['surge', temp_dir, domain],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return True, f"https://{domain}"
            else:
                return False, result.stderr
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)
    
    except subprocess.TimeoutExpired:
        return False, "部署超时"
    except Exception as e:
        return False, str(e)


def generate_qrcode(url, output_path):
    """生成二维码"""
    try:
        import qrcode
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(output_path)
        return True
    except ImportError:
        return False


def main():
    if len(sys.argv) < 2:
        print("用法: python deploy.py <html文件路径>")
        sys.exit(1)
    
    html_file = sys.argv[1]
    
    if not os.path.exists(html_file):
        print(f"文件不存在: {html_file}")
        sys.exit(1)
    
    now = datetime.now()
    date_str = now.strftime('%Y%m%d')
    weekday_cn = get_weekday_cn(now)
    weekday_en = get_weekday_en(now)
    
    domain = f"homework-{date_str}-{weekday_en}.surge.sh"
    
    print(f"日期: {now.strftime('%Y年%m月%d日')} {weekday_cn}")
    print(f"域名: {domain}")
    print()
    
    if not check_surge_installed():
        print("surge 未安装")
        install = input("是否现在安装? (y/n): ").lower() == 'y'
        if install:
            if not install_surge():
                print("\n无法继续部署")
                print("\n备选方案:")
                print("1. 访问 https://app.netlify.com/drop")
                print("2. 将HTML文件拖拽上传")
                sys.exit(1)
        else:
            print("\n备选方案:")
            print("1. 手动安装: npm install -g surge")
            print("2. 使用 Netlify Drop: https://app.netlify.com/drop")
            sys.exit(1)
    
    print("\n检查 surge 登录状态...")
    if not check_surge_login():
        print("未登录 surge")
        
        email, password = read_surge_config()
        
        if email and password:
            print("找到 surge 配置文件")
            if not surge_login(email, password):
                print("\nsurge 登录失败，无法继续部署")
                print("\n备选方案:")
                print("1. 手动登录: surge login")
                print("2. 使用 Netlify Drop")
                sys.exit(1)
        else:
            print("未找到 surge 配置文件")
            print("\n请选择:")
            print("1. 手动登录: surge login")
            print("2. 配置文件: config/surge_config.txt")
            print("3. 使用 Netlify Drop")
            sys.exit(1)
    else:
        result = subprocess.run(['surge', 'whoami'], capture_output=True, text=True)
        logged_user = result.stdout.strip()
        print(f"已登录 surge（账号: {logged_user}）")
    
    success, result = deploy_to_surge(html_file, domain)
    
    if success:
        url = result
        print("\n" + "="*60)
        print("部署成功！")
        print("="*60)
        print(f"\n在线链接（可分享给妈妈）：")
        print(f"   {url}")
        print(f"\n分享话术：")
        print(f'   "今天（{now.strftime("%m月%d日")} {weekday_cn}）的作业已整理好了')
        print(f'   点击查看：{url}')
        print(f'   包含了今天学习的内容和作业详情"')
        print(f"\n有效期: 长期有效")
        print(f"提示: 下次生成新作业时，会覆盖今天的链接\n")
        
        qr_path = html_file.replace('.html', '_qr.png')
        if generate_qrcode(url, qr_path):
            print(f"二维码已生成: {qr_path}")
        
    else:
        print(f"\n部署失败: {result}")
        print("\n备选方案:")
        print("1. 访问 https://app.netlify.com/drop")
        print(f"2. 上传文件: {html_file}")


if __name__ == '__main__':
    main()
