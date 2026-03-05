const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 建议在 Railway 的 Variables 里设置，或者暂时直接填在这里
const API_KEY = process.env.ODDS_API_KEY || '这里填入你的TheOddsAPI的Key'; 

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    try {
        // 抓取英超赔率作为演示 (soccer_epl)
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'uk,eu',
                markets: 'h2h',
                bookmakers: 'williamhill,pinnacle'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: '数据抓取失败: ' + error.message });
    }
});

app.listen(PORT, () => console.log(`已启动: http://localhost:${PORT}`));
