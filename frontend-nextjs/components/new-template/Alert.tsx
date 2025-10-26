import React from "react";

interface AlertProps {
  type: "success" | "danger" | "warning" | "info";
  message: string;
  description?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, description }) => {
  let bgColor, borderColor, textColor;

  switch (type) {
    case "success":
      bgColor = "bg-green-100 dark:bg-green-500/20";
      borderColor = "border-green-500";
      textColor = "text-green-800 dark:text-green-400";
      break;
    case "danger":
      bgColor = "bg-red-100 dark:bg-red-500/20";
      borderColor = "border-red-500";
      textColor = "text-red-800 dark:text-red-400";
      break;
    case "warning":
      bgColor = "bg-yellow-100 dark:bg-yellow-500/20";
      borderColor = "border-yellow-500";
      textColor = "text-yellow-800 dark:text-yellow-400";
      break;
    case "info":
      bgColor = "bg-blue-100 dark:bg-blue-500/20";
      borderColor = "border-blue-500";
      textColor = "text-blue-800 dark:text-blue-400";
      break;
    default:
      bgColor = "bg-gray-100 dark:bg-gray-500/20";
      borderColor = "border-gray-500";
      textColor = "text-gray-800 dark:text-gray-400";
  }

  return (
    <div
      className={`rounded-lg border p-4 ${bgColor} ${borderColor} ${textColor}`}
      role="alert"
    >
      <strong className="font-bold">{message}</strong>
      {description && <span className="block sm:inline"> {description}</span>}
    </div>
  );
};

export default Alert;
