# Next.js Blog/Portfolio Design Document

## 1. Project Overview

### Purpose
To create a modern, high-performance personal blog and portfolio website using Next.js that can be deployed to GitHub Pages.

### Goals
- Create a visually appealing and responsive design
- Optimize for performance and SEO
- Provide an easy content management system for blog posts
- Showcase portfolio projects effectively
- Ensure compatibility with GitHub Pages deployment

## 2. Technical Architecture

### Framework & Tools
- **Next.js**: Core framework (latest version with static export support)
- **TypeScript**: For type safety and better developer experience
- **React**: UI library (comes with Next.js)
- **MDX**: For writing blog posts with Markdown + React components
- **Tailwind CSS**: For styling
- **next-mdx-remote**: For processing MDX content
- **GitHub Actions**: For automated deployment to GitHub Pages

### Project Structure
```
blog/
├── public/               # Static assets (images, favicon, etc.)
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Layout components (Header, Footer, etc.)
│   │   ├── ui/           # UI components (Button, Card, etc.)
│   │   └── blog/         # Blog-specific components
│   ├── content/          # Blog posts and portfolio content (MDX)
│   │   ├── blog/         # Blog posts
│   │   └── projects/     # Portfolio projects
│   ├── lib/              # Utility functions and helpers
│   │   ├── mdx.ts        # MDX processing utilities
│   │   └── api.ts        # API utilities
│   ├── pages/            # Next.js pages
│   │   ├── index.tsx     # Home page
│   │   ├── blog/         # Blog pages
│   │   ├── projects/     # Portfolio pages
│   │   └── about.tsx     # About page
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

## 3. Feature Specifications

### Home Page
- Hero section with personal introduction
- Featured blog posts (3-4 most recent)
- Featured portfolio projects (3-4 best works)
- Newsletter signup (optional)
- Social media links

### Blog Section
- List view of all blog posts with pagination
- Search functionality
- Category/tag filtering
- Individual blog post pages with:
  - Title, date, author info
  - Reading time estimate
  - Table of contents
  - Content (MDX)
  - Social sharing buttons
  - Related posts
  - Comments section (optional, using Giscus for GitHub Discussions integration)

### Portfolio Section
- Grid/gallery view of projects
- Filtering by technology/category
- Individual project pages with:
  - Project title and description
  - Technologies used
  - Project images/screenshots
  - Links to live demo and source code
  - Case study content (if applicable)

### About Page
- Professional biography
- Skills and technologies
- Work experience
- Education
- Contact information
- Downloadable resume

### Global Features
- Responsive design (mobile, tablet, desktop)
- Dark/light mode toggle
- Navigation menu (with mobile hamburger menu)
- SEO optimization
- Analytics integration (Google Analytics or Plausible)
- Fast loading times (optimized images, code splitting)

## 4. Content Management

### Blog Posts
- Written in MDX format
- Stored in `src/content/blog/` directory
- Frontmatter for metadata:
  ```yaml
  ---
  title: "Post Title"
  date: "2025-05-23"
  excerpt: "Brief description of the post"
  coverImage: "/images/blog/cover.jpg"
  tags: ["nextjs", "react", "webdev"]
  ---
  ```
- Support for embedding React components within MDX

### Portfolio Projects
- Stored in `src/content/projects/` directory
- Frontmatter for metadata:
  ```yaml
  ---
  title: "Project Name"
  description: "Brief description of the project"
  date: "2025-05-23"
  coverImage: "/images/projects/cover.jpg"
  technologies: ["React", "Next.js", "Tailwind CSS"]
  demoUrl: "https://example.com"
  sourceUrl: "https://github.com/username/project"
  featured: true
  ---
  ```

## 5. Design & UI

### Design Principles
- Clean, minimalist aesthetic
- Typography-focused for readability
- Strategic use of whitespace
- Consistent color scheme
- Subtle animations for enhanced UX

### Color Scheme
- Primary: #3B82F6 (blue)
- Secondary: #10B981 (green)
- Accent: #8B5CF6 (purple)
- Background (light): #FFFFFF
- Background (dark): #1F2937
- Text (light): #1F2937
- Text (dark): #F9FAFB

### Typography
- Headings: Inter (sans-serif)
- Body: Inter (sans-serif)
- Code: JetBrains Mono (monospace)

## 6. Performance Optimization

### Strategies
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Font optimization with next/font
- Minimal JavaScript with static HTML generation
- CSS optimization with Tailwind (purging unused styles)
- Caching strategies
- Preloading critical assets

### Performance Targets
- Lighthouse score > 90 for all categories
- First Contentful Paint < 1s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

## 7. SEO Strategy

### Implementation
- Dynamic metadata with next/head
- Structured data (JSON-LD) for blog posts and projects
- Sitemap generation
- robots.txt configuration
- Canonical URLs
- Open Graph and Twitter card metadata

## 8. GitHub Pages Deployment

### Setup
- Configure Next.js for static export:
  ```js
  // next.config.js
  module.exports = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  }
  ```

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: out
          branch: gh-pages
```

## 9. Development Timeline

### Phase 1: Setup & Core Structure (1 week)
- Initialize Next.js project with TypeScript
- Set up Tailwind CSS
- Create basic project structure
- Implement layout components

### Phase 2: Content Management (1 week)
- Set up MDX processing
- Create blog post and project data structures
- Implement content fetching utilities

### Phase 3: Page Development (2 weeks)
- Develop home page
- Implement blog list and detail pages
- Create portfolio list and detail pages
- Build about page

### Phase 4: Design & UI Refinement (1 week)
- Implement responsive design
- Add dark/light mode
- Refine typography and spacing
- Add animations and transitions

### Phase 5: Performance & SEO (1 week)
- Optimize images and assets
- Implement SEO best practices
- Add analytics
- Performance testing and optimization

### Phase 6: GitHub Pages Deployment (2-3 days)
- Configure Next.js for static export
- Set up GitHub Actions workflow
- Test deployment
- Fix any deployment issues

## 10. Future Enhancements

### Potential Additions
- Comment system integration
- Newsletter subscription
- Search functionality with Algolia
- Internationalization support
- RSS feed
- Content rating system
- Reading progress indicator
- Related content suggestions
- Custom theme builder
