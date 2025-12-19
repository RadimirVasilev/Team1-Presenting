// js/product-modal.js
document.addEventListener('DOMContentLoaded', function () {
  // 1) Създаваме модала, ако го няма
  let modal = document.getElementById('productModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'product-modal';
    modal.innerHTML = `
      <div class="pm-backdrop" data-close="true"></div>
      <div class="pm-panel" role="dialog" aria-modal="true">
        <button class="pm-close" aria-label="Затвори">&times;</button>
        <div class="pm-body">
          <div class="pm-left">
            <div class="pm-image"></div>
          </div>
          <div class="pm-right">
            <h2 class="pm-title"></h2>
            <div class="pm-price">Цена: <span class="pm-price-val"></span> лв</div>

            <div class="pm-controls">
              <label>Размер</label>
              <div class="pm-sizes"></div>
              <label>Цвят</label>
              <div class="pm-colors"></div>
            </div>

            <div class="pm-actions">
              <button type="button" class="pm-back">Назад</button>
              <button type="button" class="pm-add">Добави в количката</button>
            </div>

            <div class="pm-related">
              <h4>Може да ви хареса</h4>
              <div class="pm-related-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const placeholderImg = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
       <rect width="100%" height="100%" fill="#222"/>
       <text x="50%" y="50%" fill="#999" font-size="20" text-anchor="middle" dy=".35em">Няма снимка</text>
     </svg>`
  );

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  // Затваряне
  modal.addEventListener('click', function (e) {
    if (e.target.matches('.pm-backdrop, .pm-close, .pm-back')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Клик върху картинка/placeholder
  document.body.addEventListener('click', function (e) {
    const box = e.target.closest('.product-image');
    if (!box) return;
    const article = box.closest('.product');
    if (!article) return;
    showProduct(article);
  });

  // Enter върху фокусиран .product-image
  document.body.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const el = document.activeElement;
    if (!el || !el.classList.contains('product-image')) return;
    const article = el.closest('.product');
    if (!article) return;
    showProduct(article);
  });

  function showProduct(article) {
    const name  = article.getAttribute('data-name') || 'Продукт';
    const base  = parseFloat(article.getAttribute('data-price-base') || article.getAttribute('data-price') || '0') || 0;
    const img   = article.getAttribute('data-img') || '';
    let sizes   = [];
    let colors  = [];

    try { sizes  = JSON.parse(article.getAttribute('data-sizes')  || '[]'); } catch(e){}
    try { colors = JSON.parse(article.getAttribute('data-colors') || '[]'); } catch(e){}

    const titleEl    = modal.querySelector('.pm-title');
    const priceEl    = modal.querySelector('.pm-price-val');
    const imgWrap    = modal.querySelector('.pm-image');
    const sizesWrap  = modal.querySelector('.pm-sizes');
    const colorsWrap = modal.querySelector('.pm-colors');
    const relatedWrap= modal.querySelector('.pm-related-list');

    titleEl.textContent = name;
    priceEl.textContent = base.toFixed(2);

    // снимка
    imgWrap.innerHTML = '';
    const im = document.createElement('img');
    im.src = img || placeholderImg;
    im.alt = name;
    im.style.maxWidth = '100%';
    im.style.display = 'block';
    imgWrap.appendChild(im);

    // размери
    if (!sizes.length) sizes = [{label:'S',mod:0}];
    sizesWrap.innerHTML = '';
    sizes.forEach((s, i)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-btn';
      b.dataset.mod = Number(s.mod || 0);
      b.textContent = s.label;
      if (i===0) b.classList.add('active');
      sizesWrap.appendChild(b);
    });

    // цветове
    if (!colors.length) colors = ['Стандартен'];
    colorsWrap.innerHTML = '';
    colors.forEach((c, i)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'color-btn';
      b.dataset.color = c;
      b.textContent = c;
      if (i===0) b.classList.add('active');
      colorsWrap.appendChild(b);
    });

    function updatePrice() {
      const activeSize = modal.querySelector('.size-btn.active');
      const mod = activeSize ? Number(activeSize.dataset.mod || 0) : 0;
      priceEl.textContent = (base + mod).toFixed(2);
    }

    modal.querySelectorAll('.size-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        modal.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        updatePrice();
      });
    });
    modal.querySelectorAll('.color-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        modal.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // related продукти – просто имена
    relatedWrap.innerHTML = '';
    Array.from(document.querySelectorAll('.product')).slice(0,4).forEach(p=>{
      const div = document.createElement('div');
      div.className = 'mini-card';
      div.textContent = p.getAttribute('data-name') || 'Продукт';
      relatedWrap.appendChild(div);
    });

    // Добавяне в количката – изпращаме custom event към cart.js
    const addBtnOld = modal.querySelector('.pm-add');
    const addBtn = addBtnOld.cloneNode(true);
    addBtnOld.parentNode.replaceChild(addBtn, addBtnOld);

    addBtn.addEventListener('click', ()=>{
      const sizeBtn = modal.querySelector('.size-btn.active');
      const colorBtn= modal.querySelector('.color-btn.active');
      const sizeLbl = sizeBtn ? sizeBtn.textContent : '';
      const colorLbl= colorBtn? colorBtn.dataset.color : '';
      const price   = parseFloat(priceEl.textContent || '0') || 0;

      const baseId  = article.getAttribute('data-id') || ('p-' + Date.now());
      const id      = baseId + '::' + sizeLbl + '::' + colorLbl;

      const payload = {
        id,
        name: name + (sizeLbl ? ' / '+sizeLbl : '') + (colorLbl ? ' / '+colorLbl : ''),
        price,
        img: img || ''
      };

      window.dispatchEvent(new CustomEvent('cart:add', { detail: payload }));

      addBtn.textContent = 'Добавено ✓';
      setTimeout(()=>{ addBtn.textContent = 'Добави в количката'; closeModal(); }, 600);
    });

    openModal();
    updatePrice();
  }
});
