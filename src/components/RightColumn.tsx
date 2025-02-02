interface RightColumnProps {
	toggleRightColumn: () => void;
	isRightColumnVisible: boolean;
}

const RightColumn: React.FC<RightColumnProps> = ({
	toggleRightColumn,
	isRightColumnVisible,
}) => {
	return (
		<div className="bg-red-500 p-4 h-full flex items-start">
			{/* Toggle Button for Right Column */}
			<button
				onClick={toggleRightColumn}
				className="bg-gray-700 text-white p-2 rounded"
			>
				{isRightColumnVisible ? "→" : "←"}
			</button>

			{/* Show Right Column content only when expanded */}
			{isRightColumnVisible && <p className="ml-2">Right Column</p>}
		</div>
	);
};

export default RightColumn;
