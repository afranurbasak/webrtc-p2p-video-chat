const WebSocket = require("ws");

const sunucu = new WebSocket.Server({ port: 3000 });

let kullanicilar = [];

sunucu.on("connection", (baglanti) => {
    kullanicilar.push(baglanti);
    console.log("Yeni kullanıcı bağlandı. Toplam:", kullanicilar.length);

    baglanti.on("message", (mesaj) => {
        console.log("Mesaj geldi:", mesaj.toString());

        kullanicilar.forEach((kullanici) => {
            if (kullanici !== baglanti && kullanici.readyState === WebSocket.OPEN) {
                kullanici.send(mesaj.toString());
                console.log("Mesaj diğer kullanıcıya gönderildi");
            }
        });
    });

    baglanti.on("close", () => {
        kullanicilar = kullanicilar.filter(k => k !== baglanti);
        console.log("Bir kullanıcı ayrıldı. Kalan:", kullanicilar.length);
    });
});

console.log("Sunucu 3000 portunda çalışıyor");