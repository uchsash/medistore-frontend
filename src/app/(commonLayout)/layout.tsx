import { HeroSearch } from "@/components/modules/home/Searchbar";
import Navbar from "@/components/modules/shared/Navbar";



export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
      >
        <Navbar />
        {/* <HeroSearch /> */}
        <h1>This is common layout</h1>
        {children}
      </div>

  );
}