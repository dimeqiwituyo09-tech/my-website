const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 记得在 Railway Variables 里设置 ODDS_API_KEY
const API_KEY = process.env.ODDS_API_KEY; 

app.use(express.static(path.join(__dirname)));

app.get('/api/data', async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: '环境变量中未找到 API_KEY' });
    }
    try {
        // 直接获取英超赔率，这个接口自带赛程信息
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/`, {
            params: {
                apiKey: API_KEY,
                regions: 'eu',
                markets: 'h2h',
                bookmakers: 'pinnacle,williamhill'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: '接口访问受限', detail: error.message });
    }
});

app.listen(PORT, () => console.log('服务正常启动'));
