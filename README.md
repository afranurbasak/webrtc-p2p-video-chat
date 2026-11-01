# WebRTC Peer-to-Peer Video Chat

## 🇹🇷 Türkçe

### Proje Hakkında
WebRTC kullanarak iki kullanıcı arasında tarayıcı üzerinden birebir görüntülü görüşme ve metin sohbeti sağlayan bir uygulamadır. Görüntü ve ses eşler arası (peer-to-peer) aktarılır, metin mesajları `RTCDataChannel` üzerinden gönderilir. Aynı istemci için birbirinin yerine kullanılabilen iki sinyal sunucusu bulunur: **Node.js** ve **ASP.NET Core**.

Bu proje, daha sonra [realtime-chat-webrtc-aspnetcore](https://github.com/afranurbasak/realtime-chat-webrtc-aspnetcore) projesinde genişletilen fikirlerin ilk sürümüdür.

Çalışma mantığı:
1. İki kullanıcı da WebSocket ile sinyal sunucusuna bağlanır.
2. Arayan taraf bir SDP teklifi (offer) oluşturur; sunucu teklif/yanıt (answer) ve ICE adaylarını diğer kullanıcıya iletir.
3. Bağlantı kurulduktan sonra görüntü ve ses doğrudan tarayıcılar arasında akar, sohbet mesajları veri kanalı üzerinden gider.

### Özellikler
- Kamera ve mikrofon erişimi
- WebRTC ile birebir görüntülü ve sesli görüşme
- `RTCDataChannel` üzerinden metin sohbeti
- Node.js (`ws`) ve ASP.NET Core olmak üzere iki ayrı sinyal sunucusu
- Herkese açık STUN sunucusu ile ICE bağlantısı

### Kullanılan Teknolojiler
JavaScript, WebRTC, WebSocket, Node.js (`ws`), C#, ASP.NET Core (.NET 8), HTML, CSS

### Kurulum
```bash
git clone https://github.com/afranurbasak/webrtc-p2p-video-chat.git
cd webrtc-p2p-video-chat
```
- .NET sürümü için [.NET 8 SDK](https://dotnet.microsoft.com/download) gerekir.
- Node.js sürümü için Node.js gerekir: `cd node && npm install`

### Kullanım
**.NET sürümü (önerilen):**
```bash
cd dotnet
dotnet run
```
Terminalde görünen adresi iki ayrı tarayıcı penceresinde açın.

**Node.js sürümü:**
```bash
cd node
node sunucu.js            # 3000 portunda WebSocket sunucusu
npx http-server -p 8080   # ayrı bir terminalde, statik dosyalar için
```
`http://localhost:8080` adresini iki pencerede açın. Node.js istemcisi sinyal sunucusuna `ws://localhost:3000` adresinden bağlanır.

### Notlar
- Yalnızca STUN sunucusu kullanılır (TURN yoktur); farklı ağlardaki kullanıcılar arasında bağlantı kurulamayabilir.
- Arayüz metinleri Türkçedir.

## 🇬🇧 English

### About the Project
A browser application for one-to-one video calls and text chat between two users using WebRTC. Audio and video are transferred peer-to-peer, and text messages are sent over an `RTCDataChannel`. The same client comes with two interchangeable signalling servers: **Node.js** and **ASP.NET Core**.

This project is the first version of the ideas later expanded in [realtime-chat-webrtc-aspnetcore](https://github.com/afranurbasak/realtime-chat-webrtc-aspnetcore).

How it works:
1. Both users connect to the signalling server over WebSocket.
2. The caller creates an SDP offer; the server relays the offer/answer and ICE candidates to the other user.
3. Once connected, audio and video flow directly between the browsers and chat messages go through the data channel.

### Features
- Camera and microphone access
- One-to-one video and audio calls with WebRTC
- Text chat over `RTCDataChannel`
- Two separate signalling servers: Node.js (`ws`) and ASP.NET Core
- ICE connectivity through a public STUN server

### Technologies
JavaScript, WebRTC, WebSocket, Node.js (`ws`), C#, ASP.NET Core (.NET 8), HTML, CSS

### Installation
```bash
git clone https://github.com/afranurbasak/webrtc-p2p-video-chat.git
cd webrtc-p2p-video-chat
```
- The .NET version requires the [.NET 8 SDK](https://dotnet.microsoft.com/download).
- The Node.js version requires Node.js: `cd node && npm install`

### Usage
**.NET version (recommended):**
```bash
cd dotnet
dotnet run
```
Open the address printed in the terminal in two browser windows.

**Node.js version:**
```bash
cd node
node sunucu.js            # WebSocket server on port 3000
npx http-server -p 8080   # in a second terminal, serves the static files
```
Open `http://localhost:8080` in two windows. The Node.js client connects to the signalling server at `ws://localhost:3000`.

### Notes
- Only a STUN server is used (no TURN), so users on different networks may not be able to connect.
- The user interface is in Turkish.
