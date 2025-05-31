// File: netlify/functions/gemini-proxy.js (VERSI BARU)

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    const apiKey = process.env.GEMINI_API_KEY; // WAJIB DISET DI NETLIFY ENV VARS

    if (!apiKey) {
        console.error('GEMINI_API_KEY environment variable not set.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not configured on server.' })
        };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        console.error('Invalid JSON payload:', event.body);
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    const { modelName, contents, generationConfig } = payload;

    if (!modelName || !contents || !Array.isArray(contents) || contents.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing or invalid modelName or contents in request body. Ensure contents is a non-empty array.' })
        };
    }

    // URL API Gemini, menggunakan modelName dari payload
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: contents,
        // Gunakan generationConfig dari payload, atau default jika tidak ada
        generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 256 }
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const responseBodyText = await response.text(); // Baca body sebagai teks dulu

        if (!response.ok) {
            console.error('Gemini API Error Status:', response.status);
            console.error('Gemini API Error Body:', responseBodyText);
            let errorDetails = responseBodyText;
            try {
                errorDetails = JSON.parse(responseBodyText); // Coba parse sebagai JSON
            } catch (e) { /* Biarkan sebagai teks jika bukan JSON */ }
            
            return { // Kembalikan error ke client
                statusCode: response.status, // Gunakan status code dari Gemini jika memungkinkan
                body: JSON.stringify({ 
                    error: 'Failed to fetch from Gemini API.',
                    details: errorDetails 
                })
            };
        }

        const data = JSON.parse(responseBodyText); // Parse jika respons OK

        let botResponseText = "Maaf, saya tidak bisa memproses permintaan Anda saat ini.";
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
            botResponseText = data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
            botResponseText = `Permintaan Anda tidak dapat diproses oleh AI: ${data.promptFeedback.blockReason}. Mohon coba pertanyaan lain.`;
            console.warn("Response blocked by Gemini:", data.promptFeedback);
        } else {
            console.warn("Unexpected response structure from Gemini API:", data);
        }
        
        // Kembalikan respons yang sudah diproses ke client
        return {
            statusCode: 200,
            body: JSON.stringify({ response: botResponseText }) // Format ini yang diharapkan oleh script.js Anda
        };

    } catch (error) {
        console.error('Error in Netlify proxy function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal Server Error in proxy function.',
                details: error.message 
            })
        };
    }
};