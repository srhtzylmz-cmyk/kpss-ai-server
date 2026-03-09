// 1️⃣ Gerekli kütüphaneler
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // Node 18+ ise opsiyonel, global fetch kullanabilirsin

// 2️⃣ Express app oluştur
const app = express();
app.use(cors());
app.use(express.json());

// 3️⃣ Test endpoint
app.get("/", (req, res) => res.send("AI Backend çalışıyor"));

// 4️⃣ /solve route (Groq AI ile çalışır)
app.post("/solve", async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options)
    return res.status(400).json({ error: "question veya options eksik" });

  try {
    // ✅ Daha net prompt
    const prompt = `
Aşağıdaki soruyu çöz ve sadece tek bir harf veya seçenek olarak cevabı ver:

Soru: ${question}
Seçenekler: ${options.join(", ")}
`;

    // Groq API isteği
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768", // Free plan için daha güvenilir
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 200
      })
    });

    // Ham yanıtı al
    const text = await response.text();
    console.log("Groq’dan ham yanıt:", text); // Debug için

    // JSON parse
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Groq’dan geçersiz JSON döndü" });
    }

    if (!data?.choices || data.choices.length === 0)
      return res.status(500).json({ error: "Groq cevap üretemedi" });

    // ✅ Cevabı frontend’e gönder
    res.json({ choices: data.choices });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});

// 5️⃣ Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server çalışıyor:", PORT));
