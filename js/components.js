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

// Load footer when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a placeholder for the footer
  const footerPlaceholder = document.createElement('div');
  footerPlaceholder.id = 'footer-placeholder';
  document.body.appendChild(footerPlaceholder);
  
  // Load the footer component
  loadComponent('components/footer.html', '#footer-placeholder');
});
