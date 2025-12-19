// women-slider.js – хоризонтален скрол за секциите data-slider
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-slider]').forEach(function (section) {
    var row = section.querySelector('.women-products-row');
    if (!row) return;

    var prev = section.querySelector('.slider-btn-prev');
    var next = section.querySelector('.slider-btn-next');

    function slide(dir) {
      var amount = row.clientWidth * 0.8;
      row.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { slide(-1); });
    if (next) next.addEventListener('click', function () { slide(1); });
  });
});
