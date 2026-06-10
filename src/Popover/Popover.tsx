import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./popover.css";

interface PopoverProps {
  children?: ReactNode;
}

interface ActionProps {
  node?: ReactNode;
  children?: ReactNode;
}

interface ContentProps {
  children?: ReactNode;
}

interface PositionType {
  top: number;
  left: number;
}

interface PopOverContextType {
  flag: boolean;
  openPopover: () => void;
  closePopover: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  position: PositionType;
}

interface PopoverComponent extends React.FC<PopoverProps> {
  Action: React.FC<ActionProps>;
  Content: React.FC<ContentProps>;
}

const PopOverContext = createContext<PopOverContextType>({
  flag: false,
  openPopover: () => {},
  closePopover: () => {},
  buttonRef: { current: null },
  position: { top: 0, left: 0 },
});

const Popover: PopoverComponent = ({ children }) => {
  const [flag, setFlag] = useState(false);
  const [position, setPosition] = useState<PositionType>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPopover = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const popWidth = 260;
      const popHeight = 140;

      let left = rect.left;
      let top = rect.bottom + 10;

      if (left + popWidth > window.innerWidth) {
        left = window.innerWidth - popWidth - 20;
      }

      if (top + popHeight > window.innerHeight) {
        top = rect.top - popHeight - 10;
      }

      setPosition({ top, left });
    }

    setFlag(true);
  };

  const closePopover = () => {
    closeTimerRef.current = setTimeout(() => {
      setFlag(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <PopOverContext.Provider
      value={{ flag, openPopover, closePopover, buttonRef, position }}
    >
      <div className="popover">{children}</div>
    </PopOverContext.Provider>
  );
};

const Action: React.FC<ActionProps> = ({ node, children }) => {
  const { openPopover, closePopover, buttonRef } = useContext(PopOverContext);

  return (
    <button
      ref={buttonRef}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}
    >
      {node || children}
    </button>
  );
};

const Content: React.FC<ContentProps> = ({ children }) => {
  const { flag, openPopover, closePopover, position } =
    useContext(PopOverContext);

  const [mountNode, setMountNode] = useState<Element | null>(null);

  useEffect(() => {
    const node = document.querySelector("[popover-root]");
    setMountNode(node);
  }, []);

  if (!flag || !mountNode) return null;

  return createPortal(
    <div
      popover-data=""
      className="content"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}
    >
      {children}
    </div>,
    mountNode
  );
};

Popover.Action = Action;
Popover.Content = Content;

export default Popover;

// setTimeout(() => setFlag(false), 100)
// Yeh turant setFlag(false) nahi karta. Kehta hai — "100ms baad band karna". Is 100ms ke andar agar mouse content pe aa jaaye toh timer cancel ho jaata hai.

// Mouse button se bahar nikla
//   → closePopover() call
//   → setTimeout shuru, ID saved: closeTimerRef.current = 42
//   → 100ms ka countdown...

//   Case 1: Mouse content pe pahuncha (100ms ke andar)
//     → openPopover() call
//     → clearTimeout(42) ← timer cancel, popover band nahi hoga
  
//   Case 2: Mouse kahin aur gaya (100ms baad)
//     → Timer fire → setFlag(false) → popover band
