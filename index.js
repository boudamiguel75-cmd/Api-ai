const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Mistral } = require('@mistralai/mistralai');

const app = express();
app.use(express.json());

// ─── CONFIGURATION DES CLÉS API ───
const geminiApiKey = process.env.GEMINI_API_KEY;
const mistralApiKey = process.env.MISTRAL_API_KEY;

// Initialisation de Gemini
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Initialisation de Mistral
const mistral = new Mistral({ apiKey: mistralApiKey });

// Route d'accueil
app.get('/', (req, res) => {
  res.json({ 
    status: "API Multi-IA (Gemini & Mistral) en ligne 🚀",
    services: ["/api/gemini", "/api/mistral", "/api/foot"]
  });
});

// ─── ENDPOINT GEMINI (Pour votre bot / Shisui) ───
app.get('/api/gemini', async (req, res) => {
  const prompt = req.query.q || req.query.prompt;
  
  if (!prompt) {
    return res.status(400).json({ error: "Le paramètre 'q' ou 'prompt' est requis." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      result: text,
      success: true
    });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ error: "Erreur lors de la génération IA Gemini." });
  }
});

// ─── ENDPOINT MISTRAL (Nouvelle route IA) ───
app.get('/api/mistral', async (req, res) => {
  const prompt = req.query.q || req.query.prompt;
  
  if (!prompt) {
    return res.status(400).json({ error: "Le paramètre 'q' ou 'prompt' est requis." });
  }

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-small-latest', // Modèle rapide et performant
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content;

    res.json({
      result: text,
      success: true
    });
  } catch (error) {
    console.error("Erreur Mistral:", error);
    res.status(500).json({ error: "Erreur lors de la génération IA Mistral." });
  }
});

// ─── ENDPOINT FOOTBALL IA (Utilise Gemini par défaut) ───
app.get('/api/foot', async (req, res) => {
  const { player, club, opponent, action, score } = req.query;

  if (!player || !action) {
    return res.status(400).json({ error: "Paramètres 'player' et 'action' requis." });
  }

  const systemPrompt = `Tu es un journaliste et commentateur sportif de football passionné, style Canal+ / BeIN Sports. 
Rédige un commentaire très court (2 phrases max), dynamique et immersif avec des emojis.`;

  const userPrompt = `Joueur: ${player} (${club || 'Équipe'})
Action/Événement: ${action}
Opposant: ${opponent || 'Adversaire'}
Score final: ${score || 'N/A'}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const commentary = response.text();

    res.json({
      commentary: commentary.trim(),
      success: true
    });
  } catch (error) {
    console.error("Erreur API Foot:", error);
    res.json({
      commentary: `⚽ Match intense pour ${player} sous les couleurs de ${club} !`,
      success: false
    });
  }
});

// Port dynamique exigé par Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
