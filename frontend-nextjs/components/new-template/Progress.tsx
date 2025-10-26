import React from "react";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, max = 100, className = "" }) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 ${className}`}>
      <div
        className="bg-primary h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default Progress;
