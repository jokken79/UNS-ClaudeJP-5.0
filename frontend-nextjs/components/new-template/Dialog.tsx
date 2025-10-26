import React from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <h3 className="text-xl font-medium text-black dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
