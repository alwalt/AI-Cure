interface RightColumnProps {
	toggleRightColumn: () => void;
	isRightColumnVisible: boolean;
}

const RightColumn: React.FC<RightColumnProps> = ({
	toggleRightColumn,
	isRightColumnVisible,
}) => {
	return (
		<div className="bg-red-500 h-full flex flex-col items-start">
			{/* Toggle Button for Right Column */}
			<button
				onClick={toggleRightColumn}
				className="bg-gray-700 text-white p-2 rounded w-8"
			>
				{isRightColumnVisible ? "→" : "←"}
			</button>

			{/* Show Right Column content only when expanded */}
			{isRightColumnVisible && <p>Right Column</p>}
		</div>
	);
};

export default RightColumn;
