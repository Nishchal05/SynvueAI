import React from "react";
import { motion } from "framer-motion";

const gradients = (
  <defs>
    <linearGradient id="synvue-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" className="[stop-color:#22d3ee] dark:[stop-color:#60a5fa]" />
      <stop offset="50%" className="[stop-color:#818cf8] dark:[stop-color:#a78bfa]" />
      <stop offset="100%" className="[stop-color:#f472b6] dark:[stop-color:#f472b6]" />
    </linearGradient>
    <radialGradient id="synvue-glow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" className="[stop-color:rgba(99,102,241,0.35)]" />
      <stop offset="100%" className="[stop-color:rgba(99,102,241,0)]" />
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <clipPath id="ringClip">
      <circle cx="32" cy="32" r="27" />
    </clipPath>
  </defs>
);

const BrandMark = ({ animate = true }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="SynvueAI logo mark"
      className="block drop-shadow-sm"
    >
      {gradients}
      <circle cx="32" cy="32" r="27" fill="url(#synvue-glow)" />
      <motion.circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="url(#synvue-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0.3, rotate: 0 }}
        animate={
          animate
            ? {
                pathLength: [0.3, 1, 0.3],
                rotate: [0, 360],
              }
            : { pathLength: 1, rotate: 0 }
        }
        transition={
          animate
            ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        style={{ originX: 0.5, originY: 0.5 }}
      />
      <motion.path
        d="M16 40c6-8 14-8 20-8s12 0 12-8"
        fill="none"
        stroke="url(#synvue-grad)"
        strokeWidth="3.25"
        strokeLinecap="round"
        filter="url(#softGlow)"
        initial={{ pathLength: 0 }}
        animate={animate ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={animate ? { duration: 1.2, delay: 0.15, ease: "easeOut" } : {}}
      />
      <motion.path
        d="M18 28l14 14 14-14"
        fill="none"
        stroke="url(#synvue-grad)"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#softGlow)"
        initial={{ opacity: 0, y: -2 }}
        animate={animate ? { opacity: 1, y: 0 } : { opacity: 1 }}
        transition={animate ? { duration: 0.6, delay: 0.45, ease: "easeOut" } : {}}
      />
      <motion.circle
        cx="32"
        cy="32"
        r="4.2"
        fill="url(#synvue-grad)"
        initial={{ scale: 0 }}
        animate={animate ? { scale: [0, 1, 1.06, 1] } : { scale: 1 }}
        transition={animate ? { duration: 0.9, delay: 0.3, ease: "easeOut" } : {}}
      />
      <g clipPath="url(#ringClip)">
        <motion.rect
          x="-64"
          y="0"
          width="64"
          height="64"
          fill="url(#synvue-grad)"
          opacity={0.15}
          initial={{ x: -64 }}
          animate={
            animate ? { x: [ -64, 64 ] } : { x: -64 }
          }
          transition={animate ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" } : {}}
        />
      </g>
    </svg>
  );
};

const Wordmark = ({ size = 64 }) => (
  <div
    className="select-none leading-none font-semibold tracking-tight"
    style={{ fontSize: Math.max(14, size * 0.38) }}
  >
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 dark:from-sky-400 dark:via-violet-400 dark:to-fuchsia-400">
      Synvue
    </span>
    <span className="text-slate-700 dark:text-slate-200">AI</span>
  </div>
);

export default function SynvueLogo({ size = 64, showWordmark = true, animate = true, className = "" }) {
  return (
    <div
      className={"inline-flex items-center gap-3 " + className}
      style={{
        width: size,
        height: size,
      }}
    >
      <div style={{ width: size, height: size }} className="shrink-0">
        <BrandMark animate={animate} />
      </div>
      {showWordmark && <Wordmark size={size} />}
    </div>
  );
}
