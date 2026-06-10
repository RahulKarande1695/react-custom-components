import React, { useEffect, useState } from "react";

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    let frameId: number;

    const updateClock = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

      setTime(`${hours}:${minutes}:${seconds}:${milliseconds}`);

      frameId = requestAnimationFrame(updateClock);
    };

    updateClock();

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div style={{ fontSize: "2rem", fontFamily: "monospace" }}>
      {time}
    </div>
  );
};

export default DigitalClock;