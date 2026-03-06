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

    const BIG_FIVE = [
        'soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 
        'soccer_italy_serie_a', 'soccer_france_ligue_1'
    ];

    try {
        console.log('📡 正在多路同步五大联赛数据...');
        
        // 使用 allSettled 代替 all，防止单个联赛失败导致整体报错
        const results = await Promise.allSettled(
            BIG_FIVE.map(league => 
                axios.get(`https://api.the-odds-api.com/v4/sports/${league}/odds/`, {
                    params: {
                        apiKey: API_KEY,
                        regions: 'eu',
                        markets: 'h2h',
                        bookmakers: 'williamhill,pinnacle',
                        dateFormat: 'iso'
                    },
                    timeout: 8000 // 设置 8 秒超时，防止卡死
                })
            )
        );

        let combined = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                combined = combined.concat(result.value.data);
            } else {
                console.warn(`警告: 联赛 ${BIG_FIVE[index]} 抓取失败:`, result.reason.message);
            }
        });

        if (combined.length === 0) {
            throw new Error('所有联赛请求均失败，请检查 API Key 额度或网络');
        }

        // 排序
        combined.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        cacheData = combined;
        lastFetchTime = now;
        res.json(combined);

    } catch (error) {
        console.error('致命错误:', error.message);
        if (cacheData) return res.json(cacheData); // 失败时尝试返回旧缓存
        res.status(500).json({ error: '卫星连接中断', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子探测器 V2.8 (五大联赛版) 已启动`));

