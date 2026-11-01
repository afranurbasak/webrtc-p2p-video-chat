# WebRTC Peer-to-Peer Video Chat

One-to-one video call and text chat in the browser using WebRTC (media + `RTCDataChannel`), with a minimal WebSocket signaling server. The same client is provided with two interchangeable signaling servers: **Node.js** and **ASP.NET Core**.

This was the first iteration of the ideas later expanded in [realtime-chat-webrtc-aspnetcore](../realtime-chat-webrtc-aspnetcore).

## How it works

1. Both peers connect to the signaling server over WebSocket.
2. The caller creates an SDP offer; the server relays offer/answer and ICE candidates to the other peer.
3. Once connected, video/audio flow peer-to-peer and chat messages go over a data channel.

## Run — .NET version (recommended)

```bash
cd dotnet
dotnet run
```

Open the printed URL in two browser windows.

## Run — Node.js version

```bash
cd node
npm install
node sunucu.js        # WebSocket server on port 3000
```

Serve `index.html` with any static server (e.g. `npx http-server -p 8080`) and open `http://localhost:8080` in two windows.

## Tech stack

JavaScript · WebRTC · WebSockets · Node.js (`ws`) · ASP.NET Core (.NET 8)

UI text is in Turkish. Uses a public STUN server only (no TURN).
