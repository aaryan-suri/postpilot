import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { STYLES } from "../../utils/styles";
import Navbar from "./Navbar";
import Footer from "../Landing/Footer";
import GradientButton from "../shared/GradientButton";

export default function MarketingLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        ...STYLES.page,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0c0c0e 0%, #0A0A0B 50%, #080809 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 900,
          height: "60vh",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,89,49,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "glow-pulse 6s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <Navbar
        onLogoClick={() => navigate("/")}
        showBack={false}
        scrolled={scrolled}
        rightContent={
          <GradientButton onClick={() => navigate("/onboard")} size="sm" withArrow>
            Get Started
          </GradientButton>
        }
      />
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}
