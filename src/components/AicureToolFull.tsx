"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";

export default function AicureToolFull() {
  const [showRight, setShowRight] = useState(true);
  const toggleRightColumn = () => setShowRight((prev) => !prev);

  return (
    <div className="flex h-screen col-span-3">
      <div className="min-w-[300px] max-w-[300px]">
        <LeftColumn />
      </div>
      {/* flex-grow has to be here to allow right col to collapse */}
      <div className="flex flex-col h-screen grow min-w-[300px]">
        <div className="h-3/4">
          <MiddleTopColumn />
        </div>
        <div className="">
          <MiddleBottomColumn />
        </div>
      </div>

      <div
        className={`${showRight ? "min-w-[300px]" : "w-[36px]"} flex h-full`}
      >
        <RightColumn
          toggleRightColumn={toggleRightColumn}
          isRightColumnVisible={showRight}
        />
      </div>
    </div>
  );
}
