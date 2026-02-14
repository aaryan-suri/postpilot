import React from "react";
import { STYLES } from "../../utils/styles";
import Navbar from "../Layout/Navbar";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import HowItWorks from "./HowItWorks";
import GradientButton from "../shared/GradientButton";

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ ...STYLES.page, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,89,49,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,185,49,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <Navbar
        onLogoClick={() => {}}
        showBack={false}
        rightContent={
          <GradientButton onClick={onGetStarted} size="sm">
            Get Started →
          </GradientButton>
        }
        style={{ position: "relative", zIndex: 10 }}
      />
      <HeroSection onGetStarted={onGetStarted} />
      <StatsSection />
      <HowItWorks />
    </div>
  );
}
