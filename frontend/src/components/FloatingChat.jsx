import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --rust:  #C4622D;
    --ember: #E8855A;
    --ink:   #1A1210;
    --mist:  #8A7B6E;
    --sand:  #D4C5A9;
    --cream: #F5F0E8;
  }

  @keyframes fc-spin-slow { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
  @keyframes fc-spin-rev  { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes fc-pop-in {
    0%   { opacity:0; transform:scale(0) rotate(-20deg); }
    65%  { transform:scale(1.12) rotate(4deg); }
    100% { opacity:1; transform:scale(1) rotate(0deg); }
  }
  @keyframes fc-shimmer {
    0%  { background-position:-200% center; }
    100%{ background-position: 200% center; }
  }
  @keyframes fc-pulse-ring {
    0%   { transform:scale(1);   opacity:.6; }
    100% { transform:scale(1.7); opacity:0; }
  }
  @keyframes fc-bubble-1 {
    0%,100%{ transform:translateY(0) scale(1);   opacity:.9; }
    50%    { transform:translateY(-8px) scale(1.04); opacity:1; }
  }
  @keyframes fc-bubble-2 {
    0%,100%{ transform:translateY(0) scale(1);   opacity:.8; }
    50%    { transform:translateY(-6px) scale(1.03); opacity:1; }
  }
  @keyframes fc-badge-bounce {
    0%,100%{ transform:scale(1); }
    40%    { transform:scale(1.25); }
    60%    { transform:scale(.9); }
  }
  @keyframes fc-tooltip-in {
    from { opacity:0; transform:translateX(8px) scale(.95); }
    to   { opacity:1; transform:translateX(0)   scale(1); }
  }
  @keyframes fc-tooltip-out {
    from { opacity:1; transform:translateX(0)   scale(1); }
    to   { opacity:0; transform:translateX(8px) scale(.95); }
  }
  @keyframes fc-dots {
    0%,80%,100%{ transform:scale(0); opacity:.3; }
    40%        { transform:scale(1);  opacity:1; }
  }
  @keyframes fc-waveBar {
    0%,100%{ transform:scaleY(.3); opacity:.4; }
    50%    { transform:scaleY(1);  opacity:1;  }
  }
  @keyframes fc-trail-fade {
    0%  { opacity:.5; transform:scale(1); }
    100%{ opacity:0;  transform:scale(1.6); }
  }

  /* ── FAB WRAPPER ── */
  .fc-wrap {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    pointer-events: none;
  }

  /* ── TOOLTIP / PREVIEW CARD ── */
  .fc-tooltip {
    pointer-events: all;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(212,197,169,.55);
    border-radius: 18px;
    padding: 14px 16px;
    box-shadow: 0 8px 32px rgba(44,36,32,.12), 0 2px 8px rgba(196,98,45,.08);
    min-width: 210px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transform-origin: bottom right;
  }
  .fc-tooltip.entering { animation: fc-tooltip-in .3s cubic-bezier(.34,1.56,.64,1) both; }
  .fc-tooltip.leaving  { animation: fc-tooltip-out .22s ease both; pointer-events:none; }

  /* Glass shine line */
  .fc-tooltip::before {
    content:'';
    position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
  }

  .fc-tooltip-label {
    font-size:.62rem; font-weight:500;
    letter-spacing:.09em; text-transform:uppercase;
    margin-bottom:6px;
    background: linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:fc-shimmer 2.5s linear infinite;
    font-family:'Syne',sans-serif;
  }
  .fc-tooltip-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:.9rem;
    color:var(--ink); margin-bottom:4px;
    letter-spacing:-.01em;
  }
  .fc-tooltip-sub {
    font-size:.74rem; color:var(--mist); line-height:1.5;
    font-family:'DM Sans',sans-serif;
  }

  /* Mini AI wave in tooltip */
  .fc-tooltip-wave {
    display:flex; align-items:center; gap:2.5px;
    margin-top:10px; height:16px;
  }
  .fc-tooltip-wave-bar {
    width:2px; background:var(--ember); border-radius:99px;
    animation:fc-waveBar 1s ease-in-out infinite;
  }
  .fc-tooltip-wave-bar:nth-child(1){ height:7px;  animation-delay:0s; }
  .fc-tooltip-wave-bar:nth-child(2){ height:14px; animation-delay:.12s; }
  .fc-tooltip-wave-bar:nth-child(3){ height:9px;  animation-delay:.24s; }
  .fc-tooltip-wave-bar:nth-child(4){ height:5px;  animation-delay:.36s; }
  .fc-tooltip-wave-bar:nth-child(5){ height:12px; animation-delay:.2s; }
  .fc-tooltip-wave-label {
    font-size:.65rem; color:var(--mist);
    font-family:'DM Sans',sans-serif; margin-left:4px;
  }

  /* Tooltip CTA row */
  .fc-tooltip-cta {
    margin-top:10px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .fc-cta-chip {
    display:inline-flex; align-items:center; gap:6px;
    background: linear-gradient(135deg,var(--rust),var(--ember));
    color:#fff; border-radius:99px;
    padding:6px 14px;
    font-size:.72rem; font-weight:500;
    font-family:'DM Sans',sans-serif;
    box-shadow:0 3px 10px rgba(196,98,45,.3);
    letter-spacing:.02em;
  }
  .fc-cta-arrow { transition:transform .2s; display:inline-block; }
  .fc-tooltip:hover .fc-cta-arrow { transform:translateX(3px); }
  .fc-cta-dismiss {
    font-size:.65rem; color:var(--sand);
    font-family:'DM Sans',sans-serif;
    cursor:pointer; padding:4px 8px;
    border-radius:6px;
    transition:color .18s, background .18s;
    border:none; background:none;
  }
  .fc-cta-dismiss:hover { color:var(--mist); background:rgba(212,197,169,.2); }

  /* ── MAIN FAB BUTTON ── */
  .fc-btn {
    pointer-events: all;
    position: relative;
    width: 62px; height: 62px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex; align-items:center; justify-content:center;
    animation: fc-pop-in .55s cubic-bezier(.34,1.56,.64,1) both;
    outline: none;
  }

  /* Pulse rings */
  .fc-pulse-ring {
    position:absolute; inset:-4px;
    border-radius:50%;
    border:2px solid rgba(196,98,45,.45);
    animation:fc-pulse-ring 2.2s ease-out infinite;
    pointer-events:none;
  }
  .fc-pulse-ring:nth-child(2){ animation-delay:.9s; }

  /* Orbit ring */
  .fc-orbit {
    position:absolute; inset:-10px;
    border-radius:50%;
    border:1.5px dashed rgba(196,98,45,.2);
    animation:fc-spin-slow 14s linear infinite;
    pointer-events:none;
  }
  .fc-orbit::after {
    content:''; position:absolute;
    top:4px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background:var(--ember); border-radius:50%;
    box-shadow:0 0 8px var(--ember);
  }
  .fc-orbit-inner {
    position:absolute; inset:-4px;
    border-radius:50%;
    border:1px dashed rgba(196,98,45,.12);
    animation:fc-spin-rev 9s linear infinite;
    pointer-events:none;
  }

  /* The colored circle itself */
  .fc-circle {
    position:absolute; inset:0;
    border-radius:50%;
    background:linear-gradient(135deg,var(--rust) 0%,var(--ember) 100%);
    box-shadow:
      0 8px 24px rgba(196,98,45,.45),
      0 2px 6px rgba(196,98,45,.3),
      inset 0 1px 0 rgba(255,255,255,.2);
    transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s;
  }
  .fc-btn:hover .fc-circle {
    transform:scale(1.1);
    box-shadow:0 14px 36px rgba(196,98,45,.55), inset 0 1px 0 rgba(255,255,255,.25);
  }
  .fc-btn:active .fc-circle {
    transform:scale(.93);
    box-shadow:0 4px 12px rgba(196,98,45,.35);
  }

  /* Glass sheen on the circle */
  .fc-circle::before {
    content:'';
    position:absolute; inset:0;
    border-radius:inherit;
    background:linear-gradient(135deg,rgba(255,255,255,.22) 0%,transparent 55%);
  }

  /* Icon inside */
  .fc-icon {
    position:relative; z-index:1;
    font-size:1.45rem;
    transition:transform .25s cubic-bezier(.34,1.56,.64,1);
    line-height:1;
  }
  .fc-btn:hover .fc-icon { transform:scale(1.12) rotate(-8deg); }

  /* Badge (unread count) */
  .fc-badge {
    position:absolute; top:0; right:0;
    width:20px; height:20px;
    background:var(--cream);
    border:2px solid rgba(196,98,45,.3);
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Syne',sans-serif;
    font-weight:800; font-size:.6rem;
    color:var(--rust);
    z-index:2;
    animation:fc-badge-bounce .4s cubic-bezier(.34,1.56,.64,1) both;
    box-shadow:0 2px 8px rgba(196,98,45,.2);
  }

  /* ── MINI CHAT BUBBLES (decorative, floating near FAB) ── */
  .fc-deco-bubbles {
    position:absolute;
    bottom:68px; right:8px;
    pointer-events:none;
    display:flex; flex-direction:column; gap:6px; align-items:flex-end;
  }
  .fc-deco-b {
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(10px);
    border:1px solid rgba(212,197,169,.5);
    border-radius:12px 12px 3px 12px;
    padding:6px 10px;
    font-size:.66rem; color:var(--mist);
    font-family:'DM Sans',sans-serif;
    box-shadow:0 3px 12px rgba(44,36,32,.08);
    white-space:nowrap;
  }
  .fc-deco-b-1{ animation:fc-bubble-1 3.5s ease-in-out infinite; }
  .fc-deco-b-2{ animation:fc-bubble-2 4.2s ease-in-out infinite .4s; }

  /* ── TRAIL CIRCLES (click ripple) ── */
  .fc-trail {
    position:absolute; inset:-6px;
    border-radius:50%;
    border:2px solid var(--ember);
    pointer-events:none;
    animation:fc-trail-fade .55s ease both;
  }
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function FloatingChat() {
  const navigate = useNavigate();
  const [hovered,      setHovered]      = useState(false);
  const [tooltipState, setTooltipState] = useState("idle");   // idle | entering | visible | leaving
  const [showDeco,     setShowDeco]     = useState(false);
  const [trail,        setTrail]        = useState(false);
  const [dismissed,    setDismissed]    = useState(false);

  /* show decorative bubbles after a brief delay on mount */
  useEffect(() => {
    const t = setTimeout(() => setShowDeco(true), 1400);
    return () => clearTimeout(t);
  }, []);

  /* auto-show tooltip after 2s if not dismissed */
  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => {
      if (!hovered) openTooltip();
    }, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  const openTooltip = () => {
    if (dismissed) return;
    setTooltipState("entering");
    setTimeout(() => setTooltipState("visible"), 10);
  };

  const closeTooltip = () => {
    setTooltipState("leaving");
    setTimeout(() => setTooltipState("idle"), 240);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (tooltipState === "idle") openTooltip();
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleClick = () => {
    setTrail(true);
    setTimeout(() => setTrail(false), 600);
    closeTooltip();
    setTimeout(() => navigate("/chat"), 160);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
    closeTooltip();
  };

  const showTooltip = tooltipState === "entering" || tooltipState === "visible" || tooltipState === "leaving";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="fc-wrap">

        {/* ── TOOLTIP CARD ── */}
        {showTooltip && !dismissed && (
          <div
            className={`fc-tooltip ${tooltipState}`}
            onClick={handleClick}
          >
            <div className="fc-tooltip-label">Resume AI</div>
            <div className="fc-tooltip-title">Ask me anything</div>
            <div className="fc-tooltip-sub">
              Get instant feedback on your resume, skills, and best-fit roles.
            </div>
            <div className="fc-tooltip-wave">
              <div className="fc-tooltip-wave-bar" />
              <div className="fc-tooltip-wave-bar" />
              <div className="fc-tooltip-wave-bar" />
              <div className="fc-tooltip-wave-bar" />
              <div className="fc-tooltip-wave-bar" />
              <span className="fc-tooltip-wave-label">AI active</span>
            </div>
            <div className="fc-tooltip-cta">
              <div className="fc-cta-chip">
                Chat now <span className="fc-cta-arrow">→</span>
              </div>
              <button className="fc-cta-dismiss" onClick={handleDismiss}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── DECORATIVE FLOATING BUBBLES ── */}
        {showDeco && !hovered && tooltipState === "idle" && (
          <div className="fc-deco-bubbles">
            <div className="fc-deco-b fc-deco-b-2">How's my resume? ✦</div>
            <div className="fc-deco-b fc-deco-b-1">Best roles for me?</div>
          </div>
        )}

        {/* ── MAIN FAB ── */}
        <button
          className="fc-btn"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Open AI Chat"
          title="Open AI Chat"
        >
          {/* Pulse rings */}
          <div className="fc-pulse-ring" />
          <div className="fc-pulse-ring" />

          {/* Orbit rings */}
          <div className="fc-orbit" />
          <div className="fc-orbit-inner" />

          {/* Click trail ripple */}
          {trail && <div className="fc-trail" />}

          {/* The button circle */}
          <div className="fc-circle" />

          {/* Icon */}
          <span className="fc-icon" role="img" aria-hidden>◎</span>

          {/* Badge */}
          <div className="fc-badge">AI</div>
        </button>

      </div>
    </>
  );
}