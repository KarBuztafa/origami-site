const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); 
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// --- TELEGRAM BİLGİLERİN ---
const TELEGRAM_TOKEN = "8496231793:AAHXevB0DFma3n73pby6CSHn3hSRQPoHN1E"; 
const CHAT_ID = "8791239379";

// --- SİTE TASARIMI ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Origami Sipariş</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background-color: #f4f7f6; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 85%; max-width: 400px; border-top: 5px solid #3498db; }
                input, textarea { width: 100%; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; padding: 12px; box-sizing: border-box; }
                button { width: 100%; background: #3498db; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="text-align:center; color:#2c3e50;">Origami Sipariş</h2>
                <form action="/gonder" method="POST">
                    <input type="text" name="isim" placeholder="Adın ve Sınıfın" required>
                    <textarea name="istek" placeholder="Ne istiyorsun? (Örn: 2 Kuş)" required></textarea>
                    <button type="submit">Siparişi Gönder</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// --- SİPARİŞİ TELEGRAMA ATAN KISIM ---
app.post('/gonder', async (req, res) => {
    const { isim, istek } = req.body;
    const zaman = new Date().toLocaleTimeString('tr-TR');
    const mesaj = `🚀 *YENİ SİPARİŞ!*\n👤 *Kişi:* ${isim}\n📄 *İstek:* ${istek}\n⏰ *Saat:* ${zaman}`;
    
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: mesaj,
            parse_mode: "Markdown"
        });
    } catch (e) { console.log("Hata:", e.message); }

    res.send(`
        <body style="background:#f4f7f6; font-family:sans-serif; text-align:center; padding-top:50px;">
            <h1>Sipariş Alındı! ✅</h1>
            <p>Fiyat bilgisi sizinle paylaşılacaktır.</p>
            <a href="/">Geri Dön</a>
        </body>
    `);
});

// --- SUNUCUYU BAŞLATMA ---
app.listen(3000, () => {
    console.log("🚀 Sunucu Aktif!");
});
