// components/base/CustomSlider.tsx
"use client";

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
}: CustomSliderProps) {
  // Default formatters if none provided
  const defaultFormatValue = (val: number) => val.toString();
  const defaultFormatMinMax = (val: number) => val.toString();

  const valueFormatter = formatValue || defaultFormatValue;
  const minMaxFormatter = formatMinMax || defaultFormatMinMax;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Current Value */}
      <div className="flex justify-between items-center">
        <label className="text-text-default text-xs font-medium">{label}</label>
        <span className="text-gray-500 text-xs">{valueFormatter(value)}</span>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
      />

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minMaxFormatter(min)}</span>
        <span>{minMaxFormatter(max)}</span>
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
