const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // Eğer Node 18+ ise fetch global zaten var

const app = express();
app.use(cors());
app.use(express.json());

// API key environment variable'dan alınır
const API_KEY = process.env.GROQ_API_KEY;

// /solve route
app.post("/solve", async (req, res) => {
  const { question, options, userId } = req.body;

  if (!question || !options) {
    return res.status(400).json({ error: "question veya options eksik" });
  }

  try {
    // Groq API'ye istek
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

    const data = await response.json();

    // Cevabı frontend’e gönder
    res.json({
      choices: data.choices // frontend data.choices[0].message.content ile alır
    });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});

// Test endpoint
app.get("/", (req, res) => res.send("AI Backend çalışıyor"));

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server çalışıyor:", PORT));
