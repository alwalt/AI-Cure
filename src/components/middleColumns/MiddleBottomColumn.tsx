import ChatbotComponent from "@/components/middleColumns/chatbot/ChatbotComponent";

// Try to see if you can remove w-full and overflow-hidden
export default function MiddleBottomColumn() {
  return (
    <div className="bg-primaryBlack h-full flex-1 min-h-0 overflow-y-scroll">
      <ChatbotComponent />
    </div>
  );
}
