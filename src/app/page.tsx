import AicureToolFull from "@/components/AicureToolFull";
import MainNavigation from "@/components/MainNanigation";
import Footer from "@/components/Footer";

export default function Home() {
	return (
		<div>
			<MainNavigation />
			<h1>AI-Cure tool</h1>
			<AicureToolFull />;
			<Footer />
		</div>
	);
}
