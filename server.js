const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 优先读取环境变量，如果没有则使用手动填写的 Key
const API_KEY = process.env.ODDS_API_KEY || '在此填入你的32位The-Odds-API-Key'; 

app.use(express.static(path.join(__dirname)));

// 五大联赛代码映射
const leagueKeys = ['soccer_epl', 'soccer_spain_la_liga', 'soccer_germany_bundesliga', 'soccer_italy_serie_a', 'soccer_france_ligue_1'];

app.get('/api/data', async (req, res) => {
    try {
        // 请求 The-Odds-API 获取五大联赛赔率
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle',
                dateFormat: 'iso'
            }
        });

        // 只保留五大联赛的数据
        const filtered = response.data.filter(match => leagueKeys.includes(match.sport_key));
        res.json(filtered);
    } catch (error) {
        console.error('后端抓取失败:', error.message);
        res.status(500).json({ error: '数据抓取失败', detail: error.message });
    }
});

app.listen(PORT, () => console.log(`量子终端后端启动成功`));
