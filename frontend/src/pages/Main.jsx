import { useContext, useState, useEffect, useRef } from "react";
import { ResumeContext } from "../context";
import UploadSection from "../components/UploadSection";
import ScoreLineChart from "../components/ScoreLineChart";
import SkillTags from "../components/SkillTags";
import JobCards from "../components/JobCards";
import FloatingChat from "../components/FloatingChat";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --cream:      #F5F0E8;
    --warm:       #EDE5D4;
    --sand:       #D4C5A9;
    --rust:       #C4622D;
    --ember:      #E8855A;
    --dusk:       #2C2420;
    --ink:        #1A1210;
    --mist:       #8A7B6E;
    --card-bg:    rgba(255,255,255,0.68);
    --card-border:rgba(212,197,169,0.55);
    --glow:       rgba(196,98,45,0.14);
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; } to { opacity:1; }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes orbDrift1 {
    0%,100%{ transform:translate(0,0) scale(1); }
    40%    { transform:translate(50px,-30px) scale(1.08); }
    70%    { transform:translate(-20px,40px) scale(0.96); }
  }
  @keyframes orbDrift2 {
    0%,100%{ transform:translate(0,0) scale(1); }
    35%    { transform:translate(-40px,50px) scale(1.06); }
    65%    { transform:translate(30px,-20px) scale(0.94); }
  }
  @keyframes spin-slow {
    from{ transform:rotate(0deg); } to{ transform:rotate(360deg); }
  }
  @keyframes spin-rev {
    from{ transform:rotate(0deg); } to{ transform:rotate(-360deg); }
  }
  @keyframes scoreCount {
    from{ opacity:0; transform:scale(.6); }
    to  { opacity:1; transform:scale(1); }
  }
  @keyframes barFill {
    from{ width:0; }
  }
  @keyframes pulseRing {
    0%  { transform:scale(1);   opacity:.6; }
    70% { transform:scale(1.5); opacity:0; }
    100%{ transform:scale(1);   opacity:0; }
  }
  @keyframes tickerMove {
    from{ transform:translateX(0); }
    to  { transform:translateX(-50%); }
  }
  @keyframes slideIn {
    from{ opacity:0; transform:translateX(-18px); }
    to  { opacity:1; transform:translateX(0); }
  }
  @keyframes cardReveal {
    from{ opacity:0; transform:translateY(24px) scale(.97); }
    to  { opacity:1; transform:translateY(0)    scale(1);   }
  }

  /* ── LAYOUT ── */
  .dash-root {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    position: relative;
    overflow-x: hidden;
  }

  /* background orbs */
  .dash-orb {
    position:fixed; border-radius:50%;
    filter:blur(90px); pointer-events:none; z-index:0;
  }
  .dash-orb-1{
    width:600px;height:600px;
    background:radial-gradient(circle,rgba(232,133,90,.18),transparent 70%);
    top:-160px;right:-120px;
    animation:orbDrift1 16s ease-in-out infinite;
  }
  .dash-orb-2{
    width:480px;height:480px;
    background:radial-gradient(circle,rgba(196,98,45,.14),transparent 70%);
    bottom:-80px;left:-80px;
    animation:orbDrift2 20s ease-in-out infinite;
  }
  .dash-grain{
    position:fixed;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    opacity:.5;pointer-events:none;z-index:1;
  }

  /* ── TOPBAR ── */
  .dash-topbar{
    position:sticky;top:0;z-index:50;
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 36px;
    background:rgba(245,240,232,.82);
    backdrop-filter:blur(18px);
    border-bottom:1px solid rgba(212,197,169,.4);
    animation:fadeIn .6s ease both;
  }
  .topbar-logo{
    font-family:'Syne',sans-serif;font-weight:800;
    font-size:1.05rem;letter-spacing:.04em;
    display:flex;align-items:center;gap:8px;
  }
  .topbar-dot{
    width:8px;height:8px;background:var(--rust);
    border-radius:50%;display:inline-block;
    box-shadow:0 0 0 3px rgba(196,98,45,.2);
  }
  .topbar-title{
    font-family:'Syne',sans-serif;font-weight:700;
    font-size:1rem;color:var(--mist);
    letter-spacing:.02em;
  }
  .topbar-badge{
    background:rgba(196,98,45,.10);
    border:1px solid rgba(196,98,45,.22);
    border-radius:99px;padding:6px 16px;
    font-size:.72rem;font-weight:500;
    letter-spacing:.07em;text-transform:uppercase;
    color:var(--rust);
    display:flex;align-items:center;gap:7px;
  }
  .badge-pulse{
    width:5px;height:5px;border-radius:50%;
    background:var(--rust);flex-shrink:0;
    animation:pulseRing 2s ease-in-out infinite;
    box-shadow:0 0 0 0 var(--rust);
  }

  /* ── CONTENT AREA ── */
  .dash-content{
    position:relative;z-index:2;
    max-width:1300px;margin:0 auto;
    padding:40px 36px 120px;
  }

  /* ── SECTION HEADER ── */
  .section-header{
    display:flex;align-items:baseline;gap:14px;
    margin-bottom:28px;
  }
  .section-title{
    font-family:'Syne',sans-serif;font-weight:800;
    font-size:1.45rem;letter-spacing:-.02em;color:var(--ink);
  }
  .section-sub{
    font-size:.8rem;color:var(--mist);letter-spacing:.04em;
  }
  .section-line{
    flex:1;height:1px;background:linear-gradient(90deg,rgba(212,197,169,.6),transparent);
  }

  /* ── UPLOAD AREA WRAPPER ── */
  .upload-wrapper{
    animation:fadeUp .7s .1s ease both;
    background:var(--card-bg);
    backdrop-filter:blur(18px);
    border:1.5px dashed var(--sand);
    border-radius:24px;
    padding:48px 40px;
    text-align:center;
    position:relative;overflow:hidden;
    transition:border-color .3s ease,box-shadow .3s ease;
    margin-bottom:40px;
  }
  .upload-wrapper:hover{
    border-color:var(--ember);
    box-shadow:0 0 0 6px rgba(196,98,45,.07),0 12px 40px rgba(196,98,45,.12);
  }
  .upload-inner-glow{
    position:absolute;inset:0;
    background:radial-gradient(ellipse at 50% 0%,rgba(232,133,90,.08),transparent 60%);
    pointer-events:none;
  }

  /* ── ANALYSIS GRID ── */
  .analysis-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    grid-template-rows:auto auto auto auto;
    gap:24px;
  }
  @media(max-width:900px){ .analysis-grid{grid-template-columns:1fr;} }

  /* ── GLASS CARD ── */
  .glass-card{
    background:var(--card-bg);
    backdrop-filter:blur(18px);
    border:1px solid var(--card-border);
    border-radius:24px;
    padding:28px 30px;
    box-shadow:0 4px 24px rgba(44,36,32,.07),0 1px 4px rgba(196,98,45,.05);
    position:relative;overflow:hidden;
    transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease;
  }
  .glass-card:hover{
    transform:translateY(-4px);
    box-shadow:0 12px 40px rgba(44,36,32,.11),0 2px 8px rgba(196,98,45,.1);
  }
  .glass-card-shine{
    position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
  }

  /* ── SCORE CARD ── */
  .score-card{
    grid-column:1;grid-row:1;
    animation:cardReveal .7s .45s ease both;
  }
  .score-card-label{
    font-size:.72rem;font-weight:500;letter-spacing:.09em;
    text-transform:uppercase;color:var(--mist);margin-bottom:16px;
    display:flex;align-items:center;gap:8px;
  }
  .score-card-label::before{
    content:'';width:18px;height:2px;
    background:var(--rust);border-radius:99px;
  }
  .score-display{
    display:flex;align-items:flex-end;gap:8px;
    animation:scoreCount .5s .7s cubic-bezier(.34,1.56,.64,1) both;
  }
  .score-big{
    font-family:'Syne',sans-serif;font-weight:800;
    font-size:5rem;line-height:1;letter-spacing:-.04em;
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmer 3s linear infinite;
  }
  .score-denom{
    font-family:'Syne',sans-serif;font-weight:600;
    font-size:1.6rem;color:var(--sand);margin-bottom:14px;
  }
  .score-bar-track{
    height:6px;background:rgba(196,98,45,.1);
    border-radius:99px;margin-top:20px;overflow:hidden;
  }
  .score-bar-fill{
    height:100%;border-radius:99px;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    animation:barFill .9s .9s cubic-bezier(.65,0,.35,1) both;
    box-shadow:0 0 12px rgba(232,133,90,.5);
  }
  .score-sub{
    margin-top:10px;font-size:.75rem;color:var(--mist);
    display:flex;justify-content:space-between;
  }

  /* score ring */
  .score-ring-wrap{
    position:absolute;right:-20px;top:-20px;
    width:140px;height:140px;pointer-events:none;
  }
  .score-ring{
    position:absolute;inset:0;
    border:1.5px dashed rgba(196,98,45,.18);
    border-radius:50%;
    animation:spin-slow 18s linear infinite;
  }
  .score-ring::after{
    content:'';position:absolute;
    top:6px;left:50%;margin-left:-4px;
    width:7px;height:7px;
    background:var(--rust);border-radius:50%;
    box-shadow:0 0 8px var(--rust);
  }
  .score-ring-2{
    position:absolute;inset:14px;
    border:1px dashed rgba(196,98,45,.10);
    border-radius:50%;
    animation:spin-rev 12s linear infinite;
  }

  /* sub-score bars */
  .sub-scores{
    margin-top:22px;display:flex;flex-direction:column;gap:12px;
  }
  .sub-score-row{
    display:flex;align-items:center;gap:12px;
  }
  .sub-score-label{
    font-size:.73rem;font-weight:500;color:var(--mist);
    width:90px;flex-shrink:0;
  }
  .sub-score-track{
    flex:1;height:5px;background:rgba(196,98,45,.08);
    border-radius:99px;overflow:hidden;
  }
  .sub-score-fill{
    height:100%;border-radius:99px;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    animation:barFill 1s ease both;
  }
  .sub-score-val{
    font-family:'Syne',sans-serif;font-weight:700;
    font-size:.75rem;color:var(--ink);width:28px;text-align:right;
  }

  /* ── CHART CARD ── */
  .chart-card{
    grid-column:2;grid-row:1 / span 1;
    animation:cardReveal .7s .55s ease both;
  }

  /* ── SKILLS CARD ── */
  .skills-card{
    grid-column:1;grid-row:2 / span 1;
    animation:cardReveal .7s .65s ease both;
  }
  .skills-cloud{
    display:flex;flex-wrap:wrap;gap:9px;margin-top:6px;
  }
  .skill-chip{
    padding:7px 14px;border-radius:99px;
    font-size:.76rem;font-weight:500;letter-spacing:.03em;
    cursor:default;
    transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease,background .2s;
    animation:slideIn .5s ease both;
  }
  .skill-chip:hover{
    transform:translateY(-3px) scale(1.07);
    box-shadow:0 6px 16px rgba(196,98,45,.2);
  }
  .chip-rust{ background:rgba(196,98,45,.12);color:var(--rust);border:1px solid rgba(196,98,45,.2); }
  .chip-warm{ background:rgba(212,197,169,.3);color:var(--dusk);border:1px solid rgba(212,197,169,.5); }
  .chip-ember{ background:rgba(232,133,90,.12);color:#b5501f;border:1px solid rgba(232,133,90,.2); }

  /* ── INFO CARD (Education/Experience) ── */
  .info-card{
    grid-column:1;grid-row:3 / span 1;
    animation:cardReveal .7s .7s ease both;
  }
  .info-section{
    margin-bottom:18px;
  }
  .info-section:last-child{ margin-bottom:0; }
  .info-label{
    font-size:.72rem;font-weight:500;letter-spacing:.09em;
    text-transform:uppercase;color:var(--mist);margin-bottom:8px;
    display:flex;align-items:center;gap:8px;
  }
  .info-label::before{
    content:'';width:18px;height:2px;
    background:var(--rust);border-radius:99px;
  }
  .info-text{
    font-size:.82rem;line-height:1.5;color:var(--ink);
  }
  .info-badges{
    display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;
  }
  .info-badge{
    padding:5px 10px;border-radius:8px;
    background:rgba(196,98,45,.08);border:1px solid rgba(196,98,45,.15);
    font-size:.7rem;font-weight:500;color:var(--rust);
  }

  /* ── JOBS CARD ── */
  .jobs-card{
    grid-column:2;grid-row:2 / span 2;
    animation:cardReveal .7s .75s ease both;
  }
  .job-item{
    display:flex;align-items:center;gap:14px;
    padding:12px 0;border-bottom:1px solid rgba(212,197,169,.25);
    transition:background .2s;cursor:default;
    border-radius:8px;padding:10px 10px;margin:0 -10px;
    transition:background .2s;
  }
  .job-item:hover{ background:rgba(196,98,45,.05); }
  .job-item:last-child{ border-bottom:none; }
  .job-rank{
    font-family:'Syne',sans-serif;font-weight:800;
    font-size:1.1rem;color:var(--sand);width:24px;
    flex-shrink:0;
  }
  .job-rank-1{ color:var(--rust); }
  .job-info{ flex:1;min-width:0; }
  .job-title{
    font-weight:500;font-size:.88rem;
    color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .job-company{
    font-size:.74rem;color:var(--mist);margin-top:2px;
  }
  .job-match-bar-wrap{ width:70px;flex-shrink:0; }
  .job-match-pct{
    font-family:'Syne',sans-serif;font-weight:700;
    font-size:.8rem;color:var(--rust);text-align:right;margin-bottom:4px;
  }
  .job-mini-track{
    height:3px;background:rgba(196,98,45,.1);
    border-radius:99px;overflow:hidden;
  }
  .job-mini-fill{
    height:100%;background:linear-gradient(90deg,var(--rust),var(--ember));
    border-radius:99px;animation:barFill .8s ease both;
  }

  /* ── EMPTY STATE ── */
  .empty-state{
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:80px 20px;gap:18px;
    animation:fadeUp .8s .3s ease both;
  }
  .empty-icon{
    width:72px;height:72px;border-radius:50%;
    background:rgba(196,98,45,.08);border:1.5px dashed rgba(196,98,45,.25);
    display:flex;align-items:center;justify-content:center;
    font-size:1.8rem;
    animation:spin-slow 20s linear infinite;
  }
  .empty-title{
    font-family:'Syne',sans-serif;font-weight:700;
    font-size:1.1rem;color:var(--mist);
  }
  .empty-sub{ font-size:.8rem;color:var(--sand); }

  /* ── TICKER ── */
  .dash-ticker{
    position:fixed;bottom:0;left:0;right:0;z-index:40;
    border-top:1px solid rgba(212,197,169,.3);
    background:rgba(245,240,232,.8);backdrop-filter:blur(12px);
    padding:11px 0;overflow:hidden;
  }
  .dash-ticker-track{
    display:flex;white-space:nowrap;
    animation:tickerMove 30s linear infinite;
    width:max-content;
  }
  .dash-ticker-item{
    display:inline-flex;align-items:center;gap:24px;
    padding:0 36px;font-size:.7rem;font-weight:500;
    letter-spacing:.09em;text-transform:uppercase;color:var(--mist);
  }
  .ticker-sep{
    width:3px;height:3px;border-radius:50%;
    background:var(--sand);flex-shrink:0;
  }

  /* ── FLOATING CHAT POSITIONING ── */
  .floating-chat-wrap{
    position:fixed;bottom:60px;right:32px;z-index:60;
  }
`;


const SUB_SCORES = [
  { label:"ATS Score",  val:91 },
  { label:"Relevance",  val:84 },
  { label:"Keywords",   val:88 },
  { label:"Formatting", val:79 },
];

const TICKER_ITEMS = [
  "Resume Analysis","ATS Optimization","Skills Matching",
  "Job Fit Score","Career Insights","AI-Powered",
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
/* Helper: safely render values that might be objects */
const safeRender = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.join(", ");
    return Object.values(value).join(", ");
  }
  return String(value);
};

function Main() {
  const ctx = useContext(ResumeContext);
  const analysis = ctx?.analysis ?? null;

  // Generate dynamic sub-scores from analysis data
  const generateSubScores = () => {
    if (!analysis || !analysis.scores) return SUB_SCORES;
    
    const scores = analysis.scores;
    return [
      { label: "ATS Score", val: Math.round(scores.ats || 0) },
      { label: "Relevance", val: Math.round(scores.relevance || 0) },
      { label: "Keywords", val: Math.round(scores.keywords || 0) },
      { label: "Formatting", val: Math.round(scores.formatting || 0) },
    ];
  };

  // Generate dynamic ticker items based on analysis
  const generateTickerItems = () => {
    if (!analysis) return TICKER_ITEMS;
    
    const items = [];
    
    // Add analysis components
    if (analysis.skills && analysis.skills.length > 0) {
      items.push(`${analysis.skills.length} Skills Found`);
    }
    if (analysis.job_matches && analysis.job_matches.length > 0) {
      items.push(`${analysis.job_matches.length} Job Matches`);
    }
    if (analysis.certifications && analysis.certifications.length > 0) {
      items.push(`${analysis.certifications.length} Certifications`);
    }
    
    // Add recommendations if available
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      items.push("Personalized Insights");
    }
    
    // Add score indicators
    if (analysis.overall_score >= 85) {
      items.push("Excellent Resume");
    } else if (analysis.overall_score >= 70) {
      items.push("Good Resume");
    } else {
      items.push("Resume Optimization Tips");
    }
    
    // Add base items if list is empty or short
    if (items.length < 3) {
      items.push(...["Resume Analysis", "AI-Powered", "Career Insights"]);
    }
    
    return items.slice(0, 6); // Limit to 6 items
  };

  const currentSubScores = generateSubScores();
  const currentTickerItems = generateTickerItems();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="dash-root">
        {/* Ambient background */}
        <div className="dash-orb dash-orb-1" />
        <div className="dash-orb dash-orb-2" />
        <div className="dash-grain" />

        {/* Top bar */}
        <header className="dash-topbar">
          <div className="topbar-logo">
            <span className="topbar-dot" />
            ResumeAI
          </div>
          <span className="topbar-title">Intelligence Dashboard</span>
          <div className="topbar-badge">
            <span className="badge-pulse" />
            AI Active
          </div>
        </header>

        {/* Main Content */}
        <main className="dash-content">

          {/* ── UPLOAD SECTION ── */}
          <div style={{ animation:"fadeUp .7s .05s ease both" }}>
            <div className="section-header">
              <span className="section-title">Upload Resume</span>
              <span className="section-line" />
              <span className="section-sub">PDF</span>
            </div>
            <div className="upload-wrapper">
              <div className="upload-inner-glow" />
              <UploadSection />
            </div>
          </div>

          {/* ── ANALYSIS (shown if data exists) ── */}
          {analysis ? (
            <div className="analysis-grid">

              {/* ── SCORE CARD ── */}
              <div className="glass-card score-card">
                <div className="glass-card-shine" />
                <div className="score-ring-wrap">
                  <div className="score-ring" />
                  <div className="score-ring-2" />
                </div>

                <div className="score-card-label">Overall Score</div>
                <div className="score-display">
                  <span className="score-big">{analysis.overall_score}</span>
                  <span className="score-denom">/100</span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar-fill"
                    style={{ width:`${analysis.overall_score}%` }}
                  />
                </div>
                <div className="score-sub">
                  <span>Resume Strength</span>
                  <span style={{ color:"var(--rust)",fontWeight:600 }}>
                    {analysis.overall_score >= 85
                      ? "Excellent"
                      : analysis.overall_score >= 70
                      ? "Good"
                      : "Needs Work"}
                  </span>
                </div>

                <div className="sub-scores">
                  {currentSubScores.map(({ label, val }, i) => (
                    <div className="sub-score-row" key={label}>
                      <span className="sub-score-label">{label}</span>
                      <div className="sub-score-track">
                        <div
                          className="sub-score-fill"
                          style={{
                            width:`${val}%`,
                            animationDelay:`${.7 + i * .12}s`,
                          }}
                        />
                      </div>
                      <span className="sub-score-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CHART CARD ── */}
              <div className="glass-card chart-card">
                <div className="glass-card-shine" />
                <div className="score-card-label">Score Progression</div>
                <ScoreLineChart scores={analysis.scores} />
              </div>

              {/* ── SKILLS CARD ── */}
              <div className="glass-card skills-card" >
                <SkillTags skills={analysis.skills} />
              </div>

              {/* ── INFO CARD (Education & Experience) ── */}
              <div className="glass-card info-card">
                <div className="glass-card-shine" />
                
                {analysis.education && analysis.education !== "Not specified" && (
                  <div className="info-section">
                    <div className="info-label">Education</div>
                    <div className="info-text">{safeRender(analysis.education)}</div>
                  </div>
                )}

                {analysis.experience && analysis.experience !== "Not specified" && (
                  <div className="info-section">
                    <div className="info-label">Experience</div>
                    <div className="info-text">{safeRender(analysis.experience)}</div>
                  </div>
                )}

                {analysis.certifications && analysis.certifications.length > 0 && (
                  <div className="info-section">
                    <div className="info-label">Certifications</div>
                    <div className="info-badges">
                      {analysis.certifications.map((cert, idx) => (
                        <div key={idx} className="info-badge">{safeRender(cert)}</div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div className="info-section">
                    <div className="info-label">Recommendations</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--mist)', lineHeight: 1.6 }}>
                      {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                        <div key={idx}>• {safeRender(rec)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── JOBS CARD ── */}
              <div className="glass-card jobs-card">
                <JobCards jobs={analysis.job_matches} />
              </div>

            </div>
          ) : (
            /* ── EMPTY STATE ── */
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-title">Awaiting your resume</div>
              <div className="empty-sub">Upload a file above to unlock your intelligence report</div>
            </div>
          )}
        </main>

        {/* Floating Chat */}
        <div className="floating-chat-wrap">
          <FloatingChat />
        </div>

        {/* Ticker bar */}
        <div className="dash-ticker">
          <div className="dash-ticker-track">
            {[...currentTickerItems, ...currentTickerItems].map((item, i) => (
              <span key={i} className="dash-ticker-item">
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
export default Main;