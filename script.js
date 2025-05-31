// File: script.js (MODIFIKASI)

// --- Konfigurasi Awal & Fungsi Helper ---
const launchDateString = "June 15, 2025 06:00:00"; // Pastikan format ini benar untuk new Date()
let countdownFunctionInterval; // Variabel untuk interval countdown

// --- Fungsi Countdown ---
function startCountdown() {
    const countDownDate = new Date(launchDateString).getTime();
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    function update() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownFunctionInterval);
            const countdownEl = document.getElementById("countdown");
            if (countdownEl) {
                countdownEl.innerHTML = "<span style='font-size:1.2rem; color: var(--text-color);'>We Are Live!</span>";
            }
            const mainTitle = document.querySelector('.main-title');
            if (mainTitle) {
                mainTitle.innerText = "Welcome!";
            }
        }
    }
    update(); // Panggil sekali untuk tampilan awal
    countdownFunctionInterval = setInterval(update, 1000);
}


// --- Kode Utama Setelah DOM Dimuat ---
document.addEventListener('DOMContentLoaded', () => {
    // Mulai Countdown
    startCountdown();

    // --- Konfigurasi Subscribe Form ---
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = document.getElementById('emailInput');
            if (emailInput) {
                const email = emailInput.value;
                if (email) {
                    alert(`Terima kasih! Email Anda "${email}" telah didaftarkan untuk notifikasi.`);
                    emailInput.value = '';
                    // Untuk fungsionalitas nyata, Anda bisa gunakan Netlify Forms
                    // dengan menambahkan data-netlify="true" ke tag <form> di HTML
                    // atau kirim ke backend lain.
                } else {
                    alert('Silakan masukkan alamat email Anda.');
                }
                // console.log("Email to subscribe:", email); // Untuk debugging jika perlu
            } else {
                console.error("Email input field not found.");
            }
        });
    }

    // --- Elemen dan Logika Music Player & Intro Overlay ---
    const introOverlay = document.getElementById('intro-blur-overlay');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const bgMusic = document.getElementById('background-music');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');

    if (introOverlay && musicPlayBtn && bgMusic && chatbotToggleBtn) {
        musicPlayBtn.addEventListener('click', () => {
            if (!musicPlayBtn.classList.contains('control-active')) { // Tombol awal untuk memulai
                introOverlay.classList.add('hidden');
                if (chatbotToggleBtn) {
                    chatbotToggleBtn.style.opacity = '1';
                    chatbotToggleBtn.style.pointerEvents = 'auto';
                }
                bgMusic.play().catch(error => {
                    console.warn("Autoplay was prevented. User interaction needed:", error);
                    // Mungkin beri tahu pengguna untuk klik lagi jika musik tidak mulai
                });
                musicPlayBtn.classList.add('control-active');
                musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else { // Tombol sudah menjadi kontrol musik
                if (bgMusic.paused) {
                    bgMusic.play();
                    // musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>'; // Diurus oleh event 'onplay'
                } else {
                    bgMusic.pause();
                    // musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>'; // Diurus oleh event 'onpause'
                }
            }
        });

        if (bgMusic) {
            bgMusic.onpause = () => {
                if (musicPlayBtn.classList.contains('control-active')) {
                    musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            };
            bgMusic.onplay = () => {
                if (musicPlayBtn.classList.contains('control-active')) {
                    musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                }
            };
        }
    } else {
        console.error('Required elements for music player/intro not found.');
    }

    // --- Elemen dan Logika Chatbot ---
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatbotToggleBtn && chatWindow && chatCloseBtn && chatMessages && chatInput && chatSendBtn) {
        chatbotToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) {
                if (chatMessages.children.length === 0) { // Hanya tambahkan pesan selamat datang jika belum ada pesan
                    addBotMessage("Halo! Saya adalah Karmel Bot. Ada yang bisa saya bantu?");
                }
                chatInput.focus();
            }
        });

        chatCloseBtn.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });

        chatSendBtn.addEventListener('click', handleUserMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleUserMessage();
            }
        });
    } else {
        console.error('Satu atau lebih elemen UI chatbot tidak ditemukan.');
    }

    // --- Fungsi Helper Chatbot ---
    function addUserMessage(message) {
        if (!chatMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'user');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    function addBotMessage(message, isTyping = false) {
        if (!chatMessages) return;

        // Hapus indikator pengetikan sebelumnya jika ini bukan pesan pengetikan baru
        if (!isTyping) {
            const existingTypingIndicator = chatMessages.querySelector('.typing-indicator');
            if (existingTypingIndicator) {
                existingTypingIndicator.remove();
            }
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'bot');
        if (isTyping) {
            messageElement.classList.add('typing-indicator');
            messageElement.innerHTML = '<span></span><span></span><span></span>';
        } else {
            messageElement.textContent = message;
        }
        chatMessages.appendChild(messageElement);
        scrollToBottom();
        return messageElement; // Kembalikan elemen untuk referensi (misal, menghapus indikator)
    }

    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    async function handleUserMessage() {
        if (!chatInput) return;
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        addUserMessage(messageText);
        chatInput.value = '';
        const typingIndicatorElement = addBotMessage('', true); // Tampilkan indikator mengetik

        try {
            // --- FUNGSI INTI PEMANGGILAN API CHATBOT (via Netlify Function) ---
            // Nama model yang ingin Anda gunakan.
            const MODEL_NAME = "gemini-1.5-flash-latest"; // Atau "gemini-2.0-flash-001" atau model valid lainnya

            // Susun 'contents' seperti yang Anda lakukan sebelumnya, termasuk konteks/history
            const contentsForGemini = [
                {
                    "role": "user",
                    "parts": [{ "text": "Konteks: Kamu adalah asisten chatbot untuk website Karmel. Namamu adalah Karmel Bot. Bersikaplah ramah dan membantu. Berikan jawaban singkat dan padat. Tanggal peluncuran website adalah " + launchDateString + ". Selalu jawab dalam bahasa Indonesia." }]
                },
                {
                    "role": "model",
                    "parts": [{ "text": "Tentu, saya Karmel Bot. Siap membantu Anda!"}]
                },
                {
                    "role": "user",
                    "parts": [{ "text": messageText }]
                }
            ];
            
            const generationConfig = {
                temperature: 0.7,
                maxOutputTokens: 256, // Sesuaikan jika perlu
            };

            const response = await fetch('/.netlify/functions/gemini-proxy', { // PANGGIL NETLIFY FUNCTION
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    modelName: MODEL_NAME,
                    contents: contentsForGemini,
                    generationConfig: generationConfig
                })
            });

            if (typingIndicatorElement && chatMessages.contains(typingIndicatorElement)) {
                typingIndicatorElement.remove();
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Gagal mem-parse respons error dari server."}));
                console.error("API Proxy Error Data:", errData);
                let errorMessage = `Error dari server: ${response.status}`;
                if (errData.error) {
                    errorMessage = typeof errData.error === 'object' ? JSON.stringify(errData.error) : errData.error;
                    if (errData.details) {
                         errorMessage += ` Detail: ${typeof errData.details === 'object' ? JSON.stringify(errData.details) : errData.details}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            let botResponse = "Maaf, saya tidak mendapatkan respons yang valid saat ini.";
            if (data.response) { // Proxy kita mengembalikan dalam format { response: "teks jawaban" }
                botResponse = data.response;
            } else {
                console.warn("Unexpected API response structure from proxy:", data);
            }
            addBotMessage(botResponse.trim());

        } catch (error) {
            console.error("Error processing chat message:", error.message);
            if (typingIndicatorElement && chatMessages.contains(typingIndicatorElement)) {
                typingIndicatorElement.remove();
            }
            
            // Logika Fallback jika API gagal (tetap ada dari kode Anda, ini bagus)
            let fallbackResponse = `Maaf, terjadi masalah: ${error.message}. Saya akan coba jawab dengan pengetahuan terbatas.`;
            addBotMessage(fallbackResponse);
            
            setTimeout(() => {
                let localBotResponse = "Saya dapat menjawab pertanyaan dasar tentang Karmel. Kami akan meluncur pada " + 
                    (launchDateString ? launchDateString.substring(0, launchDateString.indexOf(',')) : 'tanggal yang ditentukan') + 
                    ". Silakan tanyakan apa saja!";
                
                const lowerUserMessage = messageText.toLowerCase();
                if (lowerUserMessage.includes('halo') || lowerUserMessage.includes('hai')) {
                    localBotResponse = "Halo! Ada yang bisa saya bantu tentang Karmel hari ini?";
                } else if (lowerUserMessage.includes('launch') || lowerUserMessage.includes('kapan') || lowerUserMessage.includes('tanggal')) {
                    localBotResponse = `Kami akan diluncurkan pada ${launchDateString ? launchDateString.substring(0, launchDateString.indexOf(',')) : 'tanggal yang ditentukan'}. Bersiaplah!`;
                } else if (lowerUserMessage.includes('apa itu karmel') || lowerUserMessage.includes('tentang karmel')) {
                    localBotResponse = "Karmel adalah sebuah proyek yang sangat menarik. Nantikan detail lebih lanjut pada hari peluncuran!";
                } else if (lowerUserMessage.includes('terima kasih')) {
                    localBotResponse = "Sama-sama! Beri tahu saya jika ada pertanyaan lain.";
                } else if (lowerUserMessage.includes('siapa kamu')) {
                    localBotResponse = "Saya adalah Karmel Bot, asisten virtual untuk website Karmel.";
                }
                addBotMessage(localBotResponse);
            }, 1000);
        }
    }
});