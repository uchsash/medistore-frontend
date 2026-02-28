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
        {children}
      </div>

  );
}