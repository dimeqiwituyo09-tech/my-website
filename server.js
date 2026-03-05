const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 请填入你在 the-odds-api.com 申请的 Key
const API_KEY = process.env.ODDS_API_KEY || '这里填入你的32位API_KEY'; 

app.use(express.static(path.join(__dirname)));

// 汉化辅助：将 API 的联赛 ID 映射为中文
const leagueMapping = {
    'soccer_epl': '英超',
    'soccer_spain_la_liga': '西甲',
    'soccer_italy_serie_a': '意甲',
    'soccer_germany_bundesliga': '德甲',
    'soccer_france_ligue_1': '法甲'
};

app.get('/api/data', async (req, res) => {
    try {
        // 同时获取五大联赛的数据
        const leagues = Object.keys(leagueMapping).join(',');
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu', // 欧洲区
                markets: 'h2h', // 胜平负
                bookmakers: 'williamhill,pinnacle', // 锁定威廉和平博
                dateFormat: 'iso'
            }
        });

        // 过滤：只保留五大联赛的数据
        const filteredData = response.data.filter(match => 
            Object.keys(leagueMapping).includes(match.sport_key)
        );

        res.json(filteredData);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: '数据抓取失败', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子终端已在端口 ${PORT} 启动`));
