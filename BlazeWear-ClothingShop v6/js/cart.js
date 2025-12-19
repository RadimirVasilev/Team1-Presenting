// cart.js — улучшено с правилно отваряне на количка и обновяване на badge
document.addEventListener('DOMContentLoaded', function () {
  try {
    var panel = document.getElementById('cartPanel');
    var cartContents = document.getElementById('cartContents');
    var cartTotalEl = document.getElementById('cartTotal');
    var cartClose = document.getElementById('cartClose');
    var openFloating = document.getElementById('openCartFloating');
    var headerCartBtn = document.getElementById('cartOpenBtn') || document.querySelector('.icon-btn[aria-label="cart"]');


    if (!panel) {
      console.warn('cart.js: #cartPanel липсва в DOM');
      return;
    }
    if (!cartContents) {
      cartContents = document.createElement('div');
      cartContents.id = 'cartContents';
      panel.insertBefore(cartContents, panel.querySelector('.cart-footer') || null);
    }
    if (!cartTotalEl) {
      var t = panel.querySelector('#cartTotal');
      if (!t) {
        t = document.createElement('strong');
        t.id = 'cartTotal';
        var footer = panel.querySelector('.cart-footer');
        if (footer) footer.insertBefore(t, footer.firstChild);
      }
      cartTotalEl = t;
    }

    var cart = {};

    function formatPrice(n) {
      var num = Number(n) || 0;
      return num.toFixed(2) + ' лв';
    }

    function safeImgData(uri) {
      if (!uri) {
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"></svg>';
      }
      return uri;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // РЕНДЕРИРАНЕ НА КОЛИЧКАТА + обновяване на badge-а
    function renderCart() {
      cartContents.innerHTML = '';
      var ids = Object.keys(cart);

      // ако няма продукти
      if (ids.length === 0) {
        var p = document.createElement('p');
        p.className = 'cart-empty';
        p.innerText = 'В момента количката е празна';
        cartContents.appendChild(p);

        if (cartTotalEl) cartTotalEl.innerText = formatPrice(0);

        // badge = 0 и скрит
        updateBadge();
        return;
      }

      var total = 0;
      ids.forEach(function (id) {
        var it = cart[id];
        total += (it.price * it.qty);

        var item = document.createElement('div');
        item.className = 'cart-item';
        var imgSrc = safeImgData(it.img);

        item.innerHTML = ''
          + '<img src="' + imgSrc + '" alt="">'
          + '<div class="meta">'
            + '<h4>' + escapeHtml(it.name) + '</h4>'
            + '<div class="price">' + formatPrice(it.price) + '</div>'
            + '<div class="qty-controls">'
              + '<button class="dec" data-id="' + id + '">-</button>'
              + '<span class="qty">' + it.qty + '</span>'
              + '<button class="inc" data-id="' + id + '">+</button>'
            + '</div>'
          + '</div>'
          + '<button class="remove-item" data-id="' + id + '" title="Премахни">🗑</button>';

        cartContents.appendChild(item);
      });

      if (cartTotalEl) cartTotalEl.innerText = formatPrice(total);

      // attach listeners за + / - / 🗑
      cartContents.querySelectorAll('.inc').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.id;
          if (cart[id]) {
            cart[id].qty++;
            saveCartToLocalStorage();
            renderCart(); // вътре ще се извика updateBadge()
          }
        });
      });

      cartContents.querySelectorAll('.dec').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.id;
          if (!cart[id]) return;
          if (cart[id].qty > 1) {
            cart[id].qty--;
          } else {
            delete cart[id];
          }
          saveCartToLocalStorage();
          renderCart();
        });
      });

      cartContents.querySelectorAll('.remove-item').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.id;
          if (cart[id]) {
            delete cart[id];
            saveCartToLocalStorage();
            renderCart();
          }
        });
      });

      // след всяко рендериране обновяваме badge-а
      updateBadge();
    }

    function saveCartToLocalStorage() {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (e) {
        console.warn('cart.js: не мога да запаза в localStorage', e);
      }
    }

    function loadCartFromLocalStorage() {
      try {
        var saved = localStorage.getItem('cart');
        if (saved) {
          cart = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('cart.js: не мога да заредя от localStorage', e);
      }
    }

    // Badge показва общия брой БРОЙКИ (qty)
    function updateBadge() {
      var badge = document.getElementById('cartBadge');
      if (!badge) return;

      var count = 0;
      Object.keys(cart).forEach(function (id) {
        var it = cart[id];
        if (it && it.qty) {
          count += Number(it.qty) || 0;
        }
      });

      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
        ;
      } else {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    }

    function openPanel() {
      // ВЕЧЕ НЕ ПРОВЕРЯВАМЕ ДАЛИ ИМА АРТИКУЛИ
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      try { panel.style.right = '0px'; } catch (e) {}
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      try { panel.style.right = '-420px'; } catch (e) {}
    }

    // wire open/close triggers
    if (headerCartBtn) headerCartBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openPanel();
    });
    if (openFloating) openFloating.addEventListener('click', function (e) {
      e.preventDefault();
      openPanel();
    });
    if (cartClose) cartClose.addEventListener('click', function (e) {
      e.preventDefault();
      closePanel();
    });

    // LISTENER: custom 'cart:add' event from product pages
    document.addEventListener('cart:add', function(e) {
      var detail = e.detail;
      if (!detail) return;

      var id = detail.id;
      var name = detail.name;
      var price = parseFloat(detail.price) || 0;
      var img = detail.img || '';
      var qty = detail.qty || 1;

      if (!cart[id]) {
        cart[id] = { id: id, name: name, price: price, img: img, qty: qty };
      } else {
        cart[id].qty += qty;
      }

      saveCartToLocalStorage();
      renderCart(); // вътре ще обнови и badge-а

      console.log('cart.js: добавен артикул', detail);
    });

    // Load cart from localStorage
    loadCartFromLocalStorage();
    renderCart();
    updateBadge();

    // Clear cart after successful order
    window.addEventListener('bw:order:success', function (ev) {
      try {
        cart = {};
        saveCartToLocalStorage();
        renderCart();
        updateBadge();
        closePanel();
        console.info('cart.js: количката е изчистена.');
      } catch (e) {
        console.warn('cart.js: грешка при изчистване', e);
      }
    });

  } catch (err) {
    console.error('cart.js error:', err);
  }
});

