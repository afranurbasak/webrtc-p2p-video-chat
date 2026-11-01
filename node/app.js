const kendiVideo = document.getElementById("kendiVideo");
const karsiVideo = document.getElementById("karsiVideo");
const karsiKart = document.getElementById("karsiKart");

const kameraBtn = document.getElementById("kameraBtn");
const kameraKapatBtn = document.getElementById("kameraKapatBtn");
const mikrofonBtn = document.getElementById("mikrofonBtn");
const baglanBtn = document.getElementById("baglanBtn");
const buyutBtn = document.getElementById("buyutBtn");
const bitirBtn = document.getElementById("bitirBtn");
const kucultBtn = document.getElementById("kucultBtn");

const durum = document.getElementById("durum");
const mesajAlani = document.getElementById("mesajAlani");
const mesajKutusu = document.getElementById("mesajKutusu");
const gonderBtn = document.getElementById("gonderBtn");

const ws = new WebSocket("ws://localhost:3000");

let yerelAkis = null;
let peer = null;
let veriKanali = null;
let buyukMod = false;
let mikrofonKapali = false;
let kameraKapali = false;
let bekleyenAdaylar = [];
let offerGonderildi = false;

function durumYaz(metin) {
  durum.textContent = "Durum: " + metin;
}

function mesajEkle(kim, metin) {
  const div = document.createElement("div");
  div.className = "mesaj-kutu " + (kim === "Ben" ? "mesaj-ben" : "mesaj-karsi");
  div.innerHTML = `<strong>${kim}</strong>${metin}`;
  mesajAlani.appendChild(div);
  mesajAlani.scrollTop = mesajAlani.scrollHeight;
}

function veriKanaliOlaylariniAyarla() {
  if (!veriKanali) return;

  veriKanali.onopen = () => {
    durumYaz("Veri kanalı açıldı");
  };

  veriKanali.onmessage = (event) => {
    mesajEkle("Karşı Taraf", event.data);
  };

  veriKanali.onclose = () => {
    durumYaz("Veri kanalı kapandı");
  };
}

async function kamerayiAc() {
  if (yerelAkis) {
    kendiVideo.srcObject = yerelAkis;
    return yerelAkis;
  }

  try {
    yerelAkis = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    kendiVideo.srcObject = yerelAkis;
    durumYaz("Kamera açıldı");
    return yerelAkis;
  } catch (hata) {
    console.error("Kamera açma hatası:", hata);
    durumYaz("Kamera açılamadı");
    throw hata;
  }
}

async function peerOlustur() {
  if (peer) return peer;

  peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  peer.ontrack = (event) => {
    karsiVideo.srcObject = event.streams[0];
    durumYaz("Karşı taraf yayını geldi");
  };

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(JSON.stringify({
        tip: "candidate",
        candidate: event.candidate
      }));
    }
  };

  peer.onconnectionstatechange = () => {
    durumYaz("Bağlantı durumu: " + peer.connectionState);
  };

  peer.ondatachannel = (event) => {
    veriKanali = event.channel;
    veriKanaliOlaylariniAyarla();
  };

  const akis = await kamerayiAc();
  akis.getTracks().forEach(track => {
    peer.addTrack(track, akis);
  });

  return peer;
}

async function bekleyenAdaylariEkle() {
  while (bekleyenAdaylar.length > 0) {
    const aday = bekleyenAdaylar.shift();
    try {
      await peer.addIceCandidate(new RTCIceCandidate(aday));
    } catch (hata) {
      console.error("ICE adayı eklenemedi:", hata);
    }
  }
}

function kamerayiKapatAc() {
  if (!yerelAkis) return;

  const videoTrack = yerelAkis.getVideoTracks()[0];
  if (!videoTrack) return;

  kameraKapali = !kameraKapali;
  videoTrack.enabled = !kameraKapali;

  kameraKapatBtn.textContent = kameraKapali ? "Kamerayı Aç" : "Kamerayı Kapat";
  durumYaz(kameraKapali ? "Kamera kapatıldı" : "Kamera yeniden açıldı");
}

