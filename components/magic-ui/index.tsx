import { cn } from "@/lib/utils";
import React from "react";

// ===== ANIMATED GRADIENT TEXT =====
interface AnimatedGradientTextProps {
    children: React.ReactNode;
    className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
    return (
        <span
            className={cn(
                "inline-flex animate-gradient bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-[length:200%] bg-clip-text text-transparent",
                className
            )}
        >
            {children}
        </span>
    );
}

// ===== BLUR FADE =====
interface BlurFadeProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    inView?: boolean;
}

export function BlurFade({ children, className, delay = 0, duration = 0.4 }: BlurFadeProps) {
    return (
        <div
            className={cn("animate-blur-fade", className)}
            style={{
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
            }}
        >
            {children}
        </div>
    );
}

// ===== SHIMMER BUTTON =====
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    shimmerColor?: string;
    background?: string;
}

export function ShimmerButton({
    children,
    className,
    shimmerColor = "#ffffff",
    background = "rgba(0, 0, 0, 1)",
    ...props
}: ShimmerButtonProps) {
    return (
        <button
            className={cn(
                "relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg px-6 py-2 font-medium",
                "transition-all duration-300 hover:scale-[1.02]",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                className
            )}
            style={{ background }}
            {...props}
        >
            {children}
        </button>
    );
}

// ===== BORDER BEAM =====
interface BorderBeamProps {
    className?: string;
    size?: number;
    duration?: number;
    anchor?: number;
    borderWidth?: number;
    colorFrom?: string;
    colorTo?: string;
    delay?: number;
}

export function BorderBeam({
    className,
    size = 200,
    duration = 12,
    anchor = 90,
    borderWidth = 1.5,
    colorFrom = "#7c3aed",
    colorTo = "#06b6d4",
    delay = 0,
}: BorderBeamProps) {
    return (
        <div
            style={
                {
                    "--size": size,
                    "--duration": duration,
                    "--anchor": anchor,
                    "--border-width": borderWidth,
                    "--color-from": colorFrom,
                    "--color-to": colorTo,
                    "--delay": `-${delay}s`,
                } as React.CSSProperties
            }
            className={cn(
                "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
                "[background:linear-gradient(white,white)_padding-box,conic-gradient(from_calc(270deg-(var(--spread)*0.5deg)),transparent_0,var(--color-from)_10%,var(--color-to)_90%,transparent)_border-box]",
                "dark:[background:linear-gradient(#111_0_0)_padding-box,conic-gradient(from_calc(270deg-(var(--spread)*0.5deg)),transparent_0,var(--color-from)_10%,var(--color-to)_90%,transparent)_border-box]",
                "animate-border-beam",
                className
            )}
        />
    );
}

// ===== METEORS =====
interface MeteorsProps {
    numero?: number;
}

export function Meteors({ numero = 20 }: MeteorsProps) {
    const meteoros = Array.from({ length: numero }, (_, i) => i);
    return (
        <>
            {meteoros.map((i) => (
                <span
                    key={i}
                    className={cn(
                        "pointer-events-none absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full bg-slate-500",
                        "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-slate-500 before:to-transparent"
                    )}
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.6 + 0.2}s`,
                        animationDuration: `${Math.floor(Math.random() * 5) + 3}s`,
                    }}
                />
            ))}
        </>
    );
}
