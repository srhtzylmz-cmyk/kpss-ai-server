// 1️⃣ Gerekli kütüphaneler
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // Node 18+ ise bu opsiyonel

// 2️⃣ Express app oluştur
const app = express(); // ✅ app burada tanımlanmalı
app.use(cors());
app.use(express.json());

// 3️⃣ Test endpoint
app.get("/", (req, res) => res.send("AI Backend çalışıyor"));

// 4️⃣ /solve route
app.post("/solve", async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options) 
    return res.status(400).json({ error: "question veya options eksik" });

  try {
    const prompt = `
Soru: ${question}
Seçenekler: ${options.join(", ")}
Doğru cevabı sadece tek bir harf veya seçenek olarak ver.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}` // ✅ API key gizli
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const text = await response.text();

    let data;
    try { data = JSON.parse(text); } 
    catch { return res.status(500).json({ error: "Groq’dan geçersiz JSON döndü" }); }

    if (!data?.choices || data.choices.length === 0) 
      return res.status(500).json({ error: "Groq cevap üretemedi" });

    res.json({ choices: data.choices });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});

// 5️⃣ Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server çalışıyor:", PORT));

