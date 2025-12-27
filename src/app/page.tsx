import { Blog7 } from "@/components/blocks/blog7";
import { Experience5 } from "@/components/blocks/experience5";
import { Feature1 } from "@/components/blocks/feature1";
import { Feature2 } from "@/components/blocks/feature2";
import { Hero7 } from "@/components/blocks/hero7";
import { Navbar1 } from "@/components/blocks/navbar1";
import { Waitlist1 } from "@/components/blocks/waitlist1";

export default function Home() {
  return (
    <main>
      <Navbar1 />
      <Hero7 />
      <Blog7 />
      <Feature1 />
      <Feature2 />
      <Experience5 />
      <Waitlist1 />
    </main>
  );
}
