import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK =
  "https://via.placeholder.com/1280x720.png?text=Image+unavailable";

const IMAGES = [
  "/images/homepage.jpg",
  "/images/2k26.homepage.jpg",
  "/images/bf6.homepage.jpg",
  "/images/cyberpunk2077.homepage.jpg",
  "/images/er.homepage.jpg",
  "/images/fh5.homepage.jpg",
  "/images/gtav.homepage.jpg",
  "/images/madden26.homepage.jpg",
  "/images/spiderman.homepage.jpg",
  "/images/tlou2.homepage.jpg",
];

const AUTOPLAY_MS = 4500;

export default function Landing() {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const total = IMAGES.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Autoplay (pause on hover/focus)
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [isPaused, total]);

  // Keyboard arrows for accessibility
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dots = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        id: i,
        active: i === index,
      })),
    [index, total]
  );

  return (
    <section className="hero-panel">
      <div
        className="carousel"
        role="region"
        aria-label="Featured gameplay carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Slides */}
        {IMAGES.map((src, i) => (
          <Slide key={src} src={src} active={i === index} />
        ))}

        {/* Overlay content */}
        <div className="carousel__overlay">
          <h1 className="m-0">Joystick: PC Paradise</h1>
          <p className="tagline">
            Your one stop shop for top-tier games at rock-bottom prices.
          </p>
          <div className="carousel__controls">
            <button
              className="btn-ghost"
              onClick={prev}
              aria-label="Previous screenshot"
            >
              ← Prev
            </button>
            <button
              className="btn-ghost"
              onClick={next}
              aria-label="Next screenshot"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="carousel__dots" aria-label="Slide navigation">
          {dots.map((d) => (
            <button
              key={d.id}
              className={`dot ${d.active ? "is-active" : ""}`}
              aria-label={`Go to slide ${d.id + 1}`}
              aria-current={d.active ? "true" : "false"}
              onClick={() => setIndex(d.id)}
            />
          ))}
        </div>

        {/* Pause badge */}
        <span className="carousel__badge" aria-live="polite">
          {isPaused ? "Paused" : "Playing"}
        </span>
      </div>
    </section>
  );
}

function Slide({ src, active }) {
  const [ok, setOk] = useState(true);
  return (
    <div className={`slide ${active ? "is-active" : ""}`}>
      <img
        src={ok ? src : FALLBACK}
        alt=""
        onError={() => setOk(false)}
        draggable={false}
      />
      {/* subtle vignette */}
      <div className="slide__shade" />
    </div>
  );
}
