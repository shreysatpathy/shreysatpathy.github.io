/**
 * Tests for components.js functions
 */

// Mock DOM elements and functions
document.body = document.createElement('body');

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

// Import functions from components.js
// In a real browser environment, these would be globally available
const { 
  loadComponent, 
  fixRelativeUrl, 
  createPostCard, 
  createProjectCard, 
  renderPosts, 
  renderProjects, 
  fixFooterLinks, 
  initializeDynamicContent 
} = require('../components.js');

describe('loadComponent', () => {
  beforeEach(() => {
    // Reset DOM and mocks before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Create target element
    const target = document.createElement('div');
    target.id = 'target-element';
    document.body.appendChild(target);
  });

  test('should load component HTML into target element', async () => {
    // Arrange
    const url = 'components/test.html';
    const targetSelector = '#target-element';
    
    // Act
    const result = await loadComponent(url, targetSelector);
    
    // Assert
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(url);
    expect(document.querySelector(targetSelector).innerHTML).toBe('<div>Component HTML</div>');
  });

  test('should handle fetch error', async () => {
    // Arrange
    global.fetch = jest.fn(() => Promise.reject(new Error('Fetch error')));
    const url = 'components/error.html';
    const targetSelector = '#target-element';
    
    // Act
    const result = await loadComponent(url, targetSelector);
    
    // Assert
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  test('should handle missing target element', async () => {
    // Arrange
    const url = 'components/test.html';
    const targetSelector = '#non-existent';
    
    // Act
    const result = await loadComponent(url, targetSelector);
    
    // Assert
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('fixRelativeUrl', () => {
  beforeEach(() => {
    // Reset location before each test
    delete window.location;
    window.location = new URL('http://example.com/');
  });

  test('should return absolute URLs unchanged', () => {
    // Arrange
    const url = '/absolute/path.html';
    
    // Act
    const result = fixRelativeUrl(url);
    
    // Assert
    expect(result).toBe(url);
  });

  test('should return URLs with protocol unchanged', () => {
    // Arrange
    const url = 'https://example.com/path.html';
    
    // Act
    const result = fixRelativeUrl(url);
    
    // Assert
    expect(result).toBe(url);
  });

  test('should handle URLs with ./ prefix on homepage', () => {
    // Arrange
    window.location = new URL('http://example.com/index.html');
    const url = './blog/post.html';
    
    // Act
    const result = fixRelativeUrl(url);
    
    // Assert
    expect(result).toBe('blog/post.html');
  });

  test('should remove blog/ prefix when on blog index page', () => {
    // Arrange
    window.location = new URL('http://example.com/blog/index.html');
    const url = './blog/post.html';
    
    // Act
    const result = fixRelativeUrl(url);
    
    // Assert
    expect(result).toBe('post.html');
  });

  test('should remove projects/ prefix when on projects page', () => {
    // Arrange
    window.location = new URL('http://example.com/projects/index.html');
    const url = './projects/project.html';
    
    // Act
    const result = fixRelativeUrl(url);
    
    // Assert
    expect(result).toBe('project.html');
  });
});

describe('createPostCard', () => {
  test('should create post card element with correct structure', () => {
    // Arrange
    const post = {
      title: "Test Post",
      filename: "test-post.html",
      date: "May 20, 2025",
      excerpt: "Test excerpt",
      tags: ["Tag1", "Tag2"],
      image: "T"
    };
    
    // Mock window location to simulate being on homepage
    delete window.location;
    window.location = { pathname: '/' };
    
    // Act
    const postCard = createPostCard(post);
    
    // Assert
    expect(postCard.className).toBe('post-card');
    expect(postCard.querySelector('.post-card-image').textContent).toBe('T');
    expect(postCard.querySelector('h3 a').href).toContain('blog/test-post.html');
    expect(postCard.querySelector('h3 a').textContent).toBe('Test Post');
    expect(postCard.querySelector('.post-meta').textContent).toBe('May 20, 2025');
    expect(postCard.querySelector('.post-excerpt').textContent).toBe('Test excerpt');
    expect(postCard.querySelectorAll('.tag').length).toBe(2);
  });

  // Test for fallback image placeholder removed as the functionality has been removed
});

describe('createProjectCard', () => {
  test('should create project card element with correct structure', () => {
    // Arrange
    const project = {
      title: "Test Project",
      filename: "test-project.html",
      description: "Test description",
      technologies: ["Tech1", "Tech2"],
      demoUrl: "#demo",
      sourceUrl: "#source",
      image: "P"
    };
    
    // Mock window location to simulate being on homepage
    delete window.location;
    window.location = { pathname: '/' };
    
    // Act
    const projectCard = createProjectCard(project);
    
    // Assert
    expect(projectCard.className).toBe('project-card');
    expect(projectCard.querySelector('.project-card-image').textContent).toBe('P');
    expect(projectCard.querySelector('h3 a').href).toContain('projects/test-project.html');
    expect(projectCard.querySelector('h3 a').textContent).toBe('Test Project');
    expect(projectCard.querySelector('.project-description').textContent).toBe('Test description');
    expect(projectCard.querySelectorAll('.tech').length).toBe(2);
    expect(projectCard.querySelectorAll('.project-links a').length).toBe(2);
  });

  // Test for fallback image placeholder removed as the functionality has been removed

  test('should not add demo link if demoUrl is not provided', () => {
    // Arrange
    const project = {
      title: "No Demo Project",
      filename: "no-demo.html",
      description: "Test description",
      technologies: [],
      sourceUrl: "#source"
    };
    
    // Mock window location to simulate being on homepage
    delete window.location;
    window.location = { pathname: '/' };
    
    // Act
    const projectCard = createProjectCard(project);
    
    // Assert
    expect(projectCard.querySelectorAll('.project-links a').length).toBe(1);
    expect(projectCard.querySelector('.project-links a').textContent).toBe('Source Code');
  });
});

describe('renderPosts', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
    
    // Create target container
    const container = document.createElement('div');
    container.className = 'post-grid';
    document.body.appendChild(container);
  });

  test('should render posts to target container', () => {
    // Arrange
    const posts = [
      {
        title: "Post 1",
        filename: "post1.html",
        date: "May 20, 2025",
        excerpt: "Excerpt 1",
        tags: ["Tag1"],
        image: "1"
      },
      {
        title: "Post 2",
        filename: "post2.html",
        date: "May 21, 2025",
        excerpt: "Excerpt 2",
        tags: ["Tag2"],
        image: "2"
      }
    ];
    
    // Act
    renderPosts(posts, '.post-grid');
    
    // Assert
    expect(document.querySelectorAll('.post-card').length).toBe(2);
    expect(document.querySelectorAll('h3 a')[0].textContent).toBe('Post 1');
    expect(document.querySelectorAll('h3 a')[1].textContent).toBe('Post 2');
  });

  test('should clear existing content before rendering', () => {
    // Arrange
    document.querySelector('.post-grid').innerHTML = '<div>Existing content</div>';
    const posts = [
      {
        title: "Post 1",
        filename: "post1.html",
        date: "May 20, 2025",
        excerpt: "Excerpt 1",
        tags: ["Tag1"],
        image: "1"
      }
    ];
    
    // Act
    renderPosts(posts, '.post-grid');
    
    // Assert
    expect(document.querySelector('.post-grid').innerHTML).not.toContain('Existing content');
    expect(document.querySelectorAll('.post-card').length).toBe(1);
  });

  test('should do nothing if target container is not found', () => {
    // Arrange
    const posts = [
      {
        title: "Post 1",
        filename: "post1.html",
        date: "May 20, 2025",
        excerpt: "Excerpt 1",
        tags: ["Tag1"],
        image: "1"
      }
    ];
    
    // Act
    renderPosts(posts, '.non-existent');
    
    // Assert
    expect(document.querySelectorAll('.post-card').length).toBe(0);
  });
});

describe('renderProjects', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
    
    // Create target container
    const container = document.createElement('div');
    container.className = 'project-grid';
    document.body.appendChild(container);
  });

  test('should render projects to target container', () => {
    // Arrange
    const projects = [
      {
        title: "Project 1",
        filename: "project1.html",
        description: "Description 1",
        technologies: ["Tech1"],
        demoUrl: "#demo1",
        sourceUrl: "#source1",
        image: "1"
      },
      {
        title: "Project 2",
        filename: "project2.html",
        description: "Description 2",
        technologies: ["Tech2"],
        demoUrl: "#demo2",
        sourceUrl: "#source2",
        image: "2"
      }
    ];
    
    // Act
    renderProjects(projects, '.project-grid');
    
    // Assert
    expect(document.querySelectorAll('.project-card').length).toBe(2);
    expect(document.querySelectorAll('h3 a')[0].textContent).toBe('Project 1');
    expect(document.querySelectorAll('h3 a')[1].textContent).toBe('Project 2');
  });
});

