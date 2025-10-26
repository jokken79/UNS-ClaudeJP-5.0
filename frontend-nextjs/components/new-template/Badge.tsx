import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color = "primary", className = "" }) => {
  let bgColor, textColor;

  switch (color) {
    case "primary":
      bgColor = "bg-primary";
      textColor = "text-white";
      break;
    case "secondary":
      bgColor = "bg-gray-200 dark:bg-gray-700";
      textColor = "text-gray-800 dark:text-gray-200";
      break;
    case "success":
      bgColor = "bg-green-500";
      textColor = "text-white";
      break;
    case "danger":
      bgColor = "bg-red-500";
      textColor = "text-white";
      break;
    case "warning":
      bgColor = "bg-yellow-500";
      textColor = "text-white";
      break;
    case "info":
      bgColor = "bg-blue-500";
      textColor = "text-white";
      break;
    case "dark":
      bgColor = "bg-gray-800 dark:bg-gray-900";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-primary";
      textColor = "text-white";
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-medium ${bgColor} ${textColor} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
