// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('nav ul');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Create Particle System with lazy loading
function createParticles() {
    const container = document.querySelector('.robotics-background');
    const particleCount = window.innerWidth < 768 ? 20 : 40; // Fewer particles on mobile
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// Lazy load particles only when needed
const createParticlesLazy = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createParticles();
                observer.disconnect();
            }
        });
    }, { rootMargin: '100px' });
    
    const background = document.querySelector('.robotics-background');
    if (background) {
        observer.observe(background);
    }
};

// Create Morphing Blobs
function createBlobs() {
    const container = document.querySelector('.robotics-background');
    
    for (let i = 1; i <= 3; i++) {
        const blob = document.createElement('div');
        blob.className = `blob blob-${i}`;
        container.appendChild(blob);
    }
}

// Interactive Mouse Trail Effect (optimized for performance)
document.addEventListener('mousemove', (e) => {
    // Only on desktop and throttle more aggressively
    if (window.innerWidth > 768 && Math.random() > 0.9) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.left = e.pageX + 'px';
        glow.style.top = e.pageY + 'px';
        document.body.appendChild(glow);
        
        setTimeout(() => glow.remove(), 2000);
    }
}, { passive: true });

// Utility function for debouncing
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Enhanced Parallax Scrolling with performance optimizations
const handleParallaxScroll = debounce(() => {
    const scrolled = window.pageYOffset;
    
    // Grid moves slower for depth
    const grid = document.querySelector('.grid-pattern');
    if (grid) {
        grid.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
    
    // Only animate visible elements
    document.querySelectorAll('.node').forEach((node, i) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            const speed = 0.15 + (i * 0.03);
            node.style.transform = `translateY(${scrolled * speed}px) scale(1)`;
        }
    });
    
    // Icons float at different rates - only if visible
    document.querySelectorAll('.icon-item').forEach((icon, i) => {
        const rect = icon.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            const speed = 0.1 + (i * 0.02);
            icon.style.transform = `translateY(${scrolled * speed}px)`;
        }
    });
    
    // Blobs move very subtly - only if visible
    document.querySelectorAll('.blob').forEach((blob, i) => {
        const rect = blob.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
            const speed = 0.05 + (i * 0.02);
            blob.style.transform = `translateY(${scrolled * speed}px)`;
        }
    });
}, 16); // 60fps

window.addEventListener('scroll', handleParallaxScroll, { passive: true });

// Lazy load GitHub stats only when section is visible
const loadGitHubStatsLazy = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchGitHubStats();
                observer.disconnect();
            }
        });
    }, { rootMargin: '100px' });
    
    const githubSection = document.getElementById('github');
    if (githubSection) {
        observer.observe(githubSection);
    }
};

// Fetch GitHub Statistics (unchanged but now lazy loaded)
async function fetchGitHubStats() {
    const username = 'pranavvkumar21';
    const statsContainer = document.getElementById('githubStats');
    
    try {
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userResponse.json();
        
        // Fetch repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const reposData = await reposResponse.json();
        
        // Calculate statistics
        const totalRepos = userData.public_repos;
        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = reposData.reduce((acc, repo) => acc + repo.forks_count, 0);
        const followers = userData.followers;
        const following = userData.following;
        
        // Display stats with animation
        statsContainer.innerHTML = `
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.1s both">
                <div class="stat-icon">📚</div>
                <div class="stat-info">
                    <h3>${totalRepos}</h3>
                    <p>Public Repositories</p>
                </div>
            </div>
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.2s both">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                    <h3>${totalStars}</h3>
                    <p>Total Stars</p>
                </div>
            </div>
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.3s both">
                <div class="stat-icon">🍴</div>
                <div class="stat-info">
                    <h3>${totalForks}</h3>
                    <p>Total Forks</p>
                </div>
            </div>
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.4s both">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>${followers}</h3>
                    <p>Followers</p>
                </div>
            </div>
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.5s both">
                <div class="stat-icon">🔗</div>
                <div class="stat-info">
                    <h3>${following}</h3>
                    <p>Following</p>
                </div>
            </div>
            <div class="stat-card" style="animation: fadeInUp 0.6s ease-out 0.6s both">
                <div class="stat-icon">📅</div>
                <div class="stat-info">
                    <h3>${new Date(userData.created_at).getFullYear()}</h3>
                    <p>Member Since</p>
                </div>
            </div>
        `;
        
        // Add fadeInUp animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        statsContainer.innerHTML = '<div class="loading">Unable to load GitHub statistics at this time.</div>';
    }
}

