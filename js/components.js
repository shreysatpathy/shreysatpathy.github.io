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
 * Fix relative URLs based on the current page location
 * @param {string} url - The URL to fix
 * @returns {string} - The fixed URL
 */
function fixRelativeUrl(url) {
  console.log('Fixing URL:', url, 'from path:', window.location.pathname);
  
  // If the URL is already absolute or has a protocol, return it as is
  if (url.startsWith('/') || url.includes('://')) {
    return url;
  }
  
  // Handle URLs with leading ./ notation
  if (url.startsWith('./')) {
    // For URLs starting with ./, we need to adjust based on current directory
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part !== '');
    
    // If we're in a subdirectory (like blog/ or projects/), we need to adjust the path
    if (pathParts.length > 0) {
      const currentDir = pathParts[pathParts.length - 1];
      
      // If we're in blog directory
      if (currentDir === 'blog' || path.includes('/blog/')) {
        // If the URL is pointing to a blog post from blog directory
        if (url.startsWith('./blog/')) {
          return url.replace('./blog/', '');
        }
      }
      
      // If we're in projects directory
      if (currentDir === 'projects' || path.includes('/projects/')) {
        // If the URL is pointing to a project from projects directory
        if (url.startsWith('./projects/')) {
          return url.replace('./projects/', '');
        }
      }
    }
    
    // For other cases, just remove the ./ prefix
    return url.substring(2);
  }
  
  // Get current path information
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(part => part !== '');
  
  // Detect if we're on the blog index page
  const isBlogIndexPage = path.includes('/blog/index.html') || 
                         path.endsWith('/blog/') ||
                         path.endsWith('/blog');
                         
  // Detect if we're on the home page (root or index.html)
  const isHomePage = path === '/' || 
                    path.endsWith('/index.html') || 
                    pathParts.length === 0 || 
                    (pathParts.length === 1 && pathParts[0] === 'index.html');
  
  console.log('Page context:', { isHomePage, isBlogIndexPage, pathParts });
  
  // Special case for blog/index.html accessing posts from posts.json
  if (isBlogIndexPage && url.startsWith('blog/')) {
    // When on blog/index.html, we need to access blog posts directly
    return url.replace('blog/', '');
  }
  
  // Special case for home page
  if (isHomePage) {
    // On home page, URLs should be used exactly as they are in posts.json
    // If the URL doesn't start with ./ but is a relative path like blog/post.html or projects/project.html
    // we need to make sure it's properly handled
    if (!url.startsWith('./') && !url.startsWith('/') && !url.includes('://')) {
      // The URL is already in the correct format for the home page
      return url;
    }
    return url;
  }
  
  // If we're in a subdirectory (like blog/ or projects/), we need to adjust the path
  if (pathParts.length > 0) {
    const currentDir = pathParts[pathParts.length - 1];
    
    // If the URL starts with the current directory, we need to remove it to avoid duplication
    if (url.startsWith(currentDir + '/')) {
      return url;
    }
    
    // If we're in a blog/ or projects/ directory and trying to access another blog/ or projects/ page
    if ((currentDir === 'blog' || currentDir === 'projects') && 
        (url.startsWith('blog/') || url.startsWith('projects/'))) {
      // Go up one level and then to the target
      return '../' + url;
    }
  }
  
  return url;
}

