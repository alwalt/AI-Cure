"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";

const AicureToolFull = () => {
	// Only track right column visibility now
	const [showRight, setShowRight] = useState(true);

	const toggleRightColumn = () => setShowRight((prev) => !prev);

	return (
		<div className="flex h-screen p-2 gap-2">
			{/* Left Column (Always Visible) */}
			<div className="w-1/4">
				<LeftColumn />
			</div>

			{/* Middle Column (Adjusts width based on right column state) */}
			<div className="flex flex-col h-screen flex-grow">
				<div className="h-3/4">
					<MiddleTopColumn />
				</div>
				<div className="flex-grow">
					<MiddleBottomColumn />
				</div>
			</div>

			{/* Right Column (Collapses to small width when hidden) */}
			<div className="flex-shrink-0">
				<div
					className={`${showRight ? "w-1/4" : "w-10"} flex items-start h-full`}
				>
					<RightColumn
						toggleRightColumn={toggleRightColumn}
						isRightColumnVisible={showRight}
					/>
				</div>
			</div>
		</div>
	);
};

export default AicureToolFull;
