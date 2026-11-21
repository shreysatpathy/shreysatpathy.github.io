// Main JavaScript file for the static blog site

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, initializing site...');
  
  // Dark mode toggle functionality
  setupDarkMode();
  
  // Initialize any other interactive elements
  setupMobileNavigation();
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
    document.documentElement.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
  
  // Toggle dark mode when button is clicked
  themeToggle.addEventListener('click', function() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode', isDark);
    
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
  
  // Add active class to current page. Compare normalized paths: the home link
  // ("/") must match exactly, otherwise it would match every page; section
  // links ("/blog/") also match pages nested under them.
  const normalize = p => p.replace(/index\.html$/, '');
  const current = normalize(window.location.pathname);
  navLinks.forEach(link => {
    const target = normalize(new URL(link.href, window.location.href).pathname);
    const isActive = target === '/'
      ? current === '/'
      : current === target || (target.endsWith('/') && current.startsWith(target));
    link.classList.toggle('active', isActive);
  });
}

// Export functions for testing in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupDarkMode,
    setupMobileNavigation
  };
}
