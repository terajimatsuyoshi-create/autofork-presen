const axios = require('axios');

module.exports = async (req, res) => {
    const { industry } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    const prompt = `あなたは物流とサプライチェーンを専門とする未来予測コンサルタントです。日本の「${industry}」の企業が、自動フォークリフト（AutoFork）の導入を検討しています。この技術を導入した5年後の、変革された倉庫の姿を、希望に満ちた感動的な文章で記述してください。文章は日本語で、3〜4文程度にまとめてください。`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };
        const response = await axios.post(API_URL, payload);
        const result = response.data.candidates[0].content.parts[0].text;
        res.status(200).json({ vision: result });
    } catch (error) {
        console.error("Vision API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "AIからの応答を解析できませんでした。" });
    }
};
