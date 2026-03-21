const functions = require("firebase-functions");
const fetch = require("node-fetch"); // Para hacer peticiones HTTP a la API de OpenAI

// Reemplaza con tu API Key de OpenAI
const OPENAI_API_KEY = "TU_OPENAI_API_KEY_AQUI";

exports.dollyFunction = functions.https.onRequest(async (req, res) => {
    // Solo permitir POST
    if (req.method !== "POST") {
        return res.status(405).send("Método no permitido");
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).send({ error: "Falta el mensaje" });
    }

    try {
        // Llamada a ChatGPT
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Eres Dolly, asistente de NextLayer LATAM. Responde sobre nuestros servicios de IT y ciberseguridad de manera profesional y clara."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();

        // Devolver la respuesta de Dolly
        const reply = data.choices[0].message.content;
        res.send({ reply });

    } catch (error) {
        console.error("Error en Dolly Function:", error);
        res.status(500).send({ error: "Error interno en Dolly" });
    }
});
