import { useState, useMemo } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --cream:       #F5F0E8;
    --sand:        #D4C5A9;
    --rust:        #C4622D;
    --ember:       #E8855A;
    --ink:         #1A1210;
    --mist:        #8A7B6E;
    --card-bg:     rgba(255,255,255,0.72);
    --card-border: rgba(212,197,169,0.55);
  }

  @keyframes st-fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes st-chip-pop {
    0%   { opacity:0; transform:scale(.7) translateY(8px); }
    65%  { transform:scale(1.06) translateY(-2px); }
    100% { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes st-shimmer {
    0%  { background-position:-200% center; }
    100%{ background-position: 200% center; }
  }
  @keyframes st-spin     { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
  @keyframes st-spin-rev { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes st-bar-fill { from{width:0;} }
  @keyframes st-pulse    {
    0%,100%{ box-shadow:0 0 0 0   rgba(196,98,45,.35); }
    50%    { box-shadow:0 0 0 7px rgba(196,98,45,0); }
  }
  @keyframes st-filter-slide {
    from{ opacity:0; transform:translateX(-8px); }
    to  { opacity:1; transform:translateX(0); }
  }
  @keyframes st-count-pop {
    0%  { transform:scale(0) rotate(-12deg); opacity:0; }
    65% { transform:scale(1.15) rotate(2deg); opacity:1; }
    100%{ transform:scale(1) rotate(0); opacity:1; }
  }

  /* ── WRAPPER ── */
  .st-wrap {
    width:100%;
    font-family:'DM Sans',sans-serif;
    color:var(--ink);
    animation:st-fadeUp .55s ease both;
  }

  /* ── HEADER ── */
  .st-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:18px; gap:12px;
  }
  .st-header-left { display:flex; flex-direction:column; gap:3px; }
  .st-eyebrow {
    font-size:.62rem; font-weight:500;
    letter-spacing:.1em; text-transform:uppercase;
    color:var(--mist);
    display:flex; align-items:center; gap:7px;
  }
  .st-eyebrow::before {
    content:''; width:14px; height:2px;
    background:var(--rust); border-radius:99px;
  }
  .st-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:.95rem;
    color:var(--ink); letter-spacing:-.01em;
  }

  /* count badge */
  .st-count-badge {
    display:flex; align-items:center; gap:6px;
    background:var(--card-bg);
    border:1px solid var(--card-border);
    border-radius:12px; padding:6px 12px;
    backdrop-filter:blur(10px);
    animation:st-count-pop .4s .2s cubic-bezier(.34,1.56,.64,1) both;
  }
  .st-count-num {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:.95rem;
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:st-shimmer 2.5s linear infinite;
  }
  .st-count-label { font-size:.68rem; color:var(--mist); }

  /* ── FILTER TABS ── */
  .st-filters {
    display:flex; gap:6px; flex-wrap:wrap;
    margin-bottom:18px;
  }
  .st-filter-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:6px 14px; border-radius:99px;
    border:1px solid var(--card-border);
    background:var(--card-bg);
    backdrop-filter:blur(10px);
    font-family:'DM Sans',sans-serif;
    font-size:.72rem; font-weight:400;
    color:var(--mist); cursor:pointer;
    transition:background .18s, border-color .18s, color .18s,
               transform .2s cubic-bezier(.34,1.56,.64,1);
    animation:st-filter-slide .35s ease both;
    white-space:nowrap;
  }
  .st-filter-btn:hover {
    background:rgba(196,98,45,.07);
    border-color:rgba(196,98,45,.25);
    color:var(--ink);
    transform:translateY(-1px);
  }
  .st-filter-btn.active {
    background:rgba(196,98,45,.12);
    border-color:rgba(196,98,45,.3);
    color:var(--rust); font-weight:500;
    box-shadow:0 2px 8px rgba(196,98,45,.15);
  }
  .st-filter-dot {
    width:6px; height:6px; border-radius:50%; flex-shrink:0;
  }
  .st-filter-count {
    background:rgba(196,98,45,.12); color:var(--rust);
    border-radius:99px; padding:1px 6px;
    font-size:.62rem; font-weight:600;
  }
  .st-filter-btn.active .st-filter-count {
    background:rgba(196,98,45,.2);
  }

  /* ── CHIP CLOUD ── */
  .st-cloud {
    display:flex; flex-wrap:wrap; gap:9px;
    margin-bottom:24px;
  }

  /* ── SKILL CHIP ── */
  .st-chip {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 15px; border-radius:99px;
    font-size:.78rem; font-weight:400;
    cursor:default;
    transition:
      transform .22s cubic-bezier(.34,1.56,.64,1),
      box-shadow .22s ease,
      background .2s,
      border-color .2s;
    animation:st-chip-pop .4s cubic-bezier(.34,1.56,.64,1) both;
    position:relative; overflow:hidden;
    border:1px solid transparent;
    letter-spacing:.01em;
  }
  .st-chip::before {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.25) 0%,transparent 60%);
    border-radius:inherit; pointer-events:none;
  }
  .st-chip:hover {
    transform:translateY(-4px) scale(1.06);
    z-index:2;
  }

  /* chip indicator dot */
  .st-chip-dot {
    width:5px; height:5px; border-radius:50%; flex-shrink:0;
    transition:transform .2s;
  }
  .st-chip:hover .st-chip-dot { transform:scale(1.5); }

  /* ── CATEGORY COLOR VARIANTS ── */
  /* frontend */
  .st-chip-fe {
    background:rgba(59,130,246,.1);
    border-color:rgba(59,130,246,.2);
    color:#1d4ed8;
    box-shadow:0 2px 8px rgba(59,130,246,.08);
  }
  .st-chip-fe:hover { box-shadow:0 8px 20px rgba(59,130,246,.18); background:rgba(59,130,246,.15); }
  .st-chip-fe .st-chip-dot { background:#3b82f6; }

  /* backend */
  .st-chip-be {
    background:rgba(196,98,45,.09);
    border-color:rgba(196,98,45,.22);
    color:var(--rust);
    box-shadow:0 2px 8px rgba(196,98,45,.06);
  }
  .st-chip-be:hover { box-shadow:0 8px 20px rgba(196,98,45,.18); background:rgba(196,98,45,.15); }
  .st-chip-be .st-chip-dot { background:var(--rust); }

  /* data */
  .st-chip-db {
    background:rgba(139,92,246,.09);
    border-color:rgba(139,92,246,.2);
    color:#6d28d9;
    box-shadow:0 2px 8px rgba(139,92,246,.06);
  }
  .st-chip-db:hover { box-shadow:0 8px 20px rgba(139,92,246,.16); background:rgba(139,92,246,.13); }
  .st-chip-db .st-chip-dot { background:#8b5cf6; }

  /* devops / cloud */
  .st-chip-do {
    background:rgba(20,184,166,.09);
    border-color:rgba(20,184,166,.2);
    color:#0f766e;
    box-shadow:0 2px 8px rgba(20,184,166,.06);
  }
  .st-chip-do:hover { box-shadow:0 8px 20px rgba(20,184,166,.16); background:rgba(20,184,166,.13); }
  .st-chip-do .st-chip-dot { background:#14b8a6; }

  /* tools / other */
  .st-chip-to {
    background:rgba(212,197,169,.25);
    border-color:rgba(212,197,169,.5);
    color:var(--mist);
    box-shadow:0 2px 8px rgba(44,36,32,.04);
  }
  .st-chip-to:hover { box-shadow:0 8px 20px rgba(44,36,32,.1); background:rgba(212,197,169,.38); }
  .st-chip-to .st-chip-dot { background:var(--sand); }

  /* ── SUMMARY BAR GRID ── */
  .st-summary {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(130px,1fr));
    gap:10px;
    padding-top:18px;
    border-top:1px solid rgba(212,197,169,.3);
  }
  .st-summary-item {
    display:flex; flex-direction:column; gap:5px;
    animation:st-fadeUp .4s ease both;
  }
  .st-summary-header {
    display:flex; align-items:center; justify-content:space-between;
  }
  .st-summary-label {
    font-size:.65rem; color:var(--mist);
    letter-spacing:.04em; text-transform:uppercase;
  }
  .st-summary-val {
    font-family:'Syne',sans-serif; font-weight:700;
    font-size:.72rem; color:var(--rust);
  }
  .st-summary-track {
    height:3px; background:rgba(196,98,45,.09);
    border-radius:99px; overflow:hidden;
  }
  .st-summary-fill {
    height:100%; border-radius:99px;
    animation:st-bar-fill .7s cubic-bezier(.65,0,.35,1) both;
  }

  /* ── EMPTY STATE ── */
  .st-empty {
    display:flex; flex-direction:column; align-items:center;
    gap:10px; padding:36px 20px; text-align:center;
  }
  .st-empty-orbit {
    position:relative; width:56px; height:56px;
  }
  .st-empty-ring {
    position:absolute; inset:0;
    border:1.5px dashed rgba(196,98,45,.2);
    border-radius:50%;
    animation:st-spin 16s linear infinite;
  }
  .st-empty-ring::after {
    content:''; position:absolute;
    top:3px; left:50%; margin-left:-3px;
    width:5px; height:5px;
    background:var(--ember); border-radius:50%;
  }
  .st-empty-ring-inner {
    position:absolute; inset:10px;
    border:1px dashed rgba(196,98,45,.1);
    border-radius:50%;
    animation:st-spin-rev 10s linear infinite;
  }
  .st-empty-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.3rem; }
  .st-empty-label { font-size:.82rem; color:var(--mist); }
`;

/* ─────────────────────────────────────────────
   CATEGORY LOGIC
───────────────────────────────────────────── */
const CATEGORIES = [
  {
    key:   "frontend",
    label: "Frontend",
    cls:   "st-chip-fe",
    color: "#3b82f6",
    keywords: ["react","vue","angular","svelte","next","nuxt","html","css","scss","sass","tailwind","redux","typescript","javascript","js","ts","jsx","tsx","webpack","vite","graphql","apollo"],
  },
  {
    key:   "backend",
    label: "Backend",
    cls:   "st-chip-be",
    color: "#C4622D",
    keywords: ["node","express","django","flask","fastapi","spring","rails","laravel","rust","go","golang","python","java","php","ruby","c#","dotnet",".net","api","rest","grpc"],
  },
  {
    key:   "data",
    label: "Data & DB",
    cls:   "st-chip-db",
    color: "#8b5cf6",
    keywords: ["sql","mysql","postgres","postgresql","mongodb","redis","elasticsearch","firebase","supabase","prisma","sequelize","pandas","numpy","tensorflow","pytorch","ml","ai","data","analytics","bigquery","spark","kafka"],
  },
  {
    key:   "devops",
    label: "DevOps",
    cls:   "st-chip-do",
    color: "#14b8a6",
    keywords: ["docker","kubernetes","k8s","aws","gcp","azure","ci","cd","jenkins","github actions","terraform","ansible","nginx","linux","bash","shell","git","vercel","netlify","heroku","cloud"],
  },
];

function categorize(skill) {
  const s = skill.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => s.includes(kw))) return cat;
  }
  return { key:"tools", label:"Tools", cls:"st-chip-to", color:"#D4C5A9" };
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function SkillTags({ skills }) {
  const [activeFilter, setActiveFilter] = useState("all");

  /* categorize every skill */
  const categorized = useMemo(() => {
    if (!skills) return [];
    return skills.map(skill => ({ skill, cat: categorize(skill) }));
  }, [skills]);

  /* build filter counts */
  const filterOptions = useMemo(() => {
    const counts = { all: categorized.length };
    for (const { cat } of categorized) {
      counts[cat.key] = (counts[cat.key] ?? 0) + 1;
    }
    const allCats = [
      { key:"all", label:"All Skills", color:"var(--rust)" },
      ...CATEGORIES,
      { key:"tools", label:"Tools", color:"#D4C5A9" },
    ];
    return allCats.filter(c => counts[c.key] > 0).map(c => ({ ...c, count: counts[c.key] ?? 0 }));
  }, [categorized]);

  /* filtered list */
  const visible = useMemo(() => {
    if (activeFilter === "all") return categorized;
    return categorized.filter(({ cat }) => cat.key === activeFilter);
  }, [categorized, activeFilter]);

  /* summary bars per category */
  const summaryItems = useMemo(() => {
    return filterOptions.filter(f => f.key !== "all").map(f => ({
      ...f,
      pct: Math.round((f.count / skills.length) * 100),
    }));
  }, [filterOptions, skills]);

  if (!skills || skills.length === 0) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="st-empty">
          <div className="st-empty-orbit">
            <div className="st-empty-ring" />
            <div className="st-empty-ring-inner" />
            <div className="st-empty-icon">◎</div>
          </div>
          <div className="st-empty-label">No skills detected yet</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="st-wrap">

        {/* ── HEADER ── */}
        <div className="st-header">
          <div className="st-header-left">
            <div className="st-eyebrow">Resume Analysis</div>
            <div className="st-title">Detected Skills</div>
          </div>
          <div className="st-count-badge">
            <span className="st-count-num">{skills.length}</span>
            <span className="st-count-label">skills found</span>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="st-filters">
          {filterOptions.map((f, i) => (
            <button
              key={f.key}
              className={`st-filter-btn ${activeFilter === f.key ? "active" : ""}`}
              style={{ animationDelay:`${.05*i}s` }}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.key !== "all" && (
                <span className="st-filter-dot" style={{ background: f.color }} />
              )}
              {f.label}
              <span className="st-filter-count">{f.count}</span>
            </button>
          ))}
        </div>

        {/* ── CHIP CLOUD ── */}
        <div className="st-cloud">
          {visible.map(({ skill, cat }, i) => (
            <span
              key={`${skill}-${i}`}
              className={`st-chip ${cat.cls}`}
              style={{ animationDelay:`${.03*i}s` }}
              title={`${cat.label} skill`}
            >
              <span className="st-chip-dot" />
              {skill}
            </span>
          ))}
        </div>

        {/* ── SUMMARY BARS ── */}
        {activeFilter === "all" && summaryItems.length > 1 && (
          <div className="st-summary">
            {summaryItems.map((item, i) => (
              <div
                key={item.key}
                className="st-summary-item"
                style={{ animationDelay:`${.06*i}s` }}
              >
                <div className="st-summary-header">
                  <span className="st-summary-label">{item.label}</span>
                  <span className="st-summary-val">{item.count}</span>
                </div>
                <div className="st-summary-track">
                  <div
                    className="st-summary-fill"
                    style={{
                      width:`${item.pct}%`,
                      background:`linear-gradient(90deg,${item.color},${item.color}99)`,
                      animationDelay:`${.1 * i}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}