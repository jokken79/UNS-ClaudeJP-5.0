import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, className = "", ...props }) => {
  return (
    <label className={`form-label ${className}`} {...props}>
      {children}
    </label>
  );
};

export default Label;
