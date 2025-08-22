// 必要なライブラリを読み込みます
require('dotenv').config(); // .envファイルから環境変数を読み込む
const express = require('express');
const axios = require('axios');
const path = require('path');

// Expressアプリケーションを作成します
const app = express();
const port = 3000;

// JSON形式のリクエストを扱えるようにします
app.use(express.json());
// 静的なファイル（HTML、CSS、クライアント側JS）は 'public' フォルダから提供します
app.use(express.static(path.join(__dirname, 'public')));

// Gemini APIの基本設定
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

// APIリクエストを中継するエンドポイントを作成します
const callGeminiAPI = async (prompt, generationConfig = {}) => {
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig
    };

    try {
        const response = await axios.post(API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to call Gemini API");
    }
};

// コスト試算用のAPIエンドポイント
app.post('/api/simulate', async (req, res) => {
    const { operators, salary } = req.body;
    const prompt = `You are a logistics cost analysis expert for Japanese companies. A company has ${operators} forklift operators with an average annual salary of ${salary} JPY each. Based on typical Japanese industry averages, estimate the annual "invisible costs" (採用と育成コスト, 生産性のブレコスト, 安全・リスク管理コスト). Assume a 15% turnover rate for hiring/training costs, a 10% productivity loss factor, and a 5% safety/risk cost factor against the total direct salary. Provide only a JSON object with the keys "hiringCost", "productivityLoss", and "safetyRiskCost" with their calculated integer values in JPY.`;

    try {
        const result = await callGeminiAPI(prompt, { responseMimeType: "application/json" });
        const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(cleanedResult));
    } catch (error) {
        console.error("Parsing Error:", error);
        res.status(500).json({ error: "AIからの応答を解析できませんでした。" });
    }
});

// 未来予測用のAPIエンドポイント
app.post('/api/vision', async (req, res) => {
    const { industry } = req.body;
    const prompt = `あなたは物流とサプライチェーンを専門とする未来予測コンサルタントです。日本の「${industry}」の企業が、自動フォークリフト（AutoFork）の導入を検討しています。この技術を導入した5年後の、変革された倉庫の姿を、希望に満ちた感動的な文章で記述してください。文章は日本語で、3〜4文程度にまとめてください。`;
    
    try {
        const result = await callGeminiAPI(prompt);
        res.json({ vision: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ルートURLにアクセスがあった場合、'public' フォルダの中の index.html を返します
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vercel環境でない場合のみ、ローカルでサーバーを起動します
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`サーバーが起動しました。 http://localhost:${port} でプレゼンテーションにアクセスしてください。`);
    });
}

// Vercelで動作させるためにappをエクスポートします
module.exports = app;

