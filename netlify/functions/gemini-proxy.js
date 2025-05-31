// File: netlify/functions/gemini-proxy.js (VERSI DEBUG SANGAT MINIMAL)

exports.handler = async function(event, context) {
    // LOGGING PALING AWAL
    console.log("--- MINIMAL gemini-proxy invoked ---");
    console.log("Request Method:", event.httpMethod);
    console.log("Request Path:", event.path);
    console.log("Request Headers:", JSON.stringify(event.headers, null, 2)); // Log headers untuk info lebih
    
    let requestBodyContent = "No body or body not a string";
    if (event.body && typeof event.body === 'string') {
        requestBodyContent = event.body;
        console.log("Request Body (Raw String):", requestBodyContent);
    } else {
        console.log("Request Body (Not a String or Missing):", event.body);
    }
    // --- AKHIR LOGGING AWAL ---

    if (event.httpMethod === 'POST') {
        console.log("POST method correctly received by minimal proxy.");
        let parsedBody = null;
        let parseError = null;
        try {
            if (event.body && typeof event.body === 'string') {
                 parsedBody = JSON.parse(event.body);
                 console.log("Parsed body:", parsedBody);
            } else {
                console.log("Skipping JSON.parse as body is not a string or is missing.");
            }
        } catch (e) {
            console.error("Error parsing body in minimal proxy:", e.message);
            parseError = e.message;
        }

        // Mengembalikan pesan sukses bersama dengan apa yang diterima
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Minimal proxy: Panggilan POST diterima!",
                receivedMethod: event.httpMethod,
                receivedBodyContent: requestBodyContent, // Kirim kembali body mentah
                parsedBodyCheck: parsedBody ? "Body berhasil diparsing" : "Body tidak diparsing atau parsing gagal",
                parseErrorDetail: parseError,
                yourUserMessage: parsedBody ? parsedBody.userMessage : "Tidak ada userMessage di body yang diparsing"
            })
        };
    } else {
        // Jika bukan POST, kembalikan 405 dengan body JSON
        console.warn("Minimal proxy: Method Not Allowed. Received:", event.httpMethod);
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json", "Allow": "POST" },
            body: JSON.stringify({
                error: "Method Not Allowed",
                message: `Hanya metode POST yang diizinkan untuk endpoint ini. Anda menggunakan ${event.httpMethod}.`
            })
        };
    }
};