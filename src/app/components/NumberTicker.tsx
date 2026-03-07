"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
    isDecimal = false,
    decimalPlaces = 1,
}: {
    value: number;
    direction?: "up" | "down";
    className?: string;
    delay?: number; // delay in s
    isDecimal?: boolean;
    decimalPlaces?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    const [displayValue, setDisplayValue] = useState(direction === "down" ? value.toFixed(isDecimal ? decimalPlaces : 0) : "0");

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(direction === "down" ? 0 : value);
            }, delay * 1000);
        }
    }, [motionValue, isInView, delay, value, direction]);

    useEffect(
        () =>
            springValue.on("change", (latestVal) => {
                if (ref.current) {
                    ref.current.textContent = Intl.NumberFormat("tr-TR", {
                        minimumFractionDigits: isDecimal ? decimalPlaces : 0,
                        maximumFractionDigits: isDecimal ? decimalPlaces : 0,
                    }).format(latestVal);
                }
            }),
        [springValue, isDecimal, decimalPlaces],
    );

    return (
        <span
            className={className}
            ref={ref}
        >
            {displayValue}
        </span>
    );
}
