import React from "react";

interface RadioGroupProps {
  name: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="form-radio text-primary"
          />
          <span className="ml-2 text-black dark:text-white">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
