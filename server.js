const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

// 缓存逻辑
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
        // 请求即将开始的所有足球比赛
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle',
                dateFormat: 'iso'
            }
        });

        const data = response.data;
        // 按时间排序
        data.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        cacheData = data;
        lastFetchTime = now;
        res.json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: '数据抓取失败', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子终端已启动 | 端口: ${PORT}`));
