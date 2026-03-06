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
const CACHE_DURATION = 15 * 60 * 1000; 

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    const now = Date.now();
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) return res.json(cacheData);

    try {
        const results = await Promise.allSettled(
            BIG_FIVE.map(league => 
                axios.get(`https://api.the-odds-api.com/v4/sports/${league}/odds/`, {
                    params: { apiKey: API_KEY, regions: 'eu', markets: 'h2h', bookmakers: 'williamhill,pinnacle', dateFormat: 'iso' },
                    timeout: 10000 
                })
            )
        );

        let combined = [];
        const fortyEightHoursLater = now + (48 * 60 * 60 * 1000); // 计算48小时后的时间点

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                const filteredLeagues = result.value.data.filter(m => {
                    const matchTime = new Date(m.commence_time).getTime();
                    // 只保留：还没开始 且 在未来48小时内的比赛
                    return matchTime > now && matchTime < fortyEightHoursLater;
                });
                combined = combined.concat(filteredLeagues);
            }
        });

        combined.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        
        cacheData = combined;
        lastFetchTime = now;
        res.json(combined);

    } catch (error) {
        res.status(500).json({ error: 'FETCH_ERROR', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`精准探测器 V3.0 已启动`));
