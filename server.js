const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const ODDS_API_KEY = process.env.ODDS_API_KEY;

app.use(express.static(path.join(__dirname)));

// 获取五大联赛实时赔率接口
app.get('/api/odds', async (req, res) => {
    try {
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/`, {
            params: {
                apiKey: ODDS_API_KEY,
                regions: 'uk,eu', // 获取英国和欧洲区数据
                markets: 'h2h',   // 胜平负赔率
                bookmakers: 'williamhill,pinnacle' // 指定威廉和平博
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: '赔率数据抓取失败' });
    }
});

app.listen(PORT, () => console.log(`量化终端 2.0 启动`));

