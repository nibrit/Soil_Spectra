import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  helpText?: string;
  displayValue: string;
  gradient?: string;
  markers?: Array<{ value: number; label: string }>;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  helpText,
  displayValue,
  gradient = 'from-blue-500 to-green-500',
  markers = []
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {helpText && (
            <div className="group relative ml-1">
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {helpText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
          {displayValue}
        </span>
      </div>

      <div className="relative">
        <div
          className={`absolute h-2 top-0 left-0 bg-gradient-to-r ${gradient} rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            outline: 'none'
          }}
        />
      </div>

      {markers.length > 0 && (
        <div className="flex justify-between mt-1">
          {markers.map((marker, index) => {
            const markerPosition = ((marker.value - min) / (max - min)) * 100;
            return (
              <div 
                key={index} 
                className="text-xs text-gray-500 relative"
                style={{ left: `${markerPosition}%`, marginLeft: `-${markerPosition / 100}rem` }}
              >
                {marker.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};