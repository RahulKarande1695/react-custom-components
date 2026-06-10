import { useRef, useState } from "react";
import './otp.css';

function OTP() {
  const [otps, setOtps] = useState<string[]>(["", "", "", ""]);
  const [masked, setMasked] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const maskTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>([
    null, null, null, null,
  ]);

  function maskAt(index: number, delay: number = 300) {
    if (maskTimers.current[index]) {
      clearTimeout(maskTimers.current[index]!);
    }
    maskTimers.current[index] = setTimeout(() => {
      setMasked((prev) => {
        const updated = [...prev];
        updated[index] = "*";
        return updated;
      });
    }, delay);
  }

  function moveCursorToEnd(el: HTMLInputElement | null) {
    if (!el) return;
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }

  function moveForward(index: number) {
    return () => {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
        moveCursorToEnd(nextInput);
      }
    };
  }

  function moveBackward(index: number) {
    return () => {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        moveCursorToEnd(prevInput);
      }
    };
  }

  function handleClick(index: number) {
    return () => {
      moveCursorToEnd(inputRefs.current[index]);
    };
  }

  function handlePaste(index: number) {
    return (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const pasted = event.clipboardData.getData("text");
      const digits = pasted.split("").filter((char) => !isNaN(Number(char)));

      const newOtps = [...otps];
      const newMasked = [...masked];

      digits.slice(0, 4 - index).forEach((digit, i) => {
        const targetIndex = index + i;
        newOtps[targetIndex] = digit;
        newMasked[targetIndex] = digit;
        maskAt(targetIndex, 300);   
      });

      setOtps(newOtps);
      setMasked(newMasked);

      const lastFilledIndex = Math.min(index + digits.length, 3);
      const targetInput = inputRefs.current[lastFilledIndex];
      if (targetInput) {
        targetInput.focus();
        moveCursorToEnd(targetInput);
      }
    };
  }

  function handleKeyUp(index: number) {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
      const key = event.key;

      if (key === "Backspace") {
        const newOtps = [...otps];
        const newMasked = [...masked];
        newOtps[index] = "";
        newMasked[index] = "";
        setOtps(newOtps);
        setMasked(newMasked);
        moveBackward(index)();
        return;
      }

      if (isNaN(Number(key))) return;

      const newOtps = [...otps];
      const newMasked = [...masked];
      newOtps[index] = key;
      newMasked[index] = key;
      setOtps(newOtps);
      setMasked(newMasked);
      maskAt(index, 300);   
      moveForward(index)();
    };
  }

  return (
    <div className="otp">
      {new Array(4).fill("").map((_, index) => (
        <input
          key={index}
          type="text"
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          autoComplete="one-time-code"
          inputMode="numeric"
          value={masked[index] ?? ""}
          onChange={() => {}}
          onClick={handleClick(index)}
          onKeyUp={handleKeyUp(index)}
          onPaste={handlePaste(index)}
          maxLength={1}
        />
      ))}
    </div>
  );
}

export default OTP;