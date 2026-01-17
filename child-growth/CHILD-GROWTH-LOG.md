# 孩子成长记录技能使用说明

## 功能概述

`child-growth-log` 技能用于记录多个孩子的每日成长情况，支持区分姐姐和弟弟。每个孩子有独立的数据空间，自动在周末生成周报，月末生成月报，年末生成年报。

## 触发词

- 记录成长
- 孩子成长
- 成长记录
- 每日记录
- 每周总结
- 每月总结
- 年度总结
- 姐姐成长
- 弟弟成长

## 使用方法

### 1. 记录每日成长

```bash
cd child-growth
node child-growth-log-ui.js daily [日期]
```

执行后会先选择要记录的孩子（姐姐/弟弟），然后依次填写各维度信息。

示例：
```bash
cd child-growth
node child-growth-log-ui.js daily 2026-01-17
```

### 2. 手动生成报告

```bash
cd child-growth
node child-growth-log-ui.js process [日期] [孩子]
```

如果指定日期是周末，会自动生成周报；如果是月末，会自动生成月报；如果是年末，会自动生成年报。

示例：
```bash
# 生成姐姐的周报
cd child-growth
node child-growth-log-ui.js process 2026-01-18 姐姐

# 生成弟弟的月报
cd child-growth
node child-growth-log-ui.js process 2026-01-31 弟弟
```

### 3. 查看记录列表

```bash
cd child-growth
node child-growth-log-ui.js list [类型] [孩子]
```

类型可以是：`daily`、`weekly`、`monthly`、`yearly`

示例：
```bash
# 查看姐姐的周报列表
cd child-growth
node child-growth-log-ui.js list weekly 姐姐

# 查看弟弟的每日记录
cd child-growth
node child-growth-log-ui.js list daily 弟弟
```

### 4. 查看记录详情

```bash
cd child-growth
node child-growth-log-ui.js view <类型> <id> [孩子]
```

示例：
```bash
cd child-growth
node child-growth-log-ui.js view weekly 2026-01-12_2026-01-18 姐姐
```

### 5. 查看所有孩子

```bash
cd child-growth
node child-growth-log-ui.js children
```

## 数据存储位置

所有数据存储在 `child-growth-data` 目录下，按孩子分目录：

```
child-growth/
├── child-growth-data/
│   ├── 姐姐/
│   │   ├── daily/
│   │   ├── weekly/
│   │   ├── monthly/
│   │   └── yearly/
│   └── 弟弟/
│       ├── daily/
│       ├── weekly/
│       ├── monthly/
│       └── yearly/
├── child-growth-log.js
├── child-growth-log-ui.js
└── CHILD-GROWTH-LOG.md
```

## 记录维度

每个孩子每日记录包含5个维度：

- **生活**: 今日亮点、需要改进、今日心情
- **健康**: 身体状况、运动情况、睡眠质量
- **学习**: 学习收获、学习困难、作业完成情况、学习进度
- **社交**: 社交亮点、社交挑战、朋友互动、家庭互动
- **成长**: 成长亮点、成长挑战、今日小成就、自我改进

## 自动报告生成规则

- **周报**: 每周最后一天(周六或周日)自动生成
- **月报**: 每月最后一天自动生成
- **年报**: 每年最后一天(12月31日)自动生成

## 报告内容

### 周报包含
- 孩子姓名、时间周期和周数
- 各维度(生活、健康、学习、社交、成长)的正面表现和问题
- 综合评价
- 下周关注重点

### 月报包含
- 孩子姓名、月份和年度
- 各维度的月度进步
- 本月亮点回顾
- 综合评价
- 下月目标

### 年报包含
- 孩子姓名、年份
- 各维度的年度进步和里程碑
- 年度亮点回顾
- 综合评价
- 来年目标

## 交互示例

### 记录每日成长
```bash
$ cd child-growth && node child-growth-log-ui.js daily

=== 选择孩子 ===
  1. 姐姐
  2. 弟弟
请选择 (1-2): 1

=== 姐姐 每日成长记录 ===
请记录今天的各个方面情况 (直接回车跳过)

【生活】
  今日亮点: 今天自己整理了房间
  需要改进: 吃饭时有点挑食
  今日心情 (好/一般/需要关注): 好

...

✅ 姐姐记录已保存: .../child-growth-data/姐姐/daily/2026-01-17.json
```

### 查看报告
```bash
$ cd child-growth && node child-growth-log-ui.js list weekly 姐姐

=== 姐姐 weekly记录列表 ===
  - weekly_2026-01-12_2026-01-18
```

```bash
$ cd child-growth && node child-growth-log-ui.js view weekly 2026-01-12_2026-01-18 姐姐

{
  "child": "姐姐",
  "period": "2026-01-12 ~ 2026-01-18",
  "weekNumber": 3,
  ...
}
```

## 注意事项

1. 首次使用会自动创建数据目录结构
2. 建议每天记录，这样报告会更准确和完整
3. 报告生成需要至少1天的数据
4. 每个孩子有独立的数据空间，互不干扰
5. 可以随时查看和回顾历史记录
6. 数据以JSON格式存储，可轻松导出或迁移

## 技术实现

- 使用Node.js开发
- 文件系统存储，按孩子分目录管理
- 支持命令行交互模式
- 自动识别时间节点生成报告
