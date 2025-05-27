import ChatbotComponent from "@/components/middleColumns/chatbot/ChatbotComponent";

// Try to see if you can remove w-full and overflow-hidden
export default function MiddleBottomColumn() {
  return (
    <div className="border-2 border-red-400 bg-primaryBlack h-full flex-1 overflow-y-scroll">
      <ChatbotComponent />
    </div>
  );
}
