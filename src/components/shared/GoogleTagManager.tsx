"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const GoogleTagManager = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "pageview",
        page: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams]);

  return null;
};
