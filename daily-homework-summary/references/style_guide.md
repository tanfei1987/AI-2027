# 每日作业汇总 - 样式指南

## 设计理念

本模板采用清新活泼的设计风格，适合小学生使用：
- 色彩明快，区分度高
- 信息层次清晰，先展示课堂内容，再展示作业
- 表格化作业展示，便于家长快速查看
- 支持打印和移动端
- 动画效果增加趣味性

## 页面结构

每个科目卡片包含三部分：
1. **课堂内容区域**：展示今日学习内容、教学重点、学习目标
2. **练习题详解区域**（新增）：展示具体的例题、解题方法、易错点分析
3. **作业表格区域**：以表格形式展示作业内容、重要程度、完成方法、书本知识

## 颜色规范

### 科目主题色

| 科目 | 主色 | 浅色背景 | 深色强调 |
|------|------|----------|----------|
| 数学 | #3B82F6 | #EFF6FF | #1E40AF |
| 语文 | #10B981 | #ECFDF5 | #047857 |
| 英文 | #8B5CF6 | #F5F3FF | #5B21B6 |

### 功能色

| 用途 | 颜色代码 | 说明 |
|------|----------|------|
| 重要标记 | #F59E0B | 高优先级作业 |
| 重要背景 | #FEF3C7 | 重要项目背景 |
| 主文字 | #1F2937 | 标题和正文 |
| 次文字 | #6B7280 | 标签和说明 |

## HTML结构

### 课堂内容区域

```html
<div class="class-content">
    <h3 class="content-title">📖 今日课堂内容</h3>
    <div class="content-box">
        <div class="content-item">
            <span class="content-label">学习内容：</span>
            <span>第5课《小蝌蚪找妈妈》</span>
        </div>
        <div class="content-item">
            <span class="content-label">教学重点：</span>
            <span>认识生字词，理解课文内容，学习小蝌蚪成长变化过程</span>
        </div>
        <div class="content-item">
            <span class="content-label">学习目标：</span>
            <span>能够正确朗读课文，认识本课15个生字</span>
        </div>
    </div>
</div>
```

