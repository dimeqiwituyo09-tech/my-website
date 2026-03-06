const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || 'YOUR_KEY_HERE';

const BIG_FIVE = [
    'soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 
    'soccer_italy_serie_a', 'soccer_france_ligue_1'
];

let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15分钟缓存以节省额度

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) return res.json(cacheData);

    try {
        console.log('📡 启动多路并行抓取...');
        
        // 使用 allSettled 容错机制：即使西甲挂了，英超也要显示
        const results = await Promise.allSettled(
            BIG_FIVE.map(league => 
                axios.get(`https://api.the-odds-api.com/v4/sports/${league}/odds/`, {
                    params: { apiKey: API_KEY, regions: 'eu', markets: 'h2h', bookmakers: 'williamhill,pinnacle', dateFormat: 'iso' },
                    timeout: 10000 
                })
            )
        );

        let combined = [];
        let errors = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                combined = combined.concat(result.value.data);
            } else {
                errors.push(`${BIG_FIVE[index]}: ${result.reason.message}`);
            }
        });

        // 如果全部失败，向前端发送具体错误
        if (combined.length === 0) {
            return res.status(500).json({ 
                error: 'SERVER_GATEWAY_ERROR', 
                detail: errors.join(' | ') 
            });
        }

        combined.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        
        cacheData = combined;
        lastFetchTime = now;
        res.json(combined);

    } catch (error) {
        res.status(500).json({ error: 'SYSTEM_CRASH', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子探测器 V2.9 已启动`));
