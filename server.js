const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// API key environment variable'dan alınır
const API_KEY = process.env.GROQ_API_KEY;

app.get("/", (req, res) => {
  res.send("AI Backend çalışıyor");
});

app.post("/ai", async (req, res) => {
  const { prompt } = req.body;

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
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: "AI isteği başarısız",
      detail: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
