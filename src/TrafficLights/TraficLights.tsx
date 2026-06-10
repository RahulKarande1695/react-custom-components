import { useEffect, useRef, useState } from "react";
import "./traficlights.css";

interface Lights {
  red: number;
  green: number;
  yellow: number;
}

type Color = keyof Lights;

const TraficLights = () => {
  const [lights, setLights] = useState<Lights>({
    red: 0,
    green: 0,
    yellow: 0,
  });

  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef<number>(0);

  const handleInterval = (color: Color, time: number) => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }

    currentRef.current = time;
    //  ek key dynamic aste baki reset hotata automatic, apn spreador nahi vaprla karan aplya junya value nahi lagnaret. default value adhi set kraychi aste. mhnun 2 vela setLights aahe.
    setLights({
      red: 0,
      green: 0,
      yellow: 0,
      [color]: currentRef.current,
    });

    const id = setInterval(() => {
      currentRef.current--;

      setLights({
        red: 0,
        green: 0,
        yellow: 0,
        [color]: currentRef.current,
      });

      if (currentRef.current <= 0) {
        clearInterval(id);

        if (color === "green") handleInterval("yellow", 1);
        if (color === "yellow") handleInterval("red", 5);
        if (color === "red") handleInterval("green", 3);
      }
    }, 1000);

    timerIdRef.current = id;
  };

  useEffect(() => {
    handleInterval("red", 5);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, []);

  return (
    <div className="trafficContainer">
      <div className={`light red ${lights.red > 0 ? "active" : ""}`}>
        <span>{lights.red || ""}</span>
      </div>

      <div className={`light green ${lights.green > 0 ? "active" : ""}`}>
        <span>{lights.green || ""}</span>
      </div>

      <div className={`light yellow ${lights.yellow > 0 ? "active" : ""}`}>
        <span>{lights.yellow || ""}</span>
      </div>
    </div>
  );
};

export default TraficLights;