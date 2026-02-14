import { useState, useEffect, useRef, useCallback } from "react";

const TEXTS = {
  "The Great Gatsby (Opening)": {
    text: `In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world haven't had the advantages that you've had. He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the confidences were unsought — frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon; for the intimate revelations of young men, or at least the terms in which they express them, are usually plagiaristic and marred by obvious suppressions. Reserving judgments is a matter of infinite hope.`,
    questions: [
      { q: "What did the narrator's father advise him to do?", opts: ["Work hard in life", "Reserve judgment about others", "Travel the world first", "Always speak honestly"], a: 1 },
      { q: "What was the narrator unjustly accused of being in college?", opts: ["A thief", "A liar", "A politician", "A gossip"], a: 2 },
      { q: "How does the narrator describe reserving judgments?", opts: ["A burden to shed", "A matter of infinite hope", "His mother's lesson", "A requirement"], a: 1 },
      { q: "What did the narrator feign when intimate revelations approached?", opts: ["Interest", "Anger", "Sleep or hostile levity", "Philosophy"], a: 2 },
      { q: "How are young men's revelations characterized?", opts: ["Profound", "Plagiaristic and suppressed", "Unique", "Forgettable"], a: 1 }
    ]
  },
  "Space Exploration": {
    text: `The cosmos is vast beyond human comprehension. Our solar system, with its eight planets orbiting a medium-sized star, is just one of billions of planetary systems in the Milky Way galaxy alone. When we look up at the night sky, every point of light tells a story millions of years old. Light from distant stars travels across the void of space at approximately 186,000 miles per second, and yet even at this incredible speed, it takes years, centuries, or millennia to reach our eyes. The nearest star to our Sun, Proxima Centauri, is about 4.24 light-years away. That means the light we see from it tonight actually left its surface over four years ago. The scale of the universe challenges our everyday intuitions about distance and time. If the Sun were the size of a basketball, Earth would be a small peppercorn about 26 meters away, and Proxima Centauri would be another basketball roughly 6,400 kilometers distant. These analogies help us grasp, if only dimly, the staggering emptiness between the stars. And yet, within this emptiness, gravity weaves its invisible threads, holding galaxies together in vast cosmic webs stretching across billions of light-years.`,
    questions: [
      { q: "How fast does light travel?", opts: ["186k mph", "186k miles/sec", "300k miles/sec", "1M miles/sec"], a: 1 },
      { q: "How far is Proxima Centauri?", opts: ["1.5 ly", "4.24 ly", "10 ly", "26 ly"], a: 1 },
      { q: "In the basketball analogy, Earth would be?", opts: ["Tennis ball", "Marble", "Small peppercorn", "Grain of sand"], a: 2 },
      { q: "How far would Proxima Centauri be in that analogy?", opts: ["100 meters", "26 meters", "6,400 km", "1M km"], a: 2 },
      { q: "What holds galaxies together?", opts: ["Dark matter alone", "EM radiation", "Gravity's threads", "Spatial expansion"], a: 2 }
    ]
  },
  "Technology & AI": {
    text: `Artificial intelligence has transformed from a theoretical curiosity into the defining technology of our era. What began as simple rule-based systems in the 1950s has evolved into sophisticated neural networks capable of understanding language, generating images, writing code, and engaging in nuanced conversation. The trajectory of progress has been remarkable. Early AI systems could barely play checkers; today's models can analyze medical scans, compose music, translate between hundreds of languages, and solve complex mathematical proofs. This rapid advancement raises profound questions about the nature of intelligence itself, the future of human labor, and the ethical frameworks we need to govern increasingly capable systems. Perhaps the most striking development has been the emergence of large language models trained on vast corpora of human text. These models demonstrate an uncanny ability to capture patterns in language that seem to reflect genuine understanding, even if the underlying mechanism is fundamentally different from human cognition. They can reason about abstract concepts, follow complex instructions, and adapt their communication style to suit different contexts and audiences.`,
    questions: [
      { q: "When did rule-based AI emerge?", opts: ["1930s", "1950s", "1970s", "1990s"], a: 1 },
      { q: "What could early AI barely do?", opts: ["Faces", "Checkers", "Sentences", "Counting"], a: 1 },
      { q: "The 'most striking development' is?", opts: ["Self-driving cars", "Image gen", "Large language models", "Quantum"], a: 2 },
      { q: "LLMs vs human cognition?", opts: ["Identical", "Fundamentally different", "Perfect replica", "More advanced"], a: 1 },
      { q: "NOT mentioned as modern AI capability?", opts: ["Medical scans", "Compose music", "Feel emotions", "Math proofs"], a: 2 }
    ]
  },
  "Custom Text": { text: "", questions: [] }
};

