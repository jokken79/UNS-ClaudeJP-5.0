import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  let baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200";
  let variantStyles = "";
  let sizeStyles = "";

  switch (variant) {
    case "primary":
      variantStyles = "bg-primary text-white hover:bg-primary-dark";
      break;
    case "secondary":
      variantStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";
      break;
    case "outline":
      variantStyles = "border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800";
      break;
    case "text":
      variantStyles = "text-primary hover:bg-gray-100 dark:hover:bg-gray-800";
      break;
  }

  switch (size) {
    case "sm":
      sizeStyles = "px-3 py-1.5 text-sm";
      break;
    case "md":
      sizeStyles = "px-4 py-2 text-base";
      break;
    case "lg":
      sizeStyles = "px-5 py-2.5 text-lg";
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
