import React from "react";
import { PLATFORM_ICONS } from "../../utils/styles";

export function getPlatformIcon(platform) {
  return PLATFORM_ICONS[platform] || "📱";
}

export default function PlatformIcon({ platform, size = 20 }) {
  return <span style={{ fontSize: size }}>{getPlatformIcon(platform)}</span>;
}
