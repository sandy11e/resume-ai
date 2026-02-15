import { useState, useRef, useEffect, useCallback } from "react";
import { askQuestion } from "../api";

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

  /* ── KEYFRAMES ── */
  @keyframes slideUser {
    from { opacity:0; transform:translateX(22px) scale(.95); }
    to   { opacity:1; transform:translateX(0)    scale(1); }
  }
  @keyframes slideAI {
    from { opacity:0; transform:translateX(-22px) scale(.95); }
    to   { opacity:1; transform:translateX(0)     scale(1); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes dotBounce {
    0%,80%,100% { transform:translateY(0);   opacity:.35; }
    40%         { transform:translateY(-6px); opacity:1; }
  }
  @keyframes shimmer {
    0%  { background-position:-200% center; }
    100%{ background-position: 200% center; }
  }
  @keyframes spin-slow { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
  @keyframes spin-rev  { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes waveBar {
    0%,100%{ transform:scaleY(.3); opacity:.4; }
    50%    { transform:scaleY(1);  opacity:1; }
  }
  @keyframes sendPop {
    0%  { transform:scale(1); }
    35% { transform:scale(.85) rotate(8deg); }
    70% { transform:scale(1.15) rotate(-4deg); }
    100%{ transform:scale(1) rotate(0deg); }
  }
  @keyframes inputFlash {
    0%  { border-color:rgba(196,98,45,.42); box-shadow:0 0 0 5px rgba(196,98,45,.15), 0 4px 20px rgba(196,98,45,.15); }
    100%{ border-color:rgba(212,197,169,.55); box-shadow:none; }
  }
  .ci-input-flash {
    animation:inputFlash .55s ease both;
  }
  @keyframes glowPulse {
    0%,100%{ box-shadow: 0 0 0 0   rgba(196,98,45,.3); }
    50%    { box-shadow: 0 0 0 8px rgba(196,98,45,0); }
  }
  @keyframes newMsgPing {
    0%  { transform:scale(0); opacity:1; }
    100%{ transform:scale(2.5); opacity:0; }
  }
  @keyframes dateSlide {
    from { opacity:0; transform:translateY(6px) scale(.95); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }
  @keyframes breathe {
    0%,100%{ opacity:.5; transform:scale(1); }
    50%    { opacity:1;  transform:scale(1.05); }
  }

  /* ── WRAPPER ── */
  .ci-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    position: relative;
    overflow: hidden;
  }

  /* ── SCROLL AREA ── */
  .ci-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    scroll-behavior: smooth;
  }
  .ci-messages::-webkit-scrollbar { width: 3px; }
  .ci-messages::-webkit-scrollbar-track { background: transparent; }
  .ci-messages::-webkit-scrollbar-thumb {
    background: rgba(212,197,169,.55);
    border-radius: 99px;
  }

  /* ── EMPTY STATE ── */
  .ci-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 40px 20px;
    text-align: center;
    animation: fadeUp .7s ease both;
    pointer-events: none;
  }
  .ci-empty-orbit {
    position: relative;
    width: 88px; height: 88px;
  }
  .ci-empty-ring-1 {
    position: absolute; inset: 0;
    border: 1.5px dashed rgba(196,98,45,.3);
    border-radius: 50%;
    animation: spin-slow 16s linear infinite;
  }
  .ci-empty-ring-1::after {
    content:''; position:absolute;
    top:4px; left:50%; margin-left:-4px;
    width:7px; height:7px;
    background:var(--rust); border-radius:50%;
    box-shadow:0 0 8px var(--rust);
  }
  .ci-empty-ring-2 {
    position:absolute; inset:13px;
    border:1px dashed rgba(196,98,45,.15);
    border-radius:50%;
    animation:spin-rev 10s linear infinite;
  }
  .ci-empty-center {
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    font-size:1.7rem;
    animation:breathe 3s ease-in-out infinite;
  }
  .ci-empty-title {
    font-family:'Syne',sans-serif;
    font-weight:700; font-size:1.05rem; color:var(--ink);
  }
  .ci-empty-sub {
    font-size:.78rem; color:var(--mist);
    max-width:270px; line-height:1.65;
  }

  /* Suggestion chips in empty state */
  .ci-suggestions {
    display:flex; flex-wrap:wrap; gap:8px;
    justify-content:center;
    max-width:380px;
    pointer-events:all;
  }
  .ci-suggestion-chip {
    padding:7px 15px;
    background:var(--card-bg);
    border:1px solid var(--card-border);
    border-radius:99px;
    font-size:.74rem; color:var(--mist);
    cursor:pointer; font-family:'DM Sans',sans-serif;
    transition:background .18s, color .18s, border-color .18s,
               transform .2s cubic-bezier(.34,1.56,.64,1);
    backdrop-filter:blur(10px);
    white-space:nowrap;
  }
  .ci-suggestion-chip:hover {
    background:rgba(196,98,45,.1);
    border-color:rgba(196,98,45,.28);
    color:var(--rust);
    transform:translateY(-2px) scale(1.04);
  }

  /* ── DATE DIVIDER ── */
  .ci-date-divider {
    display:flex; align-items:center; gap:10px;
    margin:12px 0 6px;
    animation:dateSlide .4s ease both;
  }
  .ci-date-line {
    flex:1; height:1px;
    background:linear-gradient(90deg,transparent,rgba(212,197,169,.45),transparent);
  }
  .ci-date-label {
    font-size:.63rem; color:var(--sand);
    letter-spacing:.07em; text-transform:uppercase;
    padding:3px 10px;
    background:rgba(212,197,169,.15);
    border:1px solid rgba(212,197,169,.3);
    border-radius:99px;
  }

  /* ── MESSAGE ROW ── */
  .ci-row {
    display:flex;
    gap:10px;
    max-width:80%;
  }
  .ci-row-user {
    align-self:flex-end;
    flex-direction:row-reverse;
    animation:slideUser .32s cubic-bezier(.25,.46,.45,.94) both;
  }
  .ci-row-ai {
    align-self:flex-start;
    animation:slideAI .32s cubic-bezier(.25,.46,.45,.94) both;
  }

  /* Avatars */
  .ci-avatar {
    width:32px; height:32px; border-radius:50%;
    flex-shrink:0; display:flex; align-items:center; justify-content:center;
    font-size:.72rem; margin-top:2px;
  }
  .ci-avatar-user {
    background:linear-gradient(135deg,var(--rust),var(--ember));
    color:#fff; font-family:'Syne',sans-serif; font-weight:800;
    box-shadow:0 4px 10px rgba(196,98,45,.3);
    font-size:.68rem;
  }
  .ci-avatar-ai {
    border:1.5px dashed rgba(196,98,45,.32);
    background:rgba(196,98,45,.06);
    color:var(--rust);
    font-size:.48rem; letter-spacing:.06em;
    animation:spin-slow 20s linear infinite;
  }

  /* Group wrapper */
  .ci-group { display:flex; flex-direction:column; gap:3px; }

  /* Sender label */
  .ci-sender-label {
    font-size:.62rem; font-weight:500;
    letter-spacing:.06em; text-transform:uppercase;
    padding:0 4px; margin-bottom:2px;
  }
  .ci-sender-label-ai {
    background:linear-gradient(120deg,var(--rust) 0%,var(--ember) 50%,var(--rust) 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text;
    animation:shimmer 2.5s linear infinite;
  }
  .ci-sender-label-user { color:var(--mist); text-align:right; }

  /* Bubbles */
  .ci-bubble {
    padding:12px 17px;
    border-radius:18px;
    font-size:.875rem; line-height:1.66;
    position:relative; word-wrap:break-word;
  }
  .ci-bubble-user {
    background:linear-gradient(135deg,var(--rust),var(--ember));
    color:#fff;
    border-radius:18px 5px 18px 18px;
    box-shadow:0 5px 18px rgba(196,98,45,.28), inset 0 1px 0 rgba(255,255,255,.15);
  }
  .ci-bubble-ai {
    background:var(--card-bg);
    border:1px solid var(--card-border);
    color:var(--ink);
    border-radius:5px 18px 18px 18px;
    box-shadow:0 4px 16px rgba(44,36,32,.07);
    backdrop-filter:blur(14px);
  }
  .ci-bubble-ai::before {
    content:'';
    position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);
    border-radius:inherit;
  }
  /* error bubble */
  .ci-bubble-error {
    background:rgba(220,38,38,.07);
    border:1px solid rgba(220,38,38,.2);
    color:#b91c1c;
    border-radius:5px 18px 18px 18px;
  }

  /* Timestamp */
  .ci-ts {
    font-size:.62rem; color:rgba(212,197,169,.8);
    padding:2px 4px; margin-top:3px;
  }
  .ci-row-user .ci-ts { text-align:right; }

  /* ── TYPING INDICATOR ── */
  .ci-typing-row {
    display:flex; gap:10px;
    align-self:flex-start;
    animation:slideAI .28s ease both;
  }
  .ci-typing-bubble {
    background:var(--card-bg);
    border:1px solid var(--card-border);
    border-radius:5px 18px 18px 18px;
    padding:14px 18px;
    display:flex; gap:5px; align-items:center;
    box-shadow:0 4px 16px rgba(44,36,32,.07);
    backdrop-filter:blur(14px);
  }
  .ci-typing-dot {
    width:6px; height:6px;
    background:var(--sand); border-radius:50%;
    animation:dotBounce 1.2s ease-in-out infinite;
  }
  .ci-typing-dot:nth-child(2){ animation-delay:.18s; }
  .ci-typing-dot:nth-child(3){ animation-delay:.36s; }

  /* ── SCROLL-TO-BOTTOM FAB ── */
  .ci-scroll-fab {
    position:absolute; bottom:90px; right:20px;
    width:36px; height:36px; border-radius:50%;
    background:var(--card-bg);
    border:1px solid var(--card-border);
    box-shadow:0 4px 16px rgba(44,36,32,.12);
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:.9rem; color:var(--mist);
    backdrop-filter:blur(10px);
    transition:transform .2s cubic-bezier(.34,1.56,.64,1), color .2s;
    z-index:5;
    animation:fadeIn .25s ease both;
  }
  .ci-scroll-fab:hover {
    transform:translateY(3px) scale(1.1);
    color:var(--rust);
  }

  /* ── INPUT BAR ── */
  .ci-input-bar {
    flex-shrink:0;
    padding:14px 20px 16px;
    border-top:1px solid rgba(212,197,169,.32);
    background:rgba(245,240,232,.88);
    backdrop-filter:blur(20px);
    position:relative; z-index:5;
  }

  .ci-input-row {
    display:flex; align-items:center; gap:10px;
    background:var(--card-bg);
    border:1.5px solid var(--card-border);
    border-radius:99px;
    padding:6px 6px 6px 18px;
    backdrop-filter:blur(14px);
    transition:border-color .22s, box-shadow .22s;
  }
  .ci-input-row:focus-within {
    border-color:rgba(196,98,45,.42);
    box-shadow:0 0 0 4px rgba(196,98,45,.09), 0 4px 20px rgba(196,98,45,.1);
  }

  /* small spinning icon */
  .ci-input-icon {
    width:24px; height:24px; flex-shrink:0;
    border:1.5px dashed rgba(196,98,45,.32);
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:.46rem; letter-spacing:.05em; color:var(--rust);
    animation:spin-slow 18s linear infinite;
  }

  .ci-input {
    flex:1;
    border:none; background:transparent; outline:none;
    font-family:'DM Sans',sans-serif;
    font-size:.875rem; color:var(--ink);
    padding:8px 0; min-width:0;
  }
  .ci-input::placeholder { color:var(--sand); }

  /* wave while loading */
  .ci-wave {
    display:flex; align-items:center; gap:2.5px;
    height:20px; opacity:0;
    transition:opacity .28s;
    flex-shrink:0;
  }
  .ci-wave.show { opacity:1; }
  .ci-wave-bar {
    width:2px; background:var(--ember); border-radius:99px;
    animation:waveBar 1s ease-in-out infinite;
  }
  .ci-wave-bar:nth-child(1){ height:8px;  animation-delay:0s; }
  .ci-wave-bar:nth-child(2){ height:14px; animation-delay:.12s; }
  .ci-wave-bar:nth-child(3){ height:10px; animation-delay:.24s; }
  .ci-wave-bar:nth-child(4){ height:6px;  animation-delay:.36s; }

  /* char count */
  .ci-char-count {
    font-size:.64rem; color:var(--sand);
    flex-shrink:0; min-width:24px; text-align:right;
    transition:color .2s;
  }
  .ci-char-count.warn { color:var(--ember); }

  /* send button */
  .ci-send {
    width:40px; height:40px; flex-shrink:0;
    border-radius:50%; border:none;
    background:linear-gradient(135deg,var(--rust),var(--ember));
    color:#fff; font-size:.95rem;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 14px rgba(196,98,45,.35), inset 0 1px 0 rgba(255,255,255,.2);
    transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s, opacity .2s;
    position:relative; overflow:hidden;
  }
  .ci-send::before {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);
    border-radius:inherit;
  }
  .ci-send:hover:not(:disabled) {
    transform:scale(1.12) rotate(10deg);
    box-shadow:0 8px 24px rgba(196,98,45,.45);
    animation:glowPulse 1.5s ease infinite;
  }
  .ci-send:active:not(:disabled) {
    animation:sendPop .35s ease both;
  }
  .ci-send:disabled { opacity:.38; cursor:not-allowed; box-shadow:none; }

  /* input footer */
  .ci-input-footer {
    display:flex; align-items:center; justify-content:space-between;
    margin-top:9px; padding:0 4px;
  }
  .ci-footer-hint {
    font-size:.64rem; color:var(--sand);
    display:flex; align-items:center; gap:5px;
  }
  .ci-footer-hint kbd {
    background:rgba(212,197,169,.25);
    border:1px solid rgba(212,197,169,.45);
    border-radius:4px; padding:1px 5px;
    font-size:.62rem; font-family:'DM Sans',sans-serif;
    color:var(--mist);
  }
  .ci-msg-count {
    font-size:.63rem; color:var(--sand);
    letter-spacing:.04em;
  }

  /* ── CLEAR BUTTON ── */
  .ci-clear-btn {
    background:none; border:none; cursor:pointer;
    font-size:.68rem; color:var(--sand);
    font-family:'DM Sans',sans-serif;
    padding:3px 8px; border-radius:6px;
    transition:color .18s, background .18s;
    letter-spacing:.02em;
  }
  .ci-clear-btn:hover { color:var(--rust); background:rgba(196,98,45,.08); }
`;

/* ─── helpers ─── */
const fmt = (d) => new Date(d).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
const today = () => new Date().toDateString();

const QUICK_PROMPTS = [
  "What roles fit my skills best?",
  "How can I improve my ATS score?",
  "Rewrite my summary section",
  "What keywords am I missing?",
];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
function Avatar({ sender }) {
  return sender === "user"
    ? <div className="ci-avatar ci-avatar-user">You</div>
    : <div className="ci-avatar ci-avatar-ai">AI</div>;
}

function MessageBubble({ message, isLast }) {
  const isUser  = message.sender === "user";
  const isError = message.isError;

  return (
    <div
      className={`ci-row ${isUser ? "ci-row-user" : "ci-row-ai"}`}
      style={{ animationDelay: isLast ? "0s" : ".0s" }}
    >
      <Avatar sender={message.sender} />

      <div className="ci-group">
        <div className={`ci-sender-label ${isUser
          ? "ci-sender-label-user"
          : "ci-sender-label-ai"}`}
        >
          {isUser ? "You" : "ResumeAI"}
        </div>

        <div className={`ci-bubble ${
          isError      ? "ci-bubble-error"
          : isUser     ? "ci-bubble-user"
          : "ci-bubble-ai"
        }`}>
          {isError && <span>⚠ </span>}
          {message.text}
        </div>

        {message.time && (
          <div className="ci-ts">{fmt(message.time)}</div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="ci-typing-row">
      <div className="ci-avatar ci-avatar-ai">AI</div>
      <div>
        <div className="ci-sender-label ci-sender-label-ai">ResumeAI</div>
        <div className="ci-typing-bubble">
          <div className="ci-typing-dot" />
          <div className="ci-typing-dot" />
          <div className="ci-typing-dot" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
function ChatInterface() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("chatHistory");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const messagesEndRef  = useRef(null);
  const scrollAreaRef   = useRef(null);
  const inputRef        = useRef(null);

  /* persist */
  useEffect(() => {
    try { localStorage.setItem("chatHistory", JSON.stringify(messages)); }
    catch { /* quota exceeded – silent */ }
  }, [messages]);

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  /* show scroll FAB when user scrolled up */
  const onScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowFab(distFromBottom > 120);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  };

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg = { sender:"user", text:msg, time:Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askQuestion(msg);
      await new Promise(r => setTimeout(r, 300)); // let typing bubble breathe
      const aiMsg = {
        sender:"ai",
        text:res?.data?.response ?? "I couldn't get a response — please try again.",
        time:Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        sender:"ai", text:"Error communicating with server.",
        time:Date.now(), isError:true,
      }]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const clearHistory = () => {
    setMessages([]);
    try { localStorage.removeItem("chatHistory"); } catch {}
  };

  /* ── fill input from suggestion chip (does NOT auto-send) ── */
  const fillInput = (text) => {
    setInput(text);
    // short delay so state flushes before we focus+move cursor to end
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(text.length, text.length);
      /* flash the input row to signal it was filled */
      el.classList?.add("ci-input-flash");
      setTimeout(() => el.classList?.remove("ci-input-flash"), 600);
    }, 30);
  };

  /* listen for fill-input events from parent suggestion chips (Chat.jsx) */
  useEffect(() => {
    const handler = (e) => fillInput(e.detail);
    window.addEventListener("ci:fill-input", handler);
    return () => window.removeEventListener("ci:fill-input", handler);
  // fillInput is stable (defined without deps), safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* group messages by date */
  const todayStr = today();
  let lastDate = null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ci-wrap">

        {/* ── MESSAGES ── */}
        <div
          className="ci-messages"
          ref={scrollAreaRef}
          onScroll={onScroll}
        >
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="ci-empty">
              <div className="ci-empty-orbit">
                <div className="ci-empty-ring-1" />
                <div className="ci-empty-ring-2" />
                <div className="ci-empty-center">◎</div>
              </div>
              <div className="ci-empty-title">Start a conversation</div>
              <div className="ci-empty-sub">
                Ask me anything about your resume — I'll help you land your next role.
              </div>
              <div className="ci-suggestions">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    className="ci-suggestion-chip"
                    onClick={() => fillInput(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list with date dividers */}
          {messages.map((msg, i) => {
            const msgDate = msg.time ? new Date(msg.time).toDateString() : todayStr;
            const showDivider = msgDate !== lastDate;
            lastDate = msgDate;
            const label = msgDate === todayStr ? "Today" : msgDate;

            return (
              <div key={i}>
                {showDivider && (
                  <div className="ci-date-divider">
                    <div className="ci-date-line" />
                    <span className="ci-date-label">{label}</span>
                    <div className="ci-date-line" />
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isLast={i === messages.length - 1}
                />
              </div>
            );
          })}

          {loading && <TypingBubble />}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom FAB */}
        {showFab && (
          <button className="ci-scroll-fab" onClick={scrollToBottom} title="Scroll to bottom">
            ↓
          </button>
        )}

        {/* ── INPUT BAR ── */}
        <div className="ci-input-bar">
          <div className="ci-input-row">
            <div className="ci-input-icon">AI</div>

            <input
              ref={inputRef}
              className="ci-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about your resume…"
              disabled={loading}
              maxLength={500}
              autoFocus
            />

            {/* char counter when typing */}
            {input.length > 350 && (
              <span className={`ci-char-count ${input.length > 450 ? "warn" : ""}`}>
                {500 - input.length}
              </span>
            )}

            {/* wave when loading */}
            <div className={`ci-wave ${loading ? "show" : ""}`}>
              <div className="ci-wave-bar" />
              <div className="ci-wave-bar" />
              <div className="ci-wave-bar" />
              <div className="ci-wave-bar" />
            </div>

            <button
              className="ci-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send (Enter)"
            >
              ↑
            </button>
          </div>

          <div className="ci-input-footer">
            <div className="ci-footer-hint">
              Press <kbd>Enter</kbd> to send
            </div>
            {messages.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span className="ci-msg-count">{messages.length} messages</span>
                <button className="ci-clear-btn" onClick={clearHistory}>
                  Clear history
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default ChatInterface;