function mikrofonuKapatAc() {
  if (!yerelAkis) return;

  const audioTrack = yerelAkis.getAudioTracks()[0];
  if (!audioTrack) return;

  mikrofonKapali = !mikrofonKapali;
  audioTrack.enabled = !mikrofonKapali;

  mikrofonBtn.textContent = mikrofonKapali ? "Mikrofonu Aç" : "Mikrofonu Kapat";
  durumYaz(mikrofonKapali ? "Mikrofon kapatıldı" : "Mikrofon yeniden açıldı");
}

function karsiVideoyuBuyutKucult() {
  buyukMod = !buyukMod;

  if (buyukMod) {
    karsiKart.classList.add("buyuk-video");
    buyutBtn.style.display = "none";
    kucultBtn.style.display = "block";
  } else {
    karsiKart.classList.remove("buyuk-video");
    buyutBtn.style.display = "inline-block";
    kucultBtn.style.display = "none";
  }
}

function aramayiBitir() {
  if (veriKanali) {
    try { veriKanali.close(); } catch {}
    veriKanali = null;
  }

  if (peer) {
    try { peer.close(); } catch {}
    peer = null;
  }

  if (karsiVideo.srcObject) {
    karsiVideo.srcObject = null;
  }

  bekleyenAdaylar = [];
  offerGonderildi = false;
  baglanBtn.disabled = false;

  if (buyukMod) {
    karsiKart.classList.remove("buyuk-video");
    buyutBtn.style.display = "inline-block";
    kucultBtn.style.display = "none";
    buyukMod = false;
  }

  durumYaz("Arama sonlandırıldı");
}

kameraBtn.addEventListener("click", async () => {
  await kamerayiAc();
});

kameraKapatBtn.addEventListener("click", () => {
  kamerayiKapatAc();
});

mikrofonBtn.addEventListener("click", () => {
  mikrofonuKapatAc();
});

buyutBtn.addEventListener("click", () => {
  karsiVideoyuBuyutKucult();
});

kucultBtn.addEventListener("click", () => {
  buyukMod = false;
  karsiKart.classList.remove("buyuk-video");
  buyutBtn.style.display = "inline-block";
  kucultBtn.style.display = "none";
});

bitirBtn.addEventListener("click", () => {
  aramayiBitir();
});

baglanBtn.addEventListener("click", async () => {
  if (offerGonderildi) return;

  offerGonderildi = true;
  baglanBtn.disabled = true;

  await peerOlustur();

  veriKanali = peer.createDataChannel("chat");
  veriKanaliOlaylariniAyarla();

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  ws.send(JSON.stringify({
    tip: "offer",
    offer: offer
  }));

  durumYaz("Offer gönderildi");
});

gonderBtn.addEventListener("click", () => {
  const msg = mesajKutusu.value.trim();
  if (!msg) return;

  if (!veriKanali || veriKanali.readyState !== "open") {
    alert("Veri kanalı henüz açık değil.");
    return;
  }

  veriKanali.send(msg);
  mesajEkle("Ben", msg);
  mesajKutusu.value = "";
});

mesajKutusu.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    gonderBtn.click();
  }
});

ws.onopen = () => {
  durumYaz("WebSocket bağlı");
};

ws.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  if (data.tip === "offer") {
    await peerOlustur();

    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    ws.send(JSON.stringify({
      tip: "answer",
      answer: answer
    }));

    await bekleyenAdaylariEkle();
    durumYaz("Offer alındı, answer gönderildi");
  }

  else if (data.tip === "answer") {
    await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
    await bekleyenAdaylariEkle();
    durumYaz("Answer alındı");
  }

  else if (data.tip === "candidate") {
    if (peer && peer.remoteDescription) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (hata) {
        console.error("ICE adayı eklenemedi:", hata);
      }
    } else {
      bekleyenAdaylar.push(data.candidate);
    }
  }
};

ws.onerror = (hata) => {
  console.error("WebSocket hatası:", hata);
  durumYaz("WebSocket hatası");
};