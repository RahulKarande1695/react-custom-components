import { useMemo, useState } from "react";

type TimeFormat = "12h" | "24h";

const TimePicker = () => {
  const [format, setFormat] = useState<TimeFormat>("12h");
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const hours = useMemo(() => {
    if (format === "12h") {
      return Array.from(
        { length: 12 },
        (_, i) => String(i + 1).padStart(2, "0")
      );
    }

    return Array.from(
      { length: 24 },
      (_, i) => String(i).padStart(2, "0")
    );
  }, [format]);

  const minutes = Array.from(
    { length: 60 },
    (_, i) => String(i).padStart(2, "0")
  );

  return (
    <div
      style={{
        width: "300px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>Custom Time Picker</h3>

      {/* Format Selection */}

      <select
        value={format}
        onChange={(e) => {
          setFormat(e.target.value as TimeFormat);
          setHour(
            e.target.value === "12h" ? "01" : "00"
          );
        }}
      >
        <option value="12h">12 Hours</option>
        <option value="24h">24 Hours</option>
      </select>

      <br />
      <br />

      {/* Time Selection */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        :

        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {format === "12h" && (
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        )}
      </div>

      <hr />

      <h4>
        Selected Time:
        {hour}:{minute}
        {format === "12h" ? ` ${period}` : ""}
      </h4>
    </div>
  );
};

export default TimePicker;