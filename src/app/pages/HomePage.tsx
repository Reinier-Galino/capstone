import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { ProjectGallery } from "../components/ProjectGallery";
export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProjectGallery />
      </main>
      <Footer />
    </>
  );
}
