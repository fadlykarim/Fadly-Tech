// --- Konfigurasi Countdown ---
// Atur tanggal peluncuran Anda di sini
// Format: "Bulan Hari, Tahun Jam:Menit:Detik" (misalnya, "December 31, 2024 23:59:59")
const launchDateString = "Juny 15, 2025 06:00:00"; // Contoh: 31 Juli 2025, pukul 17:00
const countDownDate = new Date(launchDateString).getTime();

// Update countdown setiap 1 detik
const countdownFunction = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    // Kalkulasi waktu
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Tampilkan hasil di elemen dengan id yang sesuai
    // Menggunakan String().padStart() untuk memastikan selalu ada 2 digit (misal: 05 bukan 5)
    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');

    // Jika countdown selesai
    if (distance < 0) {
        clearInterval(countdownFunction);
        document.getElementById("countdown").innerHTML = "<span style='font-size:1.2rem; color: var(--text-color);'>We Are Live!</span>";
        const mainTitle = document.querySelector('.main-title');
        if (mainTitle) {
            mainTitle.innerText = "Welcome!";
        }
        // Anda bisa menambahkan aksi lain di sini, seperti mengarahkan ke halaman utama
    }
}, 1000);


// Handle form subscription (contoh sederhana)
const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Mencegah form mengirim data secara default
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value;
        
        if (email) {
            alert(`Terima kasih! Email Anda "${email}" telah didaftarkan untuk notifikasi.`);
            emailInput.value = ''; // Kosongkan input setelah submit
        } else {
            alert('Silakan masukkan alamat email Anda.');
        }
        // Di aplikasi nyata, Anda akan mengirim email ini ke server atau layanan email marketing
        // Kode di bawah ini hanya mencatat email ke konsol browser, tidak mengirimkannya.
        console.log("Email to subscribe:", email);
    });
}
