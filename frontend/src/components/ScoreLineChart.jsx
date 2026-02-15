import { useMemo, useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

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

  @keyframes slc-fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slc-shimmer  {
    0%  {background-position:-200% center;}
    100%{background-position: 200% center;}
  }
  @keyframes slc-spin     { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
  @keyframes slc-spin-rev { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes slc-bar-in   { from{transform:scaleY(0)} to{transform:scaleY(1)} }
  @keyframes slc-pulse    {
    0%,100%{box-shadow:0 0 0 0   rgba(196,98,45,.4);}
    50%    {box-shadow:0 0 0 8px rgba(196,98,45,0);}
  }
  @keyframes slc-badge-pop {
    0%  {transform:scale(0) rotate(-10deg); opacity:0;}
    65% {transform:scale(1.1) rotate(2deg); opacity:1;}
    100%{transform:scale(1) rotate(0);      opacity:1;}
  }
  @keyframes slc-tick-in {
    from{opacity:0; transform:translateY(8px);}
    to  {opacity:1; transform:translateY(0);}
  }
  @keyframes slc-tooltip-in {
    from{opacity:0; transform:translateY(6px) scale(.94);}
    to  {opacity:1; transform:translateY(0)   scale(1);}
  }
  @keyframes slc-sparkle {
    0%  {transform:scale(0) rotate(0);   opacity:0;}
    50% {transform:scale(1) rotate(180deg); opacity:1;}
    100%{transform:scale(0) rotate(360deg); opacity:0;}
  }

  /* ── WRAPPER ── */
  .slc-wrap {
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    animation: slc-fadeUp .6s ease both;
  }

  /* ── HEADER ── */
  .slc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 22px;
    gap: 12px;
  }
  .slc-header-left { display:flex; flex-direction:column; gap:4px; }
  .slc-eyebrow {
    font-size:.62rem; font-weight:500;
    letter-spacing:.1em; text-transform:uppercase;
    display: flex; align-items:center; gap:7px;
    color: var(--mist);
  }
  .slc-eyebrow::before {
    content:'';
    width:14px; height:2px;
    background:var(--rust); border-radius:99px;
  }
  .slc-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:.95rem;
    color:var(--ink); letter-spacing:-.01em;
  }

  /* score summary badges */
  .slc-badges {
    display:flex; gap:8px; align-items:center; flex-wrap:wrap;
  }
  .slc-badge {
    display:flex; align-items:center; gap:6px;
    background:var(--card-bg);
    border:1px solid var(--card-border);
    border-radius:12px;
    padding:6px 12px;
    backdrop-filter:blur(10px);
    animation:slc-badge-pop .45s cubic-bezier(.34,1.56,.64,1) both;
  }
  .slc-badge-label { font-size:.65rem; color:var(--mist); letter-spacing:.04em; }
  .slc-badge-val {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:.9rem; color:var(--rust);
  }
  .slc-badge-val.shimmer {
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:slc-shimmer 2.5s linear infinite;
  }

  /* ── CHART AREA ── */
  .slc-chart-area {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    padding: 4px 0 0;
  }

  /* decorative orbit ring */
  .slc-orbit-wrap {
    position:absolute; top:-18px; right:-18px;
    width:120px; height:120px; pointer-events:none; z-index:0;
  }
  .slc-orbit {
    position:absolute; inset:0;
    border:1.5px dashed rgba(196,98,45,.14);
    border-radius:50%;
    animation:slc-spin 20s linear infinite;
  }
  .slc-orbit::after {
    content:''; position:absolute;
    top:4px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background:var(--ember); border-radius:50%;
    box-shadow:0 0 8px var(--ember);
  }
  .slc-orbit-inner {
    position:absolute; inset:16px;
    border:1px dashed rgba(196,98,45,.08);
    border-radius:50%;
    animation:slc-spin-rev 13s linear infinite;
  }

  /* canvas container */
  .slc-canvas-wrap {
    position:relative; z-index:1;
  }

  /* ── CUSTOM TOOLTIP ── */
  .slc-tooltip {
    position:absolute;
    background:rgba(255,255,255,.9);
    backdrop-filter:blur(16px);
    border:1px solid var(--card-border);
    border-radius:12px;
    padding:10px 14px;
    pointer-events:none;
    z-index:10;
    box-shadow:0 8px 24px rgba(44,36,32,.12), 0 2px 6px rgba(196,98,45,.08);
    animation:slc-tooltip-in .2s ease both;
    min-width:120px;
  }
  .slc-tooltip::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
    border-radius:inherit;
  }
  .slc-tooltip-label {
    font-size:.65rem; color:var(--mist);
    letter-spacing:.06em; text-transform:uppercase; margin-bottom:4px;
  }
  .slc-tooltip-val {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:1.3rem; color:var(--ink); line-height:1;
  }
  .slc-tooltip-sub {
    font-size:.68rem; color:var(--mist); margin-top:4px;
  }
  .slc-tooltip-bar {
    height:3px; background:rgba(196,98,45,.1);
    border-radius:99px; overflow:hidden; margin-top:8px;
  }
  .slc-tooltip-fill {
    height:100%;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    border-radius:99px;
    transition:width .3s ease;
  }

  /* ── MINI BAR SUMMARY ── */
  .slc-mini-bars {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(90px,1fr));
    gap:10px;
    margin-top:20px;
  }
  .slc-mini-bar-item {
    display:flex; flex-direction:column; gap:5px;
    animation:slc-tick-in .4s ease both;
  }
  .slc-mini-bar-header {
    display:flex; justify-content:space-between; align-items:baseline;
  }
  .slc-mini-bar-label {
    font-size:.65rem; color:var(--mist);
    letter-spacing:.03em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    max-width:70px;
  }
  .slc-mini-bar-val {
    font-family:'Syne',sans-serif; font-weight:700;
    font-size:.72rem; color:var(--rust); flex-shrink:0;
  }
  .slc-mini-bar-track {
    height:4px; background:rgba(196,98,45,.1);
    border-radius:99px; overflow:hidden;
  }
  .slc-mini-bar-fill {
    height:100%; border-radius:99px;
    background:linear-gradient(90deg,var(--rust),var(--ember));
    transform-origin:left;
    animation:slc-bar-in .7s cubic-bezier(.65,0,.35,1) both;
  }

  /* ── TREND PILL ── */
  .slc-trend {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:99px;
    font-size:.68rem; font-weight:500;
    letter-spacing:.03em;
  }
  .slc-trend-up   { background:rgba(72,187,120,.1);  color:#2f7d55; border:1px solid rgba(72,187,120,.2); }
  .slc-trend-down { background:rgba(239,68,68,.08);  color:#b91c1c; border:1px solid rgba(239,68,68,.15); }
  .slc-trend-flat { background:rgba(212,197,169,.2); color:var(--mist); border:1px solid rgba(212,197,169,.4); }

  /* ── EMPTY STATE ── */
  .slc-empty {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px;
    padding:48px 20px; text-align:center;
    color:var(--mist); font-size:.82rem;
  }
  .slc-empty-icon {
    font-size:1.8rem; opacity:.4;
  }
`;

/* ─── helpers ─── */
function calcTrend(values) {
  if (values.length < 2) return "flat";
  const delta = values[values.length - 1] - values[0];
  if (delta >  2) return "up";
  if (delta < -2) return "down";
  return "flat";
}

function trendLabel(trend, values) {
  if (values.length < 2) return "Stable";
  const delta = Math.abs(values[values.length - 1] - values[0]);
  if (trend === "up")   return `↑ +${delta.toFixed(0)} pts`;
  if (trend === "down") return `↓ −${delta.toFixed(0)} pts`;
  return "→ Stable";
}

/* ─── gradient plugin factory ─── */
function makeGradient(ctx, chartArea) {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0,   "rgba(196,98,45,.28)");
  gradient.addColorStop(.5,  "rgba(232,133,90,.12)");
  gradient.addColorStop(1,   "rgba(196,98,45,.02)");
  return gradient;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function ScoreLineChart({ scores }) {
  const chartRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const labels = useMemo(() => scores ? Object.keys(scores)   : [], [scores]);
  const values = useMemo(() => scores ? Object.values(scores) : [], [scores]);
  const avg    = useMemo(() => values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0, [values]);
  const peak   = useMemo(() => values.length ? Math.max(...values) : 0, [values]);
  const trend  = useMemo(() => calcTrend(values), [values]);

  /* dynamic gradient fill */
  const data = useMemo(() => ({
    labels,
    datasets: [{
      label: "Score",
      data: values,
      borderColor:        "rgba(196,98,45,.85)",
      backgroundColor:    (ctx) => {
        const chart = ctx.chart;
        if (!chart.chartArea) return "transparent";
        return makeGradient(chart.ctx, chart.chartArea);
      },
      borderWidth: 2.5,
      pointRadius:          6,
      pointHoverRadius:     9,
      pointBackgroundColor: "#fff",
      pointBorderColor:     "var(--rust)",
      pointBorderWidth:     2.5,
      pointHoverBackgroundColor: "var(--rust)",
      pointHoverBorderColor:     "#fff",
      pointHoverBorderWidth:     3,
      tension: 0.42,
      fill: true,
    }],
  }), [labels, values]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode:"index", intersect:false },
    animation: {
      duration: 900,
      easing:   "easeInOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: ({ chart, tooltip: t }) => {
          if (t.opacity === 0) { setTooltip(null); return; }
          const pos  = chart.canvas.getBoundingClientRect();
          const wrap = chart.canvas.parentNode;
          const wRect= wrap.getBoundingClientRect();
          setTooltip({
            x:     t.caretX,
            y:     t.caretY,
            label: t.title?.[0] ?? "",
            value: t.dataPoints?.[0]?.raw ?? 0,
          });
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        ticks: {
          color:    "rgba(138,123,110,.6)",
          font:     { family:"'DM Sans',sans-serif", size:11 },
          stepSize: 25,
          callback: (v) => `${v}`,
        },
        grid: { color:"rgba(212,197,169,.22)", drawBorder:false },
        border:{ dash:[4,4], display:false },
      },
      x: {
        ticks: {
          color:    "rgba(138,123,110,.7)",
          font:     { family:"'DM Sans',sans-serif", size:11 },
          maxRotation: 30,
        },
        grid:  { display:false },
        border:{ display:false },
      },
    },
  }), []);

  if (!scores) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="slc-empty">
          <div className="slc-empty-icon">◌</div>
          <div>No score data yet</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="slc-wrap">

        {/* ── HEADER ── */}
        <div className="slc-header">
          <div className="slc-header-left">
          
          </div>

          <div className="slc-badges">
            <div className="slc-badge" style={{animationDelay:".1s"}}>
              <span className="slc-badge-label">Peak</span>
              <span className="slc-badge-val shimmer">{peak}</span>
            </div>
            <div className="slc-badge" style={{animationDelay:".2s"}}>
              <span className="slc-badge-label">Avg</span>
              <span className="slc-badge-val">{avg}</span>
            </div>
            <div className={`slc-trend slc-trend-${trend}`} style={{animationDelay:".3s"}}>
              {trendLabel(trend, values)}
            </div>
          </div>
        </div>

        {/* ── CHART ── */}
        <div className="slc-chart-area">
          {/* Decorative orbit */}
          <div className="slc-orbit-wrap">
            <div className="slc-orbit" />
            <div className="slc-orbit-inner" />
          </div>

          <div className="slc-canvas-wrap">
            <Line ref={chartRef} data={data} options={options} />

            {/* Custom tooltip */}
            {tooltip && (
              <div
                className="slc-tooltip"
                style={{
                  left: Math.min(tooltip.x + 12, 999),
                  top:  Math.max(tooltip.y - 60, 0),
                  transform: tooltip.x > 260 ? "translateX(-110%)" : "none",
                }}
              >
                <div className="slc-tooltip-label">{tooltip.label}</div>
                <div className="slc-tooltip-val">{tooltip.value}<span style={{fontSize:".7rem",color:"var(--mist)",marginLeft:2}}>/100</span></div>
                <div className="slc-tooltip-sub">
                  {tooltip.value >= 85 ? "Excellent ✦" : tooltip.value >= 70 ? "Good" : "Needs work"}
                </div>
                <div className="slc-tooltip-bar">
                  <div className="slc-tooltip-fill" style={{width:`${tooltip.value}%`}} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MINI BARS ── */}
        {labels.length > 0 && (
          <div className="slc-mini-bars">
            {labels.map((label, i) => (
              <div
                key={label}
                className="slc-mini-bar-item"
                style={{animationDelay:`${.05 * i}s`}}
              >
                <div className="slc-mini-bar-header">
                  <span className="slc-mini-bar-label" title={label}>{label}</span>
                  <span className="slc-mini-bar-val">{values[i]}</span>
                </div>
                <div className="slc-mini-bar-track">
                  <div
                    className="slc-mini-bar-fill"
                    style={{
                      width:`${values[i]}%`,
                      animationDelay:`${.08 * i}s`,
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