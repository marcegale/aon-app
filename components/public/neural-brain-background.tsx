"use client";

type NeuralBrainBackgroundProps = {
  className?: string;
  compact?: boolean;
};

export function NeuralBrainBackground({
  className = "",
  compact = false,
}: NeuralBrainBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <style jsx>{`
        .brain-rotator {
          animation: brainFloat 14s ease-in-out infinite,
            brainRotate 28s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .brain-core {
          animation: brainPulse 5s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .brain-glow-a {
          animation: glowShiftA 6s ease-in-out infinite;
        }

        .brain-glow-b {
          animation: glowShiftB 7.5s ease-in-out infinite;
        }

        .brain-glow-c {
          animation: glowShiftC 8.2s ease-in-out infinite;
        }

        .orbit-a {
          animation: orbitSpinA 16s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .orbit-b {
          animation: orbitSpinB 22s linear infinite;
          transform-origin: center;
          transform-box: fill-box;
        }

        .scan-lines {
          animation: scanDrift 10s linear infinite;
        }

        .particles-a {
          animation: particlesFloatA 18s linear infinite;
        }

        .particles-b {
          animation: particlesFloatB 22s linear infinite;
        }

        @keyframes brainRotate {
          0% {
            transform: rotateY(0deg) rotateZ(-1deg);
          }
          50% {
            transform: rotateY(180deg) rotateZ(1deg);
          }
          100% {
            transform: rotateY(360deg) rotateZ(-1deg);
          }
        }

        @keyframes brainFloat {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.015);
          }
        }

        @keyframes brainPulse {
          0%,
          100% {
            opacity: 0.82;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        @keyframes glowShiftA {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes glowShiftB {
          0%,
          100% {
            opacity: 0.25;
          }
          45% {
            opacity: 0.95;
          }
        }

        @keyframes glowShiftC {
          0%,
          100% {
            opacity: 0.2;
          }
          55% {
            opacity: 0.9;
          }
        }

        @keyframes orbitSpinA {
          0% {
            transform: rotate(0deg);
            opacity: 0.22;
          }
          50% {
            opacity: 0.38;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.22;
          }
        }

        @keyframes orbitSpinB {
          0% {
            transform: rotate(360deg);
            opacity: 0.14;
          }
          50% {
            opacity: 0.28;
          }
          100% {
            transform: rotate(0deg);
            opacity: 0.14;
          }
        }

        @keyframes scanDrift {
          0% {
            transform: translateY(-6%);
            opacity: 0.14;
          }
          50% {
            opacity: 0.22;
          }
          100% {
            transform: translateY(6%);
            opacity: 0.14;
          }
        }

        @keyframes particlesFloatA {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-10px, 12px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes particlesFloatB {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(12px, -10px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>

      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_65%_45%,rgba(83,52,215,0.35),transparent_26%),radial-gradient(circle_at_72%_52%,rgba(36,133,255,0.28),transparent_18%),radial-gradient(circle_at_58%_58%,rgba(201,162,77,0.2),transparent_20%)]" />

      <div className="scan-lines absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(124,58,237,0.025),transparent)]" />

      <svg
        viewBox="0 0 1200 900"
        className={`absolute inset-0 z-[1] h-full w-full ${
            compact ? "opacity-100" : "opacity-100"
        }`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="brainGold" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#F0D28A" stopOpacity="1" />
            <stop offset="55%" stopColor="#C9A24D" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C9A24D" stopOpacity="0.05" />
          </radialGradient>

          <radialGradient id="brainBlue" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="1" />
            <stop offset="45%" stopColor="#3B82F6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.06" />
          </radialGradient>

          <radialGradient id="brainViolet" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="1" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.08" />
          </radialGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="hardGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(-160 0)">
        <g className="orbit-a">
            <ellipse
            cx="760"
            cy="470"
            rx="280"
            ry="110"
            fill="none"
            stroke="rgba(96,165,250,0.22)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            />
        </g>

        <g className="orbit-b">
            <ellipse
            cx="760"
            cy="470"
            rx="220"
            ry="170"
            fill="none"
            stroke="rgba(201,162,77,0.18)"
            strokeWidth="1.1"
            strokeDasharray="3 10"
            transform="rotate(-18 760 470)"
            />
        </g>

        <g className="particles-a">
            <circle cx="610" cy="260" r="2.5" fill="#C9A24D" opacity="0.75" />
            <circle cx="830" cy="250" r="2" fill="#60A5FA" opacity="0.8" />
            <circle cx="960" cy="360" r="2.2" fill="#8B5CF6" opacity="0.65" />
            <circle cx="560" cy="510" r="2" fill="#8B5CF6" opacity="0.6" />
            <circle cx="920" cy="580" r="2.2" fill="#C9A24D" opacity="0.75" />
        </g>

        <g className="particles-b">
            <circle cx="1020" cy="300" r="1.8" fill="#C9A24D" opacity="0.65" />
            <circle cx="700" cy="610" r="2" fill="#60A5FA" opacity="0.72" />
            <circle cx="890" cy="650" r="1.8" fill="#8B5CF6" opacity="0.7" />
            <circle cx="650" cy="340" r="1.7" fill="#60A5FA" opacity="0.65" />
        </g>

        <g className="brain-rotator">
            <g className="brain-core">
            <ellipse
                cx="760"
                cy="470"
                rx={compact ? "205" : "245"}
                ry={compact ? "145" : "175"}
                fill="rgba(11,18,32,0.18)"
                filter="url(#softGlow)"
            />

            <path
                d="M600 420
                C620 335, 700 285, 780 300
                C845 245, 960 285, 990 385
                C1045 405, 1070 470, 1040 535
                C1038 610, 970 652, 905 638
                C860 685, 780 692, 725 658
                C655 668, 595 628, 580 560
                C540 520, 545 455, 600 420Z"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1.2"
            />

            <path
                d="M615 428
                C635 352, 708 314, 775 325
                C842 270, 942 304, 968 392
                C1018 412, 1040 467, 1018 525
                C1012 590, 954 626, 895 616
                C853 653, 787 660, 738 632
                C676 638, 625 603, 612 550
                C578 515, 582 460, 615 428Z"
                fill="none"
                stroke="url(#brainBlue)"
                strokeOpacity="0.6"
                strokeWidth="1.8"
                filter="url(#hardGlow)"
            />

            <path
                d="M638 372 C705 335, 784 336, 845 366"
                fill="none"
                stroke="url(#brainGold)"
                strokeWidth="1.6"
                strokeOpacity="0.7"
                filter="url(#hardGlow)"
            />
            <path
                d="M650 430 C728 402, 830 398, 934 428"
                fill="none"
                stroke="url(#brainViolet)"
                strokeWidth="1.5"
                strokeOpacity="0.65"
                filter="url(#hardGlow)"
            />
            <path
                d="M640 492 C725 468, 842 470, 958 504"
                fill="none"
                stroke="url(#brainBlue)"
                strokeWidth="1.4"
                strokeOpacity="0.7"
                filter="url(#hardGlow)"
            />
            <path
                d="M664 558 C748 548, 822 556, 906 594"
                fill="none"
                stroke="url(#brainGold)"
                strokeWidth="1.5"
                strokeOpacity="0.72"
                filter="url(#hardGlow)"
            />
            <path
                d="M748 590 C786 615, 818 635, 840 678"
                fill="none"
                stroke="url(#brainBlue)"
                strokeWidth="1.35"
                strokeOpacity="0.6"
                filter="url(#hardGlow)"
            />

            <g strokeWidth="1.15" fill="none" filter="url(#hardGlow)">
                <path
                d="M660 370 L708 410 L772 372 L822 420 L892 380 L948 432"
                stroke="url(#brainGold)"
                strokeOpacity="0.65"
                />
                <path
                d="M640 448 L706 470 L782 432 L854 470 L928 438"
                stroke="url(#brainBlue)"
                strokeOpacity="0.72"
                />
                <path
                d="M628 520 L704 526 L774 500 L850 538 L926 520"
                stroke="url(#brainViolet)"
                strokeOpacity="0.6"
                />
                <path
                d="M680 585 L736 560 L798 590 L862 572"
                stroke="url(#brainGold)"
                strokeOpacity="0.68"
                />
            </g>

            <g>
                {[
                [662, 370, "brain-glow-a", "#C9A24D"],
                [708, 410, "brain-glow-b", "#60A5FA"],
                [772, 372, "brain-glow-c", "#8B5CF6"],
                [822, 420, "brain-glow-a", "#C9A24D"],
                [892, 380, "brain-glow-b", "#60A5FA"],
                [948, 432, "brain-glow-c", "#8B5CF6"],
                [640, 448, "brain-glow-b", "#60A5FA"],
                [706, 470, "brain-glow-a", "#C9A24D"],
                [782, 432, "brain-glow-c", "#8B5CF6"],
                [854, 470, "brain-glow-b", "#60A5FA"],
                [928, 438, "brain-glow-a", "#C9A24D"],
                [628, 520, "brain-glow-c", "#8B5CF6"],
                [704, 526, "brain-glow-b", "#60A5FA"],
                [774, 500, "brain-glow-a", "#C9A24D"],
                [850, 538, "brain-glow-c", "#8B5CF6"],
                [926, 520, "brain-glow-b", "#60A5FA"],
                [680, 585, "brain-glow-a", "#C9A24D"],
                [736, 560, "brain-glow-b", "#60A5FA"],
                [798, 590, "brain-glow-c", "#8B5CF6"],
                [862, 572, "brain-glow-a", "#C9A24D"],
                [840, 678, "brain-glow-b", "#60A5FA"],
                ].map(([cx, cy, cls, fill], index) => (
                <circle
                    key={`${cx}-${cy}-${index}`}
                    cx={Number(cx)}
                    cy={Number(cy)}
                    r="3.2"
                    fill={String(fill)}
                    className={String(cls)}
                    filter="url(#hardGlow)"
                />
                ))}
            </g>
            </g>
        </g>
        </g>

      </svg>
    </div>
  );
}