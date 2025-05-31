// File: script.js

// --- Konfigurasi Awal & Fungsi Helper ---
const launchDateString = "June 15, 2025 06:00:00";
let countdownFunctionInterval;

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
            if (mainTitle) mainTitle.innerText = "Welcome!";
        }
    }
    update();
    countdownFunctionInterval = setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    startCountdown();

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
                } else {
                    alert('Silakan masukkan alamat email Anda.');
                }
            } else {
                console.error("Email input field not found.");
            }
        });
    }

    const introOverlay = document.getElementById('intro-blur-overlay');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const bgMusic = document.getElementById('background-music');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');

    if (introOverlay && musicPlayBtn && bgMusic && chatbotToggleBtn) {
        musicPlayBtn.addEventListener('click', () => {
            if (!musicPlayBtn.classList.contains('control-active')) {
                introOverlay.classList.add('hidden');
                if (chatbotToggleBtn) {
                    chatbotToggleBtn.style.opacity = '1';
                    chatbotToggleBtn.style.pointerEvents = 'auto';
                }
                bgMusic.play().catch(error => {
                    console.warn("Autoplay was prevented:", error);
                });
                musicPlayBtn.classList.add('control-active');
                musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                if (bgMusic.paused) {
                    bgMusic.play();
                } else {
                    bgMusic.pause();
                }
            }
        });
        if (bgMusic) {
            bgMusic.onpause = () => {
                if (musicPlayBtn.classList.contains('control-active')) musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            };
            bgMusic.onplay = () => {
                if (musicPlayBtn.classList.contains('control-active')) musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            };
        }
    } else {
        console.error('Required elements for music player/intro not found.');
    }

    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatbotToggleBtn && chatWindow && chatCloseBtn && chatMessages && chatInput && chatSendBtn) {
        chatbotToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) {
                if (chatMessages.children.length === 0) {
                    addBotMessage("Halo! Saya Karmel Bot (versi tes). Silakan kirim pesan.");
                }
                chatInput.focus();
            }
        });
        chatCloseBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
        chatSendBtn.addEventListener('click', handleUserMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') handleUserMessage();
        });
    } else {
        console.error('Chatbot UI elements not found.');
    }

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
        if (!isTyping) {
            const existingTypingIndicator = chatMessages.querySelector('.typing-indicator');
            if (existingTypingIndicator) existingTypingIndicator.remove();
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
        return messageElement;
    }

    function scrollToBottom() {
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleUserMessage() {
        if (!chatInput) return;
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        addUserMessage(messageText);
        chatInput.value = '';
        const typingIndicatorElement = addBotMessage('', true);

        try {
            console.log("Mencoba mengirim ke proxy dengan pesan:", messageText); // LOG SEBELUM FETCH

            const response = await fetch('/.netlify/functions/gemini-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Untuk versi debug proxy yang sangat sederhana, kita hanya kirim userMessage
                    // Jika proxy Anda sudah mengharapkan modelName, contents, dll., sesuaikan lagi nanti.
                    userMessage: messageText,
                    // Anda bisa tambahkan modelName jika proxy minimal Anda juga memeriksanya:
                    // modelName: "gemini-2.0-flash-001", 
                })
            });

            console.log("Respons status dari proxy:", response.status); // LOG STATUS RESPONS

            if (typingIndicatorElement && chatMessages.contains(typingIndicatorElement)) {
                typingIndicatorElement.remove();
            }

            const responseBodyText = await response.text(); // Selalu ambil teks dulu
            console.log("Respons body mentah dari proxy:", responseBodyText); // LOG BODY MENTAH

            if (!response.ok) {
                let errData;
                try {
                    errData = JSON.parse(responseBodyText);
                } catch (e) {
                    // Jika gagal parse, berarti body bukan JSON, mungkin HTML 405
                    errData = { error: `Server error ${response.status}`, details: responseBodyText };
                }
                let errorMessage = errData.error || `Error dari server: ${response.status}`;
                if (errData.details && typeof errData.details === 'string' && errData.details.includes("<html>")) {
                    errorMessage = `Error ${response.status}: Halaman tidak diizinkan atau tidak ditemukan.`;
                } else if (errData.details) {
                    errorMessage += ` Detail: ${typeof errData.details === 'object' ? JSON.stringify(errData.details) : errData.details}`;
                }
                throw new Error(errorMessage);
            }

            const data = JSON.parse(responseBodyText); // Coba parse jika response.ok
            
            // Sesuaikan dengan apa yang dikembalikan oleh proxy minimal Anda
            // Jika proxy minimal mengembalikan { message: "...", receivedBody: ... }
            let botResponse = data.message || (data.response || "Tidak ada pesan dari bot.");
            if (data.receivedBody) {
                console.log("Proxy menerima body:", data.receivedBody);
            }
            addBotMessage(botResponse.trim());

        } catch (error) {
            console.error("Error dalam handleUserMessage:", error.message);
            if (typingIndicatorElement && chatMessages.contains(typingIndicatorElement)) {
                typingIndicatorElement.remove();
            }
            addBotMessage(`Error: ${error.message}`);
        }
    }
});