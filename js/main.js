// Main JavaScript file for the static blog site

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load components first
  loadFooterComponent().then(() => {
    // Dark mode toggle functionality
    setupDarkMode();
    
    // Initialize any other interactive elements
    setupMobileNavigation();
  });
});

/**
 * Set up dark mode toggle functionality
 */
function setupDarkMode() {
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Check for saved user preference
  const savedTheme = localStorage.getItem('theme');
  
  // Apply saved theme or use system preference
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
  
  // Toggle dark mode when button is clicked
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Update icon
    if (document.body.classList.contains('dark-mode')) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    }
  });
}

/**
 * Set up mobile navigation for smaller screens
 */
function setupMobileNavigation() {
  // This can be expanded if we add a mobile menu toggle button
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Add active class to current page
  navLinks.forEach(link => {
    if (link.href === window.location.href || window.location.href.includes(link.href)) {
      link.classList.add('active');
    }
  });
}

/**
 * Load the footer component
 */
async function loadFooterComponent() {
  try {
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
    
    // Fetch the footer HTML
    const response = await fetch(basePath + 'components/footer.html');
    if (!response.ok) {
      throw new Error(`Failed to load footer component`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a container for the footer if it doesn't exist
    let footerContainer = document.querySelector('#footer-container');
    if (!footerContainer) {
      footerContainer = document.createElement('div');
      footerContainer.id = 'footer-container';
      document.body.appendChild(footerContainer);
    }
    
    // Insert the footer HTML
    footerContainer.innerHTML = html;
    
    // Fix the footer links
    const homeLink = document.querySelector('.footer-home-link');
    const blogLink = document.querySelector('.footer-blog-link');
    const projectsLink = document.querySelector('.footer-projects-link');
    const aboutLink = document.querySelector('.footer-about-link');
    
    if (homeLink) homeLink.href = basePath + 'index.html';
    if (blogLink) blogLink.href = basePath + 'blog/index.html';
    if (projectsLink) projectsLink.href = basePath + 'projects/index.html';
    if (aboutLink) aboutLink.href = basePath + 'about.html';
    
    return true;
  } catch (error) {
    console.error('Error loading footer component:', error);
    return false;
  }
}
