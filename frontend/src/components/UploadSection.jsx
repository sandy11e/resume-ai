import { useState, useContext, useRef, useCallback } from "react";
import { ResumeContext } from "../context";
import { uploadResume, analyzeResume } from "../api";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --cream:       #F5F0E8;
    --warm:        #EDE5D4;
    --sand:        #D4C5A9;
    --rust:        #C4622D;
    --ember:       #E8855A;
    --ink:         #1A1210;
    --mist:        #8A7B6E;
    --card-bg:     rgba(255,255,255,0.75);
    --card-border: rgba(212,197,169,0.55);
  }

  @keyframes us-fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes us-fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes us-spin     { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
  @keyframes us-spin-rev { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes us-shimmer  {
    0%  {background-position:-200% center;}
    100%{background-position: 200% center;}
  }
  @keyframes us-pulse-ring {
    0%  {transform:scale(1);   opacity:.65;}
    100%{transform:scale(1.9); opacity:0;}
  }
  @keyframes us-float {
    0%,100%{transform:translateY(0) rotate(-3deg);}
    50%    {transform:translateY(-10px) rotate(-3deg);}
  }
  @keyframes us-float-b {
    0%,100%{transform:translateY(0) rotate(4deg);}
    50%    {transform:translateY(-7px) rotate(4deg);}
  }
  @keyframes us-bar-fill {
    from{width:0;}
  }
  @keyframes us-bar-shimmer {
    0%  {left:-60%;}
    100%{left:130%;}
  }
  @keyframes us-check-draw {
    from{stroke-dashoffset:28;}
    to  {stroke-dashoffset:0;}
  }
  @keyframes us-success-pop {
    0%  {transform:scale(0) rotate(-15deg); opacity:0;}
    65% {transform:scale(1.1) rotate(3deg); opacity:1;}
    100%{transform:scale(1) rotate(0deg);   opacity:1;}
  }
  @keyframes us-error-shake {
    0%,100%{transform:translateX(0);}
    20%    {transform:translateX(-8px);}
    40%    {transform:translateX(8px);}
    60%    {transform:translateX(-6px);}
    80%    {transform:translateX(6px);}
  }
  @keyframes us-step-in {
    from{opacity:0;transform:translateX(-10px);}
    to  {opacity:1;transform:translateX(0);}
  }
  @keyframes us-drop-glow {
    0%,100%{box-shadow:0 0 0 0 rgba(196,98,45,.1), 0 4px 24px rgba(196,98,45,.08);}
    50%    {box-shadow:0 0 0 8px rgba(196,98,45,.05), 0 8px 40px rgba(196,98,45,.18);}
  }
  @keyframes us-waveBar {
    0%,100%{transform:scaleY(.3);opacity:.4;}
    50%    {transform:scaleY(1); opacity:1;}
  }

  /* ── ROOT ── */
  .us-root {
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* ── DROP ZONE ── */
  .us-dropzone {
    position: relative;
    border: 2px dashed var(--sand);
    border-radius: 24px;
    background: var(--card-bg);
    backdrop-filter: blur(18px);
    padding: 48px 32px 40px;
    text-align: center;
    cursor: pointer;
    transition:
      border-color .25s ease,
      background .25s ease,
      box-shadow .25s ease,
      transform .2s cubic-bezier(.34,1.56,.64,1);
    overflow: hidden;
    animation: us-fadeUp .6s ease both;
  }
  .us-dropzone:hover,
  .us-dropzone.dragging {
    border-color: var(--ember);
    background: rgba(255,255,255,.88);
    transform: translateY(-2px);
    box-shadow:
      0 0 0 6px rgba(196,98,45,.07),
      0 12px 40px rgba(196,98,45,.14);
    animation: us-drop-glow 2s ease-in-out infinite;
  }
  .us-dropzone.dragging {
    border-color: var(--rust);
    border-style: solid;
  }
  .us-dropzone.has-file {
    border-color: rgba(196,98,45,.35);
    border-style: solid;
  }

  /* Inner radial glow */
  .us-dropzone-glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(232,133,90,.07), transparent 65%);
    pointer-events: none;
    transition: opacity .3s;
  }
  .us-dropzone.dragging .us-dropzone-glow { opacity: 2; }

  /* ── ICON AREA ── */
  .us-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center; justify-content: center;
    margin-bottom: 22px;
  }
  .us-icon-orbit {
    position: absolute;
    inset: -14px;
    border: 1.5px dashed rgba(196,98,45,.2);
    border-radius: 50%;
    animation: us-spin 18s linear infinite;
    pointer-events: none;
  }
  .us-icon-orbit::after {
    content:''; position:absolute;
    top:4px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background:var(--rust); border-radius:50%;
    box-shadow:0 0 8px var(--rust);
  }
  .us-icon-orbit-inner {
    position:absolute; inset:-6px;
    border:1px dashed rgba(196,98,45,.1);
    border-radius:50%;
    animation:us-spin-rev 11s linear infinite;
  }
  .us-icon-pulse-ring {
    position:absolute; inset:-2px;
    border:2px solid rgba(196,98,45,.3);
    border-radius:50%;
    animation:us-pulse-ring 2.4s ease-out infinite;
    pointer-events:none;
  }
  .us-icon-pulse-ring:nth-child(2){ animation-delay:1.2s; }
  .us-icon-circle {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(196,98,45,.1), rgba(232,133,90,.08));
    border: 1.5px solid rgba(196,98,45,.2);
    display: flex; align-items:center; justify-content:center;
    font-size: 1.8rem;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s;
    position: relative; z-index:1;
  }
  .us-dropzone:hover .us-icon-circle,
  .us-dropzone.dragging .us-icon-circle {
    transform: scale(1.1) rotate(-5deg);
    background: linear-gradient(135deg, rgba(196,98,45,.16), rgba(232,133,90,.13));
  }

  /* ── COPY ── */
  .us-headline {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:1.15rem;
    color:var(--ink); margin-bottom:8px;
    letter-spacing:-.01em;
  }
  .us-sub {
    font-size:.82rem; color:var(--mist); line-height:1.6;
    margin-bottom:22px;
  }
  .us-sub strong { color:var(--ink); font-weight:500; }

  /* ── FORMAT CHIPS ── */
  .us-formats {
    display:flex; justify-content:center; gap:8px;
    margin-bottom:24px;
    flex-wrap:wrap;
  }
  .us-format-chip {
    padding:5px 13px;
    background:rgba(212,197,169,.18);
    border:1px solid rgba(212,197,169,.4);
    border-radius:99px;
    font-size:.7rem; font-weight:500;
    letter-spacing:.05em; text-transform:uppercase;
    color:var(--mist);
  }

  /* ── HIDDEN FILE INPUT ── */
  .us-file-input { display:none; }

  /* ── BROWSE BUTTON ── */
  .us-browse-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent;
    border:1.5px solid rgba(196,98,45,.3);
    border-radius:99px;
    padding:10px 24px;
    font-family:'DM Sans',sans-serif;
    font-size:.85rem; font-weight:500;
    color:var(--rust); cursor:pointer;
    transition:background .2s, border-color .2s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
    letter-spacing:.02em;
  }
  .us-browse-btn:hover {
    background:rgba(196,98,45,.08);
    border-color:var(--rust);
    transform:translateY(-2px);
    box-shadow:0 4px 16px rgba(196,98,45,.18);
  }

  /* ── FILE PILL (selected file display) ── */
  .us-file-pill {
    display:inline-flex; align-items:center; gap:10px;
    background:rgba(196,98,45,.07);
    border:1px solid rgba(196,98,45,.22);
    border-radius:14px;
    padding:10px 16px;
    margin-bottom:20px;
    animation:us-fadeUp .35s ease both;
    max-width:320px;
  }
  .us-file-icon {
    width:32px; height:32px;
    background:linear-gradient(135deg,var(--rust),var(--ember));
    border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:.65rem; font-weight:700; color:#fff;
    font-family:'Syne',sans-serif; letter-spacing:.04em;
    flex-shrink:0;
    box-shadow:0 3px 10px rgba(196,98,45,.3);
  }
  .us-file-info { text-align:left; min-width:0; }
  .us-file-name {
    font-size:.82rem; font-weight:500; color:var(--ink);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    max-width:180px;
  }
  .us-file-size {
    font-size:.7rem; color:var(--mist); margin-top:1px;
  }
  .us-file-remove {
    margin-left:auto; flex-shrink:0;
    width:22px; height:22px;
    border:none; background:rgba(196,98,45,.1);
    border-radius:50%; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:.7rem; color:var(--rust);
    transition:background .18s, transform .18s;
  }
  .us-file-remove:hover {
    background:rgba(196,98,45,.2);
    transform:scale(1.15) rotate(90deg);
  }

  /* ── ANALYZE BUTTON ── */
  .us-analyze-btn {
    position:relative; overflow:hidden;
    background:linear-gradient(135deg,var(--rust) 0%,var(--ember) 100%);
    border:none; border-radius:99px;
    padding:14px 40px;
    font-family:'DM Sans',sans-serif;
    font-size:.92rem; font-weight:500;
    color:#fff; cursor:pointer;
    box-shadow:0 6px 24px rgba(196,98,45,.38), inset 0 1px 0 rgba(255,255,255,.2);
    transition:transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s, opacity .2s;
    letter-spacing:.02em;
  }
  .us-analyze-btn::before {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);
    border-radius:inherit;
  }
  .us-analyze-btn::after {
    content:'';
    position:absolute;
    width:200%; height:200%;
    top:-50%; left:-150%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
    transform:skewX(-20deg);
    transition:left .55s ease;
  }
  .us-analyze-btn:hover:not(:disabled)::after { left:100%; }
  .us-analyze-btn:hover:not(:disabled) {
    transform:translateY(-3px) scale(1.03);
    box-shadow:0 12px 36px rgba(196,98,45,.48);
  }
  .us-analyze-btn:active:not(:disabled) { transform:scale(.97); }
  .us-analyze-btn:disabled {
    opacity:.42; cursor:not-allowed; box-shadow:none;
  }

  /* ── PROGRESS SECTION ── */
  .us-progress {
    margin-top:24px;
    animation:us-fadeUp .4s ease both;
  }
  .us-progress-steps {
    display:flex; flex-direction:column; gap:10px;
    margin-bottom:16px;
  }
  .us-step {
    display:flex; align-items:center; gap:12px;
    animation:us-step-in .35s ease both;
  }
  .us-step-dot {
    width:8px; height:8px; border-radius:50%;
    flex-shrink:0; transition:background .3s, box-shadow .3s;
  }
  .us-step-dot.pending { background:var(--sand); }
  .us-step-dot.active  {
    background:var(--rust);
    box-shadow:0 0 0 4px rgba(196,98,45,.2);
    animation:us-pulse-ring 1.5s ease-out infinite;
  }
  .us-step-dot.done    { background:var(--rust); }
  .us-step-label {
    font-size:.8rem; transition:color .3s;
  }
  .us-step-label.pending { color:var(--sand); }
  .us-step-label.active  { color:var(--ink); font-weight:500; }
  .us-step-label.done    { color:var(--mist); }
  .us-step-check {
    margin-left:auto; color:var(--rust); font-size:.8rem;
    opacity:0; transform:scale(0);
    transition:opacity .25s, transform .25s cubic-bezier(.34,1.56,.64,1);
  }
  .us-step-check.show { opacity:1; transform:scale(1); }

  /* Progress bar */
  .us-progress-bar-track {
    height:5px; background:rgba(196,98,45,.1);
    border-radius:99px; overflow:hidden; position:relative;
  }
  .us-progress-bar-fill {
    height:100%; border-radius:99px;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    transition:width .6s cubic-bezier(.65,0,.35,1);
    position:relative; overflow:hidden;
  }
  .us-progress-bar-sheen {
    position:absolute; top:0; bottom:0;
    width:60%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
    animation:us-bar-shimmer 1.2s ease-in-out infinite;
  }
  .us-progress-pct {
    font-family:'Syne',sans-serif; font-weight:700;
    font-size:.72rem; color:var(--rust);
    text-align:right; margin-top:6px; letter-spacing:.02em;
  }

  /* ── SUCCESS STATE ── */
  .us-success {
    display:flex; flex-direction:column; align-items:center; gap:14px;
    padding:12px 0 4px;
    animation:us-success-pop .5s cubic-bezier(.34,1.56,.64,1) both;
  }
  .us-success-ring {
    width:60px; height:60px; border-radius:50%;
    background:rgba(196,98,45,.08);
    border:2px solid rgba(196,98,45,.25);
    display:flex; align-items:center; justify-content:center;
  }
  .us-check-svg {
    width:28px; height:28px;
  }
  .us-check-path {
    stroke: var(--rust); stroke-width:2.5;
    stroke-dasharray:28; stroke-dashoffset:28;
    fill:none; stroke-linecap:round; stroke-linejoin:round;
    animation:us-check-draw .4s .15s ease both;
  }
  .us-success-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:1rem; color:var(--ink);
  }
  .us-success-sub { font-size:.78rem; color:var(--mist); }

  /* Shimmer text */
  .us-shimmer-text {
    font-family:'Syne',sans-serif; font-weight:700;
    font-size:.68rem; letter-spacing:.08em; text-transform:uppercase;
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:us-shimmer 2.5s linear infinite;
  }

  /* ── ERROR ── */
  .us-error {
    margin-top:14px;
    background:rgba(220,38,38,.06);
    border:1px solid rgba(220,38,38,.2);
    border-radius:12px;
    padding:11px 16px;
    font-size:.78rem; color:#b91c1c;
    display:flex; align-items:center; gap:8px;
    animation:us-error-shake .4s ease both;
  }

  /* ── DECORATIVE FLOATING MINI CARDS ── */
  .us-deco {
    position:absolute; pointer-events:none;
    background:rgba(255,255,255,.75);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,.9);
    border-radius:12px;
    padding:8px 12px;
    box-shadow:0 4px 16px rgba(44,36,32,.08);
    font-size:.7rem;
  }
  .us-deco-a {
    top:16px; left:16px;
    animation:us-float 5s ease-in-out infinite;
    animation-delay:.2s;
  }
  .us-deco-b {
    top:16px; right:16px;
    animation:us-float-b 6s ease-in-out infinite;
    animation-delay:.5s;
  }
  .us-deco-label { color:var(--sand); font-size:.62rem; letter-spacing:.05em; text-transform:uppercase; }
  .us-deco-val { font-family:'Syne',sans-serif; font-weight:700; color:var(--ink); font-size:.88rem; }
  .us-deco-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--rust); margin-right:4px; }

  /* ── WAVE (loading) ── */
  .us-wave {
    display:flex; align-items:center; gap:3px; height:18px;
    margin-left:8px;
  }
  .us-wave-bar {
    width:2px; background:rgba(255,255,255,.7); border-radius:99px;
    animation:us-waveBar .9s ease-in-out infinite;
  }
  .us-wave-bar:nth-child(1){ height:8px;  animation-delay:0s; }
  .us-wave-bar:nth-child(2){ height:14px; animation-delay:.12s; }
  .us-wave-bar:nth-child(3){ height:10px; animation-delay:.24s; }
  .us-wave-bar:nth-child(4){ height:6px;  animation-delay:.36s; }