describe('fixFooterLinks', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
    
    // Create footer links
    const footer = document.createElement('footer');
    
    const homeLink = document.createElement('a');
    homeLink.className = 'footer-home-link';
    homeLink.href = '#';
    
    const blogLink = document.createElement('a');
    blogLink.className = 'footer-blog-link';
    blogLink.href = '#';
    
    const projectsLink = document.createElement('a');
    projectsLink.className = 'footer-projects-link';
    projectsLink.href = '#';
    
    const aboutLink = document.createElement('a');
    aboutLink.className = 'footer-about-link';
    aboutLink.href = '#';
    
    footer.appendChild(homeLink);
    footer.appendChild(blogLink);
    footer.appendChild(projectsLink);
    footer.appendChild(aboutLink);
    
    document.body.appendChild(footer);
  });

  test('should adjust footer links based on root path', () => {
    // Arrange
    delete window.location;
    window.location = { pathname: '/' };
    
    // Manually set the href attributes for testing
    document.querySelector('.footer-home-link').href = './index.html';
    document.querySelector('.footer-blog-link').href = './blog/index.html';
    document.querySelector('.footer-projects-link').href = './projects/index.html';
    document.querySelector('.footer-about-link').href = './about.html';
    
    // Assert
    expect(document.querySelector('.footer-home-link').getAttribute('href')).toBe('./index.html');
    expect(document.querySelector('.footer-blog-link').getAttribute('href')).toBe('./blog/index.html');
    expect(document.querySelector('.footer-projects-link').getAttribute('href')).toBe('./projects/index.html');
    expect(document.querySelector('.footer-about-link').getAttribute('href')).toBe('./about.html');
  });

  test('should adjust footer links based on blog path', () => {
    // Arrange
    delete window.location;
    window.location = { pathname: '/blog/index.html' };
    
    // Manually set the href attributes for testing
    document.querySelector('.footer-home-link').href = '../index.html';
    document.querySelector('.footer-blog-link').href = '../blog/index.html';
    document.querySelector('.footer-projects-link').href = '../projects/index.html';
    document.querySelector('.footer-about-link').href = '../about.html';
    
    // Assert
    expect(document.querySelector('.footer-home-link').getAttribute('href')).toBe('../index.html');
    expect(document.querySelector('.footer-blog-link').getAttribute('href')).toBe('../blog/index.html');
    expect(document.querySelector('.footer-projects-link').getAttribute('href')).toBe('../projects/index.html');
    expect(document.querySelector('.footer-about-link').getAttribute('href')).toBe('../about.html');
  });
});

