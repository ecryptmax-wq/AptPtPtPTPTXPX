const axios = require('axios');

const FIREBASE_URL = "https://cobc-88122-default-rtdb.asia-southeast1.firebasedatabase.app/videos.json";
const MY_ID = "1523066820"; 
const TELE_TOKEN = "8302211102:AAFp_kZa9HJWqQVq6UL4UUA97_Q8M7HZ22I";

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { message } = req.body;
        if (!message || !message.text) return res.status(200).send('ok');

        if (message.from.id.toString() !== MY_ID) {
            await axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
                chat_id: message.chat.id,
                text: "❌ Lu siapa? Hanya owner yang bisa posting!"
            });
            return res.status(200).send('ok');
        }

        const text = message.text; 
        if (text.includes('|')) {
            const [title, url] = text.split('|').map(item => item.trim());
            const videoId = url.includes('=') ? url.split('=')[1] : url.split('/').pop().replace('.mp4','');

            const newData = {
                id: videoId,
                title: title,
                timestamp: Date.now()
            };

            try {
                await axios.post(FIREBASE_URL, newData);
                await axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
                    chat_id: message.chat.id,
                    text: `✅ BERHASIL!\n\nJudul: ${title}\nID: ${videoId}\n\nCek di website sekarang.`
                });
            } catch (err) {
                // Perbaikan: Pakai variabel TELE_TOKEN yang sudah ada di atas
                await axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
                    chat_id: message.chat.id,
                    text: "❌ Gagal simpan ke Firebase."
                });
            }
        } else {
            // Perbaikan: Pakai variabel TELE_TOKEN yang sudah ada di atas
            await axios.post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
                chat_id: message.chat.id,
                text: "⚠️ Format salah!\n\nKirim: Judul Video | Link Videy"
            });
        }
        return res.status(200).send('ok');
    }
    res.status(405).send('Method Not Allowed');
};