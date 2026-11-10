import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Bot,
  ChevronRight,
  CircleUserRound,
  Layers2,
  Mic,
  Plus,
  Send,
  Shield,
  Sparkles,
  Square,
} from "lucide-react";
import { systems, type SystemId } from "./systems";
import AboutAstroPulse from "./AboutAstroPulse";
const Viewer = lazy(() => import("./viewer"));
type Message = { role: "user" | "assistant"; text: string };

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function App() {
  const [activeNav, setActiveNav] = useState<
    "dashboard" | "trends" | "manual" | "nasa"
  >("dashboard");
  const [suit, setSuit] = useState(true);
  const [selected, setSelected] = useState<SystemId | null>(null);
  const [mode, setMode] = useState<"body" | "agent">("body");
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [voice, setVoice] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Welcome aboard. Select a body system, then ask me to summarize its sample readings. This is a scripted demo.",
    },
  ]);
  const timer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const system = systems.find((item) => item.id === selected);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (mode === "agent" && conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, mode]);
  function select(id: SystemId) {
    stopVoice();
    setSelected(id);
    setSuit(false);
    setMode("body");
  }
  function stopVoice() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setVoice(false);
  }
  function switchMode(next: "body" | "agent") {
    stopVoice();
    setMode(next);
  }
  function respond(text: string) {
    const reply = system
      ? `Sample ${system.label.toLowerCase()} summary: ${system.primary.label.toLowerCase()} is ${system.primary.value} ${system.primary.unit}. ${system.readings.map((reading) => `${reading.label}: ${reading.value} ${reading.unit}`).join("; ")}. These are fixed demo values, not measurements or medical advice.`
      : "Select one of the five body systems to explore its sample readings. The suit will switch to anatomy so you can see the selected structure.";
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "assistant", text: reply },
    ]);
  }
  function simulateVoice() {
    if (voice) {
      stopVoice();
      return;
    }
    setVoice(true);
    timer.current = window.setTimeout(() => {
      respond("Summarize my selected body system. [Simulated voice]");
      setVoice(false);
      timer.current = null;
    }, 1800);
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#main"
          aria-label="AstroPulse, skip to crew explorer"
        >
          <span className="brand-icon">
            <Activity size={23} />
          </span>
          <span>
            ASTRO<span className="brand-light">PULSE</span>
            <small>HUMAN HEALTH. BEYOND EARTH.</small>
          </span>
        </a>

        <nav className="header-nav-pills" aria-label="Views">
          <button
            type="button"
            className={`nav-pill ${activeNav === "dashboard" ? "active" : ""}`}
            aria-current={activeNav === "dashboard" ? "page" : undefined}
            onClick={() => setActiveNav("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-pill ${activeNav === "trends" ? "active" : ""}`}
            aria-current={activeNav === "trends" ? "page" : undefined}
            onClick={() => setActiveNav("trends")}
          >
            Trends
          </button>
          <button
            type="button"
            className={`nav-pill ${activeNav === "manual" ? "active" : ""}`}
            aria-current={activeNav === "manual" ? "page" : undefined}
            onClick={() => setActiveNav("manual")}
          >
            Field manual
          </button>
          <button
            type="button"
            className={`nav-pill ${activeNav === "nasa" ? "active" : ""}`}
            aria-current={activeNav === "nasa" ? "page" : undefined}
            onClick={() => setActiveNav("nasa")}
          >
            NASA guide
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="action-btn log-reading-btn"
            aria-label="Log reading"
            onClick={() => {
              setMode("agent");
              respond(
                "Quick reading entry: Record new cardiovascular, respiratory, or metabolic reading.",
              );
            }}
          >
            <Plus size={16} />
            <span>Log reading</span>
          </button>
          <button
            type="button"
            className="action-btn report-ground-btn"
            aria-label="Report to ground"
            onClick={() => {
              setMode("agent");
              respond(
                "Telemetry report dispatched to mission control. Flight Day 042 bio-readings transmitted.",
              );
            }}
          >
            <Send size={15} />
            <span>Report to ground</span>
          </button>
          <button
            type="button"
            className="avatar-btn"
            title="Crew member profile S"
            aria-label="Crew profile S"
          >
            S
          </button>
          <AboutAstroPulse />
        </div>
      </header>
      <main id="main" className="workspace">
        <nav className="system-rail" aria-label="Body systems">
          <span className="eyebrow">EXPLORE THE BODY</span>
          <p className="rail-intro">
            One crew member.
            <br />
            Connected systems.
          </p>
          <div className="system-buttons">
            {systems.map((item) => (
              <button
                key={item.id}
                className={`system-button ${selected === item.id ? "selected" : ""}`}
                aria-pressed={selected === item.id}
                onClick={() => select(item.id)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          <div className="rail-note">
            <Layers2 size={20} />
            <p>
              Select a system to reveal the anatomy and explore its sample
              readings.
            </p>
          </div>
          <div className="crew-label">
            <CircleUserRound size={30} />
            <div>
              <strong>Crew member A</strong>
              <span>Demo profile · Day 42</span>
            </div>
          </div>
        </nav>
        <div className="viewer-column">
          <div
            className="suit-switch"
            role="group"
            aria-label="Model visibility"
          >
            <button aria-pressed={suit} onClick={() => setSuit(true)}>
              <Shield size={15} />
              Suit on
            </button>
            <button aria-pressed={!suit} onClick={() => setSuit(false)}>
              <Layers2 size={15} />
              Suit off
            </button>
          </div>
          <Suspense
            fallback={
              <div className="viewer module-loading" role="status">
                Loading 3D viewer…
              </div>
            }
          >
            <Viewer
              suit={suit}
              selected={selected}
              onSelect={select}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </div>
        <aside className="inspector" aria-label="Crew inspector">
          <div className="mode-switch" role="group" aria-label="Sidebar mode">
            <button
              aria-pressed={mode === "body"}
              onClick={() => switchMode("body")}
            >
              <Activity size={17} />
              Body
            </button>
            <button
              aria-pressed={mode === "agent"}
              onClick={() => switchMode("agent")}
            >
              <Sparkles size={17} />
              AI Agent
            </button>
          </div>
          {mode === "body" ? (
            <div className="body-panel">
              <div className="panel-heading">
                <span className="eyebrow">BODY INSIGHTS</span>
                <span className="demo-tag">Sample data</span>
              </div>
              <h2>{system?.organ ?? "Your body, in focus."}</h2>
              <p className="panel-description">
                {system
                  ? `${system.label} system`
                  : "A closer look at the systems that keep you moving."}
              </p>
              {system ? (
                <div className="readings" aria-live="polite">
                  <div className="primary-reading">
                    <span>{system.primary.label}</span>
                    <div>
                      <strong>{system.primary.value}</strong>
                      <span>{system.primary.unit}</span>
                    </div>
                    <div className="sample-rule" aria-hidden="true" />
                    <small>Illustrative reading · Demo session</small>
                  </div>
                  <dl className="secondary-readings">
                    {system.readings.map((reading) => (
                      <div key={reading.label}>
                        <dt>{reading.label}</dt>
                        <dd>
                          {reading.value}
                          <small>{reading.unit}</small>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="structure-note">
                    <system.icon size={20} />
                    <div>
                      <strong>{system.organ}</strong>
                      <p>{system.note}</p>
                    </div>
                  </div>
                  {suit && (
                    <button
                      className="reveal-button"
                      onClick={() => setSuit(false)}
                    >
                      Reveal selected anatomy
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="body-empty">
                  <div className="empty-symbol">
                    <Activity size={34} />
                  </div>
                  <h3>Start with a system</h3>
                  <p>
                    Select a body system beside the model. Its structures and
                    sample readings will appear here.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => select("cardiovascular")}
                  >
                    Explore the heart
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
              <button
                className="assistant-invite"
                onClick={() => switchMode("agent")}
              >
                <span className="assistant-icon">
                  <Bot size={20} />
                </span>
                <span>
                  <strong>Make sense of the readings</strong>
                  <small>Explore with your AI Agent · Demo</small>
                </span>
                <ArrowRight size={16} />
              </button>
              <p className="panel-footnote">
                Prototype data only. No live sensors or clinical assessment.
              </p>
            </div>
          ) : (
            <div className="agent-panel">
              <div className="panel-heading">
                <span className="eyebrow">YOUR MISSION COMPANION</span>
                <span className="demo-tag">Demo</span>
              </div>
              <h2>A little perspective.</h2>
              <p className="panel-description">
                Scripted answers using your sample readings.
              </p>
              <div className="agent-context">
                <span>Viewing</span>
                <strong>{system?.label ?? "Crew overview"}</strong>
              </div>
              <div
                ref={conversationRef}
                className="conversation"
                role="log"
                aria-label="Demo conversation"
                aria-live="polite"
              >
                {messages.map((message, index) => (
                  <div className={`message ${message.role}`} key={index}>
                    <span>
                      {message.role === "assistant"
                        ? "ASTROPULSE AGENT"
                        : "YOU"}
                    </span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <button
                className="prompt-button"
                onClick={() => respond("Summarize these sample readings.")}
              >
                Summarize sample readings
                <ArrowRight size={15} />
              </button>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!input.trim()) {
                    setInputError("Enter a message to run the demo.");
                    inputRef.current?.focus();
                    return;
                  }
                  respond(input.trim());
                  setInput("");
                  setInputError("");
                }}
              >
                <label className="sr-only" htmlFor="agent-message">
                  Message the demo agent
                </label>
                <div className="message-input">
                  <input
                    ref={inputRef}
                    id="agent-message"
                    value={input}
                    maxLength={500}
                    aria-invalid={!!inputError}
                    aria-describedby={
                      inputError ? "message-error" : "agent-help"
                    }
                    onChange={(event) => {
                      setInput(event.target.value);
                      setInputError("");
                    }}
                    placeholder="Ask about the sample readings…"
                  />
                  <button aria-label="Send demo message" type="submit">
                    <Send size={17} />
                  </button>
                </div>
                {inputError && (
                  <p id="message-error" className="field-error" role="alert">
                    {inputError}
                  </p>
                )}
              </form>
              <div className="voice-demo">
                <button
                  className={voice ? "voice-active" : ""}
                  onClick={simulateVoice}
                >
                  {voice ? <Square size={18} /> : <Mic size={18} />}
                  <span>{voice ? "Cancel voice demo" : "Try voice demo"}</span>
                  <AudioLines size={18} />
                </button>
                <p role="status">
                  {voice
                    ? "Simulating a voice request…"
                    : "Simulated voice · Microphone is not used"}
                </p>
              </div>
              <p id="agent-help" className="panel-footnote">
                Local scripted demo. Messages are not sent to an AI service.
              </p>
            </div>
          )}
        </aside>
      </main>
      <footer className="footer">
        <span>
          <span className="footer-dot" />
          Explore. Understand. Stay mission-ready.
        </span>
        <details>
          <summary>Model credits & licenses</summary>
          <div className="credits">
            <h3>Two models. Credited sources.</h3>
            <p>
              Astronaut:{" "}
              <a
                href="https://science.nasa.gov/3d-resources/astronaut/"
                target="_blank"
                rel="noreferrer"
              >
                NASA / DigitalSpace Corporation
              </a>
              . Used under NASA’s media guidelines; no endorsement implied.
            </p>
            <p>
              Anatomy:{" "}
              <a
                href="https://zenodo.org/records/4953712"
                target="_blank"
                rel="noreferrer"
              >
                Z-Anatomy, Kousaku Okubo & Gauthier Kervyn
              </a>
              . “BodyParts3D, © The Database Center for Life Science licensed
              under CC Attribution-Share Alike 2.1 Japan”, mixed and modified by
              Z-anatomy.com.
            </p>
            <p>
              AstroPulse’s anatomy subset was simplified, recolored and posed.
              Distributed under the archive’s{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/2.1/jp/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA 2.1 Japan
              </a>{" "}
              terms.{" "}
              <a
                href={`${import.meta.env.BASE_URL}models/ATTRIBUTION.md`}
                target="_blank"
                rel="noreferrer"
              >
                Full sources and license notes
              </a>
              .
            </p>
          </div>
        </details>
        <span className="footer-prototype">Space Apps · Prototype</span>
      </footer>
    </div>
  );
}
