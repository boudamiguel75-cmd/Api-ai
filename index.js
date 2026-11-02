const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Récupération de la clé OpenRouter depuis les variables d'environnement de Render
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Route d'accueil
app.get('/', (req, res) => {
  res.json({ 
    status: "API OpenRouter en ligne 🚀",
    endpoints: ["/api/ai", "/api/foot"]
  });
});

// ─── ENDPOINT GÉNÉRAL AI (Via OpenRouter) ───
app.get('/api/ai', async (req, res) => {
  const prompt = req.query.q || req.query.prompt;
  
  if (!prompt) {
    return res.status(400).json({ error: "Le paramètre 'q' ou 'prompt' est requis." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // Vous pouvez changer le modèle ici (ex: "deepseek/deepseek-chat", "openai/gpt-4o", etc.)
        model: "deepseek/deepseek-chat", 
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://render.com", // Optionnel pour OpenRouter
          "X-Title": "Mon API Bot"             // Optionnel pour OpenRouter
        }
      }
    );

    const text = response.data.choices[0].message.content;

    res.json({
      result: text,
      success: true
    });
  } catch (error) {
    console.error("Erreur OpenRouter:", error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de la génération IA avec OpenRouter." });
  }
});

// ─── ENDPOINT FOOTBALL IA (Via OpenRouter) ───
app.get('/api/foot', async (req, res) => {
  const { player, club, opponent, action, score } = req.query;

  if (!player || !action) {
    return res.status(400).json({ error: "Paramètres 'player' et 'action' requis." });
  }

  const systemPrompt = "Tu es un journaliste et commentateur sportif de football passionné, style Canal+ / BeIN Sports. Rédige un commentaire très court (2 phrases max), dynamique et immersif avec des emojis.";
  const userPrompt = `Joueur: ${player} (${club || 'Équipe'}) | Action: ${action} | Adversaire: ${opponent || 'N/A'} | Score: ${score || 'N/A'}`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`
        }
      }
    );

    const commentary = response.data.choices[0].message.content;

    res.json({
      commentary: commentary.trim(),
      success: true
    });
  } catch (error) {
    console.error("Erreur API Foot OpenRouter:", error.response?.data || error.message);
    res.json({
      commentary: `⚽ Match de folie pour ${player} avec ${club || 'son équipe'} !`,
      success: false
    });
  }
});

// Port dynamique exigé par Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
