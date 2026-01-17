const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'child-growth-data');
const DAILY_DIR = path.join(DATA_DIR, 'daily');
const WEEKLY_DIR = path.join(DATA_DIR, 'weekly');
const MONTHLY_DIR = path.join(DATA_DIR, 'monthly');
const YEARLY_DIR = path.join(DATA_DIR, 'yearly');

function ensureDirectories() {
    [DATA_DIR, DAILY_DIR, WEEKLY_DIR, MONTHLY_DIR, YEARLY_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return { date: `${year}-${month}-${day}`, year, month };
}

function isWeekend(date = new Date()) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function isMonthEnd(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return date.getDate() === lastDay;
}

function isYearEnd(date = new Date()) {
    return date.getMonth() === 11 && date.getDate() === 31;
}

function getWeekNumber(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
}

function saveDailyRecord(date, data) {
    const filePath = path.join(DAILY_DIR, `${date}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
}

function getDailyRecords(startDate, endDate) {
    const records = [];
    const files = fs.readdirSync(DAILY_DIR).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
        const fileDate = file.replace('.json', '');
        if (fileDate >= startDate && fileDate <= endDate) {
            const content = fs.readFileSync(path.join(DAILY_DIR, file), 'utf8');
            records.push({ date: fileDate, data: JSON.parse(content) });
        }
    }
    
    return records.sort((a, b) => a.date.localeCompare(b.date));
}

function generateWeeklySummary(weekStart, weekEnd, records) {
    const summary = {
        period: `${weekStart} ~ ${weekEnd}`,
        weekNumber: getWeekNumber(new Date(weekEnd)),
        life: { positives: [], concerns: [] },
        health: { positives: [], concerns: [] },
        study: { positives: [], concerns: [] },
        social: { positives: [], concerns: [] },
        growth: { positives: [], concerns: [] },
        overall: ""
    };

    const dimensions = ['life', 'health', 'study', 'social', 'growth'];
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    summary[dim].positives.push(...record.data[dim].highlights);
                }
                if (record.data[dim].concerns) {
                    summary[dim].concerns.push(...record.data[dim].concerns);
                }
            }
        }
    }

    summary.overall = generateOverallComment(summary);

    return summary;
}

function generateMonthlySummary(month, year, records) {
    const summary = {
        period: `${year}-${month}`,
        life: { monthlyProgress: [], improvements: [] },
        health: { monthlyProgress: [], improvements: [] },
        study: { monthlyProgress: [], improvements: [] },
        social: { monthlyProgress: [], improvements: [] },
        growth: { monthlyProgress: [], improvements: [] },
        overall: "",
        highlights: [],
        nextMonthGoals: []
    };

    const dimensions = ['life', 'health', 'study', 'social', 'growth'];
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    summary[dim].monthlyProgress.push(...record.data[dim].highlights);
                }
                if (record.data[dim].improvements) {
                    summary[dim].improvements.push(...record.data[dim].improvements);
                }
            }
        }
    }

    summary.highlights = getTopHighlights(records);
    summary.overall = generateMonthlyComment(summary);
    summary.nextMonthGoals = generateNextGoals('month');

    return summary;
}

function generateYearlySummary(year, records) {
    const summary = {
        period: `${year}`,
        life: { yearlyProgress: [], milestones: [] },
        health: { yearlyProgress: [], milestones: [] },
        study: { yearlyProgress: [], milestones: [] },
        social: { yearlyProgress: [], milestones: [] },
        growth: { yearlyProgress: [], milestones: [] },
        overall: "",
        highlights: [],
        nextYearGoals: []
    };

    const dimensions = ['life', 'health', 'study', 'social', 'growth'];
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    summary[dim].yearlyProgress.push(...record.data[dim].highlights);
                }
                if (record.data[dim].milestones) {
                    summary[dim].milestones.push(...record.data[dim].milestones);
                }
            }
        }
    }

    summary.highlights = getYearHighlights(records);
    summary.overall = generateYearlyComment(summary);
    summary.nextYearGoals = generateNextGoals('year');

    return summary;
}

function getTopHighlights(records) {
    const allHighlights = [];
    records.forEach(r => {
        ['life', 'health', 'study', 'social', 'growth'].forEach(dim => {
            if (r.data[dim] && r.data[dim].highlights) {
                allHighlights.push(...r.data[dim].highlights.map(h => ({ date: r.date, dim, highlight: h })));
            }
        });
    });
    return allHighlights.slice(0, 5);
}

function getYearHighlights(records) {
    const allHighlights = [];
    records.forEach(r => {
        ['life', 'health', 'study', 'social', 'growth'].forEach(dim => {
            if (r.data[dim] && r.data[dim].highlights) {
                allHighlights.push(...r.data[dim].highlights.map(h => ({ date: r.date, dim, highlight: h })));
            }
        });
        if (r.data[dim] && r.data[dim].milestones) {
            allHighlights.push(...r.data[dim].milestones.map(m => ({ date: r.date, dim, highlight: m })));
        }
    });
    return allHighlights.slice(0, 10);
}

function generateOverallComment(summary) {
    let comment = `本周在`;
    const dims = [];
    if (summary.life.positives.length > 0) dims.push('生活');
    if (summary.health.positives.length > 0) dims.push('健康');
    if (summary.study.positives.length > 0) dims.push('学习');
    if (summary.social.positives.length > 0) dims.push('社交');
    if (summary.growth.positives.length > 0) dims.push('成长');
    
    if (dims.length > 0) {
        comment += dims.join('、') + '方面表现出色。';
    }
    
    if (summary.health.concerns.length > 0 || summary.study.concerns.length > 0) {
        comment += '需要注意：' + 
            [...summary.health.concerns, ...summary.study.concerns].slice(0, 2).join('；') + '。';
    }
    
    return comment;
}

function generateMonthlyComment(summary) {
    let comment = `${summary.period}月份，`;
    const achievements = [];
    
    if (summary.study.monthlyProgress.length > 0) achievements.push('学习上有了明显进步');
    if (summary.health.monthlyProgress.length > 0) achievements.push('身体健康状况良好');
    if (summary.social.monthlyProgress.length > 0) achievements.push('社交能力有所提升');
    
    if (achievements.length > 0) {
        comment += achievements.join('，') + '。';
    }
    
    return comment;
}

function generateYearlyComment(summary) {
    return `${summary.period}年是孩子成长的一年，在各方面都有了显著的进步和变化。`;
}

function generateNextGoals(period) {
    const templates = {
        month: [
            '继续保持良好的学习习惯',
            '加强体育锻炼，提高身体素质',
            '多参与社交活动，结交新朋友',
            '培养新的兴趣爱好',
            '学会管理情绪和时间'
        ],
        year: [
            '制定年度学习目标',
            '发展一项特长技能',
            '提高独立自主能力',
            '加强体质锻炼',
            '拓展社交圈子'
        ]
    };
    return templates[period] || [];
}

function saveWeeklyReport(weekStart, weekEnd, summary) {
    const fileName = `weekly_${weekStart}_${weekEnd}.json`;
    const filePath = path.join(WEEKLY_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function saveMonthlyReport(month, year, summary) {
    const fileName = `monthly_${year}_${month}.json`;
    const filePath = path.join(MONTHLY_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function saveYearlyReport(year, summary) {
    const fileName = `yearly_${year}.json`;
    const filePath = path.join(YEARLY_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function processWeekly(date = new Date()) {
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() + (6 - dayOfWeek));
    
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    
    const records = getDailyRecords(startStr, endStr);
    if (records.length === 0) return null;
    
    const summary = generateWeeklySummary(startStr, endStr, records);
    const filePath = saveWeeklyReport(startStr, endStr, summary);
    
    return { summary, filePath };
}

function processMonthly(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const records = getDailyRecords(firstDay, lastDay);
    if (records.length === 0) return null;
    
    const summary = generateMonthlySummary(month, year, records);
    const filePath = saveMonthlyReport(month, year, summary);
    
    return { summary, filePath };
}

function processYearly(date = new Date()) {
    const year = date.getFullYear();
    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;
    
    const records = getDailyRecords(firstDay, lastDay);
    if (records.length === 0) return null;
    
    const summary = generateYearlySummary(year, records);
    const filePath = saveYearlyReport(year, summary);
    
    return { summary, filePath };
}

function main() {
    ensureDirectories();
    
    const args = process.argv.slice(2);
    const command = args[0];
    const inputData = args[1];
    
    try {
        if (command === 'daily') {
            const data = JSON.parse(inputData);
            const { date, content } = data;
            saveDailyRecord(date, content);
            console.log(`Daily record saved for ${date}`);
        } else if (command === 'process') {
            const result = { date: getTodayDate().date };
            
            if (isWeekend()) {
                const weekly = processWeekly();
                if (weekly) {
                    result.weekly = weekly;
                    console.log('Weekly report generated:', weekly.filePath);
                }
            }
            
            if (isMonthEnd()) {
                const monthly = processMonthly();
                if (monthly) {
                    result.monthly = monthly;
                    console.log('Monthly report generated:', monthly.filePath);
                }
            }
            
            if (isYearEnd()) {
                const yearly = processYearly();
                if (yearly) {
                    result.yearly = yearly;
                    console.log('Yearly report generated:', yearly.filePath);
                }
            }
            
            console.log(JSON.stringify(result));
        } else if (command === 'query') {
            const { start, end, type } = JSON.parse(inputData);
            
            if (type === 'daily') {
                const records = getDailyRecords(start, end);
                console.log(JSON.stringify(records));
            } else if (type === 'weekly') {
                const files = fs.readdirSync(WEEKLY_DIR).filter(f => f.endsWith('.json'));
                console.log(JSON.stringify(files));
            } else if (type === 'monthly') {
                const files = fs.readdirSync(MONTHLY_DIR).filter(f => f.endsWith('.json'));
                console.log(JSON.stringify(files));
            } else if (type === 'yearly') {
                const files = fs.readdirSync(YEARLY_DIR).filter(f => f.endsWith('.json'));
                console.log(JSON.stringify(files));
            }
        } else {
            console.log('Usage:');
            console.log('  node child-growth-log.js daily \'{"date":"2026-01-17","content":{...}}\'');
            console.log('  node child-growth-log.js process');
            console.log('  node child-growth-log.js query \'{"start":"2026-01-01","end":"2026-01-17","type":"daily"}\'');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();