import ChatbotAI from "./chatbot/ChatbotComponent";

export default function MiddleBottomColumn() {
  return (
    <div className="bg-primaryBlack h-full flex-1 min-h-0 overflow-y-scroll">
      <ChatbotAI />
    </div>
  );
}