/**
 * Create and render a post card component
 * @param {Object} post - Post data object
 * @param {string} post.title - Post title
 * @param {string} post.filename - Post HTML filename
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
  
  // Build the URL based on the current page context
  const path = window.location.pathname;
  console.log('Current path:', path);
  
  // Check if we're on the homepage
  const isHomePage = path === '/' || 
                    path.endsWith('/index.html') || 
                    path.split('/').filter(part => part !== '').length === 0;
  
  // Check if we're on a blog page
  const isBlogPage = path.includes('/blog/');
  
  // Determine the correct URL path
  let url;
  if (isBlogPage) {
    // On blog page, we can use the filename directly without any prefix
    url = post.filename;
    console.log('On blog page, using filename directly:', url);
  } else if (isHomePage) {
    // On homepage, we need to include the blog directory
    url = 'blog/' + post.filename;
    console.log('On homepage, adding blog/ prefix:', url);
  } else {
    // From other pages, we need to navigate to the blog directory
    url = 'blog/' + post.filename;
    console.log('On other page, adding blog/ prefix:', url);
  }
  
  titleLink.href = url;
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
 * @param {string} project.filename - Project HTML filename
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
  
  // Build the URL based on the current page context
  const path = window.location.pathname;
  console.log('Current path (project):', path);
  
  // Check if we're on the homepage
  const isHomePage = path === '/' || 
                    path.endsWith('/index.html') || 
                    path.split('/').filter(part => part !== '').length === 0;
  
  // Check if we're on a projects page
  const isProjectsPage = path.includes('/projects/');
  
  // Determine the correct URL path
  let url;
  if (isProjectsPage) {
    // On projects page, we can use the filename directly without any prefix
    url = project.filename;
    console.log('On projects page, using filename directly:', url);
  } else if (isHomePage) {
    // On homepage, we need to include the projects directory
    url = 'projects/' + project.filename;
    console.log('On homepage, adding projects/ prefix:', url);
  } else {
    // From other pages, we need to navigate to the projects directory
    url = 'projects/' + project.filename;
    console.log('On other page, adding projects/ prefix:', url);
  }
  
  titleLink.href = url;
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
  
  // Load the footer component with a path adjusted based on current location
  const path = window.location.pathname;
  const isInSubdirectory = path.includes('/blog/') || path.includes('/projects/');
  const footerPath = isInSubdirectory ? '../components/footer.html' : 'components/footer.html';
  loadComponent(footerPath, '#footer-placeholder');
  
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
    // {
    //   title: "Getting Started with Next.js",
    //   filename: "getting-started-with-nextjs.html",
    //   date: "May 20, 2025",
    //   excerpt: "Learn how to build modern web applications with Next.js, a powerful React framework.",
    //   tags: ["Next.js", "React", "Web Development"],
    //   image: "N"
    // },
    // {
    //   title: "Building Scalable ML Systems",
    //   filename: "building-scalable-ml-systems.html",
    //   date: "May 15, 2025",
    //   excerpt: "Strategies for designing and implementing production-grade machine learning systems that scale.",
    //   tags: ["Machine Learning", "Scalability", "Production"],
    //   image: "M"
    // }
  ];
  
  const fallbackProjects = [
    // {
    //   title: "E-commerce Platform",
    //   filename: "ecommerce-platform.html",
    //   description: "A full-featured e-commerce platform built with modern web technologies.",
    //   technologies: ["React", "Node.js", "MongoDB"],
    //   demoUrl: "#",
    //   sourceUrl: "#",
    //   image: "E"
    // },
    // {
    //   title: "AI-Powered Reliability System",
    //   filename: "ai-reliability-system.html",
    //   description: "Predictive maintenance system using machine learning to forecast equipment failures.",
    //   technologies: ["Python", "TensorFlow", "Time Series Analysis"],
    //   demoUrl: "#",
    //   sourceUrl: "#",
    //   image: "R"
    // }
  ];
  
  try {
    // Check if we're on the homepage where these grids exist
    const postGrid = document.querySelector('.post-grid');
    const projectGrid = document.querySelector('.project-grid');
    
    if (postGrid) {
      console.log('Found post grid, loading posts...');
      try {
        // Determine if we're on the blog index page or the home page
        const isBlogIndexPage = window.location.pathname.includes('/blog/index.html') || 
                               window.location.pathname.endsWith('/blog/');
        console.log('Is blog index page:', isBlogIndexPage);
        
        // Adjust the path for data file based on current location
        let dataPath = 'data/posts.json';
        if (isBlogIndexPage) {
          dataPath = '../data/posts.json';
        }
        
        // Try to load posts data
        const postsResponse = await fetch(dataPath);
        console.log('Posts response status:', postsResponse.status);
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          console.log('Posts data loaded:', postsData.length, 'posts');
          
          if (isBlogIndexPage) {
            // On blog index page, show all posts
            renderPosts(postsData, '.post-grid');
          } else {
            // On home page, show only featured posts (first 3 or fewer)
            const featuredPosts = postsData.slice(0, 3);
            renderPosts(featuredPosts, '.post-grid');
          }
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
        // Determine if we're on the projects index page or the home page
        const isProjectsIndexPage = window.location.pathname.includes('/projects/index.html') || 
                                  window.location.pathname.endsWith('/projects/');
        console.log('Is projects index page:', isProjectsIndexPage);
        
        // Adjust the path for data file based on current location
        let dataPath = 'data/projects.json';
        if (isProjectsIndexPage) {
          dataPath = '../data/projects.json';
        }
        
        // Try to load projects data
        const projectsResponse = await fetch(dataPath);
        console.log('Projects response status:', projectsResponse.status);
        
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          console.log('Projects data loaded:', projectsData.length, 'projects');
          
          if (isProjectsIndexPage) {
            // On projects index page, show all projects
            renderProjects(projectsData, '.project-grid');
          } else {
            // On home page, show only featured projects (first 3 or fewer)
            const featuredProjects = projectsData.slice(0, 3);
            renderProjects(featuredProjects, '.project-grid');
          }
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

// Export functions for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadComponent,
    fixRelativeUrl,
    createPostCard,
    createProjectCard,
    renderPosts,
    renderProjects,
    fixFooterLinks,
    initializeDynamicContent
  };
}
