// Living decorative celestial star field with rich multi-frequency animation, cosmic shooting stars, & animated rockets.
// Kept outside the transparent Canvas so model swaps share the same distant sky.
// pointer-events: none and aria-hidden="true" ensure zero interference with 3D models or raycasts.

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  tier: "distant" | "mid" | "bright";
  animationType: "twinkle-fast" | "twinkle-mid" | "twinkle-slow" | "pulse";
  delay: number;
  duration: number;
}

const stars: Star[] = Array.from({ length: 160 }, (_, index) => {
  const noise = (seed: number) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const x = 1.5 + noise(index + 1) * 97;
  const y = 1.5 + noise(index + 109) * 97;

  // Center silhouette zone (where 3D astronaut/anatomy stands)
  const isCenter = x > 34 && x < 66 && y > 18 && y < 80;

  // Tier distribution: ~12% bright, ~28% mid, ~60% distant
  const isBright = index % 8 === 0;
  const isMid = !isBright && index % 3 === 0;

  let tier: "distant" | "mid" | "bright" = "distant";
  let size = 0.75 + noise(index + 227) * 0.45; // 0.75px - 1.2px
  let opacity = 0.18 + noise(index + 347) * 0.22; // 0.18 - 0.40

  let animationType: Star["animationType"] = "twinkle-slow";
  if (isBright) {
    tier = "bright";
    size = 2.0 + noise(index + 227) * 0.7; // 2.0px - 2.7px
    opacity = 0.75 + noise(index + 347) * 0.22; // 0.75 - 0.97
    animationType = index % 2 === 0 ? "pulse" : "twinkle-fast";
  } else if (isMid) {
    tier = "mid";
    size = 1.25 + noise(index + 227) * 0.45; // 1.25px - 1.7px
    opacity = 0.42 + noise(index + 347) * 0.22; // 0.42 - 0.64
    animationType = index % 2 === 0 ? "twinkle-mid" : "twinkle-fast";
  }

  // Softly dim stars directly behind the central silhouette so anatomy is crystal clear
  if (isCenter) {
    opacity *= 0.42;
  }

  const delay = Number((-noise(index + 401) * 8).toFixed(2));
  const duration = Number(
    (animationType === "twinkle-fast"
      ? 2.2 + noise(index + 509) * 1.2
      : animationType === "twinkle-mid"
        ? 3.8 + noise(index + 509) * 1.6
        : animationType === "pulse"
          ? 3.4 + noise(index + 509) * 1.5
          : 6.2 + noise(index + 509) * 2.4
    ).toFixed(2),
  );

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    size: Number(size.toFixed(2)),
    opacity: Number(opacity.toFixed(2)),
    tier,
    animationType,
    delay,
    duration,
  };
});

export default function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      {/* Soft atmospheric celestial glow */}
      <div className="viewer-atmospheric-glow" />

      {/* Futuristic Space Rockets cruising in deep background */}
      <div className="rocket-flight rocket-1">
        <div className="rocket-exhaust-flame cyan-exhaust" />
        <svg
          viewBox="0 0 60 28"
          className="rocket-svg"
          width="48"
          height="22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rocketBody1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8baec7" />
              <stop offset="60%" stopColor="#edf3f8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="wingGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a506b" />
              <stop offset="100%" stopColor="#5bc0de" />
            </linearGradient>
          </defs>
          <rect x="2" y="11" width="5" height="6" rx="1" fill="#243348" />
          <path
            d="M7 14 C12 8, 38 9, 56 14 C38 19, 12 20, 7 14 Z"
            fill="url(#rocketBody1)"
          />
          <path d="M12 9 L4 2 L18 8 Z" fill="url(#wingGrad1)" />
          <path d="M12 19 L4 26 L18 20 Z" fill="url(#wingGrad1)" />
          <ellipse cx="44" cy="14" rx="4" ry="2" fill="#5bc0de" />
        </svg>
      </div>

      <div className="rocket-flight rocket-2">
        <div className="rocket-exhaust-flame amber-exhaust" />
        <svg
          viewBox="0 0 54 26"
          className="rocket-svg"
          width="44"
          height="20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rocketBody2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a9ab5" />
              <stop offset="70%" stopColor="#e2ecf5" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="wingGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2c3e50" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect x="2" y="10" width="4" height="6" rx="1" fill="#1c2541" />
          <path
            d="M6 13 C12 8, 36 9, 52 13 C36 17, 12 18, 6 13 Z"
            fill="url(#rocketBody2)"
          />
          <path d="M14 9 L6 3 L19 8 Z" fill="url(#wingGrad2)" />
          <path d="M14 17 L6 23 L19 18 Z" fill="url(#wingGrad2)" />
          <circle cx="40" cy="13" r="2.5" fill="#f59e0b" />
        </svg>
      </div>

      <div className="rocket-flight rocket-3">
        <div className="rocket-exhaust-flame cyan-exhaust" />
        <svg
          viewBox="0 0 46 22"
          className="rocket-svg"
          width="38"
          height="18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 11 C10 7, 30 8, 44 11 C30 14, 10 15, 4 11 Z"
            fill="#EDF3F8"
          />
          <path d="M10 7 L3 2 L15 7 Z" fill="#5BC0DE" />
          <path d="M10 15 L3 20 L15 15 Z" fill="#5BC0DE" />
          <ellipse cx="34" cy="11" rx="3" ry="1.5" fill="#5BC0DE" />
        </svg>
      </div>

      <div className="rocket-flight rocket-4">
        <div className="rocket-exhaust-flame amber-exhaust" />
        <svg
          viewBox="0 0 52 24"
          className="rocket-svg"
          width="42"
          height="19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12 C14 6, 36 7, 48 12 C36 17, 14 18, 5 12 Z"
            fill="#E2ECF5"
          />
          <path d="M15 8 L8 1 L22 7 Z" fill="#D97706" />
          <path d="M15 16 L8 23 L22 17 Z" fill="#D97706" />
          <circle cx="36" cy="12" r="2" fill="#F59E0B" />
        </svg>
      </div>

      <div className="rocket-flight rocket-5">
        <div className="rocket-exhaust-flame cyan-exhaust" />
        <svg
          viewBox="0 0 40 20"
          className="rocket-svg"
          width="32"
          height="16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 10 C9 6, 26 7, 38 10 C26 13, 9 14, 3 10 Z"
            fill="#FFFFFF"
          />
          <path d="M9 6 L3 2 L14 6 Z" fill="#38BDF8" />
          <path d="M9 14 L3 18 L14 14 Z" fill="#38BDF8" />
        </svg>
      </div>

      {/* Subtle periodic cosmic shooting stars */}
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />

      {/* Living animated stars */}
      {stars.map((star, index) => (
        <i
          key={index}
          className={`star-${star.tier} star-${star.animationType}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
