const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

// 核心：五大联赛官方 ID 列表
const BIG_FIVE_KEYS = [
    'soccer_epl', 
    'soccer_spain_la_liga', 
    'soccer_germany_bundesliga', 
    'soccer_italy_serie_a', 
    'soccer_france_ligue_1',
    'soccer_uefa_champs_league'
];

let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(cacheData);
    }

    try {
        // 请求所有足球赛
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle',
                dateFormat: 'iso'
            }
        });

        let allMatches = response.data;

        // 【关键逻辑】将五大联赛排在最前面，其他比赛排在后面
        allMatches.sort((a, b) => {
            const aIsBig = BIG_FIVE_KEYS.includes(a.sport_key);
            const bIsBig = BIG_FIVE_KEYS.includes(b.sport_key);
            if (aIsBig && !bIsBig) return -1;
            if (!aIsBig && bIsBig) return 1;
            return new Date(a.commence_time) - new Date(b.commence_time);
        });

        cacheData = allMatches;
        lastFetchTime = now;
        res.json(allMatches);
    } catch (error) {
        console.error('API Error:', error.message);
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: '数据抓取失败' });
    }
});

app.listen(PORT, () => console.log(`量子探测器 V2.5 已上线`));
