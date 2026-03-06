const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 缩短缓存到3分钟，方便调试

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(cacheData);
    }

    try {
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
        // 核心：按开赛时间排序
        data.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        cacheData = data;
        lastFetchTime = now;
        res.json(data);
    } catch (error) {
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: 'API Error', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子终端 V2.4 运行中`));
