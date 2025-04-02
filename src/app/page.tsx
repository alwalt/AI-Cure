import AicureToolFull from "@/components/AicureToolFull";
import MainNavigation from "@/components/MainNanigation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <MainNavigation />
      <main id="main-content">
        <AicureToolFull />
      </main>
      <Footer />
    </div>
  );
}
