import { useMemo, useState } from "react";

const years = Array.from(
  { length: 21 },
  (_, index) => 2020 + index
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CustomCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Empty cells before 1st date
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Actual dates
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;

    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  return (
    <div
      style={{
        width: "320px",
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <button onClick={handlePrevMonth}>◀</button>

        <h3>
          {monthName} {year}
        </h3>

        <button onClick={handleNextMonth}>▶</button>
      </div>

      <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <select
    value={month}
    onChange={(e) =>
      setCurrentDate(
        new Date(
          year,
          Number(e.target.value),
          1
        )
      )
    }
  >
    {months.map((monthName, index) => (
      <option key={monthName} value={index}>
        {monthName}
      </option>
    ))}
  </select>

  <select
    value={year}
    onChange={(e) =>
      setCurrentDate(
        new Date(
          Number(e.target.value),
          month,
          1
        )
      )
    }
  >
    {years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>

      {/* Week Names */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <div key={day}>{day}</div>
          )
        )}
      </div>

      {/* Dates */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => {
              if (!day) return;

              setSelectedDate(
                new Date(year, month, day)
              );
            }}
            style={{
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: day ? "pointer" : "default",
              border: "1px solid #eee",
              backgroundColor:
                day && isSelected(day)
                  ? "#2563eb"
                  : "white",
              color:
                day && isSelected(day)
                  ? "white"
                  : "black",
              borderRadius: "6px",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div style={{ marginTop: "16px" }}>
          Selected:
          {" "}
          {selectedDate.toDateString()}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;