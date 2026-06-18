import React, { useEffect, useState } from "react";

interface ProgressProps {
  progress: number;
}

const Progress: React.FC<ProgressProps> = ({ progress }) => {
  return (
    <div
      style={{
        width: "300px",
        height: "30px",
        border: "1px solid black",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "green",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
};

const AnimatedProgress: React.FC<ProgressProps> = ({ progress }) => {
  return (
    <div
      style={{
        width: "400px",
        height: "25px",
        border: "1px solid #ddd",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "blue",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
};

const AnimatedProgressBar: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }

        return prev + 5;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Animated Progress: {progress}%</h2>

      <AnimatedProgress progress={progress} />
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const [progress, setProgress] = useState<number>(0);

  const increaseProgress = (): void => {
    setProgress((prev) => Math.min(prev + 10, 100));
  };

  return (
    <div>
      <h2>Controlled Progress: {progress}%</h2>

      <Progress progress={progress} />

      <button
        onClick={increaseProgress}
        style={{ marginTop: "10px" }}
      >
        Increase
      </button>

      <AnimatedProgressBar />
    </div>
  );
};

export default ProgressBar;