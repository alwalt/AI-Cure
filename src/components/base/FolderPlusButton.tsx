import { FolderPlusIcon } from "@heroicons/react/24/solid";
import Button from "@/components/base/Button";
// import ButtonProps from "@/types/files";

export default function FolderPlusButton() {
  const handleClick = () => {
    alert("Folder added! (Placeholder alert)");
  };

  return (
    <Button
      targetId="FolderPlusButton"
      buttonDescription="Add folder"
      Icon={FolderPlusIcon}
      iconClassName="h-8 w-8 p-1"
      onClick={handleClick}
    />
  );
}
// type FolderPlusButtonProps = {
//   onClick?: () => void;
// };

// export default function FolderPlusButton({ onClick }: FolderPlusButtonProps) {
// const handleClick = () => {
//   alert("Folder added! (Placeholder alert)");
//   if (onClick) onClick();
// };

//   return (
//     <div className="relative group">
//       <button onClick={handleClick} className="flex">
//         <FolderPlusIcon className="h-8 w-8 stroke-primaryWhite stroke-1 text-primaryBlack p-1 hover:stroke-redFill transition-colors duration-300" />
//       </button>
//       <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1">
//         Add folder
//       </span>
//     </div>
//   );
// }
