const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SKILL_DIR = __dirname;
const DATA_DIR = path.join(SKILL_DIR, 'child-growth-data');

const CHILDREN = ['姐姐', '弟弟'];

function getChildDir(childName) {
    return path.join(DATA_DIR, childName);
}

function getDailyDir(childName) {
    return path.join(getChildDir(childName), 'daily');
}

function getWeeklyDir(childName) {
    return path.join(getChildDir(childName), 'weekly');
}

function getMonthlyDir(childName) {
    return path.join(getChildDir(childName), 'monthly');
}

function getYearlyDir(childName) {
    return path.join(getChildDir(childName), 'yearly');
}

function ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    CHILDREN.forEach(child => {
        [getDailyDir(child), getWeeklyDir(child), getMonthlyDir(child), getYearlyDir(child)].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    });
}

function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

function createPrompt() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function selectChild(rl) {
    console.log('\n=== 选择孩子 ===');
    CHILDREN.forEach((child, i) => {
        console.log(`  ${i + 1}. ${child}`);
    });
    
    const choice = await askQuestion(rl, '请选择 (1-2): ');
    const index = parseInt(choice) - 1;
    return CHILDREN[index >= 0 && index < CHILDREN.length ? index : 0];
}

async function collectDailyRecord(rl, childName) {
    console.log(`\n=== ${childName} 每日成长记录 ===`);
    console.log('请记录今天的各个方面情况 (直接回车跳过)\n');
    
    const record = {
        life: {},
        health: {},
        study: {},
        social: {},
        growth: {}
    };
    
    console.log('【生活】');
    record.life.highlights = await askQuestion(rl, '  今日亮点: ');
    record.life.concerns = await askQuestion(rl, '  需要改进: ');
    record.life.mood = await askQuestion(rl, '  今日心情 (好/一般/需要关注): ');
    
    console.log('\n【健康】');
    record.health.highlights = await askQuestion(rl, '  身体状况良好表现: ');
    record.health.concerns = await askQuestion(rl, '  健康问题或需要注意: ');
    record.health.exercise = await askQuestion(rl, '  今日运动情况: ');
    record.health.sleep = await askQuestion(rl, '  睡眠质量 (好/一般/差): ');
    
    console.log('\n【学习】');
    record.study.highlights = await askQuestion(rl, '  学习收获: ');
    record.study.concerns = await askQuestion(rl, '  学习困难: ');
    record.study.homework = await askQuestion(rl, '  作业完成情况: ');
    record.study.progress = await askQuestion(rl, '  今日学习进度: ');
    
    console.log('\n【社交】');
    record.social.highlights = await askQuestion(rl, '  社交亮点: ');
    record.social.concerns = await askQuestion(rl, '  社交挑战: ');
    record.social.friends = await askQuestion(rl, '  与朋友互动情况: ');
    record.social.family = await askQuestion(rl, '  家庭互动情况: ');
    
    console.log('\n【成长】');
    record.growth.highlights = await askQuestion(rl, '  成长亮点: ');
    record.growth.concerns = await askQuestion(rl, '  成长挑战: ');
    record.growth.milestones = await askQuestion(rl, '  今日小成就: ');
    record.growth.improvements = await askQuestion(rl, '  自我改进: ');
    
    return record;
}

