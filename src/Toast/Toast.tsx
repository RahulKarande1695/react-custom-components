import React, { useState, useEffect, useRef } from "react";
import InfoIcon from "@mui/icons-material/Info";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import "./Toaster.css";

type ToastType = "info" | "alert" | "warning" | "success";

interface ToastItem {
  id: number;
  type: ToastType;
  position: "right-top" | "left-top" | "right-bottom" | "left-bottom";
  removing?: boolean;
}

interface ToastProps extends ToastItem {
  onRemove: (id: number) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  info: <InfoIcon sx={{ color: "blue" }} />,
  alert: <AddAlertIcon sx={{ color: "red" }} />,
  warning: <WarningIcon sx={{ color: "orange" }} />,
  success: <CheckCircleIcon sx={{ color: "green" }} />,
};

const closeIcon: Record<string, string> = {
  success: "#4caf50",
  danger: "#f44336",
  info: "#2196f3",
  alert: "#f44336",
  warning: "#ff9800",
};

function ToastCall() {
  const [add, setAdd] = useState<Set<ToastItem>>(new Set());

 function addNotification(type: ToastType) {
  const newToast: ToastItem = {
    type,
    position: "right-top",
    id: Date.now() + Math.random(),
  };

  setAdd((prev) => new Set([...prev, newToast]));

}

  function onRemove(id: number) {
    setAdd((prev) => {
      const updated = [...prev].map((item) =>
        item.id === id ? { ...item, removing: true } : item
      );

      return new Set(updated);
    });

    setTimeout(() => {
      setAdd((prev) => {
        const updated = [...prev].filter((item) => item.id !== id);
        return new Set(updated);
      });
    }, 300);
  }

  return (
    <div>
      <button onClick={() => addNotification("info")}>
        Add Info
      </button>

      <button onClick={() => addNotification("success")}>
        Add Success
      </button>

      <button onClick={() => addNotification("warning")}>
        Add Warning
      </button>

      <button onClick={() => addNotification("alert")}>
        Add Alert
      </button>

      <div className="toastWrapper">
        {[...add].map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            type={item.type}
            position={item.position}
            removing={item.removing}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}


function Toast(props: ToastProps) {
  const { id, type, position, onRemove, removing } = props;
  const [pause, setPause] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = 3000;
  const remaining = useRef(duration);
  const startTime = useRef(0);

  function startTimer() {
    startTime.current = Date.now();

    timerRef.current = setTimeout(() => {
      onRemove(id);
    }, remaining.current);
  }

  function pauseTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);

      remaining.current =
        remaining.current - (Date.now() - startTime.current);
    }
  }

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleMouseEnter() {
    setPause(true);
    pauseTimer();
  }

  function handleMouseLeave() {
    setPause(false);
    startTimer();
  }

  return (
    <div
      data-type={type}
      data-position={position}
      className={`toastContainer ${removing ? "remove" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast">
        <button className="closeOf" onClick={() => onRemove(id)}>
          <CloseIcon sx={{ fontSize: 20, color: closeIcon[type] }} />
        </button>

        <div className="contentOf">
          <div>{icons[type]}</div>

          <div className="details">
            <span>Title: {type} toaster</span>
            <span>Content: this is {type} toaster</span>
          </div>
        </div>
      </div>

      <div
        className="progressOf"
        style={{
          animationPlayState: pause ? "paused" : "running",
        }}
      ></div>
    </div>
  );
}
export default ToastCall;