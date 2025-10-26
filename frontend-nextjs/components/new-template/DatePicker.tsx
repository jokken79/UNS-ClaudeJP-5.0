import React, { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

interface DatePickerProps {
  label?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, className = "" }) => {
  const [date, setDate] = useState<Date | Date[] | null>(null);

  return (
    <div className={`form-control ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <Flatpickr
        className="form-input"
        value={date}
        onChange={([date]) => {
          setDate(date);
        }}
        options={{
          mode: "single",
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "F j, Y",
          appendTo: document.body, // Append to body to avoid z-index issues
        }}
      />
    </div>
  );
};

export default DatePicker;