// Initialize everything when page loads with performance priorities
window.addEventListener('load', () => {
    // Critical functionality first
    loadProjectsFromJSON();
    
    // Defer non-critical features
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            createParticlesLazy();
            createBlobs();
            loadGitHubStatsLazy();
        });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            createParticlesLazy();
            createBlobs();
            loadGitHubStatsLazy();
        }, 100);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Simple form submission handler
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Add success animation
    const button = this.querySelector('.submit-btn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-check"></i> Sent!';
    button.style.background = 'linear-gradient(135deg, #00ff88, #00cc6e)';
    
    setTimeout(() => {
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
        button.innerHTML = originalText;
        button.style.background = '';
    }, 1500);
});

// Add intersection observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
});
async function loadProjectsFromJSON() {
  const container = document.getElementById('projects-container');
  container.innerHTML = '<p>Loading projects...</p>';

  try {
    const response = await fetch('projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const repos = await response.json();

    container.innerHTML = '';

    repos.forEach((repo, index) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-project-index', index);

      let linksHtml = '';
      if (repo.url && repo.url.trim() !== '') {
        linksHtml = `
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="event.stopPropagation()">
            <i class="fab fa-github"></i> View on GitHub
          </a>
        `;
      } else {
        linksHtml = `<span class="project-link unavailable">Code not publicly available</span>`;
      }

      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description provided'}</p>
        <div class="project-links">
          ${linksHtml}
        </div>
      `;

      // Add click event listener for modal
      card.addEventListener('click', () => openProjectModal(repo));

      container.appendChild(card);
    });
  } catch(error) {
    container.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
  }
}

// Modal functionality
function openProjectModal(project) {
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalImage = document.getElementById('modalImage');
  const modalDescription = document.getElementById('modalDescription');
  const modalLinks = document.getElementById('modalLinks');

  // Set modal content
  modalTitle.textContent = project.name;
  modalImage.src = project.image || 'assets/cover.jpg';
  modalImage.alt = project.name;
  modalDescription.textContent = project.fullDescription || project.description;

  // Set modal links
  let linksHtml = '';
  if (project.url && project.url.trim() !== '') {
    linksHtml = `
      <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fab fa-github"></i> View on GitHub
      </a>
    `;
  } else {
    linksHtml = `<span class="project-link unavailable">Code not publicly available</span>`;
  }
  modalLinks.innerHTML = linksHtml;

  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Re-enable background scrolling
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('projectModal');
  const closeBtn = modal.querySelector('.close');

  // Close modal when clicking the close button
  closeBtn.addEventListener('click', closeProjectModal);

  // Close modal when clicking outside the modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProjectModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeProjectModal();
    }
  });
});

window.addEventListener('DOMContentLoaded', loadProjectsFromJSON);

// Load Publications from JSON
async function loadPublications() {
    const pubList = document.getElementById('pubList');
    
    try {
        const response = await fetch('publications.json');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        
        pubList.innerHTML = '';
        data.publications.forEach(pub => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${pub.url}" target="_blank">${pub.title}</a>`;
            pubList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading publications:', error);
        pubList.innerHTML = '<li>Error loading publications</li>';
    }
}

// Call the function when DOM is loaded
window.addEventListener('DOMContentLoaded', loadPublications);
// Handle Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formStatus.style.display = 'block';
                formStatus.style.color = '#4CAF50';
                formStatus.innerHTML = '✓ Message sent successfully! I\'ll get back to you soon.';
                contactForm.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            formStatus.style.display = 'block';
            formStatus.style.color = '#f44336';
            formStatus.innerHTML = '✗ Oops! Something went wrong. Please try again.';
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Hide status message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        }
    });
}

// Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.toggleButton = null;
        this.init();
    }

    init() {
        // Apply saved theme on page load
        this.applyTheme(this.currentTheme);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }

    setupToggle() {
        // Create toggle button if it doesn't exist
        if (!document.getElementById('themeToggle')) {
            this.createToggleButton();
        }
        
        this.toggleButton = document.getElementById('themeToggle');
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleTheme());
            this.updateToggleButton();
        }
    }

    createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'themeToggle';
        toggleButton.className = 'theme-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle theme');
        
        toggleButton.innerHTML = `
            <span class="icon">🌙</span>
            <span class="text">Dark</span>
        `;
        
        document.body.insertBefore(toggleButton, document.body.firstChild);
    }

    applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateToggleButton();
        
        // Add a subtle animation when switching themes
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    updateToggleButton() {
        if (!this.toggleButton) return;
        
        const icon = this.toggleButton.querySelector('.icon');
        const text = this.toggleButton.querySelector('.text');
        
        if (this.currentTheme === 'light') {
            icon.textContent = '☀️';
            text.textContent = 'Light';
        } else {
            icon.textContent = '🌙';
            text.textContent = 'Dark';
        }
    }
}

// Initialize theme manager
new ThemeManager();

// Register Service Worker for caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
