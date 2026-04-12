import { Footer } from "@/src/components/Footer";
import { Navbar } from "@/src/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-black">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
