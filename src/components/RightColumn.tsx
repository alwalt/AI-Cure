interface RightColumnProps {
	toggleRightColumn: () => void;
	isRightColumnVisible: boolean;
}

export default function RightColumn({
	toggleRightColumn,
	isRightColumnVisible,
}: RightColumnProps) {
	return (
		<div className="border-red-500 border-2 bg-primaryBlack flex flex-col items-start w-full">
			<button
				onClick={toggleRightColumn}
				className="bg-gray-700 text-white p-2 rounded w-8"
			>
				{isRightColumnVisible ? "→" : "←"}
			</button>

			{isRightColumnVisible && (
				<>
					<p>Right Column</p>
				</>
			)}
		</div>
	);
}
