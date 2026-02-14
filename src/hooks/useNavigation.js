import { useState, useCallback } from "react";

export function useNavigation(initialScreen = "landing") {
  const [screen, setScreen] = useState(initialScreen);
  const [screenHistory, setScreenHistory] = useState([initialScreen]);

  const navigateTo = useCallback((s) => {
    setScreenHistory((prev) => [...prev, s]);
    setScreen(s);
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev];
      next.pop();
      setScreen(next[next.length - 1]); // Sync screen with new history top
      return next;
    });
  }, []);

  return { screen, screenHistory, navigateTo, goBack };
}
