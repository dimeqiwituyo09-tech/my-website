const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

// 定义五大联赛核心 ID
const BIG_FIVE = [
    'soccer_epl',                // 英超
    'soccer_spain_la_liga',      // 西甲
    'soccer_germany_bundesliga', // 德甲
    'soccer_italy_serie_a',      // 意甲
    'soccer_france_ligue_1'      // 法甲
];

let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 缓存10分钟

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(cacheData);
    }

    try {
        console.log('📡 正在同步五大联赛实时数据...');
        
        // 并发抓取 5 个联赛，确保每个联赛的 48H 赛程都不被挤掉
        const requests = BIG_FIVE.map(league => 
            axios.get(`https://api.the-odds-api.com/v4/sports/${league}/odds/`, {
                params: {
                    apiKey: API_KEY,
                    regions: 'eu',
                    markets: 'h2h',
                    bookmakers: 'williamhill,pinnacle',
                    dateFormat: 'iso'
                }
            })
        );

        const responses = await Promise.all(requests);
        let combined = [];
        
        responses.forEach(response => {
            if (response.data) combined = combined.concat(response.data);
        });

        // 核心排序：按开赛时间先后排列
        combined.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        cacheData = combined;
        lastFetchTime = now;
        res.json(combined);

    } catch (error) {
        console.error('抓取失败:', error.message);
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: '卫星连接中断' });
    }
});

app.listen(PORT, () => console.log(`量子探测器 V2.8 (五大联赛版) 已启动`));
