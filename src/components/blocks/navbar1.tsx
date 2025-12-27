"use client";

import { Book, Bot, Github, Sunset, Trees, Zap } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
}

const Navbar1 = ({
  logo = {
    url: "/",
    src: "/siphio-logo-black.png",
    alt: "Siphio logo",
    title: "Siphio",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "AI Assistant",
          description: "Get all the answers you need right here",
          icon: <Bot className="size-5 shrink-0" />,
          url: "/#ai-assistant",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0" />,
          url: "/api-status",
        },
      ],
    },
    {
      title: "Blog",
      url: "/blog",
    },
  ],
  className,
}: Navbar1Props) => {
  return (
    <section className={cn("py-4 absolute top-0 left-0 right-0 z-50 bg-transparent", className)}>
      <div className="container">
        {/* Menu */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-6">
              <a href={logo.url} className="flex items-center">
                <img src={logo.src} alt={logo.alt} className="h-12 w-auto" />
              </a>
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/siphioai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black transition-colors hover:text-black/70"
            >
              <XIcon className="size-5" />
            </a>
            <a
              href="https://github.com/siphio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black transition-colors hover:text-black/70"
            >
              <Github className="size-5" />
            </a>
          </div>
        </nav>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-black transition-colors hover:text-black/70"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar1 };