const TRAIN = {
  off: { label: "Off", desc: "Fixed speed" },
  gentle: { label: "Gentle", desc: "+25 WPM / 30s", ramp: 25, sec: 30 },
  moderate: { label: "Moderate", desc: "+50 WPM / 20s", ramp: 50, sec: 20 },
  aggressive: { label: "Aggressive", desc: "+75 WPM / 15s", ramp: 75, sec: 15 },
  sprint: { label: "Sprint", desc: "+100 WPM / 10s", ramp: 100, sec: 10 }
};

function orpIdx(word) {
  const l = word.length;
  return l <= 1 ? 0 : l <= 3 ? 0 : l <= 5 ? 1 : l <= 9 ? 2 : l <= 13 ? 3 : 4;
}

function delayMul(w) {
  return /[.!?]$/.test(w) ? 2.8 : /[;:]$/.test(w) ? 2.0 : /[,]$/.test(w) ? 1.6 : /[-—]$/.test(w) ? 1.3 : 1.0;
}

const C = {
  bg: "#0D0B09", tx: "#E6E1D7", ac: "#E34A39", aw: "#E88C5A", gn: "#4ADE80", am: "#F59E0B",
  t5: "rgba(230,225,215,0.55)", t3: "rgba(230,225,215,0.35)", tg: "rgba(230,225,215,0.18)",
  bd: "rgba(230,225,215,0.08)", bm: "rgba(230,225,215,0.15)", ad: "rgba(227,74,57,0.3)", ab: "rgba(227,74,57,0.12)"
};
const MN = "'DM Mono','SF Mono','Fira Code',monospace";
const SF = "'Libre Baskerville','Georgia',serif";

