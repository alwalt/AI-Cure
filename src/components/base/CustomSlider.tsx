// components/base/CustomSlider.tsx
"use client";
import { useState, useRef } from "react";
import InfoModal from "@/components/base/InfoModal";

interface CustomSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  formatMinMax?: (value: number) => string;
  className?: string;
  infoTitle?: string;
  infoDescription?: string;
}

export default function CustomSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  formatMinMax,
  className = "",
  infoTitle,
  infoDescription,
}: CustomSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Default formatters if none provided
  const defaultFormatValue = (val: number) => val.toString();
  const defaultFormatMinMax = (val: number) => val.toString();

  const valueFormatter = formatValue || defaultFormatValue;
  const minMaxFormatter = formatMinMax || defaultFormatMinMax;

  // Calculate thumb position as percentage
  const thumbPosition = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label with Optional Info Icon */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-text-default text-xs font-medium">
            {label}
          </label>
          {infoTitle && infoDescription && (
            <InfoModal title={infoTitle} description={infoDescription} />
          )}
        </div>
      </div>

      {/* Slider Container with Min/Max Labels */}
      <div className="relative">
        {/* Min/Max Labels alongside slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-default min-w-fit">
            {minMaxFormatter(min)}
          </span>

          <div className="relative flex-1">
            {/* Dynamic value tooltip */}
            <div
              className="absolute -top-8 transform -translate-x-1/2 transition-opacity duration-200"
              style={{
                left: `${thumbPosition}%`,
                opacity: showTooltip ? 1 : 0,
              }}
            >
              <div className="bg-gray-900 text-text-default text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {valueFormatter(value)}
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>

            {/* Slider Input */}
            <input
              ref={sliderRef}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <span className="text-xs text-text-default min-w-fit">
            {minMaxFormatter(max)}
          </span>
        </div>
      </div>

      {/* Current value display below slider */}
      <div className="text-center">
        <span className="text-xs text-gray-400">
          Current: {valueFormatter(value)}
        </span>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--blue-300);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--blue-300);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
