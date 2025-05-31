// File: netlify/functions/gemini-proxy.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL_NAME;

    if (!apiKey || !modelName) {
        console.error('Server configuration error: GEMINI_API_KEY or GEMINI_MODEL_NAME not set.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key or model name not configured on server.' })
        };
    }

    let payload;
    try {
        if (!event.body || typeof event.body !== 'string') {
            return { statusCode: 400, body: JSON.stringify({ error: 'Request body is missing, not a string, or empty.' }) };
        }
        payload = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload.', details: e.message }) };
    }

    const { contents, generationConfig } = payload;

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing or invalid contents in request body. Ensure contents is a non-empty array.' })
        };
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: contents,
        generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 256 }
    };

    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const responseBodyText = await geminiResponse.text();

        if (!geminiResponse.ok) {
            let errorDetails = responseBodyText;
            try {
                errorDetails = JSON.parse(responseBodyText);
            } catch (e) { /* Keep as text if not JSON */ }
            
            console.error(`Gemini API Error (Status: ${geminiResponse.status}):`, errorDetails);
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch from Gemini API.', details: errorDetails })
            };
        }

        const data = JSON.parse(responseBodyText);
        let botResponseText = "Maaf, saya tidak bisa memproses permintaan Anda saat ini.";

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            botResponseText = data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
            botResponseText = `Permintaan Anda tidak dapat diproses oleh AI: ${data.promptFeedback.blockReason}. Mohon coba pertanyaan lain.`;
            console.warn("Response blocked by Gemini:", data.promptFeedback);
        } else {
            console.warn("Unexpected response structure from Gemini API:", data);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ response: botResponseText })
        };

    } catch (error) {
        console.error('Error in Netlify proxy function:', error.message, error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error in proxy function.', details: error.message })
        };
    }
};