export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "company" | "hiring" | "product" | "announcement" | "engineering";
  image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "4",
    slug: "q1-2025-product-roadmap",
    title: "Q1 2025 Product Roadmap",
    excerpt: "Here's what we're building in Q1 2025. New features for Spending Insights, major updates to Checklist Manager, and exciting developments in our AI Agents platform. Get a sneak peek at what's coming next.",
    content: `We're excited to share our product roadmap for Q1 2025. Here's what's coming:

## Spending Insights
- Multi-currency support
- Advanced forecasting with AI
- Custom dashboard widgets

## Checklist Manager
- Team collaboration features
- Calendar integration
- Mobile app launch

## AI Agents
- New reasoning models
- Custom agent builder
- Enterprise API

Stay tuned for more updates as we ship these features!`,
    category: "product",
    author: {
      name: "Product Team",
    },
    publishedAt: "2024-12-28",
    featured: false,
  },
  {
    id: "5",
    slug: "siphio-ai-raises-seed-funding",
    title: "Siphio AI Raises Seed Funding",
    excerpt: "We're thrilled to announce that Siphio AI has raised seed funding to accelerate our mission of building intelligent software. This investment will help us expand our team and ship more AI-native products.",
    content: `Big news! Siphio AI has raised seed funding.

## What This Means
This investment allows us to:
- Hire more talented engineers
- Accelerate product development
- Expand our AI capabilities

## Our Investors
We're backed by investors who believe in our vision of AI-native software.

## What's Next
We're doubling down on building products that actually think. Thank you to everyone who believes in our mission!`,
    category: "company",
    author: {
      name: "Siphio Team",
    },
    publishedAt: "2024-12-27",
    featured: false,
  },
  {
    id: "6",
    slug: "introducing-ai-agent-templates",
    title: "Introducing AI Agent Templates",
    excerpt: "Today we're launching AI Agent Templates - pre-built agent configurations for common use cases. Deploy intelligent agents in minutes, not weeks. From customer support to data analysis, we've got you covered.",
    content: `We're launching AI Agent Templates!

## What Are Templates?
Pre-configured AI agents ready to deploy for common use cases:
- Customer Support Agent
- Data Analysis Agent
- Content Writing Agent
- Research Assistant

## How It Works
1. Choose a template
2. Customize settings
3. Deploy in minutes

## Getting Started
Templates are available now in the AI Agents dashboard.`,
    category: "product",
    author: {
      name: "Engineering Team",
    },
    publishedAt: "2024-12-26",
    featured: false,
  },
  {
    id: "1",
    slug: "welcome-to-siphio-ai",
    title: "Welcome to Siphio AI",
    excerpt: "We're excited to announce the official launch of Siphio AI. After months of development and refinement, we're ready to share our vision for the future of intelligent software. Learn about our mission to build applications that actually think, adapt, and get smarter over time.",
    content: `We're thrilled to officially launch Siphio AI! After months of development, we're ready to share our vision for the future of intelligent software.

At Siphio, we believe AI shouldn't be an afterthought bolted onto existing applications. Instead, we build software that's AI-native from the ground up—applications that learn, adapt, and get smarter over time.

Our initial product suite includes:
- **Spending Insights**: AI-powered financial analytics that surfaces patterns you'd miss
- **Checklist Manager**: Task management that learns from your habits and predicts blockers
- **AI Agents**: Genuine reasoning agents that handle complex workflows

This is just the beginning. We're committed to building software that doesn't just store your data—it actually thinks about it.

Stay tuned for more updates, and thank you for joining us on this journey.`,
    category: "announcement",
    image: "/siphio-logo-black.png",
    author: {
      name: "Siphio Team",
    },
    publishedAt: "2024-12-27",
    featured: true,
  },
  {
    id: "2",
    slug: "were-hiring-senior-engineers",
    title: "We're Hiring: Senior Engineers",
    excerpt: "Join our team! We're actively hiring senior engineers who are passionate about AI and building products that matter. We're looking for full-stack and backend engineers to help us scale our intelligent software platform and create the next generation of AI-native applications.",
    content: `We're growing and looking for talented engineers to join the Siphio team!

## Open Positions

### Senior Full-Stack Engineer
- Experience with Next.js, TypeScript, and modern React patterns
- Background in building scalable web applications
- Interest in AI/ML integration

### Senior Backend Engineer
- Strong Python experience
- Experience with AI/ML pipelines
- Database design and optimization skills

## What We Offer
- Competitive salary and equity
- Remote-first culture
- Work on cutting-edge AI products
- Small team, big impact

## How to Apply
Send your resume and a brief intro to careers@siphio.ai. Tell us about a project you're proud of and why you're excited about AI.

We're building the future of intelligent software. Come build it with us.`,
    category: "hiring",
    author: {
      name: "Siphio Team",
    },
    publishedAt: "2024-12-26",
    featured: false,
  },
  {
    id: "3",
    slug: "building-ai-native-applications",
    title: "Building AI-Native Applications: Our Approach",
    excerpt: "A deep dive into how we architect applications with AI at their core, not as an afterthought. Discover our principles for building truly intelligent software: context-aware systems, genuine reasoning over pattern matching, and graceful degradation that ensures reliability.",
    content: `Most companies bolt AI onto existing products. We take a different approach.

## What Does "AI-Native" Mean?

An AI-native application is designed from the ground up with intelligence as a core feature. It's not a chatbot added to a sidebar or a "smart" search. It's intelligence woven into every interaction.

## Our Architecture Principles

### 1. Context is Everything
Our applications maintain rich context across sessions. The AI doesn't start fresh every time—it remembers, learns, and adapts.

### 2. Reasoning, Not Pattern Matching
We use Claude's advanced reasoning capabilities to actually think through problems, not just match patterns from training data.

### 3. Graceful Degradation
When AI can't help, our apps still work beautifully. Intelligence enhances the experience; it doesn't gate it.

## The Result

Applications that feel magical. That anticipate your needs. That get better the more you use them.

This is what software should be.`,
    category: "engineering",
    author: {
      name: "Engineering Team",
    },
    publishedAt: "2024-12-25",
    featured: false,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getPostsByCategory(category: BlogPost["category"]): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}
