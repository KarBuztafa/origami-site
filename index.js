const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

const TOKEN = '8496231793:AAHXevB0DFma3n73pby6CSHn3hSRQPoHN1E'; 
const CHAT_ID = '8791239379';

// Ana Sayfa Tasarımı ve Mantığı
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yusuf Kağan Origami Dükkanı</title>
            <script src="/socket.io/socket.io.js"></script>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; text-align: center; padding: 20px; }
                .container { background: white; max-width: 400px; margin: auto; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                h1 { color: #1a73e8; }
                input, select, button { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
                button { background-color: #1a73e8; color: white; border: none; font-weight: bold; cursor: pointer; }
                #bekleme, #sonuc { display: none; padding: 20px; border-radius: 10px; margin-top: 20px; }
                #bekleme { background-color: #e8f0fe; color: #1967d2; }
                #sonuc { background-color: #e6f4ea; color: #1e8e3e; border: 2px solid #1e8e3e; }
                .fiyat-buyuk { font-size: 32px; font-weight: bold; display: block; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div id="form-alan">
                    <h1>📄 Origami Dükkanı</h1>
                    <p>Sipariş ver, Yusuf Kağan fiyatı (kağıt adetini) hemen göndersin!</p>
                    <input type="text" id="ad" placeholder="Adın Soyadın" required>
                    <select id="urun">
                        <option value="Basit Kuş">🕊️ Basit Kuş</option>
                        <option value="Zıpzıp Kurbağa">🐸 Zıpzıp Kurbağa</option>
                        <option value="Görkemli Ejderha">🐉 Görkemli Ejderha</option>
                        <option value="Sürpriz Model">🎁 Sürpriz Model</option>
                    </select>
                    <button onclick="siparisVer()">TEKLİF AL</button>
                </div>

                <div id="bekleme">
                    <h2>Sipariş İletildi!</h2>
                    <p>Yusuf Kağan şu an mesajını gördü, fiyat belirliyor. Lütfen bu sayfadan ayrılma...</p>
                </div>

                <div id="sonuc">
                    <h2>Teklif Geldi! ✅</h2>
                    <span id="fiyat-yazisi" class="fiyat-buyuk"></span>
                    <p>Okulda kağıtları getirince origamini alabilirsin!</p>
                    <button onclick="location.reload()">Yeni Sipariş</button>
                </div>
            </div>

            <script>
                const socket = io();
                let musteriAdi = "";

                function siparisVer() {
                    musteriAdi = document.getElementById('ad').value;
                    const urunSecimi = document.getElementById('urun').value;
                    
                    if(!musteriAdi) return alert("Lütfen adını yaz!");

                    document.getElementById('form-alan').style.display = 'none';
                    document.getElementById('bekleme').style.display = 'block';

                    socket.emit('yeni-siparis', { ad: musteriAdi, urun: urunSecimi });
                }

                socket.on('fiyat-geldi', (data) => {
                    if(data.hedef.toLowerCase() === musteriAdi.toLowerCase()) {
                        document.getElementById('bekleme').style.display = 'none';
                        document.getElementById('sonuc').style.display = 'block';
                        document.getElementById('fiyat-yazisi').innerText = data.fiyat + " Adet Kağıt";
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Telegram'dan gelen cevapları yakalar
app.post('/telegram-webhook', (req, res) => {
    const body = req.body;
    if (body.message && body.message.text) {
        const text = body.message.text; 
        const parts = text.split(' '); // Örn: "Ahmet 5"
        
        if (parts.length >= 2) {
            const isim = parts[0];
            const kagitSayisi = parts[1];
            io.emit('fiyat-geldi', { hedef: isim, fiyat: kagitSayisi });
        }
    }
    res.sendStatus(200);
});

// Socket.io Bağlantısı
io.on('connection', (socket) => {
    socket.on('yeni-siparis', (data) => {
        const mesaj = `📦 *YENİ SİPARİŞ!*\n\n👤 *İsim:* ${data.ad}\n📝 *Ürün:* ${data.urun}\n\nFiyat vermek için cevap ver:\n\`${data.ad} [sayı]\``;
        
        axios.post(\`https://api.telegram.org/bot\${TOKEN}/sendMessage\`, {
            chat_id: CHAT_ID,
            text: mesaj,
            parse_mode: 'Markdown'
        }).catch(err => console.log("Telegram hatası:", err.message));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(\`Sunucu \${PORT} üzerinde çalışıyor\`));
