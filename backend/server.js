const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Приветствия — мгновенный ответ без AI ────────────────
const GREETINGS = [
  'привет','хай','хэй','ку','здравствуй','здравствуйте',
  'добрый день','добрый вечер','доброе утро',
  'hi','hey','hello','howdy','yo','sup','greetings',
  'good morning','good evening','good afternoon',
  'salom','assalomu alaykum','xayrli kun','xayrli kech'
];

const GREETING_RESPONSES = {
  ru: 'Привет! О чём хотите узнать?',
  en: 'Hi! What would you like to know?',
  uz: 'Salom! Nima haqida bilmoqchisiz?'
};

function isGreeting(message) {
  const cleaned = message.trim().toLowerCase().replace(/[!?.,]+$/, '');
  return GREETINGS.includes(cleaned);
}

// ─── Системные промпты ────────────────────────────────────
const systemPrompts = {
  ru: `Ты помощник-гид Медресе Улугбека в Самарканде.
Правила: отвечай ТОЛЬКО на заданный вопрос, кратко (1-3 предложения).
Подробности — только если явно попросили.
Не начинай экскурсию сам по себе.
Язык ответа: русский.`,

  en: `You are a guide assistant at Ulugbek Madrasah in Samarkand.
Rules: answer ONLY what was asked, briefly (1-3 sentences).
Be detailed only if explicitly asked.
Do not start a tour on your own.
Always respond in English.`,

  uz: `Siz Samarqanddagi Ulugʻbek Madrasasi yordamchi gidisiz.
Qoidalar: FAQAT so'ralgan savolga qisqa javob bering (1-3 gap).
Batafsil faqat so'ralganda.
O'zingizdan ekskursiya boshlamang.
Til: o'zbek.`
};

// ─── Роут чата ────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, history = [], lang = "ru" } = req.body;

  console.log(`\n[CHAT] lang=${lang} | message="${message}"`);

  // Приветствие → мгновенный ответ
  if (isGreeting(message)) {
    const reply = GREETING_RESPONSES[lang] || GREETING_RESPONSES.ru;
    console.log(`[CHAT] Greeting → "${reply}"`);
    return res.json({ reply });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: systemPrompts[lang] || systemPrompts.ru
    });

    // Конвертируем историю чата в формат SDK
    // Пропускаем первое AI-приветствие (история должна начинаться с user)
    const chatHistory = [];
    for (const msg of history) {
      if (msg.sender === "user") {
        chatHistory.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.sender === "ai" && chatHistory.length > 0) {
        chatHistory.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }

    console.log(`[CHAT] История: ${chatHistory.length} сообщений`);

    // Запускаем чат с историей
    const chat = model.startChat({ history: chatHistory });

    // Отправляем текущее сообщение
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    console.log(`[CHAT] Ответ: ${reply.substring(0, 100)}...`);
    res.json({ reply });

  } catch (error) {
    console.error("[CHAT] Ошибка:", error.message);
    res.status(500).json({ reply: "Ошибка соединения с Gemini: " + error.message });
  }
});

app.listen(5001, () => {
  console.log("✅ Сервер запущен на порту 5001");
  console.log(`🔑 API ключ: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : '⚠️ НЕ НАЙДЕН!'}`);
});