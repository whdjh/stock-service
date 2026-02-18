import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  text: string;
}

export default function Tooltip({ text }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, []);

  return (
    <>
      <span
        ref={iconRef}
        className="inline-flex items-center"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
      >
        <HelpCircle size={14} className="text-muted cursor-help" />
      </span>
      {visible &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-xs text-white bg-gray-800 rounded-xl whitespace-pre-line w-64 text-left leading-relaxed pointer-events-none"
            style={{
              top: pos.top - 8,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>,
          document.body
        )}
    </>
  );
}
