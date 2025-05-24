// Main JavaScript file for the static blog site

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, initializing site...');
  
  // Dark mode toggle functionality
  setupDarkMode();
  
  // Initialize any other interactive elements
  setupMobileNavigation();
  
  // Make sure dynamic content is loaded
  if (typeof initializeDynamicContent === 'function') {
    console.log('Calling initializeDynamicContent from main.js');
    initializeDynamicContent();
  } else {
    console.error('initializeDynamicContent function not found!');
  }
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

// Export functions for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupDarkMode,
    setupMobileNavigation,
    initializeDynamicContent: typeof initializeDynamicContent !== 'undefined' ? initializeDynamicContent : undefined
  };
}
