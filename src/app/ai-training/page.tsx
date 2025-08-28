// src/app/ai-training/page.tsx - AI Training route
"use client";
import RightColumn from "@/components/rightColumn/RightColumn";
import TrainingTopMiddle from "@/components/trainingAi/TrainingTopMiddle";
import Chatbot from "@/components/middleColumns/chatbot/ChatbotComponent";
import Footer from "@/components/Footer";
import NasaHeader from "@/components/NasaHeader";
import { useIsRightVisible } from "@/store/useIsRightVisible";
import Navigation from "@/components/Navigation";
import TrainingLeftColumn from "@/components/trainingAi/TrainingLeftColumn";

export default function AiTrainingPage() {
  const isRightColumnVisible = useIsRightVisible(
    (state) => state.isRightColumnVisible
  );

  return (
    <div>
      <NasaHeader />
      <main id="main-content">
        <div
          data-cy="ai-training-app"
          className="flex h-screen grid-cols-3 bg-background-default"
        >
          <div className="overflow-hidden min-w-[350px] max-w-[350px] 2xl:min-w-[450px] 2xl:max-w-[450px] flex flex-col border-r-2 border-border-column">
            <div className="flex-none p-2">
              <Navigation />
            </div>
            <div className="flex-1 min-h-0">
              <TrainingLeftColumn />
            </div>
          </div>

          <div className=" flex flex-col h-screen grow min-w-[300px] overflow-hidden">
            <div className="flex-none basis-1/2 flex flex-col overflow-hidden">
              <TrainingTopMiddle />
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <Chatbot />
            </div>
          </div>
          <div
            className={`${
              isRightColumnVisible
                ? "min-w-[300px] max-w-[400px] 2xl:min-w-[400px] 2xl:max-w-[450px]"
                : "w-[36px]"
            } flex h-full border-l-2 border-border-column`}
          >
            <RightColumn />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
