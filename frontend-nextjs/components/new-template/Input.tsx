import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className={`form-control ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input className="form-input" {...props} />
    </div>
  );
};

export default Input;