**样式说明：**
- 黄色渐变背景 (#FEFCE8 → #FEF9C3)
- 左侧橙色边框强调 (#EAB308)
- 清晰的标签结构

### 练习题详解区域（新增）

```html
<div class="practice-detail">
    <div class="practice-title">📝 课堂练习详解</div>
    
    <!-- 示例题1 -->
    <div class="example-question">
        <div class="question-number">例题 1</div>
        <div class="question-content">8 + 5 = ?</div>
        
        <div class="solution-steps">
            <div class="solution-title">🔍 解题方法：</div>
            <ol>
                <li><strong>方法一（凑十法）：</strong>8 + 2 = 10，5 - 2 = 3，10 + 3 = 13</li>
                <li><strong>方法二（拆分法）：</strong>将5拆成2和3，先算 8 + 2 = 10，再算 10 + 3 = 13</li>
            </ol>
        </div>
        
        <div class="mistakes-box">
            <div class="mistakes-title">⚠️ 易错点：</div>
            <ul>
                <li>容易直接用手指数数，容易数错</li>
                <li>容易算成 8 + 5 = 12（忘记进位）</li>
                <li>使用凑十法时容易忘记剩余的数</li>
            </ul>
        </div>
        
        <div class="answer-box">
            <span class="answer-label">✅ 正确答案：</span>
            <span class="answer-value">13</span>
        </div>
    </div>
    
    <!-- 可以添加更多例题 -->
    <div class="example-question">
        <div class="question-number">例题 2</div>
        <div class="question-content">15 - 8 = ?</div>
        <!-- ... 类似结构 ... -->
    </div>
</div>
```

**样式说明：**
- 橙色主题背景 (#FFF7ED → #FFEDD5)
- 每个例题独立卡片，白色背景
- 解题方法用绿色标题 (#059669)
- 易错点用红色警告框 (#DC2626)
- 答案用绿色高亮框 (#ECFDF5)

**内容要求：**
1. **例题选择**：选择1-3道典型的课堂练习题
2. **解题方法**：提供多种解法，标注方法名称
3. **易错点**：列出3-5个常见错误和原因
4. **答案明确**：用醒目的方式展示正确答案

### 作业表格结构

```html
<table class="homework-table">
    <thead>
        <tr>
            <th width="25%">作业内容</th>
            <th width="15%">重要程度</th>
            <th width="30%">如何完成</th>
            <th width="30%">书本知识</th>
        </tr>
    </thead>
    <tbody>
        <!-- 高重要度作业 -->
        <tr class="priority-high">
            <td data-label="作业内容">
                <div class="task-number">1.</div>
                <div class="task-desc">完成课本第45-46页练习题</div>
            </td>
            <td data-label="重要程度">
                <span class="priority-badge high">⭐⭐⭐ 高</span>
            </td>
            <td data-label="如何完成">
                <ul class="completion-steps">
                    <li>先复习今天学的加减法</li>
                    <li>独立完成，家长检查</li>
                    <li>注意书写工整</li>
                </ul>
            </td>
            <td data-label="书本知识">
                <div class="book-info">
                    <div><strong>教材：</strong>人教版数学一年级上册</div>
                    <div><strong>章节：</strong>第4单元 认识图形</div>
                    <div><strong>知识点：</strong>平面图形的识别与分类</div>
                </div>
            </td>
        </tr>
        
        <!-- 中等重要度作业 -->
        <tr class="priority-medium">
            <td data-label="作业内容">
                <div class="task-number">2.</div>
                <div class="task-desc">背诵乘法口诀1-3</div>
            </td>
            <td data-label="重要程度">
                <span class="priority-badge medium">⭐⭐ 中</span>
            </td>
            <td data-label="如何完成">
                <ul class="completion-steps">
                    <li>每天朗读5遍</li>
                    <li>睡前默背一遍</li>
                </ul>
            </td>
            <td data-label="书本知识">
                <div class="book-info">
                    <div><strong>教材：</strong>人教版数学一年级上册</div>
                    <div><strong>章节：</strong>第6单元 表内乘法</div>
                    <div><strong>知识点：</strong>乘法口诀表的记忆</div>
                </div>
            </td>
        </tr>
        
        <!-- 低重要度作业 -->
        <tr class="priority-low">
            <td data-label="作业内容">
                <div class="task-number">3.</div>
                <div class="task-desc">阅读数学绘本《数字王国》</div>
            </td>
            <td data-label="重要程度">
                <span class="priority-badge low">⭐ 低</span>
            </td>
            <td data-label="如何完成">
                <ul class="completion-steps">
                    <li>自主阅读15分钟</li>
                    <li>可选择完成</li>
                </ul>
            </td>
            <td data-label="书本知识">
                <div class="book-info">
                    <div><strong>类型：</strong>课外拓展</div>
                    <div><strong>目的：</strong>培养数学兴趣</div>
                </div>
            </td>
        </tr>
    </tbody>
</table>
```

**注意**：移动端响应式设计中，表格会转换为卡片式布局，`data-label` 属性用于显示列标题。

## 模板变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `{{DATE}}` | 作业日期 | 2025年1月8日 |
| `{{GRADE}}` | 学生年级 | 一年级 |
| `{{MATH_COUNT}}` | 数学作业数量 | 2 |
| `{{MATH_CLASS_CONTENT}}` | 数学课堂内容HTML | (课堂内容片段) |
| `{{MATH_ITEMS}}` | 数学作业表格HTML | (表格片段) |
| `{{CHINESE_COUNT}}` | 语文作业数量 | 3 |
| `{{CHINESE_CLASS_CONTENT}}` | 语文课堂内容HTML | (课堂内容片段) |
| `{{CHINESE_ITEMS}}` | 语文作业表格HTML | (表格片段) |
| `{{ENGLISH_COUNT}}` | 英文作业数量 | 2 |
| `{{ENGLISH_CLASS_CONTENT}}` | 英文课堂内容HTML | (课堂内容片段) |
| `{{ENGLISH_ITEMS}}` | 英文作业表格HTML | (表格片段) |

## 重要程度分级

作业重要程度分为三级，帮助家长有针对性地辅导：

| 等级 | 标识 | 颜色 | 判断依据 | 家长辅导建议 |
|------|------|------|----------|--------------|
| 高 | ⭐⭐⭐ 高 | 金色 (#F59E0B) | 新知识点、难度较高、需要重点关注 | 需要家长重点辅导和检查 |
| 中 | ⭐⭐ 中 | 绿色 (#10B981) | 常规练习、巩固复习、需要监督 | 需要家长监督完成质量 |
| 低 | ⭐ 低 | 灰色 (#6B7280) | 简单任务、自主完成、课外拓展 | 学生可以自主完成 |

### 表格行样式

- `priority-high`: 浅金色背景 (#FEF3C7)
- `priority-medium`: 浅绿色背景 (#F0FDF4)
- `priority-low`: 浅灰色背景 (#F9FAFB)

## 图标使用

| 图标 | 用途 |
|------|------|
| 📚 | 页面标题 |
| 📐 | 数学科目 |
| 📝 | 语文科目 |
| 🔤 | 英文科目 |
| 📅 | 日期 |
| 🎒 | 年级 |
| 📍 | 地区 |
| 📖 | 课堂内容、书本知识 |
| ⭐ | 重要标记 |
| 💪 | 鼓励 |

## 课堂内容区域样式

- 背景：浅黄色渐变 (#FEFCE8 → #FEF9C3)
- 左边框：黄色 (#EAB308) 4px
- 用于突出显示今日学习内容

## 打印优化

模板已包含打印样式，打印时：
- 移除背景渐变
- 移除悬停效果
- 添加边框便于阅读
- 防止科目卡片被分页
- 表格保持清晰可读

## 响应式断点

### 桌面端（> 640px）
- 完整表格布局
- 4列展示：作业内容、重要程度、如何完成、书本知识

### 移动端（≤ 640px）
- 表格转换为卡片式布局
- 每行作业独立成卡片
- 使用 `data-label` 属性显示列标题
- 紧凑布局，减少内边距
- 课堂内容区域自适应调整

## 使用建议

1. **家长使用流程**：
   - 先查看"今日课堂内容"，了解学生学了什么
   - 查看作业表格，重点关注⭐⭐⭐高重要度的作业
   - 根据"如何完成"列的指导进行辅导
   - 参考"书本知识"列查找相应教材内容

2. **在线分享**：
   - 使用 deploy.py 脚本自动部署
   - 生成带日期和星期的链接（例如：homework-20250108-wed.surge.sh）
   - 可分享给妈妈，方便随时查看
   - 链接格式清晰，容易识别日期

3. **分享话术建议**：
   ```
   今天（01月08日 周三）的作业已整理好了
   点击查看：https://homework-20250108-wed.surge.sh
   
   包含内容：
   ✅ 今天学习的课堂内容
   ✅ 三科作业详情（含重点标记）
   ✅ 完成方法和注意事项
   ✅ 对应的教材知识点
   
   请重点关注带⭐⭐⭐标记的作业 📚
   ```

4. **打印建议**：
   - 可打印后贴在学习区域
   - 方便随时查看作业要求
   - 家长可在表格旁边做标注

5. **移动端查看**：
   - 适合在手机上快速查看
   - 卡片式布局便于滑动浏览
   - 妈妈可保存到微信收藏或浏览器书签

6. **链接管理**：
   - 每天的链接都不同（包含日期）
   - 旧链接依然有效，可查看历史作业
   - 建议建立文件夹保存重要作业链接
