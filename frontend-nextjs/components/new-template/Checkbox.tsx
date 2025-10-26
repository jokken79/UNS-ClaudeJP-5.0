import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className = "", ...props }) => {
  return (
    <label className={`flex items-center ${className}`}>
      <input type="checkbox" className="form-checkbox" {...props} />
      {label && <span className="ml-2 text-sm text-black dark:text-white">{label}</span>}
    </label>
  );
};

export default Checkbox;
