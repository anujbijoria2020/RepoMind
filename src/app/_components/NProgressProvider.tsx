
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function NProgressProvider() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      NProgress.start();
      setTimeout(() => NProgress.done(), 300); // optional minimum delay
      previousPath.current = pathname;
    }
  }, [pathname]);

  return null;
}
