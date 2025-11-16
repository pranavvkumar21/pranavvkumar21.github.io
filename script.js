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

// Create Particle System
function createParticles() {
    const container = document.querySelector('.robotics-background');
    const particleCount = 40;
    
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

// Create Morphing Blobs
function createBlobs() {
    const container = document.querySelector('.robotics-background');
    
    for (let i = 1; i <= 3; i++) {
        const blob = document.createElement('div');
        blob.className = `blob blob-${i}`;
        container.appendChild(blob);
    }
}

// Interactive Mouse Trail Effect
document.addEventListener('mousemove', (e) => {
    // Throttle to improve performance
    if (Math.random() > 0.8) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.left = e.pageX + 'px';
        glow.style.top = e.pageY + 'px';
        document.body.appendChild(glow);
        
        setTimeout(() => glow.remove(), 2000);
    }
});

// Enhanced Parallax Scrolling
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            
            // Grid moves slower for depth
            const grid = document.querySelector('.grid-pattern');
            if (grid) {
                grid.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
            
            // Nodes move at different speeds
            document.querySelectorAll('.node').forEach((node, i) => {
                const speed = 0.15 + (i * 0.03);
                node.style.transform = `translateY(${scrolled * speed}px) scale(1)`;
            });
            
            // Icons float at different rates
            document.querySelectorAll('.icon-item').forEach((icon, i) => {
                const speed = 0.1 + (i * 0.02);
                const currentTransform = window.getComputedStyle(icon).transform;
                icon.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Blobs move very subtly
            document.querySelectorAll('.blob').forEach((blob, i) => {
                const speed = 0.05 + (i * 0.02);
                blob.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// Fetch GitHub Statistics
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

// Initialize everything when page loads
window.addEventListener('load', () => {
    createParticles();
    createBlobs();
    fetchGitHubStats();
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

    repos.forEach(repo => {
      const card = document.createElement('div');
      card.className = 'project-card';

      let linksHtml = '';
      if (repo.url && repo.url.trim() !== '') {
        linksHtml = `
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="project-link">
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

      container.appendChild(card);
    });
  } catch(error) {
    container.innerHTML = `<p>Error loading projects: ${error.message}</p>`;
  }
}

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
