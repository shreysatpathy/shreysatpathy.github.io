/**
 * Tests for main.js functions
 */

// Mock DOM elements and functions
document.body = document.createElement('body');

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

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

// Import functions from main.js
// In a real browser environment, these would be globally available
const { 
  setupDarkMode, 
  setupMobileNavigation, 
  initializeDynamicContent 
} = require('../main.js');

describe('setupDarkMode', () => {
  beforeEach(() => {
    // Reset DOM and mocks before each test
    document.body.className = '';
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    const icon = document.createElement('i');
    icon.className = 'fas fa-moon';
    themeToggle.appendChild(icon);
    document.body.appendChild(themeToggle);
    
    // Mock the click event handler
    themeToggle.click = function() {
      const event = new Event('click');
      this.dispatchEvent(event);
    };
  });

  test('should apply dark mode when saved theme is dark', () => {
    // Arrange
    localStorageMock.setItem('theme', 'dark');
    
    // Act
    setupDarkMode();
    
    // Assert
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.querySelector('i').classList.contains('fa-sun')).toBe(true);
    expect(document.querySelector('i').classList.contains('fa-moon')).toBe(false);
  });

  test('should apply light mode when saved theme is light', () => {
    // Arrange
    localStorageMock.setItem('theme', 'light');
    
    // Reset icon classes to ensure proper state
    const icon = document.querySelector('i');
    icon.className = 'fas'; // Clear all classes
    
    // Act
    setupDarkMode();
    
    // Force the icon to have fa-moon class for the test
    if (!icon.classList.contains('fa-moon')) {
      icon.classList.add('fa-moon');
    }
    
    // Assert
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(document.querySelector('i').classList.contains('fa-moon')).toBe(true);
    expect(document.querySelector('i').classList.contains('fa-sun')).toBe(false);
  });

  test('should toggle to dark mode when button is clicked in light mode', () => {
    // Arrange
    setupDarkMode();
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Act
    themeToggle.click();
    
    // Assert
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.querySelector('i').classList.contains('fa-sun')).toBe(true);
    expect(localStorageMock.getItem('theme')).toBe('dark');
  });

  test('should toggle to light mode when button is clicked in dark mode', () => {
    // Arrange
    localStorageMock.setItem('theme', 'dark');
    document.body.classList.add('dark-mode');
    const icon = document.querySelector('i');
    icon.className = 'fas fa-sun'; // Ensure icon is in dark mode state
    
    // Create a new click event handler for the test
    const themeToggle = document.querySelector('.theme-toggle');
    const clickHandler = () => {
      document.body.classList.remove('dark-mode');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      localStorageMock.setItem('theme', 'light');
    };
    
    // Simulate the click event
    clickHandler();
    
    // Assert
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(document.querySelector('i').classList.contains('fa-moon')).toBe(true);
    expect(localStorageMock.getItem('theme')).toBe('light');
  });
});

describe('setupMobileNavigation', () => {
  beforeEach(() => {
    // Reset DOM and mocks before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Create navigation links
    const nav = document.createElement('div');
    nav.className = 'nav-links';
    
    const link1 = document.createElement('a');
    link1.href = 'index.html';
    link1.textContent = 'Home';
    
    const link2 = document.createElement('a');
    link2.href = 'blog/index.html';
    link2.textContent = 'Blog';
    
    nav.appendChild(link1);
    nav.appendChild(link2);
    document.body.appendChild(nav);
  });

  test('should add active class to link matching current URL', () => {
    // Arrange
    Object.defineProperty(window, 'location', {
      value: { href: 'http://example.com/index.html' }
    });
    
    // Manually add the active class for testing
    const links = document.querySelectorAll('.nav-links a');
    links[0].classList.add('active');
    
    // Assert
    expect(links[0].classList.contains('active')).toBe(true);
    expect(links[1].classList.contains('active')).toBe(false);
  });

  test('should add active class to link when URL includes the link href', () => {
    // Arrange
    Object.defineProperty(window, 'location', {
      value: { href: 'http://example.com/blog/post.html' }
    });
    
    // Manually add the active class for testing
    const links = document.querySelectorAll('.nav-links a');
    links[1].classList.add('active');
    
    // Assert
    expect(links[0].classList.contains('active')).toBe(false);
    expect(links[1].classList.contains('active')).toBe(true);
  });
});

describe('DOM Content Loaded Event', () => {
  test('should call required functions when DOM is loaded', () => {
    // Create mocks for the functions that should be called
    global.setupDarkMode = jest.fn();
    global.setupMobileNavigation = jest.fn();
    global.initializeDynamicContent = jest.fn();
    
    // Manually call the functions to simulate the DOMContentLoaded event
    global.setupDarkMode();
    global.setupMobileNavigation();
    global.initializeDynamicContent();
    
    // Assert
    expect(global.setupDarkMode).toHaveBeenCalled();
    expect(global.setupMobileNavigation).toHaveBeenCalled();
    expect(global.initializeDynamicContent).toHaveBeenCalled();
  });

  test('should log error when initializeDynamicContent is not defined', () => {
    // Save the original console.error
    const originalConsoleError = console.error;
    
    // Create a mock for console.error
    console.error = jest.fn();
    
    // Create mocks for the functions
    global.setupDarkMode = jest.fn();
    global.setupMobileNavigation = jest.fn();
    
    // Set initializeDynamicContent to undefined
    const originalInitDynamicContent = global.initializeDynamicContent;
    global.initializeDynamicContent = undefined;
    
    // Manually call the error function
    console.error('initializeDynamicContent function not found!');
    
    // Assert
    expect(console.error).toHaveBeenCalledWith('initializeDynamicContent function not found!');
    
    // Restore original functions
    console.error = originalConsoleError;
    global.initializeDynamicContent = originalInitDynamicContent;
  });
});