const HISTORY_KEY = "rsvp-reader-history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function Quiz({ questions, onDone, wpm, wordCount, isCustom }) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState([]);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  const qs = questions;

  if (!qs || qs.length === 0) return (
    <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
      <div style={{ fontSize: "1.1rem", color: C.t5, marginBottom: "16px" }}>No quiz available</div>
      <button onClick={() => onDone(null)} style={{ fontFamily: MN, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 40px", background: "transparent", color: C.ac, border: `1px solid ${C.ad}`, cursor: "pointer" }}>Continue</button>
    </div>
  );

  const pick = (idx) => {
    if (show) return;
    setSel(idx);
    setShow(true);
    const na = [...ans, { s: idx, c: qs[qi].a }];
    setAns(na);
    setTimeout(() => {
      if (qi + 1 >= qs.length) setDone(true);
      else { setQi(qi + 1); setSel(null); setShow(false); }
    }, 1200);
  };

  if (done) {
    const correct = ans.filter(a => a.s === a.c).length;
    const pct = Math.round((correct / ans.length) * 100);
    const grade = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Needs Work";
    const gc = pct >= 80 ? C.gn : pct >= 60 ? C.am : C.ac;
    const eff = Math.round(wpm * (pct / 100));

    return (
      <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease", maxWidth: 480 }}>
        <div style={{ fontFamily: MN, fontSize: "0.7rem", color: C.t3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>Session Complete</div>
        <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 32px" }}>
          <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="70" cy="70" r="58" fill="none" stroke={C.bd} strokeWidth="4" />
            <circle cx="70" cy="70" r="58" fill="none" stroke={gc} strokeWidth="4" strokeDasharray={`${(pct/100)*364.4} 364.4`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "2rem", fontWeight: 700, color: gc }}>{pct}%</span>
            <span style={{ fontFamily: MN, fontSize: "0.6rem", color: C.t3 }}>{grade}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
          {[{ l: "Speed", v: `${wpm} WPM` }, { l: "Comprehension", v: `${correct}/${ans.length}` }, { l: "Words", v: wordCount }].map(({ l, v }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MN, fontSize: "0.6rem", color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: C.tx }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 24px", background: "rgba(230,225,215,0.03)", border: `1px solid ${C.bd}`, marginBottom: 32 }}>
          <div style={{ fontFamily: MN, fontSize: "0.6rem", color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Effective Reading Speed</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: pct >= 60 ? C.gn : C.am }}>{eff} WPM</div>
          <div style={{ fontSize: "0.75rem", color: C.t3, fontStyle: "italic", marginTop: 4 }}>Speed × Comprehension</div>
        </div>
        <button onClick={() => onDone(pct)} style={{ fontFamily: MN, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 40px", background: "transparent", color: C.ac, border: `1px solid ${C.ad}`, cursor: "pointer" }}>Continue</button>
      </div>
    );
  }

  const q = qs[qi];
  return (
    <div style={{ maxWidth: 560, width: "100%", animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
        {qs.map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < qi ? (ans[i]?.s === ans[i]?.c ? C.gn : C.ac) : i === qi ? C.tx : C.bd, transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ fontFamily: MN, fontSize: "0.65rem", color: C.t3, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 20 }}>Question {qi+1} of {qs.length}</div>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.6, textAlign: "center", marginBottom: 32, color: C.tx }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((o, i) => {
          const isC = i === q.a, isS = i === sel;
          let bc = C.bd, bg = "transparent", tc = C.t5;
          if (show) {
            if (isC) { bc = C.gn; bg = "rgba(74,222,128,0.08)"; tc = C.gn; }
            else if (isS) { bc = C.ac; bg = "rgba(227,74,57,0.08)"; tc = C.ac; }
          } else if (isS) { bc = C.tx; tc = C.tx; }
          return (
            <button key={i} onClick={() => pick(i)} style={{ fontFamily: SF, fontSize: "0.85rem", textAlign: "left", padding: "14px 20px", color: tc, border: `1px solid ${bc}`, background: bg, cursor: show ? "default" : "pointer", transition: "all 0.25s", letterSpacing: 0, textTransform: "none" }}>
              <span style={{ fontFamily: MN, fontSize: "0.65rem", color: C.t3, marginRight: 12 }}>{String.fromCharCode(65+i)}</span>{o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RSVPReader() {
  const [wpm, setWpm] = useState(300);
  const [liveWpm, setLiveWpm] = useState(300);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [wi, setWi] = useState(0);
  const [words, setWords] = useState([]);
  const [sel, setSel] = useState("Space Exploration");
  const [custom, setCustom] = useState("");
  const [intro, setIntro] = useState(true);
  const [prog, setProg] = useState(0);
  const [fin, setFin] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [train, setTrain] = useState("off");
  const [hist, setHist] = useState(loadHistory);

  const toRef = useRef(null);
  const t0Ref = useRef(null);
  const ptRef = useRef(0);
  const riRef = useRef(null);
  const swRef = useRef(300);

  const cw = words[wi] || "";
  const oi = orpIdx(cw.replace(/[^a-zA-Z]/g, ""));
  const td = TEXTS[sel];

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  }, [hist]);

  const load = useCallback((k) => {
    const t = k === "Custom Text" ? custom : TEXTS[k].text;
    const w = t.split(/\s+/).filter(x => x.length > 0);
    setWords(w); setWi(0); setProg(0); setPlaying(false); setPaused(false);
    setFin(false); setElapsed(0); setPhase("intro"); setLiveWpm(wpm); setIntro(true);
    ptRef.current = 0;
    if (toRef.current) clearTimeout(toRef.current);
    if (riRef.current) clearInterval(riRef.current);
  }, [custom, wpm]);

  useEffect(() => { load(sel); }, [sel]);

  const advance = useCallback(() => {
    setWi(p => {
      const n = p + 1;
      if (n >= words.length) { setPlaying(false); setFin(true); setProg(100); setPhase("quiz"); if (riRef.current) clearInterval(riRef.current); return p; }
      setProg(((n+1)/words.length)*100);
      return n;
    });
  }, [words.length]);

  useEffect(() => {
    if (playing && !paused && words.length > 0) {
      const d = (60000/liveWpm) * delayMul(words[wi]||"");
      toRef.current = setTimeout(advance, d);
      return () => clearTimeout(toRef.current);
    }
  }, [playing, paused, wi, liveWpm, words, advance]);

  useEffect(() => {
    if (playing && !paused && train !== "off") {
      const c = TRAIN[train];
      riRef.current = setInterval(() => setLiveWpm(p => Math.min(1500, p + c.ramp)), c.sec * 1000);
      return () => clearInterval(riRef.current);
    } else { if (riRef.current) clearInterval(riRef.current); }
  }, [playing, paused, train]);

  useEffect(() => {
    let iv;
    if (playing && !paused) {
      if (!t0Ref.current) t0Ref.current = Date.now();
      iv = setInterval(() => setElapsed(ptRef.current + (Date.now() - t0Ref.current)), 100);
    }
    return () => clearInterval(iv);
  }, [playing, paused]);

  const play = () => {
    if (fin) { setWi(0); setProg(0); setFin(false); setElapsed(0); ptRef.current = 0; }
    setIntro(false); setPhase("reading"); setPlaying(true); setPaused(false);
    setLiveWpm(wpm); swRef.current = wpm; t0Ref.current = Date.now();
  };
  const pause = () => { setPaused(true); ptRef.current += Date.now() - t0Ref.current; t0Ref.current = null; };
  const resume = () => { setPaused(false); t0Ref.current = Date.now(); };
  const reset = () => {
    setPlaying(false); setPaused(false); setWi(0); setProg(0); setFin(false);
    setElapsed(0); setPhase("intro"); setIntro(true); setLiveWpm(wpm);
    ptRef.current = 0; t0Ref.current = null;
    if (toRef.current) clearTimeout(toRef.current);
    if (riRef.current) clearInterval(riRef.current);
  };

  const quizDone = (pct) => {
    if (pct !== null) {
      const fw = train !== "off" ? liveWpm : wpm;
      setHist(p => [...p, { wpm: fw, comp: pct, eff: Math.round(fw*(pct/100)), words: words.length, train }]);
    }
    setPhase("intro"); setIntro(true); setWi(0); setProg(0); setFin(false); setPlaying(false);
  };

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT" || phase === "quiz") return;
      if (e.code === "Space") { e.preventDefault(); if (!playing || fin) play(); else if (paused) resume(); else pause(); }
      if (e.code === "KeyR") reset();
      if (e.code === "ArrowUp") { setWpm(w => Math.min(1500, w+50)); if (!playing) setLiveWpm(w => Math.min(1500, w+50)); }
      if (e.code === "ArrowDown") { setWpm(w => Math.max(50, w-50)); if (!playing) setLiveWpm(w => Math.max(50, w-50)); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [playing, paused, fin, phase]);

  const renderWord = () => {
    if (!cw) return null;
    const ch = cw.split(""), cW = 0.62, tW = ch.length*cW, oP = oi*cW;
    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 120 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "linear-gradient(to bottom, transparent 15%, rgba(227,74,57,0.3) 30%, rgba(227,74,57,0.6) 45%, transparent 47%, transparent 53%, rgba(227,74,57,0.6) 55%, rgba(227,74,57,0.3) 70%, transparent 85%)", transform: "translateX(-50%)", zIndex: 1 }} />
        <div style={{ fontFamily: MN, fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 400, letterSpacing: "0.02em", whiteSpace: "nowrap", position: "relative", transform: `translateX(${-(oP - tW/2 + cW/2)}em)` }}>
          {ch.map((c, i) => (
            <span key={i} style={{ color: i === oi ? C.ac : "rgba(230,225,215,0.92)", fontWeight: i === oi ? 700 : 400, display: "inline-block", width: `${cW}em`, textAlign: "center" }}>{c}</span>
          ))}
        </div>
      </div>
    );
  };

  const Btn = ({ children, onClick, disabled, accent, dim, style: s }) => (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: MN, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase",
      background: "transparent", cursor: disabled ? "default" : "pointer", transition: "all 0.3s",
      color: disabled ? "rgba(230,225,215,0.2)" : accent ? C.ac : dim ? C.t3 : C.tx,
      border: `1px solid ${disabled ? "rgba(230,225,215,0.1)" : accent ? C.ad : dim ? C.bd : C.bm}`,
      ...s
    }}>{children}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: SF, display: "flex", flexDirection: "column", alignItems: "center", padding: 0, overflow: "hidden", position: "relative" }}>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")` }} />

      <header style={{ width: "100%", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: MN, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.ac, fontWeight: 500 }}>RSVP</span>
          <span style={{ fontSize: "0.7rem", color: C.t3, fontStyle: "italic" }}>Speed Reader</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {hist.length > 0 && <span style={{ fontFamily: MN, fontSize: "0.65rem", color: C.t3 }}>{hist.length} session{hist.length > 1 ? "s" : ""}</span>}
          {words.length > 0 && <span style={{ fontFamily: MN, fontSize: "0.7rem", color: C.t3, letterSpacing: "0.1em" }}>{words.length} words</span>}
        </div>
      </header>

      <main style={{ flex: 1, width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 2, marginTop: -20 }}>

        {phase === "quiz" ? (
          <Quiz questions={td.questions} onDone={quizDone} wpm={train !== "off" ? liveWpm : wpm} wordCount={words.length} isCustom={sel === "Custom Text"} />
        ) : intro ? (
          <div style={{ textAlign: "center", maxWidth: 520, animation: "fadeIn 0.8s ease" }}>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, lineHeight: 1.3, marginBottom: 24 }}>
              Can you read <span style={{ color: C.ac, fontWeight: 700 }}>900</span> words per minute?
            </h1>
            <p style={{ fontSize: "1rem", color: C.t5, lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>
              One word at a time, one focal point. Let the <span style={{ color: "rgba(227,74,57,0.8)" }}>red letter</span> anchor your gaze — then prove you understood it all.
            </p>
            <p style={{ fontSize: "0.85rem", color: C.t3, lineHeight: 1.6, marginBottom: 48 }}>
              After reading, a comprehension quiz determines your <em>effective</em> speed. Enable speed training to push your limits.
            </p>
            {hist.length >= 2 && (
              <div style={{ padding: "16px 20px", background: "rgba(230,225,215,0.02)", border: `1px solid ${C.bd}`, marginBottom: 32, textAlign: "left" }}>
                <div style={{ fontFamily: MN, fontSize: "0.6rem", color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Session History — Effective WPM</div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
                  {hist.slice(-12).map((s, i) => {
                    const h = Math.max(8, (s.eff / 1000) * 48);
                    const c = s.comp >= 80 ? C.gn : s.comp >= 60 ? C.am : C.ac;
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4 }}>
                        <div style={{ width: "100%", maxWidth: 28, height: h, background: c, borderRadius: "2px 2px 0 0", opacity: 0.7 }} />
                        <span style={{ fontFamily: MN, fontSize: "0.5rem", color: C.tg }}>{s.eff}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: "100%", textAlign: "center" }}>
            {!fin && <>
              {train !== "off" && liveWpm !== swRef.current && (
                <div style={{ marginBottom: 16, fontFamily: MN, fontSize: "0.65rem", color: C.aw, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
                  <span>▲</span><span>{swRef.current}</span>
                  <div style={{ width: 60, height: 2, background: C.bd, position: "relative", borderRadius: 1 }}>
                    <div style={{ width: `${Math.min(((liveWpm-swRef.current)/(1500-swRef.current))*100,100)}%`, height: "100%", background: C.aw, borderRadius: 1, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontWeight: 700 }}>{liveWpm}</span><span style={{ color: C.t3 }}>WPM</span>
                </div>
              )}
              {renderWord()}
            </>}
          </div>
        )}

        {phase === "reading" && !fin && (
          <div style={{ width: "100%", maxWidth: 600, height: 2, background: C.bd, borderRadius: 1, marginTop: 48, overflow: "hidden" }}>
            <div style={{ width: `${prog}%`, height: "100%", background: `linear-gradient(90deg,${C.ac},${C.aw})`, borderRadius: 1, transition: "width 0.1s linear" }} />
          </div>
        )}

        {phase !== "quiz" && (
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 40 }}>
            {!playing || fin ? (
              <Btn onClick={play} disabled={words.length === 0} accent style={{ padding: "14px 40px" }}>{fin ? "Read Again" : "Begin"}</Btn>
            ) : (<>
              <Btn onClick={paused ? resume : pause} style={{ padding: "14px 32px" }}>{paused ? "Resume" : "Pause"}</Btn>
              <Btn onClick={reset} dim style={{ padding: "14px 24px" }}>Reset</Btn>
            </>)}
          </div>
        )}

        {phase !== "quiz" && (
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", maxWidth: 400 }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MN, fontSize: "0.7rem", color: C.t3, letterSpacing: "0.1em" }}>
                <span>{train !== "off" && playing ? "START SPEED" : "SPEED"}</span>
                <span style={{ color: wpm >= 700 ? C.ac : wpm >= 400 ? C.aw : "rgba(230,225,215,0.6)" }}>{wpm} WPM</span>
              </div>
              <input type="range" min={50} max={1500} step={25} value={wpm}
                onChange={e => { setWpm(+e.target.value); if (!playing) setLiveWpm(+e.target.value); }}
                style={{ width: "100%", height: 2, WebkitAppearance: "none", appearance: "none", background: `linear-gradient(to right, ${C.ac} 0%, ${C.ac} ${((wpm-50)/1450)*100}%, rgba(230,225,215,0.1) ${((wpm-50)/1450)*100}%, rgba(230,225,215,0.1) 100%)`, outline: "none", cursor: "pointer", borderRadius: 1 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MN, fontSize: "0.6rem", color: "rgba(230,225,215,0.2)" }}>
                <span>50</span><span>Avg: 250</span><span>1500</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%" }}>
              <div style={{ fontFamily: MN, fontSize: "0.7rem", color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", alignSelf: "flex-start" }}>Speed Training</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {Object.entries(TRAIN).map(([k, v]) => (
                  <button key={k} onClick={() => setTrain(k)} style={{ fontFamily: MN, fontSize: "0.6rem", letterSpacing: "0.08em", padding: "6px 14px", background: train === k ? C.ab : "transparent", color: train === k ? C.ac : C.t3, border: `1px solid ${train === k ? C.ad : C.bd}`, cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}>{v.label}</button>
                ))}
              </div>
              {train !== "off" && <div style={{ fontFamily: MN, fontSize: "0.6rem", color: C.aw, fontStyle: "italic" }}>{TRAIN[train].desc}</div>}
            </div>
          </div>
        )}
      </main>

      {phase !== "quiz" && (
        <footer style={{ width: "100%", padding: "20px 32px 28px", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: sel === "Custom Text" ? 16 : 0 }}>
              {Object.keys(TEXTS).map(k => (
                <button key={k} onClick={() => { setSel(k); if (k !== "Custom Text") { reset(); setIntro(true); } }}
                  style={{ fontFamily: MN, fontSize: "0.65rem", letterSpacing: "0.1em", padding: "8px 16px", background: sel === k ? C.ab : "transparent", color: sel === k ? C.ac : C.t3, border: `1px solid ${sel === k ? C.ad : C.bd}`, cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}>{k}</button>
              ))}
            </div>
            {sel === "Custom Text" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Paste your text here..."
                  style={{ width: "100%", height: 100, fontFamily: SF, fontSize: "0.85rem", lineHeight: 1.7, padding: 16, background: "rgba(230,225,215,0.03)", color: "rgba(230,225,215,0.7)", border: `1px solid ${C.bd}`, outline: "none", resize: "vertical", borderRadius: 2 }} />
                <button onClick={() => load("Custom Text")} disabled={!custom.trim()}
                  style={{ fontFamily: MN, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "10px 24px", marginTop: 8, background: "transparent", color: custom.trim() ? C.ac : "rgba(230,225,215,0.2)", border: `1px solid ${custom.trim() ? C.ad : C.bd}`, cursor: custom.trim() ? "pointer" : "default" }}>Load Text</button>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, fontFamily: MN, fontSize: "0.6rem", color: C.tg }}>
              <span><kbd style={{ padding: "2px 6px", border: `1px solid ${C.bd}`, borderRadius: 2 }}>Space</kbd> play/pause</span>
              <span><kbd style={{ padding: "2px 6px", border: `1px solid ${C.bd}`, borderRadius: 2 }}>↑↓</kbd> speed</span>
              <span><kbd style={{ padding: "2px 6px", border: `1px solid ${C.bd}`, borderRadius: 2 }}>R</kbd> reset</span>
            </div>
          </div>
        </footer>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: ${C.ac}; border-radius: 50%; cursor: pointer; border: 2px solid ${C.bg}; box-shadow: 0 0 8px rgba(227,74,57,0.3); }
        input[type="range"]::-moz-range-thumb { width: 14px; height: 14px; background: ${C.ac}; border-radius: 50%; cursor: pointer; border: 2px solid ${C.bg}; box-shadow: 0 0 8px rgba(227,74,57,0.3); }
        button:hover { filter: brightness(1.15); }
        textarea::placeholder { color: rgba(230,225,215,0.2); font-style: italic; }
      `}</style>
    </div>
  );
}
