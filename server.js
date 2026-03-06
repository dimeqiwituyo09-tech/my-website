const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

// 强制监控的五大联赛 ID
const TARGET_LEAGUES = [
    'soccer_epl', 
    'soccer_spain_la_liga', 
    'soccer_germany_bundesliga', 
    'soccer_italy_serie_a', 
    'soccer_france_ligue_1',
    'soccer_uefa_champs_league'
];

let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 缓存10分钟

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) return res.json(cacheData);

    try {
        // 策略：请求全量足球数据，但增加参数以获取更远时间的比赛
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle',
                dateFormat: 'iso',
                // 某些 API 版本支持 commerce_time_from，这里我们通过不过滤 sport 来获取更多
            }
        });

        let allMatches = response.data;

        // 1. 自动识别并提取五大联赛
        const bigFive = allMatches.filter(m => TARGET_LEAGUES.includes(m.sport_key));
        
        // 2. 提取非五大联赛（作为补充）
        const others = allMatches.filter(m => !TARGET_LEAGUES.includes(m.sport_key));

        // 3. 核心排序：五大联赛永远排在最上面，且按开赛时间先后排序
        bigFive.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        others.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        // 合并数据：五大联赛在前，其他在后
        const finalData = [...bigFive, ...others];

        cacheData = finalData;
        lastFetchTime = now;
        res.json(finalData);
    } catch (error) {
        console.error('API请求出错:', error.message);
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: '无法获取赛程' });
    }
});

app.listen(PORT, () => console.log(`量子探测器 V2.6 已就绪`));
