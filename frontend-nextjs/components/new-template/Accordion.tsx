import React, { useState } from "react";

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-stroke dark:border-strokedark">
      <button
        className="flex w-full items-center justify-between py-4 text-left font-medium text-black dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className="inline-flex">
          <svg
            className={`fill-current transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.00039 11.4269C7.85039 11.4269 7.70039 11.3736 7.58789 11.2611L1.35039 5.0236C1.12539 4.7986 1.12539 4.4236 1.35039 4.1986C1.57539 3.9736 1.95039 3.9736 2.17539 4.1986L8.00039 10.0236L13.8254 4.1986C14.0504 3.9736 14.4254 3.9736 14.6504 4.1986C14.8754 4.4236 14.8754 4.7986 14.6504 5.0236L8.41289 11.2611C8.30039 11.3736 8.15039 11.4269 8.00039 11.4269Z"
              fill=""
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-screen" : "max-h-0"}`}
      >
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
