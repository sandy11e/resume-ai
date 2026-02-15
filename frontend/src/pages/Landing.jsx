import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ─── Keyframes injected once ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:   #F5F0E8;
    --warm:    #EDE5D4;
    --sand:    #D4C5A9;
    --rust:    #C4622D;
    --ember:   #E8855A;
    --dusk:    #2C2420;
    --ink:     #1A1210;
    --mist:    #8A7B6E;
    --glow:    rgba(196,98,45,0.18);
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(36px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes floatA {
    0%,100% { transform: translateY(0px)   rotate(-4deg); }
    50%      { transform: translateY(-18px) rotate(-4deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translateY(0px)   rotate(6deg); }
    50%      { transform: translateY(-12px) rotate(6deg); }
  }
  @keyframes floatC {
    0%,100% { transform: translateY(0px)   rotate(-2deg); }
    50%      { transform: translateY(-22px) rotate(-2deg); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(60px,-40px) scale(1.1); }
    66%     { transform: translate(-30px,50px) scale(0.95); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(-50px,60px) scale(1.08); }
    66%     { transform: translate(40px,-30px) scale(0.93); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity:.7; }
    70%  { transform: scale(1.15); opacity:0; }
    100% { transform: scale(0.9); opacity:0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .landing-root {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    overflow: hidden;
    position: relative;
    cursor: none;
  }

  /* Custom cursor */
  .cursor-dot {
    position: fixed;
    width: 8px; height: 8px;
    background: var(--rust);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform .15s ease;
    mix-blend-mode: multiply;
  }
  .cursor-ring {
    position: fixed;
    width: 36px; height: 36px;
    border: 1.5px solid var(--rust);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: transform .35s cubic-bezier(.25,.46,.45,.94), opacity .3s;
    mix-blend-mode: multiply;
    opacity: .55;
  }
  .cursor-ring.hovered { transform: scale(2.2)!important; opacity:.25; }

  /* Background orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .orb-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(232,133,90,.28), transparent 70%);
    top: -120px; right: -80px;
    animation: orb1 14s ease-in-out infinite;
  }
  .orb-2 {
    width: 440px; height: 440px;
    background: radial-gradient(circle, rgba(196,98,45,.20), transparent 70%);
    bottom: -80px; left: -60px;
    animation: orb2 18s ease-in-out infinite;
  }
  .orb-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(212,197,169,.55), transparent 70%);
    top: 40%; left: 40%;
    animation: orb1 22s ease-in-out infinite reverse;
  }

  /* Grain overlay */
  .grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: .45;
    pointer-events: none;
    z-index: 1;
  }

  /* Nav */
  .nav {
    position: fixed; top:0; left:0; right:0;
    display: flex; align-items:center; justify-content: space-between;
    padding: 22px 48px;
    z-index: 100;
    animation: fadeIn .8s ease both;
  }
  .nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: .04em;
    color: var(--ink);
    display: flex; align-items:center; gap:8px;
  }
  .nav-dot {
    width: 8px; height: 8px;
    background: var(--rust);
    border-radius: 50%;
    display: inline-block;
  }
  .nav-pill {
    background: rgba(26,18,16,.07);
    border: 1px solid rgba(196,98,45,.15);
    border-radius: 100px;
    padding: 8px 20px;
    font-size: .78rem;
    font-weight: 500;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--mist);
  }

  /* Main content */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    padding: 120px 24px 60px;
    text-align: center;
  }

  .hero-eyebrow {
    display: inline-flex; align-items:center; gap:10px;
    background: rgba(196,98,45,.09);
    border: 1px solid rgba(196,98,45,.25);
    border-radius: 100px;
    padding: 7px 18px;
    font-size: .75rem;
    font-weight: 500;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--rust);
    margin-bottom: 36px;
    animation: fadeUp .8s .2s ease both;
  }
  .eyebrow-pulse {
    width: 6px; height: 6px;
    background: var(--rust);
    border-radius: 50%;
    animation: pulse-ring 2s ease-in-out infinite;
    box-shadow: 0 0 0 0 var(--rust);
  }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(3.2rem, 8vw, 7rem);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -.03em;
    color: var(--ink);
    max-width: 900px;
    animation: fadeUp .9s .35s ease both;
    position: relative;
  }
  .hero-title em {
    font-style: normal;
    background: linear-gradient(120deg, var(--rust) 0%, var(--ember) 40%, var(--rust) 80%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3.5s linear infinite;
  }

  .hero-sub {
    margin-top: 28px;
    font-size: 1.15rem;
    font-weight: 300;
    color: var(--mist);
    max-width: 480px;
    line-height: 1.7;
    animation: fadeUp .9s .5s ease both;
  }

  .hero-actions {
    margin-top: 52px;
    display: flex; align-items:center; gap:16px;
    animation: fadeUp .9s .65s ease both;
  }

  .btn-primary {
    position: relative;
    background: var(--rust);
    color: #fff;
    border: none;
    padding: 17px 42px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: none;
    overflow: hidden;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
    box-shadow: 0 8px 32px rgba(196,98,45,.35), inset 0 1px 0 rgba(255,255,255,.15);
    letter-spacing: .01em;
  }
  .btn-primary::before {
    content: '';
    position: absolute; inset:0;
    background: linear-gradient(135deg, rgba(255,255,255,.18) 0%, transparent 60%);
    border-radius: inherit;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    width: 200%; height: 200%;
    top: -50%; left: -150%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent);
    transform: skewX(-20deg);
    transition: left .6s ease;
  }
  .btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 16px 48px rgba(196,98,45,.45); }
  .btn-primary:hover::after { left: 100%; }
  .btn-primary:active { transform: translateY(0) scale(.98); }

  .btn-ghost {
    color: var(--mist);
    border: none; background: none;
    padding: 17px 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: .95rem;
    cursor: none;
    display: flex; align-items:center; gap:8px;
    transition: color .2s ease, gap .2s ease;
    letter-spacing: .01em;
  }
  .btn-ghost:hover { color: var(--ink); gap: 14px; }
  .btn-ghost-arrow { transition: transform .2s ease; }
  .btn-ghost:hover .btn-ghost-arrow { transform: translateX(4px); }

  /* Floating cards */
  .cards-scene {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }
  .float-card {
    position: absolute;
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 16px;
    padding: 14px 18px;
    box-shadow: 0 8px 32px rgba(44,36,32,.10), 0 2px 8px rgba(196,98,45,.08);
    font-size: .78rem;
  }
  .float-card-a {
    left: 6%; top: 28%;
    animation: floatA 6s ease-in-out infinite;
    animation-delay: .3s;
    animation-fill-mode: both;
    opacity: 0;
    animation: fadeUp .7s .9s ease both, floatA 6s 1.6s ease-in-out infinite;
  }
  .float-card-b {
    right: 6%; top: 22%;
    animation: fadeUp .7s 1.1s ease both, floatB 7s 1.8s ease-in-out infinite;
  }
  .float-card-c {
    right: 9%; bottom: 22%;
    animation: fadeUp .7s 1.3s ease both, floatC 8s 2s ease-in-out infinite;
  }

  .card-label { color: var(--mist); font-size: .68rem; letter-spacing:.06em; text-transform:uppercase; margin-bottom:6px; }
  .card-value { font-family:'Syne',sans-serif; font-weight:700; color:var(--ink); font-size:1.1rem; }
  .card-bar-track { height:4px; background:rgba(196,98,45,.12); border-radius:99px; margin-top:10px; width:130px; }
  .card-bar-fill { height:100%; border-radius:99px; background: linear-gradient(90deg,var(--rust),var(--ember)); }

  .card-tag {
    display: inline-flex; align-items:center; gap:6px;
    padding: 4px 10px; border-radius:99px;
    font-size:.7rem; font-weight:500; letter-spacing:.04em;
    margin: 3px 2px;
  }
  .tag-green { background:rgba(72,187,120,.12); color:#2f7d55; }
  .tag-amber { background:rgba(245,158,11,.12); color:#92620a; }
  .tag-blue  { background:rgba(59,130,246,.12);  color:#1d4ed8; }

  .card-score {
    display: flex; align-items:baseline; gap:4px;
  }
  .score-num { font-family:'Syne',sans-serif; font-weight:800; font-size:2rem; color:var(--rust); }
  .score-denom { font-size:.8rem; color:var(--mist); }

  /* Ticker bar */
  .ticker-wrap {
    position: absolute;
    bottom: 0; left:0; right:0;
    overflow: hidden;
    border-top: 1px solid rgba(44,36,32,.08);
    background: rgba(245,240,232,.7);
    backdrop-filter: blur(10px);
    padding: 14px 0;
    z-index: 3;
  }
  .ticker-track {
    display: flex; gap: 0;
    white-space: nowrap;
    animation: ticker 28s linear infinite;
    width: max-content;
  }
  .ticker-item {
    display: inline-flex; align-items:center; gap: 28px;
    padding: 0 40px;
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--mist);
  }
  .ticker-sep {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--sand);
    flex-shrink: 0;
  }

  /* Stats row */
  .stats-row {
    display: flex; gap: 0;
    margin-top: 72px;
    animation: fadeUp .9s .8s ease both;
    border-top: 1px solid rgba(44,36,32,.1);
    padding-top: 32px;
  }
  .stat-item {
    flex: 1;
    padding: 0 28px;
    text-align: left;
  }
  .stat-item + .stat-item {
    border-left: 1px solid rgba(44,36,32,.08);
  }
  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--ink);
    letter-spacing: -.02em;
  }
  .stat-label {
    font-size: .75rem;
    color: var(--mist);
    margin-top: 4px;
    letter-spacing: .04em;
  }

  /* Spin ring decoration */
  .spin-ring {
    position: absolute;
    right: -40px; top: -40px;
    width: 180px; height: 180px;
    border: 1px dashed rgba(196,98,45,.2);
    border-radius: 50%;
    animation: spin-slow 20s linear infinite;
    pointer-events: none;
  }
  .spin-ring::after {
    content:'';
    position:absolute; top:4px; left:50%;
    width:6px; height:6px;
    margin-left:-3px;
    background:var(--rust);
    border-radius:50%;
  }

  @media (max-width:768px) {
    .nav { padding: 18px 24px; }
    .cards-scene { display: none; }
    .stats-row { flex-direction:column; gap:20px; }
    .stat-item + .stat-item { border-left:none; border-top:1px solid rgba(44,36,32,.08); padding-top:20px; }
    .hero-actions { flex-direction:column; }
  }
