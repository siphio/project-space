import { Star } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils"; 
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Hero7Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
    className?: string;
  };
  reviews?: {
    count: number;
    rating?: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
  className?: string;
}

const Hero7 = ({
  heading = "We Build Software For Others and Ourselves",
  description = "Software built to solve real problems. Browse our products, read the documentation, and stay updated with the latest features and releases.",
  button = {
    text: "Discover all components",
    url: "https://www.shadcnblocks.com",
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "/branding/technology-logos/claude.png",
        alt: "Claude",
      },
      {
        src: "/branding/technology-logos/supabase.jpeg",
        alt: "Supabase",
      },
      {
        src: "/branding/technology-logos/apple.png",
        alt: "Apple",
      },
      {
        src: "/branding/technology-logos/stripe.jpeg",
        alt: "Stripe",
      },
      {
        src: "/branding/technology-logos/android.jpeg",
        alt: "Android",
      },
    ],
  },
  className,
}: Hero7Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container text-center">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <h1 className="text-3xl font-semibold lg:text-6xl">{heading}</h1>
          <p className="text-balance text-muted-foreground lg:text-lg">
            {description}
          </p>
        </div>
        <Button asChild size="lg" className="mt-10">
          <a href={button.url}>{button.text}</a>
        </Button>
        <div className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row">
          <span className="mx-4 inline-flex items-center -space-x-4">
            {reviews.avatars.map((avatar, index) => (
              <Avatar
                key={index}
                className="size-14 border transition-all duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:scale-110 hover:shadow-lg cursor-pointer"
              >
                <AvatarImage src={avatar.src} alt={avatar.alt} />
              </Avatar>
            ))}
          </span>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className="size-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="mr-1 font-semibold">
                {reviews.rating?.toFixed(1)}
              </span>
            </div>
            <p className="text-left font-medium text-muted-foreground">
              from {reviews.count}+ reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero7 };
