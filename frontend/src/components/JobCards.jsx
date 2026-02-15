import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --cream:       #F5F0E8;
    --warm:        #EDE5D4;
    --sand:        #D4C5A9;
    --rust:        #C4622D;
    --ember:       #E8855A;
    --ink:         #1A1210;
    --mist:        #8A7B6E;
    --card-bg:     rgba(255,255,255,0.72);
    --card-border: rgba(212,197,169,0.55);
  }

  @keyframes jc-fadeUp {
    from { opacity:0; transform:translateY(22px) scale(.97); }
    to   { opacity:1; transform:translateY(0)    scale(1); }
  }
  @keyframes jc-shimmer {
    0%  { background-position:-200% center; }
    100%{ background-position: 200% center; }
  }
  @keyframes jc-bar-fill { from { width:0; } }
  @keyframes jc-spin      { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
  @keyframes jc-spin-rev  { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
  @keyframes jc-pulse-ring {
    0%   { transform:scale(1);   opacity:.65; }
    100% { transform:scale(1.8); opacity:0; }
  }
  @keyframes jc-tag-pop {
    0%  { opacity:0; transform:scale(.7); }
    70% { transform:scale(1.08); }
    100%{ opacity:1; transform:scale(1); }
  }
  @keyframes jc-rank-drop {
    0%  { opacity:0; transform:translateY(-12px) scale(.8); }
    65% { transform:translateY(3px) scale(1.05); }
    100%{ opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes jc-dot-blink {
    0%,100%{ opacity:.3; } 50%{ opacity:1; }
  }
  @keyframes jc-slide-right {
    from{ opacity:0; transform:translateX(-10px); }
    to  { opacity:1; transform:translateX(0); }
  }
  @keyframes jc-bar-sheen {
    0%  { left:-60%; }
    100%{ left:130%; }
  }

  /* ── WRAPPER ── */
  .jc-wrap {
    width:100%;
    font-family:'DM Sans',sans-serif;
    color:var(--ink);
  }

  /* ── HEADER ── */
  .jc-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:20px; gap:12px;
  }
  .jc-header-left { display:flex; flex-direction:column; gap:3px; }
  .jc-eyebrow {
    font-size:.62rem; font-weight:500;
    letter-spacing:.1em; text-transform:uppercase;
    color:var(--mist);
    display:flex; align-items:center; gap:7px;
  }
  .jc-eyebrow::before {
    content:''; width:14px; height:2px;
    background:var(--rust); border-radius:99px;
  }
  .jc-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:.95rem;
    color:var(--ink); letter-spacing:-.01em;
  }

  /* sort controls */
  .jc-sort {
    display:flex; gap:5px;
  }
  .jc-sort-btn {
    padding:5px 12px; border-radius:99px;
    border:1px solid var(--card-border);
    background:var(--card-bg); backdrop-filter:blur(10px);
    font-family:'DM Sans',sans-serif;
    font-size:.68rem; font-weight:400; color:var(--mist);
    cursor:pointer;
    transition:background .18s, border-color .18s, color .18s,
               transform .2s cubic-bezier(.34,1.56,.64,1);
    white-space:nowrap;
  }
  .jc-sort-btn:hover { background:rgba(196,98,45,.07); color:var(--ink); transform:translateY(-1px); }
  .jc-sort-btn.active {
    background:rgba(196,98,45,.12);
    border-color:rgba(196,98,45,.3);
    color:var(--rust); font-weight:500;
  }

  /* ── CARD LIST ── */
  .jc-list {
    display:flex; flex-direction:column; gap:14px;
  }

  /* ── CARD ── */
  .jc-card {
    position:relative; overflow:hidden;
    background:var(--card-bg);
    backdrop-filter:blur(18px);
    border:1px solid var(--card-border);
    border-radius:20px;
    padding:20px 22px;
    box-shadow:0 4px 20px rgba(44,36,32,.07), 0 1px 4px rgba(196,98,45,.04);
    cursor:pointer;
    transition:
      transform .28s cubic-bezier(.34,1.56,.64,1),
      box-shadow .28s ease,
      border-color .25s;
    animation:jc-fadeUp .5s cubic-bezier(.25,.46,.45,.94) both;
  }
  .jc-card:hover {
    transform:translateY(-5px) scale(1.01);
    box-shadow:0 14px 40px rgba(44,36,32,.11), 0 3px 10px rgba(196,98,45,.1);
    border-color:rgba(196,98,45,.28);
  }
  .jc-card.top-match {
    border-color:rgba(196,98,45,.3);
    box-shadow:0 4px 20px rgba(196,98,45,.1), 0 1px 4px rgba(196,98,45,.06);
  }
  .jc-card.top-match:hover {
    box-shadow:0 14px 44px rgba(196,98,45,.18), 0 3px 10px rgba(196,98,45,.12);
  }

  /* glass shine */
  .jc-card::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
    pointer-events:none;
  }

  /* top-match accent bar */
  .jc-card-accent {
    position:absolute; top:0; left:0;
    width:3px; height:100%;
    background:linear-gradient(180deg,var(--rust),var(--ember));
    border-radius:3px 0 0 3px;
  }

  /* ── CARD INNER ── */
  .jc-card-top {
    display:flex; align-items:flex-start;
    gap:14px; margin-bottom:14px;
  }

  /* rank number */
  .jc-rank-wrap {
    flex-shrink:0; position:relative;
    width:40px; height:40px;
    display:flex; align-items:center; justify-content:center;
    animation:jc-rank-drop .45s cubic-bezier(.34,1.56,.64,1) both;
  }
  .jc-rank-ring {
    position:absolute; inset:0;
    border-radius:50%;
    border:1.5px dashed rgba(196,98,45,.22);
    animation:jc-spin 20s linear infinite;
  }
  .jc-rank-ring-inner {
    position:absolute; inset:5px;
    border-radius:50%;
    border:1px dashed rgba(196,98,45,.1);
    animation:jc-spin-rev 13s linear infinite;
  }
  .jc-rank-num {
    position:relative; z-index:1;
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:1rem; color:var(--mist);
    line-height:1;
  }
  .jc-rank-num.rank-1 {
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    font-size:1.1rem;
    animation:jc-shimmer 2.5s linear infinite;
    background-size:200% auto;
  }
  /* pulse ring for #1 */
  .jc-pulse {
    position:absolute; inset:-2px;
    border-radius:50%;
    border:2px solid rgba(196,98,45,.3);
    animation:jc-pulse-ring 2.2s ease-out infinite;
    pointer-events:none;
  }
  .jc-pulse:nth-child(2){ animation-delay:1.1s; }

  /* job info */
  .jc-info { flex:1; min-width:0; }
  .jc-job-title {
    font-family:'Syne',sans-serif; font-weight:700;
    font-size:.95rem; color:var(--ink);
    letter-spacing:-.01em; margin-bottom:4px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .jc-meta {
    display:flex; align-items:center; gap:8px;
    flex-wrap:wrap;
  }
  .jc-company {
    font-size:.75rem; color:var(--mist); font-weight:400;
  }
  .jc-meta-sep {
    width:3px; height:3px; border-radius:50%; background:var(--sand); flex-shrink:0;
  }
  .jc-location {
    font-size:.73rem; color:var(--sand);
    display:flex; align-items:center; gap:4px;
  }

  /* fit score */
  .jc-score-wrap {
    flex-shrink:0; text-align:right;
  }
  .jc-score-num {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:1.5rem; line-height:1; letter-spacing:-.03em;
    display:flex; align-items:baseline; gap:2px;
  }
  .jc-score-pct { font-size:.75rem; color:var(--sand); font-weight:400; }
  .jc-score-label {
    font-size:.62rem; color:var(--mist);
    letter-spacing:.04em; text-transform:uppercase; margin-top:2px;
  }

  /* ── PROGRESS BAR ── */
  .jc-bar-track {
    height:5px; background:rgba(196,98,45,.09);
    border-radius:99px; overflow:hidden;
    margin-bottom:14px; position:relative;
  }
  .jc-bar-fill {
    height:100%; border-radius:99px;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    animation:jc-bar-fill .8s cubic-bezier(.65,0,.35,1) both;
    position:relative; overflow:hidden;
  }
  .jc-bar-sheen {
    position:absolute; top:0; bottom:0;
    width:50%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
    animation:jc-bar-sheen 1.4s ease-in-out infinite;
  }

  /* ── TAGS ROW ── */
  .jc-tags {
    display:flex; flex-wrap:wrap; gap:6px;
    margin-bottom:12px;
  }
  .jc-tag {
    padding:4px 10px; border-radius:99px;
    font-size:.68rem; font-weight:400;
    letter-spacing:.03em;
    animation:jc-tag-pop .35s cubic-bezier(.34,1.56,.64,1) both;
    transition:transform .18s cubic-bezier(.34,1.56,.64,1);
  }
  .jc-tag:hover { transform:scale(1.08) translateY(-2px); }
  .jc-tag-skill { background:rgba(196,98,45,.09); border:1px solid rgba(196,98,45,.2); color:var(--rust); }
  .jc-tag-type  { background:rgba(212,197,169,.25); border:1px solid rgba(212,197,169,.5); color:var(--mist); }
  .jc-tag-hot   {
    background:linear-gradient(135deg,rgba(196,98,45,.12),rgba(232,133,90,.12));
    border:1px solid rgba(196,98,45,.25); color:var(--rust);
    display:flex; align-items:center; gap:5px;
  }
  .jc-hot-dot {
    width:5px; height:5px; border-radius:50%; background:var(--rust);
    animation:jc-dot-blink 1.4s ease-in-out infinite;
  }

  /* ── FOOTER ── */
  .jc-card-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:12px;
    border-top:1px solid rgba(212,197,169,.22);
  }
  .jc-footer-hint {
    font-size:.68rem; color:var(--sand);
    display:flex; align-items:center; gap:5px;
  }
  .jc-apply-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:99px;
    background:rgba(196,98,45,.09);
    border:1px solid rgba(196,98,45,.22);
    font-family:'DM Sans',sans-serif;
    font-size:.73rem; font-weight:500;
    color:var(--rust); cursor:pointer;
    transition:background .18s, transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .18s;
    white-space:nowrap;
  }
  .jc-apply-btn:hover {
    background:rgba(196,98,45,.15);
    transform:translateX(3px);
    box-shadow:0 3px 12px rgba(196,98,45,.2);
  }
  .jc-apply-arrow { transition:transform .18s; display:inline-block; }
  .jc-apply-btn:hover .jc-apply-arrow { transform:translateX(3px); }

  /* ── SHOW MORE ── */
  .jc-show-more {
    display:flex; align-items:center; justify-content:center;
    margin-top:14px;
  }
  .jc-show-more-btn {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 22px; border-radius:99px;
    background:var(--card-bg); backdrop-filter:blur(10px);
    border:1px solid var(--card-border);
    font-family:'DM Sans',sans-serif;
    font-size:.78rem; color:var(--mist); cursor:pointer;
    transition:background .2s, color .2s, border-color .2s,
               transform .2s cubic-bezier(.34,1.56,.64,1);
  }
  .jc-show-more-btn:hover {
    background:rgba(196,98,45,.08);
    border-color:rgba(196,98,45,.25); color:var(--rust);
    transform:translateY(-2px);
  }

  /* ── EMPTY ── */
  .jc-empty {
    display:flex; flex-direction:column; align-items:center;
    gap:10px; padding:40px 20px; text-align:center;
  }
  .jc-empty-orbit {
    position:relative; width:60px; height:60px;
  }
  .jc-empty-ring {
    position:absolute; inset:0;
    border:1.5px dashed rgba(196,98,45,.2);
    border-radius:50%;
    animation:jc-spin 16s linear infinite;
  }
  .jc-empty-ring::after {
    content:''; position:absolute;
    top:4px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background:var(--ember); border-radius:50%;
  }
  .jc-empty-ring-inner {
    position:absolute; inset:11px;
    border:1px dashed rgba(196,98,45,.1);
    border-radius:50%;
    animation:jc-spin-rev 10s linear infinite;
  }
  .jc-empty-icon {
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    font-size:1.4rem;
  }
  .jc-empty-label { font-size:.82rem; color:var(--mist); }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const SAMPLE_SKILLS = ["React","Python","SQL","Node.js","TypeScript","AWS","Docker","GraphQL","Figma","CI/CD"];
