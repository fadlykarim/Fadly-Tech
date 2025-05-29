// --- Konfigurasi Countdown ---
const launchDateString = "Juny 15, 2025 06:00:00";
const countDownDate = new Date(launchDateString).getTime();

const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownFunction);
        document.getElementById("countdown").innerHTML = "<span style='font-size:1.2rem; color: var(--text-color);'>We Are Live!</span>";
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) {
            mainTitle.innerText = "Welcome!";
        }
    }
}, 1000);

const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value;
        if (email) {
            alert(`Terima kasih! Email Anda "${email}" telah didaftarkan untuk notifikasi.`);
            emailInput.value = '';
        } else {
            alert('Silakan masukkan alamat email Anda.');
        }
        console.log("Email to subscribe:", email);
    });
};

// Pastikan kode ini dijalankan setelah DOM sepenuhnya dimuat
document.addEventListener('DOMContentLoaded', () => {
    // ... (kode countdown dan subscribe form yang sudah ada bisa tetap di sini atau di luar DOMContentLoaded jika sudah di akhir body)

    const introOverlay = document.getElementById('intro-blur-overlay');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const bgMusic = document.getElementById('background-music');
    const pageWrapper = document.querySelector('.page-wrapper');

    if (introOverlay && musicPlayBtn && bgMusic && pageWrapper) {
        // Awalnya, konten di page-wrapper mungkin tidak interaktif karena overlay
        // Jika overlay tidak cukup, uncomment baris berikut:
        // pageWrapper.style.pointerEvents = 'none';

        musicPlayBtn.addEventListener('click', () => {
            if (!musicPlayBtn.classList.contains('control-active')) {
                // Klik pertama: hilangkan overlay, mainkan musik, ubah tombol
                introOverlay.classList.add('hidden');
                // pageWrapper.style.pointerEvents = 'auto'; // Aktifkan interaksi konten

                bgMusic.play().catch(error => {
                    console.warn("Autoplay was prevented:", error);
                    // Mungkin perlu interaksi pengguna lain untuk memulai audio jika autoplay diblokir
                    // Anda bisa menampilkan pesan atau membiarkannya.
                    // Untuk sekarang, kita asumsikan autoplay berhasil atau pengguna akan mengklik lagi.
                });
                
                musicPlayBtn.classList.add('control-active');
                musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                // Klik berikutnya: toggle play/pause
                if (bgMusic.paused) {
                    bgMusic.play();
                    musicPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    bgMusic.pause();
                    musicPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        });

        // Sinkronkan ikon tombol jika musik selesai atau di-pause oleh browser
        if (bgMusic) {
            bgMusic.onpause = () => {
                if (musicPlayBtn.classList.contains('control-active')) { // Hanya jika sudah jadi tombol kontrol
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
});
