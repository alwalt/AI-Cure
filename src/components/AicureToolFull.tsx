"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./middleTopCol/MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";
import { useIsRightVisible } from "@/store/useIsRightVisible";

export default function AicureToolFull() {
  const isRightColumnVisible = useIsRightVisible(
    (state) => state.isRightColumnVisible
  );

  return (
    <div className="flex h-screen grid-cols-3 bg-primaryBlack">
      <div className="min-w-[300px] max-w-[300px]">
        <LeftColumn />
      </div>
      {/* flex-grow has to be here to allow right col to collapse */}
      <div className="flex flex-col h-screen grow min-w-[300px]">
        <div className="h-1/2">
          <MiddleTopColumn />
        </div>
        <div className="flex-1 pb-2">
          <MiddleBottomColumn />
        </div>
      </div>

      <div
        className={`${
          isRightColumnVisible ? "min-w-[300px] max-w-[400px]" : "w-[36px]"
        } flex h-full`}
      >
        <RightColumn />
      </div>
    </div>
  );
}