function saveDailyRecord(childName, date, data) {
    const filePath = path.join(getDailyDir(childName), `${date}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
}

function getDailyRecords(childName, startDate, endDate) {
    const records = [];
    const dailyDir = getDailyDir(childName);
    if (!fs.existsSync(dailyDir)) return records;
    
    const files = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
        const fileDate = file.replace('.json', '');
        if (fileDate >= startDate && fileDate <= endDate) {
            try {
                const content = fs.readFileSync(path.join(dailyDir, file), 'utf8');
                records.push({ date: fileDate, data: JSON.parse(content) });
            } catch (e) {
                console.error(`Error reading ${file}:`, e.message);
            }
        }
    }
    
    return records.sort((a, b) => a.date.localeCompare(b.date));
}

function generateWeeklySummary(childName, weekStart, weekEnd, records) {
    const summary = {
        child: childName,
        period: `${weekStart} ~ ${weekEnd}`,
        weekNumber: getWeekNumber(new Date(weekEnd)),
        recordsCount: records.length,
        life: { positives: [], concerns: [] },
        health: { positives: [], concerns: [] },
        study: { positives: [], concerns: [] },
        social: { positives: [], concerns: [] },
        growth: { positives: [], concerns: [] },
        overall: ""
    };

    const dimensions = ['life', 'health', 'study', 'social', 'growth'];
    const dimNames = { life: '生活', health: '健康', study: '学习', social: '社交', growth: '成长' };
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    const highlights = record.data[dim].highlights.split('\n').filter(h => h.trim());
                    highlights.forEach(h => summary[dim].positives.push({ date: record.date, content: h }));
                }
                if (record.data[dim].concerns) {
                    const concerns = record.data[dim].concerns.split('\n').filter(c => c.trim());
                    concerns.forEach(c => summary[dim].concerns.push({ date: record.date, content: c }));
                }
            }
        }
    }

    summary.overall = generateOverallComment(summary, dimNames);

    return summary;
}

function generateMonthlySummary(childName, month, year, records) {
    const summary = {
        child: childName,
        period: `${year}-${month}`,
        recordsCount: records.length,
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
    const dimNames = { life: '生活', health: '健康', study: '学习', social: '社交', growth: '成长' };
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    const items = record.data[dim].highlights.split('\n').filter(i => i.trim());
                    items.forEach(i => summary[dim].monthlyProgress.push({ date: record.date, content: i }));
                }
                if (record.data[dim].improvements) {
                    const items = record.data[dim].improvements.split('\n').filter(i => i.trim());
                    items.forEach(i => summary[dim].improvements.push({ date: record.date, content: i }));
                }
            }
        }
    }

    summary.highlights = getTopHighlights(records);
    summary.overall = generateMonthlyComment(summary, dimNames);
    summary.nextMonthGoals = generateNextGoals('month');

    return summary;
}

function generateYearlySummary(childName, year, records) {
    const summary = {
        child: childName,
        period: `${year}`,
        recordsCount: records.length,
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
    const dimNames = { life: '生活', health: '健康', study: '学习', social: '社交', growth: '成长' };
    
    for (const record of records) {
        for (const dim of dimensions) {
            if (record.data[dim]) {
                if (record.data[dim].highlights) {
                    const items = record.data[dim].highlights.split('\n').filter(i => i.trim());
                    items.forEach(i => summary[dim].yearlyProgress.push({ date: record.date, content: i }));
                }
                if (record.data[dim].milestones) {
                    const items = record.data[dim].milestones.split('\n').filter(i => i.trim());
                    items.forEach(i => summary[dim].milestones.push({ date: record.date, content: i }));
                }
            }
        }
    }

    summary.highlights = getYearHighlights(records);
    summary.overall = generateYearlyComment(summary, dimNames);
    summary.nextYearGoals = generateNextGoals('year');

    return summary;
}

function getTopHighlights(records) {
    const allHighlights = [];
    records.forEach(r => {
        ['life', 'health', 'study', 'social', 'growth'].forEach(dim => {
            if (r.data[dim] && r.data[dim].highlights) {
                const highlights = r.data[dim].highlights.split('\n').filter(h => h.trim());
                highlights.forEach(h => allHighlights.push({ date: r.date, dim, highlight: h }));
            }
        });
    });
    return allHighlights.slice(0, 10);
}

function getYearHighlights(records) {
    const allHighlights = [];
    records.forEach(r => {
        ['life', 'health', 'study', 'social', 'growth'].forEach(dim => {
            if (r.data[dim] && r.data[dim].highlights) {
                const highlights = r.data[dim].highlights.split('\n').filter(h => h.trim());
                highlights.forEach(h => allHighlights.push({ date: r.date, dim, highlight: h }));
            }
            if (r.data[dim] && r.data[dim].milestones) {
                const milestones = r.data[dim].milestones.split('\n').filter(m => m.trim());
                milestones.forEach(m => allHighlights.push({ date: r.date, dim, milestone: m }));
            }
        });
    });
    return allHighlights.slice(0, 15);
}

function generateOverallComment(summary, dimNames) {
    let comment = `本周共记录${summary.recordsCount}天。在`;
    const dims = [];
    Object.keys(dimNames).forEach(dim => {
        if (summary[dim].positives.length > 0) dims.push(dimNames[dim]);
    });
    
    if (dims.length > 0) {
        comment += dims.join('、') + '方面有积极表现。';
    }
    
    const concernDims = Object.keys(dimNames).filter(dim => summary[dim].concerns.length > 0);
    if (concernDims.length > 0) {
        comment += '关注领域：' + concernDims.map(d => dimNames[d]).join('、') + '。';
    }
    
    return comment;
}

function generateMonthlyComment(summary, dimNames) {
    let comment = `${summary.period}月份共记录${summary.recordsCount}天。`;
    const achievements = [];
    
    if (summary.study.monthlyProgress.length > 0) achievements.push('学习');
    if (summary.health.monthlyProgress.length > 0) achievements.push('健康');
    if (summary.social.monthlyProgress.length > 0) achievements.push('社交');
    if (summary.growth.monthlyProgress.length > 0) achievements.push('成长');
    
    if (achievements.length > 0) {
        comment += '在' + achievements.join('、') + '等方面都有进步。';
    }
    
    return comment;
}

function generateYearlyComment(summary, dimNames) {
    return `${summary.period}年共记录${summary.recordsCount}天，这是孩子成长的一年，在各方面都有了显著的进步和变化。`;
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

function saveWeeklyReport(childName, weekStart, weekEnd, summary) {
    const fileName = `weekly_${weekStart}_${weekEnd}.json`;
    const filePath = path.join(getWeeklyDir(childName), fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function saveMonthlyReport(childName, month, year, summary) {
    const fileName = `monthly_${year}_${month}.json`;
    const filePath = path.join(getMonthlyDir(childName), fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function saveYearlyReport(childName, year, summary) {
    const fileName = `yearly_${year}.json`;
    const filePath = path.join(getYearlyDir(childName), fileName);
    fs.writeFileSync(filePath, JSON.stringify(summary, null, 2), 'utf8');
    return filePath;
}

function processWeekly(childName, date = new Date()) {
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() + (6 - dayOfWeek));
    
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    
    const records = getDailyRecords(childName, startStr, endStr);
    if (records.length === 0) return null;
    
    const summary = generateWeeklySummary(childName, startStr, endStr, records);
    const filePath = saveWeeklyReport(childName, startStr, endStr, summary);
    
    return { summary, filePath };
}

function processMonthly(childName, date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const records = getDailyRecords(childName, firstDay, lastDay);
    if (records.length === 0) return null;
    
    const summary = generateMonthlySummary(childName, month, year, records);
    const filePath = saveMonthlyReport(childName, month, year, summary);
    
    return { summary, filePath };
}

function processYearly(childName, date = new Date()) {
    const year = date.getFullYear();
    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;
    
    const records = getDailyRecords(childName, firstDay, lastDay);
    if (records.length === 0) return null;
    
    const summary = generateYearlySummary(childName, year, records);
    const filePath = saveYearlyReport(childName, year, summary);
    
    return { summary, filePath };
}

function formatSummaryDisplay(summary, type) {
    if (type === 'weekly') {
        console.log(`\n=== ${summary.child}第${summary.weekNumber}周表现 (${summary.period}) ===`);
    } else if (type === 'monthly') {
        console.log(`\n=== ${summary.child}${summary.period}月总结 ===`);
    } else if (type === 'yearly') {
        console.log(`\n=== ${summary.child}${summary.period}年度总结 ===`);
    }
    
    console.log(`\n📊 综合评价: ${summary.overall}`);
    
    if (summary.highlights && summary.highlights.length > 0) {
        console.log('\n🌟 本期亮点:');
        summary.highlights.forEach((h, i) => {
            console.log(`  ${i + 1}. [${h.date}] ${h.highlight || h.milestone}`);
        });
    }
    
    if (summary.nextMonthGoals && summary.nextMonthGoals.length > 0) {
        console.log('\n📌 下月目标:');
        summary.nextMonthGoals.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
    }
    
    if (summary.nextYearGoals && summary.nextYearGoals.length > 0) {
        console.log('\n📌 来年目标:');
        summary.nextYearGoals.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
    }
}

async function main() {
    ensureDirectories();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'daily') {
        const rl = createPrompt();
        const date = args[1] || getTodayDate();
        const childName = await selectChild(rl);
        const data = await collectDailyRecord(rl, childName);
        const filePath = saveDailyRecord(childName, date, data);
        console.log(`\n✅ ${childName}记录已保存: ${filePath}`);
        
        const checkDate = new Date(date);
        if (isWeekend(checkDate)) {
            console.log('\n📅 周末，生成周报中...');
            const weekly = processWeekly(childName, checkDate);
            if (weekly) {
                formatSummaryDisplay(weekly.summary, 'weekly');
                console.log(`\n📁 周报已保存: ${weekly.filePath}`);
            }
        }
        
        if (isMonthEnd(checkDate)) {
            console.log('\n📅 月末，生成月报中...');
            const monthly = processMonthly(childName, checkDate);
            if (monthly) {
                formatSummaryDisplay(monthly.summary, 'monthly');
                console.log(`\n📁 月报已保存: ${monthly.filePath}`);
            }
        }
        
        if (isYearEnd(checkDate)) {
            console.log('\n📅 年末，生成年报中...');
            const yearly = processYearly(childName, checkDate);
            if (yearly) {
                formatSummaryDisplay(yearly.summary, 'yearly');
                console.log(`\n📁 年报已保存: ${yearly.filePath}`);
            }
        }
        
        rl.close();
        
    } else if (command === 'process') {
        const date = args[1] ? new Date(args[1]) : new Date();
        const childName = args[2] || CHILDREN[0];
        
        let hasReport = false;
        
        if (isWeekend(date)) {
            const weekly = processWeekly(childName, date);
            if (weekly) {
                formatSummaryDisplay(weekly.summary, 'weekly');
                hasReport = true;
            }
        }
        
        if (isMonthEnd(date)) {
            const monthly = processMonthly(childName, date);
            if (monthly) {
                formatSummaryDisplay(monthly.summary, 'monthly');
                hasReport = true;
            }
        }
        
        if (isYearEnd(date)) {
            const yearly = processYearly(childName, date);
            if (yearly) {
                formatSummaryDisplay(yearly.summary, 'yearly');
                hasReport = true;
            }
        }
        
        if (!hasReport) {
            console.log('今天不是生成周报、月报或年报的日子。');
        }
        
    } else if (command === 'list') {
        const type = args[1] || 'daily';
        const childName = args[2] || CHILDREN[0];
        let dir;
        
        if (type === 'daily') dir = getDailyDir(childName);
        else if (type === 'weekly') dir = getWeeklyDir(childName);
        else if (type === 'monthly') dir = getMonthlyDir(childName);
        else if (type === 'yearly') dir = getYearlyDir(childName);
        else dir = getDailyDir(childName);
        
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
            console.log(`\n=== ${childName} ${type}记录列表 ===`);
            if (files.length === 0) {
                console.log('  暂无记录');
            } else {
                files.forEach(f => console.log(`  - ${f.replace('.json', '')}`));
            }
        } else {
            console.log(`暂无${type}记录。`);
        }
        
    } else if (command === 'view') {
        const type = args[1];
        const id = args[2];
        const childName = args[3] || CHILDREN[0];
        
        if (!type || !id) {
            console.log('Usage: node child-growth-log-ui.js view <type> <id> [child]');
            console.log('  Example: node child-growth-log-ui.js view weekly 2026-01-12_2026-01-18 姐姐');
            return;
        }
        
        let dir;
        if (type === 'weekly') dir = getWeeklyDir(childName);
        else if (type === 'monthly') dir = getMonthlyDir(childName);
        else if (type === 'yearly') dir = getYearlyDir(childName);
        else dir = getDailyDir(childName);
        
        const filePath = path.join(dir, `${id}.json`);
        if (fs.existsSync(filePath)) {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log('\n' + JSON.stringify(content, null, 2));
        } else {
            console.log('记录不存在。');
        }
        
    } else if (command === 'children') {
        console.log('\n=== 可用的孩子 ===');
        CHILDREN.forEach((child, i) => {
            console.log(`  ${i + 1}. ${child}`);
        });
        
    } else {
        console.log('\n=== 孩子成长记录系统 ===');
        console.log('\n用法:');
        console.log('  node child-growth-log-ui.js daily [日期]              - 记录每日成长');
        console.log('  node child-growth-log-ui.js process [日期] [孩子]     - 生成报告');
        console.log('  node child-growth-log-ui.js list [类型] [孩子]        - 查看记录列表');
        console.log('  node child-growth-log-ui.js view <类型> <id> [孩子]   - 查看记录详情');
        console.log('  node child-growth-log-ui.js children                  - 查看所有孩子');
        console.log('\n类型: daily, weekly, monthly, yearly');
        console.log('孩子: 姐姐, 弟弟');
        console.log('\n示例:');
        console.log('  node child-growth-log-ui.js daily 2026-01-17');
        console.log('  node child-growth-log-ui.js list weekly 姐姐');
        console.log('  node child-growth-log-ui.js view weekly 2026-01-12_2026-01-18 弟弟');
    }
}

main().catch(console.error);
