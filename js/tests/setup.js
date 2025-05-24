/**
 * Jest setup file for the blog tests
 */

// Create a basic DOM environment
document.body = document.createElement('body');

// Mock window location
window.location = {
  pathname: '/',
  href: 'http://example.com/'
};

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
});

// Mock global functions that would be defined in the HTML
global.setupDarkMode = jest.fn();
global.setupMobileNavigation = jest.fn();
global.loadComponent = jest.fn();
global.fixRelativeUrl = jest.fn();
global.createPostCard = jest.fn();
global.createProjectCard = jest.fn();
global.renderPosts = jest.fn();
global.renderProjects = jest.fn();
global.fixFooterLinks = jest.fn();
global.initializeDynamicContent = jest.fn();

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<div>Component HTML</div>'),
    json: () => Promise.resolve([
      {
        title: "Test Post",
        filename: "test-post.html",
        date: "May 20, 2025",
        excerpt: "Test excerpt",
        tags: ["Tag1", "Tag2"],
        image: "T"
      }
    ])
  })
);

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
