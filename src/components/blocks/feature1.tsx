import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Feature1Props {
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

const Feature1 = ({
  title = "Custom AI Agent Development",
  description = "AI that actually thinks. Our agents understand context, handle ambiguity, and reason through problems—not just follow scripts. Integrated into your software, they automate complex workflows and let users control apps and systems seamlessly with natural language.",
  imageSrc = "/j53ScnFsOyNrfEbI4jycp (2).png",
  imageAlt = "Custom AI Agent Development",
  buttonPrimary = {
    text: "View Agents",
    href: "https://shadcnblocks.com",
  },
  buttonSecondary = {
    text: "Learn More",
    href: "https://shadcnblocks.com",
  },
  className,
}: Feature1Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
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
              <Button asChild>
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
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export { Feature1 };