const LOCATIONS     = ["Remote","New York","San Francisco","London","Berlin","Austin","Singapore"];
const JOB_TYPES     = ["Full-time","Contract","Hybrid","Remote-first"];

/* Derive deterministic extras from job index so cards look rich */
function enrich(job, i) {
  const score    = job.fit_score ?? job.match ?? 0;
  const isHot    = score >= 88;
  const skills   = SAMPLE_SKILLS.slice(i % 4, (i % 4) + 3);
  const location = LOCATIONS[i % LOCATIONS.length];
  const type     = JOB_TYPES[i % JOB_TYPES.length];
  const company  = job.company ?? ["Stripe","Vercel","Linear","Notion","Figma","GitHub"][i % 6];
  return { ...job, score, isHot, skills, location, type, company };
}

function scoreColor(s) {
  if (s >= 88) return "var(--rust)";
  if (s >= 72) return "var(--ember)";
  return "var(--mist)";
}

function scoreWord(s) {
  if (s >= 90) return "Excellent fit";
  if (s >= 80) return "Strong fit";
  if (s >= 70) return "Good fit";
  return "Potential fit";
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function JobCards({ jobs }) {
  const [showAll,   setShowAll]   = useState(false);
  const [sortBy,    setSortBy]    = useState("score"); // score | alpha

  const enriched = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return jobs.map(enrich);
  }, [jobs]);

  const sorted = useMemo(() => {
    const list = [...enriched];
    if (sortBy === "alpha") list.sort((a,b) => (a.job_title ?? "").localeCompare(b.job_title ?? ""));
    else list.sort((a,b) => b.score - a.score);
    return list;
  }, [enriched, sortBy]);

  const visible = showAll ? sorted : sorted.slice(0, 5);

  if (!jobs || jobs.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="jc-empty">
          <div className="jc-empty-orbit">
            <div className="jc-empty-ring" />
            <div className="jc-empty-ring-inner" />
            <div className="jc-empty-icon">◎</div>
          </div>
          <div className="jc-empty-label">No job matches yet</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="jc-wrap">

        {/* ── HEADER ── */}
        <div className="jc-header">
          <div className="jc-header-left">
            <div className="jc-eyebrow">AI Matched</div>
            <div className="jc-title">Top Job Matches</div>
          </div>
          <div className="jc-sort">
            <button className={`jc-sort-btn ${sortBy==="score" ? "active":""}`} onClick={()=>setSortBy("score")}>
              ↓ Score
            </button>
            <button className={`jc-sort-btn ${sortBy==="alpha" ? "active":""}`} onClick={()=>setSortBy("alpha")}>
              A–Z
            </button>
          </div>
        </div>

        {/* ── CARDS ── */}
        <div className="jc-list">
          {visible.map((job, i) => {
            const rank    = i + 1;
            const isFirst = rank === 1;
            const delay   = `${.08 * i}s`;

            return (
              <div
                key={i}
                className={`jc-card ${isFirst ? "top-match" : ""}`}
                style={{ animationDelay: delay }}
              >
                {/* accent bar for #1 */}
                {isFirst && <div className="jc-card-accent" />}

                {/* ── TOP ROW ── */}
                <div className="jc-card-top">
                  {/* Rank */}
                  <div className="jc-rank-wrap" style={{ animationDelay: delay }}>
                    {isFirst && <><div className="jc-pulse" /><div className="jc-pulse" /></>}
                    <div className="jc-rank-ring" />
                    <div className="jc-rank-ring-inner" />
                    <span className={`jc-rank-num ${isFirst ? "rank-1" : ""}`}>{rank}</span>
                  </div>

                  {/* Info */}
                  <div className="jc-info">
                    <div className="jc-job-title">{job.job_title ?? job.title ?? "—"}</div>
                    
                  </div>

                  {/* Score */}
                  <div className="jc-score-wrap">
                    <div className="jc-score-num" style={{ color: scoreColor(job.score) }}>
                      {job.score}
                      <span className="jc-score-pct">%</span>
                    </div>
                    <div className="jc-score-label">Fit Score</div>
                  </div>
                </div>

                {/* ── PROGRESS BAR ── */}
                <div className="jc-bar-track">
                  <div
                    className="jc-bar-fill"
                    style={{
                      width:`${job.score}%`,
                      animationDelay:`${.1 + .08 * i}s`,
                    }}
                  >
                    <div className="jc-bar-sheen" />
                  </div>
                </div>

                {/* ── TAGS ── */}
                <div className="jc-tags">
                  {job.isHot && (
                    <span className="jc-tag jc-tag-hot" style={{ animationDelay:`${delay}` }}>
                      <span className="jc-hot-dot" />
                      Hot match
                    </span>
                  )}
               
                  {job.skills.map((s, si) => (
                    <span
                      key={s}
                      className="jc-tag jc-tag-skill"
                      style={{ animationDelay:`${.05 * si}s` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* ── FOOTER ── */}
               
              </div>
            );
          })}
        </div>

        {/* ── SHOW MORE ── */}
        {sorted.length > 5 && (
          <div className="jc-show-more">
            <button
              className="jc-show-more-btn"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll
                ? `↑ Show less`
                : `Show ${sorted.length - 5} more matches`}
            </button>
          </div>
        )}

      </div>
    </>
  );
}