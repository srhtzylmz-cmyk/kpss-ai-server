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
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}` // ✅ burada key gizli
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Groq’dan geçersiz JSON döndü" });
    }

    if (!data?.choices || data.choices.length === 0) 
      return res.status(500).json({ error: "Groq cevap üretemedi" });

    res.json({ choices: data.choices });

  } catch (err) {
    console.error("Groq API hatası:", err);
    res.status(500).json({ error: "AI çözümü alınamadı" });
  }
});
