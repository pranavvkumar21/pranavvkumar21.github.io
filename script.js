document.addEventListener('DOMContentLoaded', () => {
  // Fade-in on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade').forEach(el => observer.observe(el));

  // Mobile nav toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
    }
  });

  // Project modal
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = modal.querySelector('.modal-body');
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalBody.innerHTML = card.querySelector('.modal-info').innerHTML;
      modal.classList.add('open');
    });
  });
  document.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('open');
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Contact form mailto handler
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = encodeURIComponent(form.name.value);
    const email = encodeURIComponent(form.email.value);
    const message = encodeURIComponent(form.message.value);
    const mailto = 'mailto:pranavvkumar21@gmail.com'
      + '?subject=Portfolio%20Contact%20from%20' + name
      + '&body=' + message + '%0D%0A%0D%0AFrom:%20' + email;
    window.location.href = mailto;
    form.reset();
  });

  // Particles background
  if (window.particlesJS) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#00ffc6' },
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: { enable: true, distance: 150, color: '#00ffc6', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    });
  }
});
