import { useEffect, useRef, useState } from "react";
import "./gridcolor.css";

interface Background {
  [key: number]: string;
}

const background: Background = {
  1: "on",
  0: "off",
  [-1]: "clicked",
};

const GridColor = () => {
  const [config, setConfig] = useState([
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
  ]);
  const clickedOrder = useRef<[number, number][]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timerRef.current.forEach((id) => clearTimeout(id));
    timerRef.current = [];
  };

  const rollBack = () => {
    clearAllTimers();

    let count = 1;
    for (let index = clickedOrder.current.length - 1; index >= 0; index--) {
      const [rowIndex, colIndex] = clickedOrder.current[index];
      const id = setTimeout(() => {
        setConfig((prev) => {
          const data = [...prev];
          data[rowIndex][colIndex] = 1;
          return [...data];
        });
      }, count * 1000);

      timerRef.current.push(id);
      count++;
    }
    clickedOrder.current = [];
  };

  const handleClick = (rowIndex: number, colIndex: number) => {
    clickedOrder.current.push([rowIndex, colIndex]);
    const updated = config.map((row, rI) =>
      row.map((col, cI) => (rI === rowIndex && cI === colIndex ? -1 : col))
    );
    const hasOne = updated.some((row) => row.includes(1));
    setConfig(updated);
    if (!hasOne) rollBack();
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className="container">
      {config.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${background[item]} box`}
            onClick={() => { if (item !== 0) handleClick(rowIndex, colIndex); }}
          ></div>
        )),
      )}
    </div>
  );
};

export default GridColor;