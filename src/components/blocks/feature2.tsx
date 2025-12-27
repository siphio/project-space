import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Feature2Props {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  buttonPrimary: {
    text: string;
    href: string;
  };
  buttonSecondary: {
    text: string;
    href: string;
  };
  className?: string;
}

const Feature2 = ({
  title = "New Age AI App Development",
  description = "We don't just build apps—we build apps that think. AI-native from the ground up, not bolted on as an afterthought. Our applications learn, adapt, and get smarter over time. Modern architecture, intelligent features, well-architected databases, and seamless user experiences that feel like the future.",
  imageSrc = "/44sOsIi4uUWimu3Qr86kM.png",
  imageAlt = "New Age AI App Development",
  buttonPrimary = {
    text: "Get Started",
    href: "https://shadcnblocks.com",
  },
  buttonSecondary = {
    text: "Learn More",
    href: "https://shadcnblocks.com",
  },
  className,
}: Feature2Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-center gap-8 md:gap-16 lg:grid-cols-2">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-96 w-full rounded-md object-cover animate-float-hover"
          />
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="my-6 mt-0 text-4xl font-semibold text-balance lg:text-5xl">
              {title}
            </h2>
            {description && (
              <p className="mb-8 max-w-xl text-muted-foreground lg:text-lg">
                {description}
              </p>
            )}
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button asChild className="transition-transform duration-300 hover:scale-105">
                <a href={buttonPrimary.href} target="_blank">
                  {buttonPrimary.text}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={buttonSecondary.href} target="_blank">
                  {buttonSecondary.text}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature2 };
