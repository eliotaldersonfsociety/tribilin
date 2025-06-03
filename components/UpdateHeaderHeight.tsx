"use client";

import { useEffect } from "react";

export function UpdateHeaderHeight() {
  useEffect(() => {
    const updateVars = () => {
      const header = document.querySelector("header");
      const footer = document.querySelector("#site-footer");

      if (header) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${header.clientHeight}px`
        );
      }

      if (footer) {
        document.documentElement.style.setProperty(
          "--footer-height",
          `${footer.clientHeight}px`
        );
      }
    };

    updateVars();
    window.addEventListener("resize", updateVars);
    return () => window.removeEventListener("resize", updateVars);
  }, []);

  return null;
}
