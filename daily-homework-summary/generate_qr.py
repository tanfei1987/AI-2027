# -*- coding: utf-8 -*-
import qrcode
import os

# 生成二维码
qr = qrcode.QRCode(version=1, box_size=10, border=5)
qr.add_data('https://homework-20260109-fri.surge.sh')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')

# 保存二维码
output_path = r'C:\Users\admin\.claude\skills\daily-homework-summary\homework_2026-01-09_qr.png'
img.save(output_path)
print(f'二维码已生成: {output_path}')
print(f'文件大小: {os.path.getsize(output_path)} 字节')
