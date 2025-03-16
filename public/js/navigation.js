/**
 * Navigation Scripts
 * Hanterar navigationsfunktionalitet på GoBet-plattformen.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Hantera mobilmenyn
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      
      // Förhindra scrollning av sidan när menyn är öppen
      if (mainNav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  // Markera aktiv sida i navigationen
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Kontrollera om länken matchar nuvarande sida
    if (linkPath === currentPath || 
        (currentPath.endsWith('/') && linkPath === currentPath + 'index.html') ||
        (currentPath === '/' && linkPath === '/index.html') ||
        (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== '/index.html')) {
      
      // Hitta parent nav-item och markera som aktiv
      const navItem = link.closest('.nav-item');
      if (navItem) {
        navItem.classList.add('active');
      }
    }
  });
  
  // Skrolldetektering för header-skugga
  const header = document.querySelector('.app-header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Stäng mobilmenyn när man klickar på en länk
  const navLinksMobile = document.querySelectorAll('.main-nav .nav-link');
  
  navLinksMobile.forEach(link => {
    link.addEventListener('click', function() {
      if (mainNav.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}); 