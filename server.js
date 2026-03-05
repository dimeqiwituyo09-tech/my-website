const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 建议在 Railway 的 Variables 里设置，或者暂时直接填在这里
const API_KEY = process.env.ODDS_API_KEY || 'fcc47361ad5052aa8d4313832e628172'; 

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
        console.error('API Error:', error.response ? error.response.data : error.message);
        // 这行能让错误原因直接显示在你的浏览器控制台
        res.status(500).json({ 
            error: '抓取失败', 
            reason: error.response ? error.response.data.message : error.message 
        });
    }
});

app.listen(PORT, () => console.log(`已启动: http://localhost:${PORT}`));

