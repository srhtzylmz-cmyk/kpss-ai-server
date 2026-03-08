const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/solve", async (req, res) => {

const { question, options } = req.body;

const prompt = `
KPSS sorusunu çöz.

Soru:
${question}

Seçenekler:
${options.join("\n")}

Doğru cevabı ve kısa açıklama yaz.
`;

try {

const response = await fetch(
"https://api.openai.com/v1/chat/completions",
{
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model: "gpt-3.5-turbo",
messages: [{ role: "user", content: prompt }]
})
}
);

const data = await response.json();

res.json(data);

} catch (error) {

res.status(500).json({ error: "AI çözüm hatası" });

}

});

app.listen(3000, () => {
console.log("Server çalışıyor");

});

