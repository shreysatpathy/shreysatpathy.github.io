// Function to load and inject HTML components
async function loadComponent(url, targetSelector) {
  try {
    // Fetch the component HTML
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load component from ${url}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Find the target element
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      throw new Error(`Target element not found: ${targetSelector}`);
    }
    
    // Insert the HTML content
    targetElement.innerHTML = html;
    
    // Fix the paths in the footer links based on the current page location
    fixFooterLinks();
    
    return true;
  } catch (error) {
    console.error('Error loading component:', error);
    return false;
  }
}

/**
 * Create and render a post card component
 * @param {Object} post - Post data object
 * @param {string} post.title - Post title
 * @param {string} post.url - Post URL
 * @param {string} post.date - Post date
 * @param {string} post.excerpt - Post excerpt
 * @param {Array} post.tags - Array of tags
 * @param {string} post.image - Image letter or identifier
 * @returns {HTMLElement} - The created post card element
 */
function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  
  // Create image placeholder
  const imageDiv = document.createElement('div');
  imageDiv.className = 'post-card-image placeholder';
  imageDiv.textContent = post.image || post.title.charAt(0);
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'post-card-content';
  
  // Create title
  const titleH3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = post.url;
  titleLink.textContent = post.title;
  titleH3.appendChild(titleLink);
  
  // Create meta info (date)
  const metaP = document.createElement('p');
  metaP.className = 'post-meta';
  metaP.textContent = post.date;
  
  // Create excerpt
  const excerptP = document.createElement('p');
  excerptP.className = 'post-excerpt';
  excerptP.textContent = post.excerpt;
  
  // Create tags container
  const tagsDiv = document.createElement('div');
  tagsDiv.className = 'post-tags';
  
  // Add tags
  if (post.tags && post.tags.length) {
    post.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
  }
  
  // Assemble the card
  contentDiv.appendChild(titleH3);
  contentDiv.appendChild(metaP);
  contentDiv.appendChild(excerptP);
  contentDiv.appendChild(tagsDiv);
  
  article.appendChild(imageDiv);
  article.appendChild(contentDiv);
  
  return article;
}

/**
 * Create and render a project card component
 * @param {Object} project - Project data object
 * @param {string} project.title - Project title
 * @param {string} project.url - Project URL
 * @param {string} project.description - Project description
 * @param {Array} project.technologies - Array of technologies used
 * @param {string} project.demoUrl - Demo URL
 * @param {string} project.sourceUrl - Source code URL
 * @param {string} project.image - Image letter or identifier
 * @returns {HTMLElement} - The created project card element
 */
function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'project-card';
  
  // Create image placeholder
  const imageDiv = document.createElement('div');
  imageDiv.className = 'project-card-image placeholder';
  imageDiv.textContent = project.image || project.title.charAt(0);
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'project-card-content';
  
  // Create title
  const titleH3 = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = project.url;
  titleLink.textContent = project.title;
  titleH3.appendChild(titleLink);
  
  // Create description
  const descP = document.createElement('p');
  descP.className = 'project-description';
  descP.textContent = project.description;
  
  // Create technologies container
  const techDiv = document.createElement('div');
  techDiv.className = 'project-tech';
  
  // Add technologies
  if (project.technologies && project.technologies.length) {
    project.technologies.forEach(tech => {
      const techSpan = document.createElement('span');
      techSpan.className = 'tech';
      techSpan.textContent = tech;
      techDiv.appendChild(techSpan);
    });
  }
  
  // Create links container
  const linksDiv = document.createElement('div');
  linksDiv.className = 'project-links';
  
  // Add demo link if available
  if (project.demoUrl) {
    const demoLink = document.createElement('a');
    demoLink.href = project.demoUrl;
    demoLink.className = 'btn btn-sm';
    demoLink.textContent = 'Live Demo';
    linksDiv.appendChild(demoLink);
  }
  
  // Add source code link if available
  if (project.sourceUrl) {
    const sourceLink = document.createElement('a');
    sourceLink.href = project.sourceUrl;
    sourceLink.className = 'btn btn-sm btn-outline';
    sourceLink.textContent = 'Source Code';
    linksDiv.appendChild(sourceLink);
  }
  
  // Assemble the card
  contentDiv.appendChild(titleH3);
  contentDiv.appendChild(descP);
  contentDiv.appendChild(techDiv);
  contentDiv.appendChild(linksDiv);
  
  article.appendChild(imageDiv);
  article.appendChild(contentDiv);
  
  return article;
}

/**
 * Render a collection of posts to a target element
 * @param {Array} posts - Array of post objects
 * @param {string} targetSelector - CSS selector for the target container
 */
function renderPosts(posts, targetSelector) {
  const container = document.querySelector(targetSelector);
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Render each post
  posts.forEach(post => {
    const postCard = createPostCard(post);
    container.appendChild(postCard);
  });
}

/**
 * Render a collection of projects to a target element
 * @param {Array} projects - Array of project objects
 * @param {string} targetSelector - CSS selector for the target container
 */
