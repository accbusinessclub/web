import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Panel } from "./components/Panel";
import { Moderator } from "./components/Moderator";
import { Events } from "./components/Events";
import { Gallery } from "./components/Gallery";
import { Join } from "./components/Join";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <About />
            <Moderator />
            <Panel />
            <Events />
            <Gallery />
            <Join />
            <Contact />
            <Footer />
        </div>
    );
}
