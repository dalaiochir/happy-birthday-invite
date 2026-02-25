"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Page() {
  const audioRef = useRef(null);
  const airhornRef = useRef(null);

  // ====== SETTINGS (ЭНДЭЭС Л зас) ======
  const info = useMemo(
    () => ({
      title: "🎂Баясаа & Энхжин🎂 төрсөн өдөр",
      dateLabel: "2026-02-28 (Бямба)",
      startTimeLabel: "17:00 эхэлнэ",
      placeName: "Найрамдал явах замд байгаа олоод ирээрэй",
      address: "Улаанбаатар, СХ дүүрэг, 34 хороо,",
      mapLink: "https://maps.app.goo.gl/4CZkfovgDujN7FaZ7",

      // Countdown-д ашиглах яг огноо/цаг (UB +08)
      eventISO: "2026-02-28T17:00:00+08:00",

      secretCode: "PARTY", // <-- энд нууц кодоо тавь
      secretHint: "Нууц кодоо оруул 😈", // хүсвэл өөрчил

      dresscode: "Инээдтэй / Colorful 🎭",
      bring: "Сайхан настроение 😄",
      plan: [
        "19:00 — Ирэлт + Welcome drink 🥂",
        "19:30 — Сюрприз тоглоом 😈",
        "20:00 — Торт + зураг авалт 📸",
        "20:30 — Karaoke battle 🎤",
        "21:30 — Dance floor 💃🕺",
        "22:30 — Afterparty mode 🔥",
      ],

      rsvpUrl: "https://t.me/+TJao7C6dhEtiZWM9",

      memes: ["/memes/meme1.png", "/memes/meme2.png", "/memes/meme3.png", "/memes/meme4.png"],
    }),
    []
  );
  // ===================================

  // Phase: intro -> gate -> reveal
  const [phase, setPhase] = useState("intro");

  // Fake error overlay (эхэнд)
  const [fakeErrorStage, setFakeErrorStage] = useState("show404"); // show404 -> showJK -> done

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

  // Gate (who are you?) — торт captcha
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAnswer, setGateAnswer] = useState(null); // "corner" | "center" | "all"
  const [gateMsg, setGateMsg] = useState("");

  // Map prank
  const [mapPrankOpen, setMapPrankOpen] = useState(false);

    // =========================
  // NEW: PRIVATE CODE GATE
  // =========================
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

    useEffect(() => {
    try {
      const saved = localStorage.getItem("mk_party_unlocked");
      if (saved === "1") setIsUnlocked(true);
    } catch {
      // ignore
    }
  }, []);

  // =========================
  // NEW: Ultra Mode (Konami / party)
  // =========================
  const [ultra, setUltra] = useState(false);
  const [toast, setToast] = useState("");

  // =========================
  // NEW: Screenshot Frame Mode
  // =========================
  const [frameOpen, setFrameOpen] = useState(false);

  // =========================
  // NEW: Dance Floor (Shake)
  // =========================
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakeBurst, setShakeBurst] = useState(false);

    useEffect(() => {
    if (!isUnlocked) {
      setFakeErrorStage("show404");
      setPhase("intro");
      setGateOpen(false);
      setMemeOpen(false);
      setMapPrankOpen(false);
    }
  }, [isUnlocked]);

  // 0) Fake error overlay sequence (ЧИНИЙ ХУГАЦАА ХЭВЭЭР)
  useEffect(() => {

    if (!isUnlocked) return;

    const t1 = setTimeout(() => setFakeErrorStage("showJK"), 3000); // 404 -> JK
    const t2 = setTimeout(() => setFakeErrorStage("done"), 4000); // нийт 4с
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isUnlocked]);

  // 1) Intro дуусмагц gate нээнэ (ЧИНИЙ ХУГАЦАА ХЭВЭЭР)
  useEffect(() => {
  if (!isUnlocked) return;

  const t = setTimeout(() => {
    setPhase("gate");
    setGateOpen(true);
  }, 10000);

  return () => clearTimeout(t);
}, [isUnlocked]);

  // 2) Autoplay оролдлого (iOS дээр блоклогдож магадгүй)
  useEffect(() => {
    if (!isUnlocked) return;
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
  }, [isUnlocked]);

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

    const unlockSite = () => {
    const expected = String(info.secretCode || "").trim().toLowerCase();
    const got = String(codeInput || "").trim().toLowerCase();

    if (!expected) {
      setCodeError("Нууц код тохируулаагүй байна 😭");
      return;
    }

    if (got === expected) {
      setCodeError("");
      setIsUnlocked(true);
      try {
        localStorage.setItem("mk_party_unlocked", "1");
      } catch {
        // ignore
      }
      // unlock interaction дээр audio autoplay боломжтой болдог
      enableAudio();
      return;
    }

    setCodeError("YOU ARE IMPOSTER!!! 😈");
  };

  // 3) Countdown timer (ЧИНИЙ interval ХЭВЭЭР: 2000ms)
  useEffect(() => {
    const target = new Date(info.eventISO).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ done: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [info.eventISO]);

  // 4) Random meme popup (ЧИНИЙ interval ХЭВЭЭР: 30000ms)
  useEffect(() => {
    if (phase !== "reveal") return;

    const openRandom = () => {
      if (!info.memes?.length) return;
      const pick = info.memes[Math.floor(Math.random() * info.memes.length)];
      setMemeSrc(pick);
      setMemeOpen(true);
    };

    const firstDelay = 7000 + Math.floor(Math.random() * 5000);
    const t1 = setTimeout(openRandom, firstDelay);

    const id = setInterval(() => {
      if (memeOpen) return;
      if (Math.random() < 0.6) openRandom();
    }, 30000);

    return () => {
      clearTimeout(t1);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, info.memes]);

  // QR image (libгүй) — qrserver
  const qrImg = useMemo(() => {
    const encoded = encodeURIComponent(info.rsvpUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encoded}`;
  }, [info.rsvpUrl]);

  // Gate actions (ЧИНИЙ хугацаа ХЭВЭЭР: 4000ms)
  const chooseGate = (choice) => {
    setGateAnswer(choice);

    if (choice === "corner") {
      setGateMsg("Буланг сонгосон хүн бол амьдралын нарийн мэдрэмжтэй 🧐🍰 (Perfect)");
    } else if (choice === "center") {
      setGateMsg("Үнэхээр ТОМ зорилготой хүн байна 😤🎂 (Boss energy)");
    } else {
      setGateMsg("БҮГД гэдэг бол жинхэнэ party animal 😈🔥 (сэжигтэй)");
    }

    setTimeout(() => {
      setGateOpen(false);
      setPhase("reveal");
    }, 4000);
  };

  // Map prank (ЧИНИЙ хугацаа ХЭВЭЭР: 3500ms)
  const onMapClick = (e) => {
    e.preventDefault();
    setMapPrankOpen(true);

    setTimeout(() => {
      setMapPrankOpen(false);
      window.open(info.mapLink, "_blank", "noopener,noreferrer");
    }, 3500);
  };

  // =========================
  // NEW: Toast helper
  // =========================
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
      const vibrate = (pattern = [80, 40, 80]) => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore (зарим браузер дэмжихгүй)
    }
  };
  };

  // =========================
  // NEW: Konami + "party" Easter egg
  // =========================
  useEffect(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let idx = 0;
    let typed = "";

    const onKeyDown = (e) => {
      const key = e.key;

      // Konami
      const expected = KONAMI[idx];
      if (key === expected || key.toLowerCase() === expected) {
        idx += 1;
        if (idx === KONAMI.length) {
          idx = 0;
          setUltra(true);
          showToast("🔓 ULTRA MODE ON 😈");
          // хүсвэл автоматаар strobe асааж болно
          setStrobe(true);
        }
      } else {
        idx = 0;
      }

      // "party" typing
      if (key.length === 1) {
        typed = (typed + key.toLowerCase()).slice(-12);
        if (typed.includes("party")) {
          typed = "";
          setUltra(true);
          showToast("🔓 ULTRA MODE ON 😈");
          setStrobe(true);
        }
      }

      // ESC to exit
      if (key === "Escape") {
        if (frameOpen) setFrameOpen(false);
        if (ultra) {
          setUltra(false);
          showToast("😇 Ultra OFF");
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultra, frameOpen]);

  // =========================
  // NEW: Shake Mode (with iOS permission)
  // =========================
  const enableShake = async () => {
    try {
      if (typeof window !== "undefined" && typeof DeviceMotionEvent !== "undefined") {
        // iOS 13+ permission
        // eslint-disable-next-line no-undef
        if (typeof DeviceMotionEvent.requestPermission === "function") {
          // eslint-disable-next-line no-undef
          const res = await DeviceMotionEvent.requestPermission();
          if (res !== "granted") {
            showToast("❌ Shake зөвшөөрөл өгөөгүй байна");
            return;
          }
        }
      }
      setShakeEnabled(true);
      showToast("💃 Shake ON");
    } catch {
      showToast("❌ Shake асааж чадсангүй");
    }
  };

  useEffect(() => {
    if (!shakeEnabled) return;

    let last = 0;
    let cooldown = false;

    const onMotion = (event) => {
      const a = event.accelerationIncludingGravity;
      if (!a) return;

      const x = a.x || 0;
      const y = a.y || 0;
      const z = a.z || 0;

      const mag = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();
      if (now - last < 60) return;
      last = now;

      // threshold (хэрэв хэт мэдрэг/мэдрэхгүй байвал 16~22 гэж тааруул)
      if (mag > 18 && !cooldown) {
        cooldown = true;

        setShakeBurst(true);
        showToast("🔊 BASS DROP!!!");
        vibrate(ultra ? [80, 40, 160, 40, 120] : [60, 30, 120, 30, 80]); // party vibe
        playAirhorn();
        const playAirhorn = () => {
  const a = airhornRef.current;
  if (!a) return;

  try {
    a.currentTime = 0;
    a.volume = 1;
    a.play();

    // 0.3 секунд дараа зогсооно
    setTimeout(() => {
      a.pause();
      a.currentTime = 0;
    }, 300);
  } catch {
    // ignore
  }
};

        // Түр strobe асаах (хүсэхгүй бол энэ 2 мөрийг устга)
        setStrobe(true);

        setTimeout(() => setShakeBurst(false), 700);
        setTimeout(() => {
          cooldown = false;
        }, 1200);
      }
    };

    window.addEventListener("devicemotion", onMotion, { passive: true });
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [shakeEnabled]);

  return (
    <main
      
      className={`page ${phase === "reveal" ? "phase-reveal" : "phase-intro"} ${strobe ? "strobe" : ""} ${
        ultra ? "ultra" : ""
      } ${shakeBurst ? "shakeBurst" : ""}`}
    >

      {!isUnlocked && (
        <div className="lockOverlay" role="dialog" aria-modal="true" aria-label="Private access">
          <div className="lockCard">
            <div className="lockTitle">🔒 PRIVATE PARTY ACCESS</div>
            <div className="lockSub">{info.secretHint}</div>

            <input
              className="lockInput"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setCodeError("");
              }}
              placeholder="Нууц код..."
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
            />

            {codeError && <div className="lockErr">{codeError}</div>}

            <div className="lockBtns">
              <button className="lockBtn" onClick={unlockSite}>
                НЭВТРЭХ 😈
              </button>
              <button
                className="lockBtn ghost"
                onClick={() => {
                  setCodeInput("");
                  setCodeError("");
                }}
              >
                ЦЭВЭРЛЭХ
              </button>
            </div>

            <div className="lockHint">
              * Халаалттай бүлгэмийн гишүүд л зөвхөн мэднэ 😎
            </div>
          </div>
        </div>
      )}


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
      <audio ref={airhornRef} src="/audio/airhorn.mp3" preload="auto" />

            {/* SHAKE CONFETTI BLAST (CSS particles) */}
      <div className={`shakeBlast ${shakeBurst ? "on" : ""}`} aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="sh" style={{ "--i": i }} />
        ))}
      </div>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}

      {/* FAKE ERROR OVERLAY (эхэнд) */}
      {fakeErrorStage !== "done" && (
        <div className="fakeError" role="alert" aria-live="assertive">
          <div className={`fakeCard ${fakeErrorStage === "showJK" ? "jk" : ""}`}>
            {fakeErrorStage === "show404" ? (
              <>
                <div className="fakeTitle">404: Fun not found</div>
                <div className="fakeSub">Та ямар нэгэн зүйл хайсан бол энд байх ёстой…</div>
                <div className="fakeBar">
                  <div className="fakeFill" />
                </div>
              </>
            ) : (
              <>
                <div className="fakeTitle">🥸JOKE MY BABY🥸</div>
                <div className="fakeSub">Хүлээсэнд баярлалаа</div>
                <div className="fakeBar">
                  <div className="fakeFill" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* GALZUU LOADING / INTRO */}
      <section className="intro" aria-label="intro">
        <div className="introMega">
          <div className="emojiRain" aria-hidden="true">
            <span>🎉</span>
            <span>😂</span>
            <span>🔥</span>
            <span>💃</span>
            <span>🕺</span>
            <span>🎂</span>
            <span>🥂</span>
            <span>🎭</span>
            <span>😈</span>
            <span>✨</span>
            <span>💥</span>
            <span>🍾</span>
          </div>

          <div className="introTop">
            <div className="glitch" data-text="WELCOME TO CHAOS">
              WELCOME TO PARTY
            </div>
            {/* <div className="tiny">{audioReady ? "🎶 DUU ON ✅" : "🎶 DUU ON гэсэн горим..."}</div> */}
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
            <span className="sub2">ЧИ УРИГДСАААН ХОНГОР МИНЬ! 🥳</span>
          </h1>

          <div className="pulseBar" aria-hidden="true">
            <div className="pulseFill" />
          </div>

          {audioBlocked ? (
            <button className="startBtn2" onClick={enableAudio}>
              🔊 Товшоод PARTY-г эхлүүлье
            </button>
          ) : (
            <div className="hint2">{/* чи коммент хийсэн учраас хэвээр үлдээлээ */}</div>
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
                {countdown.days}d {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </div>
            )}
          </div>

          <div className="easterHint">🤫 Secret: type “party” or try Konami…</div>
        </div>
      </section>

      {/* WHO ARE YOU? GATE */}
      {gateOpen && (
        <div className="gateOverlay" role="dialog" aria-modal="true" aria-label="Торт captcha">
          <div className="gateModal">
            <div className="gateTitle">🕵️ Хэн бэ чи?</div>
            <div className="gateQ">Тортны хамгийн гоё хэсэг?</div>

            <div className="gateBtns">
              <button className={`gateBtn ${gateAnswer === "corner" ? "picked" : ""}`} onClick={() => chooseGate("corner")}>
                Талх 🍰
              </button>
              <button className={`gateBtn ${gateAnswer === "center" ? "picked" : ""}`} onClick={() => chooseGate("center")}>
                Гол 🎂
              </button>
              <button className={`gateBtn ${gateAnswer === "all" ? "picked" : ""}`} onClick={() => chooseGate("all")}>
                Бүгд 😈
              </button>
            </div>

            <div className="gateMsg">{gateMsg ? gateMsg : "Зөв хариулт байхгүй. Бүгд зөв. Гэхдээ зан чанар чинь илэрнэ 😭"}</div>
            <div className="gateHint">* Сонгосны дараа автоматаар нэвтэрнэ</div>
          </div>
        </div>
      )}

      {/* REVEAL CONTENT */}
      <section className="content" aria-label="content">
        <div className="topActions">
          <button className={`chip ${strobe ? "on" : ""}`} onClick={() => setStrobe((v) => !v)}>
            {strobe ? "⚡ Strobe ON" : "⚡ Strobe OFF"}
          </button>

          {/* NEW: Shake enable */}
          {!shakeEnabled ? (
            <button className="chip" onClick={enableShake}>
              💃 Shake OFF
            </button>
          ) : (
            <button className="chip on" onClick={() => setShakeEnabled(false)}>
              💃 Shake ON
            </button>
          )}

          {/* NEW: Screenshot frame */}
          <button className="chip" onClick={() => setFrameOpen(true)}>
            📸 STORY
          </button>

          {!audioReady && (
            <button className="chip" onClick={enableAudio}>
              🔊 Дуу асаах
            </button>
          )}

          <a className="chip" href={info.mapLink} onClick={onMapClick}>
            🧭 Map
          </a>

          {/* NEW: Ultra toggle (optional UI) */}
          <button className={`chip ${ultra ? "on" : ""}`} onClick={() => setUltra((v) => !v)}>
            {ultra ? "😈 Ultra ON" : "😇 Ultra OFF"}
          </button>
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
              <h3>TELEGRAM СУВАГТАА НЭГДЭЭРЭЙ!!!</h3>
              <p className="rsvpText">Ирэхээ баталгаажуулаарай (QR scan эсвэл link):</p>
              <a className="rsvpLink" href={info.rsvpUrl} target="_blank" rel="noreferrer">
                {info.rsvpUrl}
              </a>
            </div>

            <div className="qrBox">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qr" src={qrImg} alt="RSVP QR code" />
              <div className="qrHint">📱 Scan me</div>
            </div>
          </div>

          <div className="divider" />

          <div className="footerNote">Хоцорвол мэдээж шийтгэлтэй шүү хонгор минь 😂😂😂</div>
        </div>
      </section>

      {/* SCREENSHOT FRAME OVERLAY */}
      {frameOpen && (
        <div className="frameOverlay" role="dialog" aria-modal="true" aria-label="Screenshot frame" onClick={() => setFrameOpen(false)}>
          <div className="frameModal" onClick={(e) => e.stopPropagation()}>
            <div className="frameTop">
              <div className="frameBadge">📸 STORY MODE</div>
              <button className="frameClose" onClick={() => setFrameOpen(false)}>
                ✖
              </button>
            </div>

            <div className="frameCanvas">
              <div className="frameGlow" aria-hidden="true" />
              <div className="frameTitle">I SURVIVED</div>
              <div className="frameName">{info.title}</div>
              <div className="frameMeta">
                <span>📅 {info.dateLabel}</span>
                {/* <span>⏰ {info.startTimeLabel}</span> */}
              </div>

              <div className="frameBottom">
                <div className="frameLeft">
                  {/* <div className="framePlace">📍 {info.placeName}</div>
                  <div className="frameAddr">{info.address}</div> */}
                  {/* <div className="frameHint2">👉 Энэ дэлгэц дээр screenshot дар 😈</div> */}
                </div>

                {/* <div className="frameQR">
                  
                  <img src={qrImg} alt="RSVP QR" />
                  <div className="frameQRHint">RSVP</div>
                </div> */}
              </div>

              <div className="frameFooter">#Birthday</div>
            </div>
          </div>
        </div>
      )}

      {/* MAP PRANK MODAL */}
      {mapPrankOpen && (
        <div className="mapPrankOverlay" role="dialog" aria-modal="true" aria-label="map prank">
          <div className="mapPrankModal">
            <div className="mapPrankTitle">🧭 “Нууц” байршил руу чиглүүлж байна…</div>
            <div className="mapPrankSub">GPS: 😂😂😂</div>
            <div className="mapPrankBar">
              <div className="mapPrankFill" />
            </div>
            <div className="mapPrankHint">Одоо map нээгдэнэ…</div>
          </div>
        </div>
      )}

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