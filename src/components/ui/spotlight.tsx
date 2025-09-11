import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1]  h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.5"
        ></ellipse>
        {/* Additional ellipses for multi-ray effect */}
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="2200"
          ry="400"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3500 2500)"
          fill={fill || "white"}
          fillOpacity="0.18"
        ></ellipse>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1800"
          ry="200"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3700 2100)"
          fill={fill || "white"}
          fillOpacity="0.12"
        ></ellipse>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1600"
          ry="150"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3600 2300)"
          fill={fill || "white"}
          fillOpacity="0.09"
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
};
