// Landing.jsx
// A lightweight hero carousel to make the shop feel alive.
// Autoplays but pauses on hover/focus; supports keyboard arrows; shows a "playing/paused" pill.
// Images live in /public/images/*.jpg with a basic placeholder fallback.

import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK =
  "https://via.placeholder.com/1280x720.png?text=Image+unavailable";

// Ordered "playlist" for the carousel.
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

const AUTOPLAY_MS = 4500; // not too fast, not too slow

export default function Landing() {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const total = IMAGES.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Autoplay (pause on hover/focus so users can actually read stuff)
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [isPaused, total]);

  // Keyboard accessibility — left/right arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Precompute dot state so React doesn’t churn on each render
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
        {/* Slides (stacked absolutely; fade via CSS) */}
        {IMAGES.map((src, i) => (
          <Slide key={src} src={src} active={i === index} />
        ))}

        {/* Overlay content sits on top of whatever slide is active */}
        <div className="carousel__overlay">
          <h1 className="m-0">Joystick: PC Paradise</h1>
          <p className="tagline">
            Your one stop shop for top-tier games at rock-bottom prices.
          </p>

          {/* Prev/Next (I keep these visible on purpose: discoverable + keyboard-friendly) */}
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

        {/* Dots — visually indicate position; click to jump */}
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

        {/* Live region so screen readers get state changes */}
        <span className="carousel__badge" aria-live="polite">
          {isPaused ? "Paused" : "Playing"}
        </span>
      </div>
    </section>
  );
}

// Single slide — swaps to fallback image on error.
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
      {/* dark vignette so overlay text stays readable on bright screenshots */}
      <div className="slide__shade" />
    </div>
  );
}
