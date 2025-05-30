// --- Konfigurasi Countdown ---
const launchDateString = "June 15, 2025 06:00:00"; // "June" bukan "Jude"
const countDownDate = new Date(launchDateString).getTime();

const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Pastikan elemen-elemen ini ada di HTML Anda
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownFunction);
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) {
            countdownEl.innerHTML = "<span style='font-size:1.2rem; color: var(--text-color);'>We Are Live!</span>";
        }
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) {
            mainTitle.innerText = "Welcome!";
        }
    }
}, 1000);

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
            } else {
                alert('Silakan masukkan alamat email Anda.');
            }
            console.log("Email to subscribe:", email);
        } else {
            console.error("Email input field not found.");
        }
    });
}

// --- Kode Utama Setelah DOM Dimuat ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen dan Logika Music Player & Intro Overlay ---
    const introOverlay = document.getElementById('intro-blur-overlay');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const bgMusic = document.getElementById('background-music');
    const pageWrapper = document.querySelector('.page-wrapper');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn'); // Tombol untuk menampilkan chatbot

    if (introOverlay && musicPlayBtn && bgMusic && pageWrapper && chatbotToggleBtn) {
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
                    musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    bgMusic.pause();
                    musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
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
        console.error('Required elements for music player/intro not found:');
        if (!introOverlay) console.error('introOverlay not found');
        if (!musicPlayBtn) console.error('musicPlayBtn not found');
        if (!bgMusic) console.error('bgMusic not found');
        if (!pageWrapper) console.error('pageWrapper not found');
        if (!chatbotToggleBtn) console.error('chatbotToggleBtn (for intro) not found');
    }

    // --- Elemen dan Logika Chatbot ---
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    // Pastikan semua elemen chatbot ada sebelum menambahkan event listener
    if (chatbotToggleBtn && chatWindow && chatCloseBtn && chatMessages && chatInput && chatSendBtn) {
        chatbotToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) {
                if (chatMessages.children.length === 0) {
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
        console.error('Chatbot UI elements not found:');
        if (!chatbotToggleBtn) console.error('chatbotToggleBtn (for chatbot UI) not found');
        if (!chatWindow) console.error('chatWindow not found');
        if (!chatCloseBtn) console.error('chatCloseBtn not found');
        if (!chatMessages) console.error('chatMessages not found');
        if (!chatInput) console.error('chatInput not found');
        if (!chatSendBtn) console.error('chatSendBtn not found');
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

    function addBotMessage(message) {
        if (!chatMessages) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'bot');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function handleUserMessage() {
        if (!chatInput) return;
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        addUserMessage(messageText);
        chatInput.value = '';

        setTimeout(() => {
            generateBotResponse(messageText);
        }, 500);
    }

    // --- Fungsi Inti Pemanggilan API Chatbot (Gemini) ---
    function generateBotResponse(userMessage) {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('chat-message', 'bot', 'typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        if (chatMessages) {
            chatMessages.appendChild(typingIndicator);
            scrollToBottom();
        } else {
            console.error("chatMessages element not found, cannot show typing indicator.");
        }

        // --- Konfigurasi untuk Gemini API ---
        const API_KEY = "AIzaSyBglA8Nehmx-dKjEj5g-HgxXjhRGWsRKbY"; // SANGAT PENTING: GANTI DENGAN API KEY BARU ANDA!
        
        // Verifikasi nama model ini di Google AI Studio atau dokumentasi resmi.
        // "gemini-2.0-flash-001" atau "gemini-1.5-flash-latest" adalah contoh yang baik.
        const MODEL_NAME = "gemini-2.0-flash-001"; // GANTI jika Anda menggunakan model lain yang valid.
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const contents = [
            {
                "role": "user",
                "parts": [{ "text": "Konteks: Kamu adalah asisten chatbot untuk website Karmel. Namamu adalah Karmel Bot. Bersikaplah ramah dan membantu. Berikan jawaban singkat dan padat. Tanggal peluncuran website adalah " + launchDateString + ". Selalu jawab dalam bahasa Indonesia." }]
            },
            {
                "role": "model",
                "parts": [{ "text": "Tentu, saya Karmel Bot. Siap membantu Anda!"}] // Contoh respons model, bisa disesuaikan/dihapus
            },
            {
                "role": "user",
                "parts": [{ "text": userMessage }]
            }
        ];
        
        const generationConfig = {
            temperature: 0.7,
            maxOutputTokens: 256,
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: generationConfig
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    console.error("API Error Data:", errData);
                    let errorMessage = `API error: ${response.status}`;
                    if (errData.error && errData.error.message) {
                        errorMessage += ` - ${errData.error.message}`;
                    }
                    throw new Error(errorMessage);
                }).catch(() => {
                    throw new Error(`API error: ${response.status} - ${response.statusText}. Respons tidak dapat di-parse sebagai JSON.`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (chatMessages && chatMessages.contains(typingIndicator)) {
                chatMessages.removeChild(typingIndicator);
            }
            
            let botResponse = "Maaf, saya tidak mendapatkan respons yang valid saat ini.";
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                botResponse = data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                botResponse = `Tidak dapat menghasilkan respons: ${data.promptFeedback.blockReason}. Coba pertanyaan lain.`;
                console.warn("Response blocked:", data.promptFeedback);
            } else {
                console.warn("Unexpected API response structure:", data);
            }
            addBotMessage(botResponse.trim());
        })
        .catch(error => {
            console.error("Error calling Gemini API:", error.message);
            if (chatMessages && chatMessages.contains(typingIndicator)) {
                chatMessages.removeChild(typingIndicator);
            }
            
            let fallbackResponse = `Maaf, terjadi masalah saat menghubungi AI Gemini (${error.message}). Saya akan coba jawab dengan pengetahuan terbatas saya.`;
            addBotMessage(fallbackResponse);
            
            setTimeout(() => {
                let localBotResponse = "Saya dapat menjawab pertanyaan dasar tentang Karmel. Kami akan meluncur pada " + 
                    (launchDateString ? launchDateString.substring(0, launchDateString.indexOf(',')) : 'tanggal yang ditentukan') + 
                    ". Silakan tanyakan apa saja!";
                
                const lowerUserMessage = userMessage.toLowerCase();
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
        });
    }
});