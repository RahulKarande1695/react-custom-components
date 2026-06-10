import { useEffect, useRef, useState } from "react";

function Stopwatch() {
  const [time, setTime] = useState<number>(0);

  const stopWatchRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null); // setInterval id stored

  const startInterval = () => {
    if (intervalRef.current !== null) return; // already running

    intervalRef.current = window.setInterval(() => {
      setTime(new Date().getTime() - stopWatchRef.current);
    }, 10);
  };

  const handleStart = () => {
    stopWatchRef.current = new Date().getTime() - time;
    startInterval();
  };

  const handlePause = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    handlePause();
    setTime(0);
  };

  // handleBlur, handleFocus Tab switching problem solve karne ke liye hain.
  useEffect(() => {
    const handleBlur = () => {
      handlePause(); 
    };

    const handleFocus = () => {
      if (time !== 0) {
        stopWatchRef.current = new Date().getTime() - time;
        startInterval();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [time]);

  const formatTime = (time: number) => {
    const ms = Math.floor((time % 1000) / 10).toString().padStart(2, "0");
    const s = Math.floor((time / 1000) % 60).toString().padStart(2, "0");
    const m = Math.floor((time / (1000 * 60)) % 60).toString().padStart(2, "0");
    const h = Math.floor(time / (1000 * 60 * 60)).toString().padStart(2, "0");

    return `${h}:${m}:${s}:${ms}`;
  };

  return (
    <div className="stopwatchContainer">
      <span className="time">{formatTime(time)}</span>
      <div>
        <button onClick={handleStart}>Start</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default Stopwatch;