import { useState, useEffect } from "react";

// Media query breakpoints
export const breakpoints = {
  small: "(max-width: 772px)",     // Mobile
  medium: "(max-width: 1024px)",   // Tablets
  large: "(max-width: 1279px)",     // Laptops/PCs
  xLarge: "(min-width: 1280px)"     // Laptops/PCs
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Handle SSR cases where window is not available
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia(query);
    
    // Update the state initially
    setMatches(media.matches);
    
    // Define callback for media query change
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Add the listener
    media.addEventListener("change", listener);
  
    // Clean up
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};

// Named hooks for specific breakpoints
export const useIsSmall = () => useMediaQuery(breakpoints.small);
export const useIsMedium = () => useMediaQuery(breakpoints.medium);
export const useIsLarge = () => useMediaQuery(breakpoints.large);
export const useIsXLarge = () => useMediaQuery(breakpoints.xLarge);

export default useMediaQuery;