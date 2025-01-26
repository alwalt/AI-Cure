"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";

const AicureToolFull = () => {
	const [showLeft, setShowLeft] = useState(true);
	const [showRight, setShowRight] = useState(true);
	return (
		<div className="flex h-screen">
			{showLeft && (
				<div className="w-1/4">
					<LeftColumn />
					<button
						onClick={() => setShowLeft(false)}
						className="bg-gray-700 text-white p-1 mt-1 w-full"
					>
						Collapse Left
					</button>
				</div>
			)}
			<div className={`flex-grow ${showLeft ? "w-1/2" : "w-3/4"}`}>
				<MiddleTopColumn />
				<div>
					<MiddleBottomColumn />
				</div>
			</div>
			{showRight && (
				<div className="w-1/4">
					<RightColumn />
					<button
						onClick={() => setShowRight(false)}
						className="bg-gray-700 text-white p-1 mt-1 w-full"
					>
						Collapse Right
					</button>
				</div>
			)}
		</div>
	);
};

export default AicureToolFull;
