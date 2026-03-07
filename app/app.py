import os
from flask import Flask, jsonify, send_from_directory
import requests
from flask_cors import CORS

# 【重点】app 必须定义在最外层，不能缩进
app = Flask(__name__, static_folder='.')
CORS(app)

@app.route('/api/data')
def get_data():
    api_key = os.getenv("ODDS_API_KEY")
    if not api_key:
        return jsonify([])
    
    # 极简取数逻辑，先确保能跑通
    url = f"https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey={api_key}&regions=uk&markets=h2h"
    try:
        r = requests.get(url)
        return jsonify(r.json() if r.status_code == 200 else [])
    except:
        return jsonify([])

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3000))
    app.run(host='0.0.0.0', port=port)
