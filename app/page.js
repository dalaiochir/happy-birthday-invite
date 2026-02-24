"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Page() {
  const audioRef = useRef(null);

  // ====== SETTINGS (ЭНДЭЭС Л зас) ======
  const info = useMemo(
    () => ({
      title: "🎂 Далай-Очирын төрсөн өдөр 🎂",
      dateLabel: "2026-03-07 (Бямба)",
      startTimeLabel: "19:00 эхэлнэ",
      placeName: "MK Rooftop Party Room",
      address: "Улаанбаатар, … дүүрэг, … хороо, … байр",
      mapLink: "https://maps.google.com/?q=Ulaanbaatar",

      // Countdown-д ашиглах яг огноо/цаг (Asia/Ulaanbaatar гэж бодоод бичиж байна)
      // Формат: YYYY-MM-DDTHH:mm:ss+08:00 (UB +08)
      eventISO: "2026-03-07T19:00:00+08:00",

      dresscode: "Инээдтэй / Colorful 🎭",
      bring: "Сайн настроение 😄",
      plan: [
        "19:00 — Ирэлт + Welcome drink 🥂",
        "19:30 — Сюрприз тоглоом 😈",
        "20:00 — Торт + зураг авалт 📸",
        "20:30 — Karaoke battle 🎤",
        "21:30 — Dance floor 💃🕺",
        "22:30 — Afterparty mode 🔥",
      ],

      // RSVP холбоос (QR дээр очно)
      // Google Form / Notion RSVP / Telegram group link гээд юу ч байж болно
      rsvpUrl: "https://t.me/your_group_or_form_link",

      // Random meme popup-д ашиглах local meme зургууд
      memes: ["/memes/meme1.jpg", "/memes/meme2.jpg", "/memes/meme3.jpg"],
    }),
    []
  );
  // ===================================

  const [phase, setPhase] = useState("intro"); // intro -> reveal
  const [audioReady, setAudioReady] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const [strobe, setStrobe] = useState(false);

  // Countdown
  const [countdown, setCountdown] = useState({
    done: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Meme popup
  const [memeOpen, setMemeOpen] = useState(false);
  const [memeSrc, setMemeSrc] = useState("");

  // 1) Intro дуусмагц reveal
  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 5200);
    return () => clearTimeout(t);
  }, []);

  // 2) Autoplay оролдлого (iOS дээр блоклогдож магадгүй)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.volume = 0.85;

    const tryPlay = async () => {
      try {
        a.muted = true;
        await a.play();
        setTimeout(() => {
          a.muted = false;
          setAudioReady(true);
        }, 250);
      } catch {
        setAudioBlocked(true);
      }
    };

    tryPlay();
  }, []);

  const enableAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.muted = false;
      await a.play();
      setAudioBlocked(false);
      setAudioReady(true);
    } catch {
      setAudioBlocked(true);
    }
  };

  // 3) Countdown timer
  useEffect(() => {
    const target = new Date(info.eventISO).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown((c) => ({ ...c, done: true, days: 0, hours: 0, minutes: 0, seconds: 0 }));
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const rem1 = totalSeconds % (24 * 3600);
      const hours = Math.floor(rem1 / 3600);
      const rem2 = rem1 % 3600;
      const minutes = Math.floor(rem2 / 60);
      const seconds = rem2 % 60;

      setCountdown({ done: false, days, hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [info.eventISO]);

  // 4) Random meme popup: reveal болсон үед хааяа pop хийе
  useEffect(() => {
    if (phase !== "reveal") return;

    const openRandom = () => {
      if (!info.memes?.length) return;
      const pick = info.memes[Math.floor(Math.random() * info.memes.length)];
      setMemeSrc(pick);
      setMemeOpen(true);
    };

    // эхний pop: 7–12 сек дотор random
    const firstDelay = 7000 + Math.floor(Math.random() * 5000);
    const t1 = setTimeout(openRandom, firstDelay);

    // дараагийн pop-ууд: 18–32 сек тутам random
    const id = setInterval(() => {
      // Хэрэв аль хэдийн нээлттэй бол дараагийн удаа алгасна
      if (memeOpen) return;
      // 60% магадлалтай pop
      if (Math.random() < 0.6) openRandom();
    }, 22000);

    return () => {
      clearTimeout(t1);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, info.memes]);

  // QR image (libгүй) — qrserver ашиглаж байна
  // Хэрэв external хүсэхгүй бол хэл, би local pure-js QR generator оруулж өгч болно (код урт болно).
  const qrImg = useMemo(() => {
    const encoded = encodeURIComponent(info.rsvpUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
  }, [info.rsvpUrl]);

  return (
    <main className={`page ${phase === "reveal" ? "phase-reveal" : "phase-intro"} ${strobe ? "strobe" : ""}`}>
      {/* Background + Effects */}
      <div className="bg" aria-hidden="true">
        <div className="grain" />
        <div className="laser laser1" />
        <div className="laser laser2" />
        <div className="laser laser3" />
        <div className="confetti" />
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="/audio/party.mp3" preload="auto" />

      {/* GALZUU LOADING / INTRO */}
      <section className="intro" aria-label="intro">
        <div className="introMega">
          <div className="emojiRain" aria-hidden="true">
            <span>🎉</span><span>😂</span><span>🔥</span><span>💃</span><span>🕺</span><span>🎂</span>
            <span>🥂</span><span>🎭</span><span>😈</span><span>✨</span><span>💥</span><span>🍾</span>
          </div>

          <div className="introTop">
            <div className="glitch" data-text="WELCOME TO CHAOS">
              WELCOME TO CHAOS
            </div>
            <div className="tiny">{audioReady ? "🎶 DUU ON ✅" : "🎶 DUU ON гэсэн горим..."}</div>
          </div>

          <div className="rot3dWrap" aria-label="3d rotating text">
            <div className="rot3d">
              <span>PARTY</span>
              <span>PARTY</span>
              <span>PARTY</span>
              <span>PARTY</span>
            </div>
          </div>

          <h1 className="introTitle2">
            {info.title}
            <span className="sub2">ЧИ УРИГДСАН! 🥳</span>
          </h1>

          <div className="pulseBar" aria-hidden="true">
            <div className="pulseFill" />
          </div>

          {audioBlocked ? (
            <button className="startBtn2" onClick={enableAudio}>
              🔊 Товшоод PARTY-г эхлүүлье
            </button>
          ) : (
            <div className="hint2">
              {audioReady ? "Дуу явж байна… одоо ачаалж дуусгана 😈" : "Дуу асаах гэж оролдож байна…"}
            </div>
          )}

          <div className="loadingLine">
            <span className="loaderDot" />
            <span className="loaderDot" />
            <span className="loaderDot" />
            <span className="loaderDot" />
            <span className="loaderDot" />
          </div>

          <div className="countdownMini">
            <div className="cdTitle">⏳ Countdown</div>
            {countdown.done ? (
              <div className="cdValue">ОДОООО! 🔥</div>
            ) : (
              <div className="cdValue">
                {countdown.days}d {String(countdown.hours).padStart(2, "0")}:
                {String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REVEAL CONTENT */}
      <section className="content" aria-label="content">
        <div className="topActions">
          <button className={`chip ${strobe ? "on" : ""}`} onClick={() => setStrobe((v) => !v)}>
            {strobe ? "⚡ Strobe ON" : "⚡ Strobe OFF"}
          </button>

          {!audioReady && (
            <button className="chip" onClick={enableAudio}>
              🔊 Дуу асаах
            </button>
          )}

          <a className="chip" href={info.mapLink} target="_blank" rel="noreferrer">
            🧭 Map
          </a>
        </div>

        <div className="card">
          <h2 className="title">{info.title}</h2>

          <div className="metaGrid">
            <div className="metaItem">
              <div className="k">📅 Өдөр</div>
              <div className="v">{info.dateLabel}</div>
            </div>
            <div className="metaItem">
              <div className="k">⏰ Цаг</div>
              <div className="v">{info.startTimeLabel}</div>
            </div>
            <div className="metaItem">
              <div className="k">📍 Байршил</div>
              <div className="v">{info.placeName}</div>
            </div>
            <div className="metaItem">
              <div className="k">🏠 Хаяг</div>
              <div className="v">{info.address}</div>
            </div>
          </div>

          <div className="divider" />

          <div className="twoCols">
            <div className="box">
              <h3>🎭 Dress code</h3>
              <p>{info.dresscode}</p>
            </div>
            <div className="box">
              <h3>👜 Бэлдэх зүйл</h3>
              <p>{info.bring}</p>
            </div>
          </div>

          <div className="divider" />

          <h3 className="h3">🔥 Үдэшлэгийн төлөвлөгөө</h3>
          <ol className="plan">
            {info.plan.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>

          <div className="divider" />

          <div className="rsvpRow">
            <div className="rsvpBox">
              <h3>✅ RSVP</h3>
              <p className="rsvpText">
                Ирэхээ баталгаажуулаарай (QR scan эсвэл link):
              </p>
              <a className="rsvpLink" href={info.rsvpUrl} target="_blank" rel="noreferrer">
                {info.rsvpUrl}
              </a>
            </div>

            <div className="qrBox">
              <img className="qr" src={qrImg} alt="RSVP QR code" />
              <div className="qrHint">📱 Scan me</div>
            </div>
          </div>

          <div className="divider" />

          <div className="footerNote">
            Хоцорвол “DJ намайг хайж байна” гэж бодно шүү 😂
          </div>
        </div>
      </section>

      {/* MEME POPUP */}
      {memeOpen && (
        <div className="memeOverlay" role="dialog" aria-modal="true" aria-label="meme popup" onClick={() => setMemeOpen(false)}>
          <div className="memeModal" onClick={(e) => e.stopPropagation()}>
            <div className="memeHeader">
              <div className="memeTitle">🚨 MEME ALERT 🚨</div>
              <button className="memeClose" onClick={() => setMemeOpen(false)}>
                ✖
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="memeImg" src={memeSrc} alt="Random meme" />
            <div className="memeFooter">
              <button className="memeBtn" onClick={() => setMemeOpen(false)}>
                OK 😂
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}