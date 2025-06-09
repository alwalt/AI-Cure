"use client";
import LeftColumn from "./leftColumn/LeftColumn";
import RightColumn from "./rightColumn/RightColumn";
import MiddleTopColumn from "./middleColumns/middleTopCol/MiddleTopColumn";
import MiddleBottomColumn from "./middleColumns/MiddleBottomColumn";
import { useIsRightVisible } from "@/store/useIsRightVisible";

export default function AicureToolFull() {
  const isRightColumnVisible = useIsRightVisible(
    (state) => state.isRightColumnVisible
  );

  return (
    <div
      data-cy="root-app"
      className="flex h-screen grid-cols-3 bg-primaryBlack"
    >
      <div className="overflow-hidden min-w-[300px] max-w-[300px] 2xl:min-w-[450px] 2xl:max-w-[450px]">
        <LeftColumn />
      </div>
      {/* flex-grow has to be here to allow right col to collapse */}
      <div className=" flex flex-col h-screen grow min-w-[300px] overflow-hidden">
        {/* Top half: fixed 50% height */}
        <div className="flex-none basis-1/2 flex flex-col overflow-hidden">
          <MiddleTopColumn />
        </div>
        {/* Bottom: fills rest, but can shrink internally */}
        <div className="flex-1 min-h-0 overflow-auto">
          <MiddleBottomColumn />
        </div>
      </div>

      <div
        className={`${
          isRightColumnVisible
            ? "min-w-[300px] max-w-[400px] 2xl:min-w-[400px] 2xl:max-w-[450px]"
            : "w-[36px]"
        } flex h-full`}
      >
        <RightColumn />
      </div>
    </div>
  );
}
