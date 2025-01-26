import {
	ChevronDoubleRightIcon,
	ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";

interface MiddleTopColumnProps {
	toggleRightColumn: () => void;
	isRightColumnVisible: boolean;
}

const MiddleTopColumn: React.FC<MiddleTopColumnProps> = ({
	toggleRightColumn,
	isRightColumnVisible,
}) => {
	return (
		<div className="bg-green-500 p-4 flex justify-between items-center h-full">
			<p>Middle Top Column</p>
			<button
				onClick={toggleRightColumn}
				className="bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-2"
			>
				{isRightColumnVisible ? (
					<>
						<ChevronDoubleRightIcon className="h-5 w-5" />
						Collapse Right Col
					</>
				) : (
					<>
						<ChevronDoubleLeftIcon className="h-5 w-5" />
						Expand Right Col
					</>
				)}
			</button>
		</div>
	);
};

export default MiddleTopColumn;
