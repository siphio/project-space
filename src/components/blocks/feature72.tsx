import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Feature {
  id: string;
  heading: string;
  description: string;
  image: string;
  url: string;
}

interface Feature72Props {
  title?: string;
  description?: string;
  buttonUrl?: string;
  buttonText?: string;
  features?: Feature[];
  className?: string;
}

const Feature72 = ({
  title = "What We Build",
  description = "From concept to launch, we craft digital products that actually work. Custom-built solutions designed to scale with your business and automate the boring stuff.",
  buttonUrl = "https://shadcnblocks.com",
  buttonText = "Book a demo",
  features = [
    {
      id: "feature-1",
      heading: "Custom Websites",
      description:
        "High-performance sites built for speed and conversions. No templates, no bloat—just clean code that ranks and converts.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      url: "https://shadcnblocks.com",
    },
    {
      id: "feature-2",
      heading: "Mobile & Web Apps",
      description:
        "Native and cross-platform applications that your users will actually want to open. Smooth UX, robust backends, built to enage.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
      url: "https://shadcnblocks.com",
    },
    {
      id: "feature-3",
      heading: "Autonomous Workflows",
      description:
        "Purpose-built AI systems that don't just automate tasks—they make decisions. Smart enough to handle edge cases, reliable enough to trust with your business operations.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
      url: "https://shadcnblocks.com",
    },
    {
      id: "feature-4",
      heading: "Advanced Analytics",
      description:
        "Powerful analytics tools to help you understand your users and make data-driven decisions.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
      url: "https://shadcnblocks.com",
    },
  ],
  className,
}: Feature72Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="mb-8 lg:max-w-sm">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 md:text-4xl lg:mb-6">
            {title}
          </h2>
          {description && (
            <p className="mb-8 text-muted-foreground lg:text-lg">
              {description}
            </p>
          )}
          {buttonUrl && (
            <Button variant="link" asChild>
              <a
                href={buttonUrl}
                className="group flex items-center font-medium md:text-base lg:text-lg"
              >
                {buttonText}
                <ArrowRight />
              </a>
            </Button>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col overflow-clip rounded-xl border border-border transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-lg"
            >
              <a href={feature.url}>
                <img
                  src={feature.image}
                  alt={feature.heading}
                  className="aspect-16/9 h-full w-full object-cover object-center transition-opacity hover:opacity-80"
                />
              </a>
              <div className="px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
                <h3 className="mb-3 text-lg font-semibold md:mb-4 md:text-2xl lg:mb-6">
                  {feature.heading}
                </h3>
                <p className="text-muted-foreground lg:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature72 };
