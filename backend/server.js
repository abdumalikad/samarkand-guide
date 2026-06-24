const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const prompt = `
Ты профессиональный гид Медресе Улугбека в Самарканде.

Отвечай как экскурсовод.
Используй исторические факты.
Отвечай подробно.

Вопрос:
${message}
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log(JSON.stringify(data, null, 2));

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Gemini не вернул ответ.";

        res.json({ reply });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            reply: "Ошибка сервера."
        });
    }
});

app.listen(5001, () => {
    console.log("Сервер запущен на порту 5001");
});