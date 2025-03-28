import ChatbotComponent from "@/components/chatbot/ChatbotComponent";

// Try to see if you can remove w-full and overflow-hidden
export default function MiddleBottomColumn() {
  return (
    <div className="bg-primaryBlack p-2 h-full flex flex-grow-0 basis-auto">
      <ChatbotComponent />
    </div>
  );
}
