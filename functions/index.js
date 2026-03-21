const functions = require("firebase-functions");
const fetch = require("node-fetch");

// ===============================================
// Configura tu API Key de OpenAI aquí
// ===============================================
const OPENAI_API_KEY = "TU_OPENAI_API_KEY_AQUI"; // <-- reemplaza esto con tu API Key

// ===============================================
// Función HTTPS para manejar el chat
// ===============================================
exports.dollyChat = functions.https.onRequest(async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Falta el mensaje del usuario." });
    }

    // Aquí construimos el prompt para ChatGPT
    const prompt = `
Eres Dolly, asistente virtual de NextLayer LATAM.
Responde preguntas sobre los servicios de la empresa:
Ciberseguridad, Consultoría IT, Gestión de Servicios y Capacitación.
Mantén un tono profesional y amable.
Mensaje del usuario: "${userMessage}"
`;

    // Llamada a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Lo siento, no puedo responder eso ahora.";

    res.json({ reply });
  } catch (error) {
    console.error("Error en Dolly Function:", error);
    res.status(500).json({ error: "Error interno en Dolly." });
  }
});
