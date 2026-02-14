import React from "react";
import { STYLES } from "../../utils/styles";

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = React.useState(value);
  React.useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function StatsRow({ stats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 36,
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} style={{ ...STYLES.card, padding: "20px 22px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontWeight: 500 }}>
            {stat.icon} {stat.label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "-1px" }}>
            <AnimatedNumber value={stat.value} />
          </div>
        </div>
      ))}
    </div>
  );
}
