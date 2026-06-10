import { useEffect, useState } from "react";
import "./overLappingCircle.css";

interface Position {
  x: number;
  y: number;
  id: number;
  overlap: boolean;
  color: string;
}

const SIZE = 120;

const OverLappingCircle = () => {
  const [circles, setCircles] = useState<Position[]>([]);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const getRandomColor = () => {
    const colors = [
      "#ff4d4d",
      "#00c853",
      "#2962ff",
      "#ff9100",
      "#d500f9",
      "#00b8d4",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const x = event.clientX;
    const y = event.clientY;

    setCircles((prev) => {
      let overlapFound = false;

      const updated = prev.map((circle) => {
        const dx = circle.x - x;
        const dy = circle.y - y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < SIZE) {
          overlapFound = true;

          return {
            ...circle,
            overlap: true,
            color: getRandomColor(),
          };
        }

        return circle;
      });

      updated.push({
        x,
        y,
        id: Date.now(),
        overlap: overlapFound,
        color: getRandomColor(),
      });

      return [...updated];
    });
  };

  return (
    <div>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          x={circle.x}
          y={circle.y}
          overlap={circle.overlap}
          color={circle.color}
        />
      ))}
    </div>
  );
};

interface CircleProps {
  x: number;
  y: number;
  overlap: boolean;
  color: string;
}

const Circle = ({ x, y, overlap, color }: CircleProps) => {
  return (
    <div
      className={`circle ${overlap ? "overlap" : ""}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        background: color,
        border: `2px solid ${color}`,
      }}
    ></div>
  );
};

export default OverLappingCircle;
