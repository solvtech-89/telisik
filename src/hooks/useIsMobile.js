import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const mediaQuery = `(max-width: ${breakpoint}px)`;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(mediaQuery).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia(mediaQuery);
    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(media.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [mediaQuery]);

  return isMobile;
}
