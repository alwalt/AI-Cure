"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";

const AicureToolFull = () => {
	const [showLeft, setShowLeft] = useState(true);
	const [showRight, setShowRight] = useState(true);

	const toggleRightColumn = () => setShowRight((prev) => !prev);
	return (
		<div className="flex h-screen">
			{/* Left Column */}
			{showLeft && (
				<div className="w-1/4">
					<LeftColumn />
					<button
						onClick={() => setShowLeft(false)}
						className="bg-gray-700 text-white p-1 mt-1 w-full"
					></button>
				</div>
			)}
			{/* Middle Columns */}
			<div
				className={`flex flex-col w-full h-screen" ${
					showLeft && showRight
						? "w-1/2"
						: showLeft || showRight
						? "w-3/4"
						: "w-full"
				}`}
			>
				<MiddleTopColumn
					toggleRightColumn={toggleRightColumn}
					isRightColumnVisible={showRight}
				/>
				<div className="flex-grow">
					<MiddleBottomColumn />
				</div>
			</div>

			{/* Right Column */}
			{showRight && (
				<div className="w-1/4">
					<RightColumn />
				</div>
			)}
		</div>
	);
};

export default AicureToolFull;
