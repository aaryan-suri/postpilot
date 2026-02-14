import React from "react";
import { STYLES } from "../../utils/styles";

export default function Analytics() {
  return (
    <div style={{ ...STYLES.card, padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Analytics coming soon</div>
      <div style={{ ...STYLES.sub, maxWidth: 400, margin: "0 auto" }}>
        Once your posts go live, you'll see engagement metrics, follower growth, best posting times,
        and conversion tracking.
      </div>
    </div>
  );
}