// Payment modal
document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('paymentModal');
  if (!modal) return;

  var openButtons = document.querySelectorAll('#checkoutBtn');
  var closeBtns = modal.querySelectorAll('.pm-close, .payment-modal-backdrop');
  var form = document.getElementById('paymentForm');
  var pmethod = document.getElementById('pmethod');
  var cardNumber = document.getElementById('cardNumber');
  var expMonth = document.getElementById('expMonth');
  var expYear = document.getElementById('expYear');
  var cardCvc = document.getElementById('cardCvc');
  var saveBtn = document.getElementById('saveCardBtn');
  var msg = document.getElementById('pmMessage');

  var savedWrapper = document.getElementById('pmSavedWrapper');
  var savedLabel = document.getElementById('pmSavedLabel');
  var useSavedBtn = document.getElementById('useSavedCardBtn');

  // флаг – когато попълваме от запазена карта, не искаме change на метода да чисти полетата
  var suppressResetOnMethodChange = false;

  // попълване на dropdown-ите за месец/година
  (function populateExpirySelects(){
    if (expMonth && expMonth.options.length === 1) {
      for (var m = 1; m <= 12; m++) {
        var mm = (m < 10 ? '0' : '') + m;
        var optM = document.createElement('option');
        optM.value = mm;
        optM.textContent = mm;
        expMonth.appendChild(optM);
      }
    }
    if (expYear && expYear.options.length === 1) {
      var now = new Date();
      var year = now.getFullYear();
      for (var i = 0; i < 12; i++) {
        var y = year + i;
        var optY = document.createElement('option');
        optY.value = String(y);
        optY.textContent = y;
        expYear.appendChild(optY);
      }
    }
  })();

  function setCvcRules() {
    if (!cardCvc || !pmethod) return;
    var method = (pmethod.value || '').toLowerCase();
    if (method === 'amex' || method === 'american express') {
      cardCvc.maxLength = 4;
      cardCvc.placeholder = '1234';
    } else {
      cardCvc.maxLength = 3;
      cardCvc.placeholder = '123';
    }
  }

  function resetCardFields() {
    if (cardNumber) cardNumber.value = '';
    if (expMonth) expMonth.value = '';
    if (expYear) expYear.value = '';
    if (cardCvc) cardCvc.value = '';
  }

  function openModal(){
    modal.setAttribute('aria-hidden','false');
    modal.style.display='block';
    clearValidation();
    setCvcRules();
    updateSavedUi();
    if (pmethod) pmethod.focus();
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modal.style.display='none';
    clearValidation();
  }

  openButtons.forEach(function(b){
    b.addEventListener('click', function(e){
      e.preventDefault();
      try {
        var cartPanel = document.getElementById('cartPanel');
        var emptyIndicator = cartPanel && cartPanel.querySelector('.cart-empty');
        if (emptyIndicator) {
          alert('Няма артикули в количката!');
          return;
        }
      } catch (e) {}
      openModal();
    });
  });

  closeBtns.forEach(function(c){
    c.addEventListener('click', function (e) {
      if (c.dataset && c.dataset.close === "true") { closeModal(); return; }
      if (c.classList.contains('pm-close')) { closeModal(); return; }
    });
  });

  function clearValidation(){
    [pmethod, cardNumber, expMonth, expYear, cardCvc].forEach(function(el){
      if (!el) return;
      el.classList.remove('invalid');
    });
    if (msg) { msg.innerText=''; msg.classList.remove('pm-success'); }
  }

  function validateAll(){
    clearValidation();
    var ok = true;

    if (!pmethod || !pmethod.value) {
      if (pmethod) pmethod.classList.add('invalid');
      ok = false;
    }

    // само 16 цифри за номер на карта
    var num = cardNumber ? cardNumber.value.replace(/\s+/g,'') : '';
    if (!/^\d{16}$/.test(num)) {
      if (cardNumber) cardNumber.classList.add('invalid');
      ok = false;
    }

    // месец/година от dropdown-и
    if (!expMonth || !expYear || !expMonth.value || !expYear.value) {
      if (expMonth) expMonth.classList.add('invalid');
      if (expYear) expYear.classList.add('invalid');
      ok = false;
    } else {
      var mm = parseInt(expMonth.value,10);
      var yy = parseInt(expYear.value.slice(-2),10);
      var now = new Date();
      var thisYY = parseInt(String(now.getFullYear()).slice(-2),10);
      var thisMM = now.getMonth() + 1;
      if (yy < thisYY || (yy === thisYY && mm < thisMM)) {
        if (expMonth) expMonth.classList.add('invalid');
        if (expYear) expYear.classList.add('invalid');
        ok = false;
      }
    }

    var method = (pmethod && pmethod.value) ? pmethod.value.toLowerCase() : '';
    var cvcVal = cardCvc ? cardCvc.value.replace(/\s+/g,'') : '';
    if (method === 'amex') {
      if (!/^\d{4}$/.test(cvcVal)) { if (cardCvc) cardCvc.classList.add('invalid'); ok = false; }
    } else {
      if (!/^\d{3}$/.test(cvcVal)) { if (cardCvc) cardCvc.classList.add('invalid'); ok = false; }
    }

    // >>> ДОПЪЛНИТЕЛНА ПРОВЕРКА: ако ползваме запазена карта, CVC трябва да съвпада
    try {
      var saved = JSON.parse(localStorage.getItem('bw_saved_card'));
      if (saved && saved.cvc) {
        // съвпадат ли методът и номерът на картата с тези от запазената?
        var enteredNumber = cardNumber ? cardNumber.value.replace(/\s+/g,'') : '';
        if (pmethod && pmethod.value === saved.method && enteredNumber === saved.number) {
          if (cardCvc && cardCvc.value !== saved.cvc) {
            cardCvc.classList.add('invalid');
            if (msg) {
              msg.innerText = 'Грешно CVC за запазената карта.';
              msg.classList.remove('pm-success');
            }
            ok = false;
          }
        }
      }
    } catch (e) {}

    return ok;
  }

  // формат + лимит до 16 цифри
  function setCardNumberFormatted(raw){
    if (!cardNumber) return;
    var v = String(raw || '').replace(/\D/g,'').slice(0,16);
    var groups = [];
    for (var i=0;i<v.length;i+=4) groups.push(v.slice(i,i+4));
    cardNumber.value = groups.join(' ');
  }

  if (cardNumber) {
    cardNumber.addEventListener('input', function(){
      setCardNumberFormatted(cardNumber.value);
    });
  }

  if (pmethod) {
    pmethod.addEventListener('change', function(){
      setCvcRules();
      if (!suppressResetOnMethodChange) {
        resetCardFields();
        clearValidation();
      }
    });
  }

  if (cardCvc) {
    cardCvc.addEventListener('input', function(){
      cardCvc.value = cardCvc.value.replace(/\D/g,'').slice(0, cardCvc.maxLength || 4);
    });
  }

  function updateSavedUi(){
    try {
      var saved = JSON.parse(localStorage.getItem('bw_saved_card'));
      if (saved && saved.masked) {
        if (savedWrapper) savedWrapper.style.display = 'flex';
        if (savedLabel) savedLabel.innerText = 'Запазена карта: ' + saved.masked;
        if (useSavedBtn) {
          useSavedBtn.onclick = function(){
            // попълване от запазена карта (без CVC – потребителят го въвежда всеки път)
            suppressResetOnMethodChange = true;
            if (pmethod) pmethod.value = saved.method || '';
            setCvcRules();
            suppressResetOnMethodChange = false;

            setCardNumberFormatted(saved.number || '');
            if (saved.exp && expMonth && expYear) {
              var parts = saved.exp.split('/');
              if (parts.length === 2) {
                var sm = parts[0];
                var sy = parts[1];
                // търсим година по последните 2 цифри
                for (var i=0;i<expYear.options.length;i++){
                  var opt = expYear.options[i];
                  if (opt.value && opt.value.slice(-2) === sy) {
                    expYear.value = opt.value;
                    break;
                  }
                }
                expMonth.value = sm;
              }
            }
            if (cardCvc) cardCvc.value = '';
            clearValidation();
            if (cardCvc) cardCvc.focus();
          };
        }
      } else {
        if (savedWrapper) savedWrapper.style.display = 'none';
      }
    } catch (e){
      if (savedWrapper) savedWrapper.style.display = 'none';
    }
  }

  if (saveBtn){
    saveBtn.addEventListener('click', function(e){
      e.preventDefault();
      if (!validateAll()){
        msg.innerText = 'Попълнете правилно полетата преди запис.';
        msg.classList.remove('pm-success');
        return;
      }
      var numRaw = cardNumber.value.replace(/\s+/g,'');
      var expStr = (expMonth.value || '').padStart(2,'0') + '/' + String(expYear.value || '').slice(-2);

      // >>> ТУК ДОБАВЯМЕ CVC КЪМ ЗАПИСАНАТА КАРТА
      var saved = {
        method: pmethod.value,
        masked: '•••• ' + numRaw.slice(-4),
        number: numRaw,
        exp: expStr,
        cvc: cardCvc.value   // <<< запазваме CVC
      };

      try {
        localStorage.setItem('bw_saved_card', JSON.stringify(saved));
        msg.innerText = 'Картата е запазена локално.';
        msg.classList.add('pm-success');
        updateSavedUi();
      } catch (err) {
        msg.innerText = 'Неуспешно записване.';
        msg.classList.remove('pm-success');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validateAll()){
        if (!msg.innerText) {
          msg.innerText = 'Моля попълнете всички полета правилно.';
        }
        msg.classList.remove('pm-success');
        return;
      }

      msg.innerText = 'Успешна поръчка! Благодарим ви.';
      msg.classList.add('pm-success');

      setTimeout(function(){
        var ev = new CustomEvent('bw:order:success', { detail: { savedCard: !!localStorage.getItem('bw_saved_card') }});
        window.dispatchEvent(ev);
        closeModal();
      }, 800);
    });
  }

  // при първоначално зареждане – ако има запазена карта, покажи секцията
  updateSavedUi();
});
