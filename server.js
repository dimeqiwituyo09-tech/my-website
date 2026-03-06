const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.ODDS_API_KEY || '在此填入你的Key';

// --- 缓存配置 ---
let cacheData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存 (单位：毫秒)

app.use(express.static(path.join(__dirname)));

const leagueKeys = [
    'soccer_epl', 
    'soccer_spain_la_liga', 
    'soccer_germany_bundesliga', 
    'soccer_italy_serie_a', 
    'soccer_france_ligue_1',
    'soccer_uefa_champs_league' // 额外加入欧冠，防止周中无联赛显示
];

app.get('/api/data', async (req, res) => {
    const now = Date.now();

    // 如果缓存存在且未过期，直接返回缓存数据
    if (cacheData && (now - lastFetchTime < CACHE_DURATION)) {
        console.log('读取缓存数据...');
        return res.json(cacheData);
    }

    try {
        console.log('正在请求 API 更新数据...');
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle',
                dateFormat: 'iso'
            }
        });

        // 过滤五大联赛
        const filtered = response.data.filter(match => leagueKeys.includes(match.sport_key));
        
        // 按时间排序
        filtered.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));

        // 更新缓存
        cacheData = filtered;
        lastFetchTime = now;

        res.json(filtered);
    } catch (error) {
        console.error('API请求失败:', error.message);
        // 如果请求失败但有旧缓存，降级返回旧缓存
        if (cacheData) return res.json(cacheData);
        res.status(500).json({ error: '数据抓取失败', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子监控后端启动 | 缓存周期: 5min`));
