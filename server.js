const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 【重要】在这里填入你的 Football-Data Token
const API_TOKEN = 'f8b27ebfc2364ef6b2b67d1183baa5c4'; 

// 让服务器能够读取你的 index.html
app.use(express.static(path.join(__dirname)));

// 创建一个后端“中转站”接口
app.get('/api/matches', async (req, res) => {
    try {
        const response = await axios.get('https://api.football-data.org/v4/matches', {
            headers: { 'X-Auth-Token': API_TOKEN }
        });
        res.json(data = response.data);
    } catch (error) {
        res.status(500).json({ error: '后端抓取数据失败' });
    }
});

app.listen(PORT, () => {
    console.log(`服务器已在端口 ${PORT} 启动`);

});
