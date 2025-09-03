"use client";

import { useSwipeable } from "react-swipeable";
import { useState } from "react";

export default function SwipeableListItem({ children, onDelete }) {
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState("");

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === "Left") {
        setTranslateX(Math.max(-100, -e.deltaX)); // drag left
      }
    },
    onSwipedLeft: (e) => {
      if (e.absX > 80) {
        // swipe far enough
        setTranslateX(-200);
        setTimeout(onDelete, 200); // trigger delete
      } else {
        // snap back
        setTranslateX(0);
      }
      setTransition("transform 0.2s ease");
    },
    onSwipedRight: () => {
      setTranslateX(0);
      setTransition("transform 0.2s ease");
    },
    trackMouse: true, // also works on desktop
  });

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Delete background */}
      <div className="absolute inset-0 flex items-center justify-end bg-red-600 text-white pr-4">
        Delete
      </div>

      {/* Foreground (the actual item) */}
      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition,
        }}
        onTransitionEnd={() => setTransition("")}
      >
        {children}
      </div>
    </div>
  );
}
