const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // Node 18+ ise fetch global, bunu kaldırabilirsin

const app = express(); // ✅ app burada tanımlanmalı
app.use(cors());
app.use(express.json());

// Groq API key environment variable'dan alınır
const API_KEY = process.env.GROQ_API_KEY;

// Test endpoint
app.get("/", (req, res) => res.send("AI Backend çalışıyor"));

// /solve route
app.post("/solve", async (req, res) => {
  const { question, options, userId } = req.body;

  if (!question || !options) {
    return res.status(400).json({ error: "question veya options eksik" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "user",
            content: `Bu soruyu çöz: "${question}"\nSeçenekler: ${options.join(", ")}`
          }
        ]
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Groq JSON parse hatası:", text);
      return res.status(500).json({ error: "Groq’dan geçersiz JSON döndü" });
    }

    if (!data?.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "Groq cevap üretemedi" });
    }

    res.json({ choices: data.choices });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server çalışıyor:", PORT));
