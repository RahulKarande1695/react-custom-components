import { useState } from "react";
import "./Switch.css";

const Switch = () => {
  const [isOn, setIsOn] = useState(false);
  return (
    <div
      className={`switch ${
        isOn ? "active" : ""
      }`}
      onClick={() => setIsOn(!isOn)}
    >
      <div className="sinpt">{isOn?"on":"off"}</div>

    </div>
  );
};

export default Switch;