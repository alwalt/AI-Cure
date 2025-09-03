// src/app/page.tsx
import AicureToolFull from "@/components/AicureToolFull";
import Footer from "@/components/Footer";
import NasaHeader from "@/components/NasaHeader";

export default function Home() {
  return (
    <div>
      <NasaHeader />
      <main id="main-content">
        <AicureToolFull />
      </main>
      <Footer />
    </div>
  );
}
