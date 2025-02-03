"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";

const AicureToolFull = () => {
	const [showRight, setShowRight] = useState(true);

	const toggleRightColumn = () => setShowRight((prev) => !prev);

	return (
		<div className="flex h-screen p-2">
			<div className="w-1/4">
				<LeftColumn />
			</div>

			<div className="flex flex-col h-screen flex-grow">
				<div className="h-3/4">
					<MiddleTopColumn />
				</div>
				<div className="flex-grow">
					<MiddleBottomColumn />
				</div>
			</div>

			<div className={`${showRight ? "w-1/4" : "w-10"} flex h-full`}>
				<RightColumn
					toggleRightColumn={toggleRightColumn}
					isRightColumnVisible={showRight}
				/>
			</div>
		</div>
	);
};

export default AicureToolFull;