function renderProjects(projects, targetSelector) {
  const container = document.querySelector(targetSelector);
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Render each project
  projects.forEach(project => {
    const projectCard = createProjectCard(project);
    container.appendChild(projectCard);
  });
}

// Function to fix footer links based on the current page location
function fixFooterLinks() {
  // Get the current path depth
  const pathParts = window.location.pathname.split('/').filter(part => part !== '');
  const depth = pathParts.length;
  
  // Base path prefix based on depth
  let basePath = '';
  for (let i = 0; i < depth; i++) {
    basePath += '../';
  }
  
  // If we're at the root, basePath should be empty
  if (basePath === '') {
    basePath = './';
  }
  
  // Update the footer links
  const homeLink = document.querySelector('.footer-home-link');
  const blogLink = document.querySelector('.footer-blog-link');
  const projectsLink = document.querySelector('.footer-projects-link');
  const aboutLink = document.querySelector('.footer-about-link');
  
  if (homeLink) homeLink.href = basePath + 'index.html';
  if (blogLink) blogLink.href = basePath + 'blog/index.html';
  if (projectsLink) projectsLink.href = basePath + 'projects/index.html';
  if (aboutLink) aboutLink.href = basePath + 'about.html';
}

// Load components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a placeholder for the footer
  const footerPlaceholder = document.createElement('div');
  footerPlaceholder.id = 'footer-placeholder';
  document.body.appendChild(footerPlaceholder);
  
  // Load the footer component
  loadComponent('components/footer.html', '#footer-placeholder');
  
  // Initialize dynamic content if data files exist
  initializeDynamicContent();
});

/**
 * Initialize dynamic content from data files
 */
async function initializeDynamicContent() {
  console.log('Initializing dynamic content...');
  
  // Fallback data in case JSON files can't be loaded
  const fallbackPosts = [
    {
      title: "Getting Started with Next.js",
      url: "blog/getting-started-with-nextjs.html",
      date: "May 20, 2025",
      excerpt: "Learn how to build modern web applications with Next.js, a powerful React framework.",
      tags: ["Next.js", "React", "Web Development"],
      image: "N"
    },
    {
      title: "Building Scalable ML Systems",
      url: "blog/building-scalable-ml-systems.html",
      date: "May 15, 2025",
      excerpt: "Strategies for designing and implementing production-grade machine learning systems that scale.",
      tags: ["Machine Learning", "Scalability", "Production"],
      image: "M"
    }
  ];
  
  const fallbackProjects = [
    {
      title: "E-commerce Platform",
      url: "projects/ecommerce-platform.html",
      description: "A full-featured e-commerce platform built with modern web technologies.",
      technologies: ["React", "Node.js", "MongoDB"],
      demoUrl: "#",
      sourceUrl: "#",
      image: "E"
    },
    {
      title: "AI-Powered Reliability System",
      url: "projects/ai-reliability-system.html",
      description: "Predictive maintenance system using machine learning to forecast equipment failures.",
      technologies: ["Python", "TensorFlow", "Time Series Analysis"],
      demoUrl: "#",
      sourceUrl: "#",
      image: "R"
    }
  ];
  
  try {
    // Check if we're on the homepage where these grids exist
    const postGrid = document.querySelector('.post-grid');
    const projectGrid = document.querySelector('.project-grid');
    
    if (postGrid) {
      console.log('Found post grid, loading posts...');
      try {
        // Try to load posts data
        const postsResponse = await fetch('data/posts.json');
        console.log('Posts response status:', postsResponse.status);
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          console.log('Posts data loaded:', postsData.length, 'posts');
          // Render featured posts (first 3 or fewer)
          const featuredPosts = postsData.slice(0, 3);
          renderPosts(featuredPosts, '.post-grid');
        } else {
          console.warn('Could not load posts.json, using fallback data');
          renderPosts(fallbackPosts, '.post-grid');
        }
      } catch (postError) {
        console.error('Error loading posts:', postError);
        renderPosts(fallbackPosts, '.post-grid');
      }
    }
    
    if (projectGrid) {
      console.log('Found project grid, loading projects...');
      try {
        // Try to load projects data
        const projectsResponse = await fetch('data/projects.json');
        console.log('Projects response status:', projectsResponse.status);
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log('Projects data loaded:', projectsData.length, 'projects');
          // Render featured projects (first 3 or fewer)
          const featuredProjects = projectsData.slice(0, 3);
          renderProjects(featuredProjects, '.project-grid');
        } else {
          console.warn('Could not load projects.json, using fallback data');
          renderProjects(fallbackProjects, '.project-grid');
        }
      } catch (projectError) {
        console.error('Error loading projects:', projectError);
        renderProjects(fallbackProjects, '.project-grid');
      }
    }
  } catch (error) {
    console.error('Error initializing dynamic content:', error);
    
    // Use fallback data if available
    try {
      renderPosts(fallbackPosts, '.post-grid');
      renderProjects(fallbackProjects, '.project-grid');
    } catch (fallbackError) {
      console.error('Error rendering fallback content:', fallbackError);
    }
  }
}
