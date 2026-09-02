"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordPageView } from "@/lib/analytics";

export function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTracked = useRef<string>("");

    useEffect(() => {
        if (!pathname) return;
        const dept = searchParams?.get("dept") || null;
        const key = `${pathname}?dept=${dept || "GENEL"}`;

        if (lastTracked.current === key) return;
        lastTracked.current = key;

        // Asynchronously record page view without blocking UI
        recordPageView(pathname, dept);
    }, [pathname, searchParams]);

    return null;
}
