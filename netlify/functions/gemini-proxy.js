// File: netlify/functions/gemini-proxy.js

exports.handler = async function(event, context) {
    // LOGGING AWAL UNTUK DEBUG
    console.log("--- Netlify Function 'gemini-proxy' invoked ---");
    console.log("Request Method:", event.httpMethod);
    // Log sebagian kecil dari body untuk menghindari log yang terlalu besar, atau jika body tidak ada/bukan string
    if (event.body && typeof event.body === 'string') {
        console.log("Request Body (first 200 chars):", event.body.substring(0, 200) + (event.body.length > 200 ? '...' : ''));
    } else {
        console.log("Request Body:", event.body); // Log apa adanya jika bukan string atau tidak ada
    }
    // --- AKHIR LOGGING AWAL ---

    if (event.httpMethod !== 'POST') {
        console.warn("Method Not Allowed:", event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('FATAL: GEMINI_API_KEY environment variable not set on Netlify.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not configured on server.' })
        };
    }

    let payload;
    try {
        if (!event.body || typeof event.body !== 'string') {
            console.error('Invalid or missing event.body for JSON.parse. Body type:', typeof event.body, 'Body content:', event.body);
            return { statusCode: 400, body: JSON.stringify({ error: 'Request body is missing, not a string, or empty.' }) };
        }
        payload = JSON.parse(event.body);
        console.log("Parsed payload:", payload);
    } catch (e) {
        console.error('Error parsing JSON payload:', e.message);
        console.error('Raw event.body that failed parsing:', event.body); // Log body mentah jika parsing gagal
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload.', details: e.message }) };
    }

    const { modelName, contents, generationConfig } = payload;

    if (!modelName || !contents || !Array.isArray(contents) || contents.length === 0) {
        console.error('Validation Error: Missing or invalid modelName or contents.');
        console.error('Received - modelName:', modelName, 'contents type:', typeof contents, 'contents length:', Array.isArray(contents) ? contents.length : 'N/A');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing or invalid modelName or contents in request body. Ensure contents is a non-empty array.' })
        };
    }
    console.log(`Attempting to call Gemini with model: ${modelName}`);

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
        console.log("Gemini API Status:", geminiResponse.status);
        // Jangan log seluruh responseBodyText jika sukses dan panjang, kecuali untuk debugging error
        // console.log("Gemini API Response Body Text:", responseBodyText); 

        if (!geminiResponse.ok) {
            console.error('Gemini API returned an error.');
            console.error('Gemini API Error Status:', geminiResponse.status);
            console.error('Gemini API Error Body:', responseBodyText); // Log body error dari Gemini
            let errorDetails = responseBodyText;
            try {
                errorDetails = JSON.parse(responseBodyText);
            } catch (e) { /* Biarkan sebagai teks jika bukan JSON */ }
            
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch from Gemini API.', details: errorDetails })
            };
        }

        const data = JSON.parse(responseBodyText);
        console.log("Successfully parsed Gemini response.");

        let botResponseText = "Maaf, saya tidak bisa memproses permintaan Anda saat ini (struktur respons tidak dikenal).";
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
            botResponseText = data.candidates[0].content.parts[0].text;
            console.log("Extracted bot response successfully.");
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
            botResponseText = `Permintaan Anda tidak dapat diproses oleh AI: ${data.promptFeedback.blockReason}. Mohon coba pertanyaan lain.`;
            console.warn("Response blocked by Gemini:", data.promptFeedback);
        } else {
            console.warn("Unexpected response structure from Gemini API. Full data:", JSON.stringify(data, null, 2));
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ response: botResponseText })
        };

    } catch (error) {
        console.error('Catastrophic error in Netlify proxy function (fetch to Gemini or other):', error.message);
        console.error('Stack trace:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error in proxy function.', details: error.message })
        };
    }
};