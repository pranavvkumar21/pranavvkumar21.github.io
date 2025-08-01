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
});