`;

const TICKER_ITEMS = [
  "Resume Analysis", "ATS Optimization", "Skills Matching",
  "Job Fit Score", "Career Insights", "AI-Powered", "Resume Analysis",
  "ATS Optimization", "Skills Matching", "Job Fit Score",
  "Career Insights", "AI-Powered",
];

export default function Landing() {
  const navigate = useNavigate();
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  /* Custom cursor */
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const loop = () => {
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      if (dotRef.current)  { dotRef.current.style.transform  = `translate(${mx-4}px,${my-4}px)`; }
      if (ringRef.current) { ringRef.current.style.transform = `translate(${rx-18}px,${ry-18}px)`; }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    loop();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Cursor */}
      <div className="cursor-dot" ref={dotRef} />
      <div className={`cursor-ring ${hovered ? "hovered" : ""}`} ref={ringRef} />

      <div className="landing-root">
        {/* Background */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grain" />

        {/* Nav */}
        <nav className="nav">
          <div className="nav-logo">
            <span className="nav-dot" />
            ResumeAI
          </div>
          <div className="nav-pill">Early Access</div>
        </nav>

        {/* Floating context cards */}
        <div className="cards-scene">
          {/* Match Score card */}
          <div className="float-card float-card-a" style={{ minWidth: 170 }}>
            <div className="card-label">Match Score</div>
            <div className="card-score">
              <span className="score-num">94</span>
              <span className="score-denom">/100</span>
            </div>
            <div className="card-bar-track">
              <div className="card-bar-fill" style={{ width: "94%" }} />
            </div>
          </div>

          {/* Skills card */}
          <div className="float-card float-card-b" style={{ minWidth: 190 }}>
            <div className="card-label">Top Skills Found</div>
            <div style={{ marginTop: 4 }}>
              <span className="card-tag tag-blue">React</span>
              <span className="card-tag tag-green">Python</span>
              <span className="card-tag tag-amber">SQL</span>
              <span className="card-tag tag-blue">TypeScript</span>
            </div>
          </div>

          {/* Jobs card */}
          <div className="float-card float-card-c" style={{ minWidth: 160, position:'relative', overflow:'hidden' }}>
            <div className="spin-ring" />
            <div className="card-label">Best Fit Roles</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>
              {["Sr. Frontend Eng.", "Full-Stack Dev", "Tech Lead"].map((r, i) => (
                <div key={r} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{
                    width:6, height:6, borderRadius:'50%',
                    background: i === 0 ? 'var(--rust)' : 'var(--sand)',
                    flexShrink:0
                  }}/>
                  <span style={{ fontSize:'.78rem', color:'var(--ink)', fontWeight: i===0 ? 500 : 400 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero */}
        <main className="hero">
          <div className="hero-eyebrow">
            <span className="eyebrow-pulse" />
            AI-Powered Career Intelligence
          </div>

          <h1 className="hero-title">
            Your resume,<br />
            <em>perfectly matched.</em>
          </h1>

          <p className="hero-sub">
            Upload your resume and let our AI surface the roles where you'll truly shine — with deep insights, not just keywords.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/app")}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              Analyze My Resume
            </button>
            <button
              className="btn-ghost"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              See how it works
              <span className="btn-ghost-arrow">→</span>
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[
              { num: "98%", label: "ATS Pass Rate" },
              { num: "3.2×", label: "More Interviews" },
              { num: "50K+", label: "Resumes Analyzed" },
            ].map(({ num, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </main>

        {/* Ticker */}
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">
                {item}
                <span className="ticker-sep" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}