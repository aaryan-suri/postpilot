import { useCallback, useEffect, useRef, useState } from "react";
import {
  getEventImageSrc,
  regenerateEventImageSrc,
  createEventImageCacheKey,
} from "../utils/eventImageService";

/**
 * React hook for consuming the centralized event image service.
 *
 * Usage:
 *   const { src, loading, error, regenerate } = useEventImage(event, "announcement", orgName);
 */
export function useEventImage(event, type = "announcement", orgName = "") {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guards against setting state after unmount or when args change mid-flight
  const generationIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (opts = { forceFresh: false }) => {
      const id = ++generationIdRef.current;
      if (!event || typeof event !== "object") {
        setSrc(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextSrc = opts.forceFresh
          ? await regenerateEventImageSrc(event, type, orgName)
          : await getEventImageSrc(event, type, orgName);

        // Ignore out-of-date responses
        if (!mountedRef.current || id !== generationIdRef.current) return;

        setSrc(nextSrc);
        setLoading(false);
      } catch (err) {
        if (!mountedRef.current || id !== generationIdRef.current) return;

        const normalizedError =
          err instanceof Error ? err : new Error("Failed to generate event image");
        if (typeof window !== "undefined" && window.__PP_DEBUG_IMAGES__) {
          // eslint-disable-next-line no-console
          console.error("[useEventImage] Image generation failed:", normalizedError);
        }
        setError(normalizedError);
        setLoading(false);
      }
    },
    [event, type, orgName]
  );

  // Load whenever the relevant event image inputs change
  useEffect(() => {
    if (!event || typeof event !== "object") {
      setSrc(null);
      setError(null);
      setLoading(false);
      return;
    }

    load({ forceFresh: false });
  }, [event, type, orgName, load]);

  const regenerate = useCallback(() => {
    if (!event || typeof event !== "object") return;
    load({ forceFresh: true });
  }, [event, load]);

  // Expose the derived cache key for debugging if needed (not required by callers)
  const cacheKey = event
    ? createEventImageCacheKey(event, type, orgName)
    : createEventImageCacheKey(null, type, orgName);

  return { src, loading, error, regenerate, cacheKey };
}

