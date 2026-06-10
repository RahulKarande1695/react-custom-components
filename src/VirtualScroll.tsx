import { useState } from "react";
import "./index.css";
const data = Array.from({ length: 100000 }, (_, index) => index);
const LIST_HEIGHT = 400;
const ROW_HEIGHT = 52;
const OVER_SCAN = 10;
function VirtualScroll() {
  const [scrollTop, setScrollTop] = useState(0);
  const listHeight = `${LIST_HEIGHT}px`;
  const rowHeight = `${ROW_HEIGHT}px`;
  const startIndex = Math.max(Math.floor(scrollTop / ROW_HEIGHT) - OVER_SCAN, 0);
  const endIndex = Math.max(
    Math.floor((LIST_HEIGHT + scrollTop) / ROW_HEIGHT) + OVER_SCAN,
    0,
  );

  const handleScroll = (e: any) => {
    setScrollTop(e.target.scrollTop);
  };
  return (
    <div
      style={{ height: listHeight }}
      className="_relative"
      onScroll={handleScroll}
    >
      <div style={{ height: `${data.length * ROW_HEIGHT}px` }}>
        {data?.slice(startIndex, endIndex)?.map((i, index) => (
          <li
            key={i}
            style={{
              height: rowHeight,
              top: `${(startIndex + index ) * ROW_HEIGHT}px`,
            }}
          >
            {i}
          </li>
        ))}
      </div>
    </div>
  );
}

export default VirtualScroll;
