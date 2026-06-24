const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;

// ─── Определение приветствий ───────────────────────────────
const GREETING_PATTERNS = {
  ru: /^(привет|хай|здравствуй(те)?|добрый\s(день|вечер|утро)|доброе\sутро|ку|хэй|йо)[!?,.\s]*$/i,
  en: /^(hi|hello|hey|howdy|greetings|yo|sup|good\s(morning|evening|afternoon))[!?,.\s]*$/i,
  uz: /^(salom|assalomu\salaykum|xayrli\s(kun|kech|tong))[!?,.\s]*$/i
};

const GREETING_RESPONSES = {
  ru: "Привет! О чём хотите узнать?",
  en: "Hi! What would you like to know?",
  uz: "Salom! Nima haqida bilmoqchisiz?"
};

function isSimpleGreeting(message, lang) {
  const pattern = GREETING_PATTERNS[lang] || GREETING_PATTERNS.ru;
  // Дополнительно: если сообщение короче 4 слов — проверяем все языки
  const trimmed = message.trim();
  if (trimmed.split(/\s+/).length <= 3) {
    return (
      pattern.test(trimmed) ||
      GREETING_PATTERNS.ru.test(trimmed) ||
      GREETING_PATTERNS.en.test(trimmed) ||
      GREETING_PATTERNS.uz.test(trimmed)
    );
  }
  return pattern.test(trimmed);
}

// ─── Системные промпты ─────────────────────────────────────
const systemPrompts = {
  ru: `Ты помощник-гид Медресе Улугбека в Самарканде.

СТРОГИЕ ПРАВИЛА:
1. Отвечай ТОЛЬКО на заданный вопрос. Ни слова лишнего.
2. Если вопрос простой — ответ короткий (1-3 предложения).
3. Подробный ответ ТОЛЬКО если пользователь прямо просит рассказать подробнее или задаёт конкретный вопрос об истории, архитектуре, учёных.
4. НЕ начинай экскурсию сам по себе. НЕ добавляй "кстати", "а ещё", "позвольте рассказать".
5. Всегда отвечай на русском языке.`,

  en: `You are an assistant guide at the Ulugbek Madrasah in Samarkand.

STRICT RULES:
1. Answer ONLY what was asked. Nothing extra.
2. Simple question = short answer (1-3 sentences).
3. Detailed answer ONLY if user explicitly asks for more or asks a specific question about history, architecture, or scholars.
4. Do NOT start a tour on your own. Do NOT add "by the way", "also", "let me tell you about".
5. Always respond in English.`,

  uz: `Siz Samarqanddagi Ulugʻbek Madrasasining yordamchi gidisiz.

QATTIQ QOIDALAR:
1. FAQAT berilgan savolga javob bering. Ortiqcha hech narsa.
2. Oddiy savol = qisqa javob (1-3 gap).
3. Batafsil javob FAQAT foydalanuvchi aniq so'raganda yoki tarix, me'morchilik, olimlar haqida savol bo'lganda.
4. O'zingizdan ekskursiya boshlamang.
5. Har doim o'zbek tilida javob bering.`
};

// ─── Основной роут ─────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], lang = "ru" } = req.body;

    // Если это просто приветствие — отвечаем сразу, не идём в AI
    if (isSimpleGreeting(message, lang)) {
      const response = GREETING_RESPONSES[lang] || GREETING_RESPONSES.ru;
      return res.json({ reply: response });
    }

    // Конвертируем историю в формат Gemini
    const geminiHistory = [];
    for (const msg of history) {
      if (msg.sender === "user") {
        geminiHistory.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.sender === "ai" && geminiHistory.length > 0) {
        geminiHistory.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }

    geminiHistory.push({ role: "user", parts: [{ text: message }] });

    const systemPrompt = systemPrompts[lang] || systemPrompts.ru;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: geminiHistory,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 512
          }
        })
      }
    );

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Ответ не получен.";

    res.json({ reply });

  } catch (error) {
    console.error("Ошибка сервера:", error);
    res.status(500).json({ reply: "Ошибка сервера." });
  }
});

app.listen(5001, () => {
  console.log("Сервер запущен на порту 5001");
});