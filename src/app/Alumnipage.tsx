import { Navbar } from "./components/Navbar";
import { Alumni } from "./components/Alumni";
import { Footer } from "./components/Footer";

export function AlumniPage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="pt-16">
                <Alumni />
            </div>
            <Footer />
        </div>
    );
}
