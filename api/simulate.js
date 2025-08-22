const axios = require('axios');

module.exports = async (req, res) => {
    const { operators, salary } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    const prompt = `You are a logistics cost analysis expert for Japanese companies. A company has ${operators} forklift operators with an average annual salary of ${salary} JPY each. Based on typical Japanese industry averages, estimate the annual "invisible costs" (採用と育成コスト, 生産性のブレコスト, 安全・リスク管理コスト). Assume a 15% turnover rate for hiring/training costs, a 10% productivity loss factor, and a 5% safety/risk cost factor against the total direct salary. Provide only a JSON object with the keys "hiringCost", "productivityLoss", and "safetyRiskCost" with their calculated integer values in JPY.`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        };
        const response = await axios.post(API_URL, payload);
        const cleanedResult = response.data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.status(200).json(JSON.parse(cleanedResult));
    } catch (error) {
        console.error("Simulate API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "AIからの応答を解析できませんでした。" });
    }
};
