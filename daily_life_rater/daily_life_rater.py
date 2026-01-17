#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
每日作息评分工具
根据用户记录的活动自动计算评分
"""

import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any
import re

# 确保在 Windows 上正确处理 UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 日志文件夹路径
LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')

# 创建 logs 文件夹（如果不存在）
def ensure_logs_dir():
    if not os.path.exists(LOGS_DIR):
        os.makedirs(LOGS_DIR)

# 类别权重配置
CATEGORY_WEIGHTS = {
    "家庭": 0.20,
    "自我提升": 0.20,
    "健康": 0.25,
    "学习": 0.15,
    "工作": 0.10,
    "生活技巧": 0.05,
    "社交": 0.03,
    "娱乐": 0.02
}

# 类别关键词映射
CATEGORY_KEYWORDS = {
    "家庭": ["家人", "陪", "家务", "照顾", "孩子", "父母", "配偶", "丈夫", "妻子", "爸爸", "妈妈", "小朋友", "给全家人", "做饭", "做菜", "做早餐", "做午餐", "做晚饭", "做午餐", "做晚餐", "做4个菜"],
    "自我提升": ["学习", "编程", "阅读", "技能", "兴趣", "爱好", "成长", "提升", "python", "python编程", "ai", "ai编程", "人工智能"],
    "健康": ["运动", "跑步", "健身", "锻炼", "早餐", "饮食", "睡觉", "睡眠", "休息", "起床", "作息", "公里", "吃早餐", "午睡", "篮球", "羽毛球", "体育", "运动课"],
    "学习": ["课程", "考试", "复习", "专业", "知识", "书籍", "笔记", "练习"],
    "工作": ["工作", "项目", "报告", "会议", "任务", "完成", "汇报", "做项目", "完成项目"],
    "生活技巧": ["整理", "收纳", "维修", "财务", "理财", "规划", "烹饪"],
    "社交": ["朋友", "聚会", "活动", "聊天", "联系", "人脉", "送和接"],
    "娱乐": ["电视", "电影", "游戏", "娱乐", "休闲", "放松", "音乐", "看电视", "看新闻"]
}


def categorize_activity(activity: str) -> str:
    """根据活动内容判断类别"""
    activity_lower = activity.lower()

    # 检查每个类别的关键词
    max_matches = 0
    best_category = "其他"

    for category, keywords in CATEGORY_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw.lower() in activity_lower)
        if matches > max_matches:
            max_matches = matches
            best_category = category

    return best_category


def parse_activities(text: str) -> List[Dict[str, Any]]:
    """解析用户输入的活动文本"""
    activities = []

    # 尝试匹配时间点的活动（如"7点起床"）
    time_pattern = r'(\d{1,2})[:点]\s*([^，,；;。\n]+)'
    time_matches = re.findall(time_pattern, text)

    # 先处理时间点匹配的活动
    time_contents = set()
    for hour, content in time_matches:
        if content.strip():
            content_clean = content.strip()
            time_contents.add(content_clean)
            activities.append({
                "time": f"{hour}:00",
                "content": content_clean,
                "category": categorize_activity(content_clean)
            })

    # 处理非时间点的句子，过滤掉已经被时间点匹配的内容
    sentences = re.split(r'[，,；;。\n]', text)
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and not re.match(r'^\d{1,2}[:点]', sentence):
            # 检查这个句子是否已经在时间点匹配中被包含
            is_duplicate = False
            for time_content in time_contents:
                if time_content in sentence or sentence in time_content:
                    is_duplicate = True
                    break

            if not is_duplicate:
                activities.append({
                    "time": None,
                    "content": sentence,
                    "category": categorize_activity(sentence)
                })

    return activities


def rate_category(category: str, activities: List[Dict[str, Any]]) -> float:
    """为某个类别评分"""
    category_activities = [a for a in activities if a["category"] == category]

    if not category_activities:
        return 0.0

    # 根据活动数量和质量评分
    # 每个活动给5分基础分，最多2个活动后不再增加
    base_score = min(len(category_activities) * 5, 10)

    # 检查活动质量关键词
    quality_boost = 0
    quality_keywords = ["完成", "很好", "优秀", "坚持", "持续", "深入", "规律", "跑了", "学习", "健康"]
    for activity in category_activities:
        if any(kw in activity["content"] for kw in quality_keywords):
            quality_boost += 1.0

    # 如果包含时间信息，给予额外加分
    time_boost = 0
    for activity in category_activities:
        if "小时" in activity["content"] or "h" in activity["content"]:
            time_boost += 1.0
        if "分钟" in activity["content"] or "min" in activity["content"]:
            time_boost += 0.5

    score = min(base_score + quality_boost + time_boost, 10)
    return round(score, 1)


def calculate_total_score(category_scores: Dict[str, float]) -> Dict[str, Any]:
    """计算总分"""
    total = sum(score * CATEGORY_WEIGHTS[cat]
                for cat, score in category_scores.items())

    # 评级
    if total >= 9:
        rating = "优秀"
    elif total >= 7:
        rating = "良好"
    elif total >= 5:
        rating = "一般"
    elif total >= 3:
        rating = "较差"
    else:
        rating = "极差"

    return {
        "total": round(total, 1),
        "rating": rating
    }


def save_log(text: str, report: Dict[str, Any]):
    """保存日志到文件"""
    ensure_logs_dir()

    # 生成日志文件名：output_YYYY-MM-DD.txt
    today = datetime.now().strftime("%Y-%m-%d")
    log_filename = f"output_{today}.txt"
    log_path = os.path.join(LOGS_DIR, log_filename)

    # 准备日志内容
    log_content = []
    log_content.append("=" * 60)
    log_content.append(f"每日作息评分日志 - {today}")
    log_content.append("=" * 60)
    log_content.append("")

    # 输入内容
    log_content.append("【输入内容】")
    log_content.append(text)
    log_content.append("")

    # 活动分类汇总
    log_content.append("【活动分类汇总】")
    log_content.append("-" * 60)
    for cat, activities in report["categories"].items():
        content = "、".join([a["content"] for a in activities])
        log_content.append(f"{cat}: {content}")
    log_content.append("")

    # 评分详情
    log_content.append("【评分详情】")
    log_content.append("-" * 60)
    for cat, score in report["category_scores"].items():
        weight = CATEGORY_WEIGHTS[cat] * 100
        log_content.append(f"{cat}: {score}/10 (权重{weight:.0f}%)")
    log_content.append("")

    # 综合评分
    total = report["total_score"]
    log_content.append(f"【综合评分】")
    log_content.append("-" * 60)
    log_content.append(f"{total['total']}/10 - {total['rating']}")
    log_content.append("")

    # 亮点
    if report["highlights"]:
        log_content.append("【亮点】")
        log_content.append("-" * 60)
        for highlight in report["highlights"]:
            log_content.append(f"✓ {highlight}")
        log_content.append("")

    # 改进建议
    if report["suggestions"]:
        log_content.append("【改进建议】")
        log_content.append("-" * 60)
        for suggestion in report["suggestions"]:
            log_content.append(f"• {suggestion}")
        log_content.append("")

    # 记录时间
    log_content.append("【记录时间】")
    log_content.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    log_content.append("")
    log_content.append("=" * 60)
    log_content.append("")

    # 写入日志文件（追加模式）
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write('\n'.join(log_content))
    except Exception as e:
        print(f"保存日志失败：{e}")


def generate_report(text: str, save_log_flag: bool = True) -> Dict[str, Any]:
    """生成完整的评分报告"""
    activities = parse_activities(text)

    # 按类别分组
    categories = {}
    for activity in activities:
        cat = activity["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(activity)

    # 为每个类别评分
    category_scores = {}
    for category in CATEGORY_WEIGHTS.keys():
        cat_activities = [a for a in activities if a["category"] == category]
        category_scores[category] = rate_category(category, cat_activities)

    # 计算总分
    total_score = calculate_total_score(category_scores)

    # 识别亮点
    highlights = []
    for cat, score in category_scores.items():
        if score >= 8:
            cat_activities = categories.get(cat, [])
            if cat_activities:
                highlights.append(f"{cat}方面表现优秀")

    # 生成改进建议
    suggestions = []
    for cat, score in category_scores.items():
        if score < 5 and score > 0:
            suggestions.append(f"增加{cat}方面的投入")

    result = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "activities": activities,
        "categories": categories,
        "category_scores": category_scores,
        "total_score": total_score,
        "highlights": highlights,
        "suggestions": suggestions
    }

    # 保存日志
    if save_log_flag:
        save_log(text, result)

    return result


def format_report(report: Dict[str, Any]) -> str:
    """格式化报告输出"""
    output = []

    output.append(f"## 📅 {report['date']} 每日活动评分\n")

    # 活动分类汇总
    output.append("### 活动分类汇总\n")
    output.append("| 类别 | 活动内容 |")
    output.append("|------|----------|")
    for cat, activities in report["categories"].items():
        content = "、".join([a["content"] for a in activities])
        output.append(f"| {cat} | {content} |")

    # 评分详情
    output.append("\n### 评分详情\n")
    for cat, score in report["category_scores"].items():
        weight = CATEGORY_WEIGHTS[cat] * 100
        output.append(f"- {cat}：{score}/10 (权重{weight:.0f}%)")

    # 综合评分
    total = report["total_score"]
    output.append(f"\n### 🏆 综合评分：{total['total']}/10 {total['rating']}\n")

    # 亮点
    if report["highlights"]:
        output.append("### ✨ 亮点")
        for highlight in report["highlights"]:
            output.append(f"- {highlight}")
        output.append("")

    # 改进建议
    if report["suggestions"]:
        output.append("### 💡 改进建议")
        for suggestion in report["suggestions"]:
            output.append(f"- {suggestion}")
        output.append("")

    return "\n".join(output)


if __name__ == "__main__":
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    # 测试示例
    test_input = """
    今天早上7点起床，跑了5公里；8点吃健康早餐；9点开始工作，
    完成了项目报告；中午陪孩子做作业1小时；下午学习了Python编程2小时；
    晚上做了晚饭；和家人一起看电视；11点睡觉
    """

    report = generate_report(test_input)
    print(format_report(report))