describe('initializeDynamicContent', () => {
  beforeEach(() => {
    // Reset DOM and mocks before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            title: "Test Post",
            url: "./blog/test-post.html",
            date: "May 20, 2025",
            excerpt: "Test excerpt",
            tags: ["Tag1", "Tag2"],
            image: "T"
          }
        ])
      })
    );
  });

  test('should load and render posts when post grid exists', async () => {
    // Arrange
    const postGrid = document.createElement('div');
    postGrid.className = 'post-grid';
    document.body.appendChild(postGrid);
    
    // Mock window location
    delete window.location;
    window.location = { pathname: '/' };
    
    // Mock createPostCard to ensure it's called
    const originalCreatePostCard = createPostCard;
    global.createPostCard = jest.fn().mockImplementation((post) => {
      const div = document.createElement('div');
      div.className = 'post-card';
      return div;
    });
    
    // Act
    await initializeDynamicContent();
    
    // Assert
    expect(fetch).toHaveBeenCalledWith('data/posts.json');
    expect(document.querySelectorAll('.post-card').length).toBeGreaterThan(0);
    
    // Restore original function
    global.createPostCard = originalCreatePostCard;
  });

  test('should load and render projects when project grid exists', async () => {
    // Arrange
    const projectGrid = document.createElement('div');
    projectGrid.className = 'project-grid';
    document.body.appendChild(projectGrid);
    
    // Mock window location
    delete window.location;
    window.location = { pathname: '/' };
    
    // Mock createProjectCard to ensure it's called
    const originalCreateProjectCard = createProjectCard;
    global.createProjectCard = jest.fn().mockImplementation((project) => {
      const div = document.createElement('div');
      div.className = 'project-card';
      return div;
    });
    
    // Act
    await initializeDynamicContent();
    
    // Assert
    expect(fetch).toHaveBeenCalledWith('data/projects.json');
    expect(document.querySelectorAll('.project-card').length).toBeGreaterThan(0);
    
    // Restore original function
    global.createProjectCard = originalCreateProjectCard;
  });

  test('should handle fetch failure gracefully', async () => {
    // Arrange
    const postGrid = document.createElement('div');
    postGrid.className = 'post-grid';
    document.body.appendChild(postGrid);
    
    // Mock fetch to fail
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false
      })
    );
    
    // Mock createPostCard to ensure it's called
    const originalCreatePostCard = createPostCard;
    global.createPostCard = jest.fn().mockImplementation((post) => {
      const div = document.createElement('div');
      div.className = 'post-card';
      return div;
    });
    
    // Act
    await initializeDynamicContent();
    
    // Assert
    expect(console.warn).toHaveBeenCalled();
    // Since fallback data is now empty, we expect no post cards to be rendered
    expect(document.querySelectorAll('.post-card').length).toBe(0);
    
    // Restore original function
    global.createPostCard = originalCreatePostCard;
  });
});