`;

/* ─── helpers ─── */
function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExt(name = "") {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

/* ── steps config ── */
const STEPS = [
  { key:"upload",   label:"Uploading resume…" },
  { key:"parse",    label:"Parsing document…" },
  { key:"analyze",  label:"Running AI analysis…" },
  { key:"score",    label:"Generating score…" },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function UploadSection() {
  const { setAnalysis } = useContext(ResumeContext);
  const [file,        setFile]        = useState(null);
  const [dragging,    setDragging]    = useState(false);
  const [status,      setStatus]      = useState("idle");   // idle | loading | success | error
  const [progress,    setProgress]    = useState(0);
  const [activeStep,  setActiveStep]  = useState(-1);
  const [doneSteps,   setDoneSteps]   = useState([]);
  const [error,       setError]       = useState("");
  const fileInputRef  = useRef(null);

  /* ── file pick ── */
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setStatus("idle"); setError(""); }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setStatus("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── drag/drop ── */
  const onDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback(()  => { setDragging(false); }, []);
  const onDrop      = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setStatus("idle"); setError(""); }
  }, []);

  /* ── step helpers ── */
  const advanceStep = (idx, pct) => new Promise(res => {
    setActiveStep(idx);
    setProgress(pct);
    setTimeout(() => {
      setDoneSteps(prev => [...prev, idx]);
      res();
    }, 700);
  });

  /* ── analyze ── */
  const handleAnalyze = async () => {
    if (!file || status === "loading") return;
    setStatus("loading");
    setProgress(0);
    setActiveStep(-1);
    setDoneSteps([]);
    setError("");

    try {
      await advanceStep(0, 20);
      await uploadResume(file);

      await advanceStep(1, 45);
      await new Promise(r => setTimeout(r, 400));

      await advanceStep(2, 70);
      const res = await analyzeResume();

      await advanceStep(3, 90);
      await new Promise(r => setTimeout(r, 300));

      setProgress(100);
      await new Promise(r => setTimeout(r, 200));

      setAnalysis(res.data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status === "error";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="us-root">
        {/* ── DROP ZONE ── */}
        <div
          className={`us-dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <div className="us-dropzone-glow" />

          {/* Decorative mini cards */}
          {!file && !isLoading && (
            <>
              <div className="us-deco us-deco-a">
                <div className="us-deco-label">Match Score</div>
                <div className="us-deco-val"><span className="us-deco-dot"/>94/100</div>
              </div>
              <div className="us-deco us-deco-b">
                <div className="us-deco-label">ATS Pass</div>
                <div className="us-deco-val" style={{color:"var(--rust)"}}>✓ Ready</div>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            className="us-file-input"
            type="file"
            accept=".pdf"
            onChange={onFileChange}
          />

          {/* ── SUCCESS STATE ── */}
          {isSuccess ? (
            <div className="us-success">
              <div className="us-success-ring">
                <svg className="us-check-svg" viewBox="0 0 28 28">
                  <polyline className="us-check-path" points="5,14 11,20 23,8" />
                </svg>
              </div>
              <div className="us-shimmer-text">Analysis Complete</div>
              <div className="us-success-title">Your resume is ready!</div>
              <div className="us-success-sub">Scroll down to explore your results</div>
            </div>
          ) : (
            <>
              {/* ── ICON ── */}
              {!isLoading && (
                <div className="us-icon-wrap">
                  <div className="us-icon-pulse-ring" />
                  <div className="us-icon-pulse-ring" />
                  <div className="us-icon-orbit" />
                  <div className="us-icon-orbit-inner" />
                  <div className="us-icon-circle">
                    {file ? "📄" : "⬆"}
                  </div>
                </div>
              )}

              {/* ── COPY ── */}
              {!file && !isLoading && (
                <>
                  <div className="us-headline">Drop your resume here</div>
                  <div className="us-sub">
                    Drag & drop or <strong>browse files</strong> to begin your AI analysis
                  </div>
                  <div className="us-formats">
                    {["PDF"].map(f => (
                      <span key={f} className="us-format-chip">{f}</span>
                    ))}
                  </div>
                  <button
                    className="us-browse-btn"
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    <span>Browse files</span>
                    <span>→</span>
                  </button>
                </>
              )}

              {/* ── FILE SELECTED STATE ── */}
              {file && !isLoading && (
                <>
                  <div className="us-file-pill" onClick={e => e.stopPropagation()}>
                    <div className="us-file-icon">{fileExt(file.name)}</div>
                    <div className="us-file-info">
                      <div className="us-file-name">{file.name}</div>
                      <div className="us-file-size">{fmtSize(file.size)}</div>
                    </div>
                    <button className="us-file-remove" onClick={removeFile}>✕</button>
                  </div>

                  <button
                    className="us-analyze-btn"
                    onClick={e => { e.stopPropagation(); handleAnalyze(); }}
                    disabled={isLoading}
                  >
                    <span>Analyze Resume</span>
                  </button>
                </>
              )}

              {/* ── LOADING STATE ── */}
              {isLoading && (
                <div className="us-progress" onClick={e => e.stopPropagation()}>
                  <div className="us-shimmer-text" style={{marginBottom:16}}>
                    Analyzing your resume…
                  </div>

                  {/* Step list */}
                  <div className="us-progress-steps">
                    {STEPS.map((step, i) => {
                      const isDone   = doneSteps.includes(i);
                      const isActive = activeStep === i && !isDone;
                      const state    = isDone ? "done" : isActive ? "active" : "pending";

                      return (
                        <div key={step.key} className="us-step" style={{animationDelay:`${i*.06}s`}}>
                          <div className={`us-step-dot ${state}`} />
                          <span className={`us-step-label ${state}`}>{step.label}</span>
                          <span className={`us-step-check ${isDone ? "show" : ""}`}>✓</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="us-progress-bar-track">
                    <div className="us-progress-bar-fill" style={{width:`${progress}%`}}>
                      <div className="us-progress-bar-sheen" />
                    </div>
                  </div>
                  <div className="us-progress-pct">{progress}%</div>
                </div>
              )}
            </>
          )}

          {/* ── ERROR ── */}
          {isError && (
            <div className="us-error" onClick={e => e.stopPropagation()}>
              <span>⚠</span> {error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}