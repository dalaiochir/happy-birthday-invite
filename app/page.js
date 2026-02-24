"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const audioRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro -> reveal
  const [audioReady, setAudioReady] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // 1) Intro дуусмагц reveal рүү шилжинэ
  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 5200);
    return () => clearTimeout(t);
  }, []);

  // 2) Autoplay оролдлого
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.volume = 0.85;

    const tryPlay = async () => {
      try {
        // Зарим браузер зөвхөн muted үед зөвшөөрдөг
        a.muted = true;
        await a.play();

        // бага зэрэг хүлээгээд unmute
        setTimeout(() => {
          a.muted = false;
          setAudioReady(true);
        }, 250);
      } catch (e) {
        setAudioBlocked(true);
      }
    };

    tryPlay();
  }, []);

  // 3) Block хийгдвэл хэрэглэгчийн interaction-аар эхлүүлэх
  const enableAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.muted = false;
      await a.play();
      setAudioBlocked(false);
      setAudioReady(true);
    } catch (e) {
      // Interaction байсан ч block болох тохиолдол ховор
      setAudioBlocked(true);
    }
  };

  // === ЭНДЭЭС мэдээллээ зас ===
  const info = {
    title: "🎂 Далай-Очирын төрсөн өдөр 🎂",
    date: "2026-03-07 (Бямба)",
    time: "19:00 эхэлнэ",
    placeName: "MK Rooftop Party Room",
    address: "Улаанбаатар, … дүүрэг, … хороо, … байр",
    mapLink: "https://maps.google.com/?q=Ulaanbaatar", // хүсвэл өөрчил
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
  };

  return (
    <main className={`page ${phase === "reveal" ? "phase-reveal" : "phase-intro"}`}>
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

      {/* Intro Overlay */}
      <section className="intro" aria-label="intro">
        <div className="introCard">
          <div className="boom">💥</div>
          <h1 className="introTitle">
            {info.title}
            <span className="sub">ЧИ УРИГДСАН! 🎉</span>
          </h1>

          <p className="introLine">
            Ороод л шууд галзуу эхэлнэ шүү 😆
          </p>

          {audioBlocked && (
            <button className="startBtn" onClick={enableAudio}>
              🔊 Товшоод PARTY-г эхлүүлье
            </button>
          )}

          {!audioBlocked && (
            <div className="audioHint">
              {audioReady ? "🎶 Дуу явж байна..." : "🎶 Дууг асаах гэж оролдож байна..."}
            </div>
          )}

          <div className="countdown">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </section>

      {/* Reveal Content */}
      <section className="content" aria-label="content">
        <div className="card">
          <h2 className="title">{info.title}</h2>

          <div className="metaGrid">
            <div className="metaItem">
              <div className="k">📅 Өдөр</div>
              <div className="v">{info.date}</div>
            </div>
            <div className="metaItem">
              <div className="k">⏰ Цаг</div>
              <div className="v">{info.time}</div>
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

          <a className="mapBtn" href={info.mapLink} target="_blank" rel="noreferrer">
            🧭 Газрын зураг нээх
          </a>

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

          <div className="footerNote">
            Хоцорвол “DJ намайг хайж байна” гэж бодно шүү 😂
          </div>
        </div>
      </section>
    </main>
  );
}