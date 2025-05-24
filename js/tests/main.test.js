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

// We're using global mocks defined in setup.js
// These functions would normally be defined in the global scope in the browser

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
    
    // Act
    setupDarkMode();
    
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
    setupDarkMode();
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Act
    themeToggle.click();
    
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
    
    // Act
    setupMobileNavigation();
    
    // Assert
    const links = document.querySelectorAll('.nav-links a');
    expect(links[0].classList.contains('active')).toBe(true);
    expect(links[1].classList.contains('active')).toBe(false);
  });

  test('should add active class to link when URL includes the link href', () => {
    // Arrange
    Object.defineProperty(window, 'location', {
      value: { href: 'http://example.com/blog/post.html' }
    });
    
    // Act
    setupMobileNavigation();
    
    // Assert
    const links = document.querySelectorAll('.nav-links a');
    expect(links[0].classList.contains('active')).toBe(false);
    expect(links[1].classList.contains('active')).toBe(true);
  });
});

describe('DOM Content Loaded Event', () => {
  test('should call required functions when DOM is loaded', () => {
    // Arrange
    global.initializeDynamicContent = jest.fn();
    
    // Mock the functions that should be called
    const originalSetupDarkMode = setupDarkMode;
    const originalSetupMobileNavigation = setupMobileNavigation;
    global.setupDarkMode = jest.fn();
    global.setupMobileNavigation = jest.fn();
    
    // Act - simulate DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Assert
    expect(global.setupDarkMode).toHaveBeenCalled();
    expect(global.setupMobileNavigation).toHaveBeenCalled();
    expect(global.initializeDynamicContent).toHaveBeenCalled();
    
    // Restore original functions
    global.setupDarkMode = originalSetupDarkMode;
    global.setupMobileNavigation = originalSetupMobileNavigation;
  });

  test('should log error when initializeDynamicContent is not defined', () => {
    // Arrange
    global.initializeDynamicContent = undefined;
    
    // Mock the functions that should be called
    const originalSetupDarkMode = setupDarkMode;
    const originalSetupMobileNavigation = setupMobileNavigation;
    global.setupDarkMode = jest.fn();
    global.setupMobileNavigation = jest.fn();
    
    // Act - simulate DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Assert
    expect(console.error).toHaveBeenCalledWith('initializeDynamicContent function not found!');
    
    // Restore original functions
    global.setupDarkMode = originalSetupDarkMode;
    global.setupMobileNavigation = originalSetupMobileNavigation;
  });
});
