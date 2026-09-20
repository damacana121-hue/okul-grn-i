import React from "react";

export const DecorativeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Soft gradient backdrop: Blue to Purple */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 transition-colors duration-500" />

      {/* Subtle glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* School themed decorative watermark shapes with ultra-low opacity (3-5%) */}
      <svg
        className="absolute inset-0 w-full h-full text-indigo-200/5 dark:text-indigo-100/[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="school-pattern" width="240" height="240" patternUnits="userSpaceOnUse">
            {/* Book icon */}
            <path
              d="M 20 40 Q 40 30 60 40 L 60 70 Q 40 60 20 70 Z M 60 40 Q 80 30 100 40 L 100 70 Q 80 60 60 70 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Pencil icon */}
            <path
              d="M 170 30 L 190 50 L 150 90 L 135 95 L 140 80 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Math Symbol: Pi */}
            <path
              d="M 40 160 L 70 160 M 48 160 L 48 185 M 62 160 L 62 185 Q 62 188 66 188"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Graduation Cap */}
            <polygon points="170,140 200,152 170,164 140,152" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 155 158 C 155 170 185 170 185 158" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Calendar grid */}
            <rect x="100" y="105" width="26" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="100" y1="113" x2="126" y2="113" stroke="currentColor" strokeWidth="1.5" />
            {/* Little stars */}
            <polygon points="30,110 32,115 37,116 33,120 34,125 30,122 26,125 27,120 23,116 28,115" fill="currentColor" />
            <polygon points="210,100 211,103 214,104 212,106 213,109 210,107 207,109 208,106 206,104 209,103" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#school-pattern)" />
      </svg>
    </div>
  );
};
