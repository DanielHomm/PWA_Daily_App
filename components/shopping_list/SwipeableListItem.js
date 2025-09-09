"use client";

import { useSwipeable } from "react-swipeable";
import { useState } from "react";

export default function SwipeableListItem({ children, onDelete, threshold = 80 }) {
  const [translateX, setTranslateX] = useState(0);
  const [transition, setTransition] = useState("");

  const handlers = useSwipeable({
    onSwiping: ({ dir, deltaX }) => {
      if (dir === "Left") {
        setTranslateX(Math.max(-150, -deltaX)); // drag left up to -150px
      }
    },
    onSwipedLeft: ({ absX }) => {
      if (absX > threshold) {
        // swipe far enough -> confirm delete
        setTranslateX(-300);
        setTransition("transform 0.2s ease");
        setTimeout(onDelete, 200);
      } else {
        // not far enough -> snap back
        setTranslateX(0);
        setTransition("transform 0.2s ease");
      }
    },
    onSwipedRight: () => {
      // reset if swiped right
      setTranslateX(0);
      setTransition("transform 0.2s ease");
    },
    trackMouse: true, // also works on desktop
  });

  return (
    <div className="relative overflow-hidden select-none" {...handlers}>
      {/* Background delete area */}
      <div className="absolute inset-0 flex items-center justify-end bg-red-600 text-white pr-4">
        Delete
      </div>

      {/* Foreground (the actual list item) */}
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
