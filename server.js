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

    // Önce text al
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Groq JSON parse hatası:", text);
      return res.status(500).json({ error: "Groq’dan geçersiz JSON döndü" });
    }

    // Eğer choices yoksa fallback
    if (!data?.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "Groq cevap üretemedi" });
    }

    // Cevabı gönder
    res.json({
      choices: data.choices
    });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});
