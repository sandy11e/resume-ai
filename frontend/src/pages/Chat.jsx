import { useNavigate } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --cream:       #F5F0E8;
    --warm:        #EDE5D4;
    --sand:        #D4C5A9;
    --rust:        #C4622D;
    --ember:       #E8855A;
    --dusk:        #2C2420;
    --ink:         #1A1210;
    --mist:        #8A7B6E;
    --card-bg:     rgba(255,255,255,0.68);
    --card-border: rgba(212,197,169,0.55);
  }

  /* ── RESETS ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── KEYFRAMES ── */
  @keyframes fadeIn  { from{opacity:0}           to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes orbDrift1 {
    0%,100%{transform:translate(0,0) scale(1);}
    40%    {transform:translate(40px,-30px) scale(1.08);}
    70%    {transform:translate(-20px,35px) scale(0.95);}
  }
  @keyframes orbDrift2 {
    0%,100%{transform:translate(0,0) scale(1);}
    35%    {transform:translate(-30px,40px) scale(1.06);}
    65%    {transform:translate(25px,-18px) scale(0.94);}
  }
  @keyframes spin-slow  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
  @keyframes spin-rev   { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
  @keyframes pulseRing  {
    0%  {transform:scale(1);   opacity:.7;}
    70% {transform:scale(1.8); opacity:0;}
    100%{transform:scale(1);   opacity:0;}
  }
  @keyframes shimmer {
    0%  {background-position:-200% center;}
    100%{background-position: 200% center;}
  }
  @keyframes breathe {
    0%,100%{opacity:.5; transform:scale(1);}
    50%    {opacity:1;  transform:scale(1.04);}
  }
  @keyframes tickerMove {
    from{transform:translateX(0);}
    to  {transform:translateX(-50%);}
  }
  @keyframes waveBar {
    0%,100%{transform:scaleY(.4);}
    50%    {transform:scaleY(1);}
  }

  /* ── ROOT ── */
  .chat-root {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    position: relative;
    overflow: hidden;
  }

  /* ── AMBIENT BG ── */
  .chat-orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0;
  }
  .chat-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(232,133,90,.16), transparent 70%);
    top: -140px; right: -80px;
    animation: orbDrift1 18s ease-in-out infinite;
  }
  .chat-orb-2 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, rgba(196,98,45,.12), transparent 70%);
    bottom: -80px; left: -60px;
    animation: orbDrift2 22s ease-in-out infinite;
  }
  .chat-grain {
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    opacity: .45; pointer-events: none; z-index: 1;
  }

  /* ── TOPBAR ── */
  .chat-topbar {
    position: relative; z-index: 10;
    display: flex; align-items: center; gap: 16px;
    padding: 0 28px;
    height: 64px;
    background: rgba(245,240,232,.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(212,197,169,.45);
    flex-shrink: 0;
    animation: fadeIn .5s ease both;
  }

  /* Back button */
  .chat-back-btn {
    display: flex; align-items: center; gap: 7px;
    background: rgba(196,98,45,.09);
    border: 1px solid rgba(196,98,45,.2);
    border-radius: 99px;
    padding: 8px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: .78rem; font-weight: 500;
    letter-spacing: .03em;
    color: var(--rust);
    cursor: pointer;
    transition: background .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
    flex-shrink: 0;
  }
  .chat-back-btn:hover {
    background: rgba(196,98,45,.15);
    transform: translateX(-3px);
    box-shadow: 0 4px 16px rgba(196,98,45,.15);
  }
  .back-arrow { transition: transform .2s ease; display: inline-block; }
  .chat-back-btn:hover .back-arrow { transform: translateX(-3px); }

  /* Logo section */
  .chat-topbar-logo {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1rem; letter-spacing: .04em;
    display: flex; align-items: center; gap: 8px;
  }
  .topbar-logo-dot {
    width: 8px; height: 8px;
    background: var(--rust); border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(196,98,45,.2);
  }

  /* Divider */
  .topbar-divider {
    width: 1px; height: 22px;
    background: rgba(212,197,169,.5);
  }

  /* Title & subtitle */
  .chat-topbar-info { flex: 1; }
  .chat-topbar-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: .92rem; color: var(--ink);
    letter-spacing: -.01em;
  }
  .chat-topbar-sub {
    font-size: .7rem; color: var(--mist);
    margin-top: 1px; display: flex; align-items: center; gap: 6px;
  }

  /* AI wave indicator */
  .ai-wave {
    display: flex; align-items: center; gap: 3px; height: 14px;
  }
  .ai-wave-bar {
    width: 2.5px; background: var(--rust); border-radius: 99px;
    animation: waveBar 1.1s ease-in-out infinite;
  }
  .ai-wave-bar:nth-child(1){ height:8px;  animation-delay:0s; }
  .ai-wave-bar:nth-child(2){ height:14px; animation-delay:.15s; }
  .ai-wave-bar:nth-child(3){ height:10px; animation-delay:.3s; }
  .ai-wave-bar:nth-child(4){ height:6px;  animation-delay:.45s; }
  .ai-wave-bar:nth-child(5){ height:12px; animation-delay:.22s; }

  /* Token/session badge */
  .chat-session-badge {
    display: flex; align-items: center; gap: 8px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 6px 14px;
    font-size: .72rem;
    flex-shrink: 0;
  }
  .session-label { color: var(--mist); letter-spacing: .04em; }
  .session-val {
    font-family: 'Syne', sans-serif; font-weight: 700;
    color: var(--rust); font-size: .8rem;
  }

  /* ── SIDEBAR + CHAT LAYOUT ── */
  .chat-body {
    flex: 1; display: flex;
    position: relative; z-index: 2;
    overflow: hidden;
    animation: fadeUp .6s .15s ease both;
  }

  /* ── SIDEBAR ── */
  .chat-sidebar {
    width: 220px; flex-shrink: 0;
    background: rgba(245,240,232,.6);
    backdrop-filter: blur(14px);
    border-right: 1px solid rgba(212,197,169,.35);
    display: flex; flex-direction: column;
    padding: 24px 16px;
    gap: 6px;
    overflow-y: auto;
  }
  @media(max-width:700px){ .chat-sidebar{ display:none; } }

  .sidebar-label {
    font-size: .65rem; font-weight: 500; letter-spacing: .1em;
    text-transform: uppercase; color: var(--sand);
    padding: 0 8px; margin-bottom: 4px; margin-top: 12px;
  }
  .sidebar-label:first-child { margin-top: 0; }

  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    border-radius: 12px;
    font-size: .8rem; color: var(--mist);
    cursor: pointer;
    transition: background .18s, color .18s, transform .18s;
    border: 1px solid transparent;
    animation: slideRight .4s ease both;
  }
  .sidebar-item:hover {
    background: rgba(196,98,45,.08);
    color: var(--ink);
    transform: translateX(3px);
  }
  .sidebar-item.active {
    background: rgba(196,98,45,.12);
    border-color: rgba(196,98,45,.2);
    color: var(--rust);
    font-weight: 500;
  }
  .sidebar-icon { font-size: .9rem; flex-shrink: 0; }

  /* Sidebar resume context card */
  .sidebar-context {
    margin-top: auto;
    background: rgba(196,98,45,.07);
    border: 1px dashed rgba(196,98,45,.22);
    border-radius: 14px;
    padding: 14px;
    animation: fadeUp .5s .4s ease both;
  }
  .sidebar-context-label {
    font-size: .65rem; font-weight: 500; letter-spacing: .07em;
    text-transform: uppercase; color: var(--rust); margin-bottom: 8px;
  }
  .sidebar-context-score {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.6rem; color: var(--ink); line-height: 1;
  }
  .sidebar-context-sub {
    font-size: .7rem; color: var(--mist); margin-top: 3px;
  }
  .sidebar-context-bar {
    height: 3px; background: rgba(196,98,45,.12);
    border-radius: 99px; margin-top: 10px; overflow: hidden;
  }
  .sidebar-context-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg,var(--rust),var(--ember));
    width: 87%;
  }
  /* spinning ring inside context card */
  .ctx-ring-wrap {
    position: relative; height: 36px; margin-top: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .ctx-ring {
    width: 32px; height: 32px; flex-shrink: 0;
    border: 1.5px dashed rgba(196,98,45,.3);
    border-radius: 50%;
    animation: spin-slow 10s linear infinite;
    position: relative;
  }
  .ctx-ring::after {
    content:''; position:absolute;
    top:2px; left:50%; margin-left:-3px;
    width:5px; height:5px;
    background: var(--rust); border-radius:50%;
  }
  .ctx-ring-inner {
    position: absolute; inset: 5px;
    border: 1px dashed rgba(196,98,45,.15);
    border-radius: 50%;
    animation: spin-rev 7s linear infinite;
  }
  .ctx-tag {
    font-size: .68rem; color: var(--mist); line-height: 1.4;
  }

  /* ── CHAT PANEL ── */
  .chat-panel {
    flex: 1; display: flex; flex-direction: column;
    min-width: 0; position: relative;
  }

  /* Decorative corner ring */
  .chat-corner-ring {
    position: absolute; bottom: 70px; right: -30px;
    width: 160px; height: 160px;
    border: 1px dashed rgba(196,98,45,.12);
    border-radius: 50%;
    animation: spin-slow 25s linear infinite;
    pointer-events: none; z-index: 0;
  }
  .chat-corner-ring::after {
    content:''; position:absolute;
    top:5px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background: var(--ember); border-radius:50%;
    animation: breathe 2.5s ease-in-out infinite;
  }

  /* ChatInterface wrapper */
  .chat-interface-wrap {
    flex: 1; position: relative; z-index: 1;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* Suggestions row */
  .chat-suggestions {
    display: flex; gap: 9px; flex-wrap: wrap;
    padding: 16px 24px 0;
    animation: fadeUp .6s .35s ease both;
  }
  .suggestion-chip {
    padding: 7px 14px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 99px;
    font-size: .73rem; font-weight: 400;
    color: var(--mist);
    cursor: pointer;
    transition: background .18s, color .18s, border-color .18s,
                transform .2s cubic-bezier(.34,1.56,.64,1);
    backdrop-filter: blur(10px);
    white-space: nowrap;
  }
  .suggestion-chip:hover {
    background: rgba(196,98,45,.10);
    border-color: rgba(196,98,45,.25);
    color: var(--rust);
    transform: translateY(-2px) scale(1.04);
  }

  /* ── TICKER ── */
  .chat-ticker {
    position: relative; z-index: 10;
    border-top: 1px solid rgba(212,197,169,.3);
    background: rgba(245,240,232,.8);
    backdrop-filter: blur(12px);
    padding: 10px 0; overflow: hidden; flex-shrink: 0;
  }
  .chat-ticker-track {
    display: flex; white-space: nowrap;
    animation: tickerMove 28s linear infinite;
    width: max-content;
  }
  .chat-ticker-item {
    display: inline-flex; align-items: center; gap: 22px;
    padding: 0 32px;
    font-size: .68rem; font-weight: 500;
    letter-spacing: .09em; text-transform: uppercase; color: var(--sand);
  }
  .ticker-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--sand); flex-shrink: 0;
  }
