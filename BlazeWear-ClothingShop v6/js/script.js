document.addEventListener('DOMContentLoaded', () => {
  // Toggle dropdown on click for touch users
  document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Ако устройството поддържа touch, предотврати навигацията при първи клик
      const li = link.parentElement;
      if (!li.classList.contains('open')) {
        e.preventDefault();
        // затвори другите отворени dropdowns
        document.querySelectorAll('.has-dropdown.open').forEach(other => {
          if (other !== li) other.classList.remove('open');
        });
        li.classList.add('open');
      }
      // ако вече е open, ще позволим нормалната навигация при втори клик
    });
  });

  // Close dropdowns on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(li => li.classList.remove('open'));
    }
  });

  // Optional: close with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.has-dropdown.open').forEach(li => li.classList.remove('open'));
    }
  });
});