`;

const SUGGESTIONS = [

];

const SIDEBAR_ITEMS = [
  { icon: "◈", label: "Current Chat",   active: true  },
  ];

const TICKER_ITEMS = [
  "Resume AI", "Real-time Analysis", "Career Intelligence",
  "Skills Matching", "ATS Optimization", "Job Fit Score",
];

function Chat() {
  const navigate = useNavigate();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="chat-root">
        {/* Ambient */}
        <div className="chat-orb chat-orb-1" />
        <div className="chat-orb chat-orb-2" />
        <div className="chat-grain" />

        {/* ── TOPBAR ── */}
        <header className="chat-topbar">
          <button className="chat-back-btn" onClick={() => navigate("/app")}>
            <span className="back-arrow">←</span>
            Dashboard
          </button>

          <div className="topbar-divider" />

          <div className="chat-topbar-logo">
            <span className="topbar-logo-dot" />
            ResumeAI
          </div>

          <div className="topbar-divider" />

          <div className="chat-topbar-info">
            <div className="chat-topbar-title">AI Career Assistant</div>
            <div className="chat-topbar-sub">
              <div className="ai-wave">
                <div className="ai-wave-bar" />
                <div className="ai-wave-bar" />
                <div className="ai-wave-bar" />
                <div className="ai-wave-bar" />
                <div className="ai-wave-bar" />
              </div>
              Model active · Context loaded
            </div>
          </div>

          <div className="chat-session-badge">
            <span className="session-label"></span>AI
            <span className="session-val">chatbot</span>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="chat-body">

          {/* ── SIDEBAR ── */}
          <aside className="chat-sidebar">
            <span className="sidebar-label">Navigation</span>
            {SIDEBAR_ITEMS.map(({ icon, label, active }, i) => (
              <div
                key={label}
                className={`sidebar-item ${active ? "active" : ""}`}
                style={{ animationDelay: `${.05 * i}s` }}
              >
                <span className="sidebar-icon">{icon}</span>
                {label}
              </div>
            ))}

            {/* Resume context mini-card */}
            <span className="sidebar-label">Resume Context</span>
          
          </aside>

          {/* ── CHAT PANEL ── */}
          <div className="chat-panel">
            {/* Decorative ring */}
            <div className="chat-corner-ring" />

            {/* Suggestion chips */}
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  style={{ animationDelay: `${.05 * i}s` }}
                  onClick={() => window.dispatchEvent(new CustomEvent("ci:fill-input", { detail: s }))}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* The actual chat component */}
            <div className="chat-interface-wrap">
              <ChatInterface />
            </div>
          </div>
        </div>

        {/* ── TICKER ── */}
        <div className="chat-ticker">
          <div className="chat-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="chat-ticker-item">
                {item}
                <span className="ticker-dot" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;