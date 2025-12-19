// payment.js
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;
  const backdrop = modal.querySelector('.payment-modal-backdrop');
  const panel = modal.querySelector('.payment-modal-panel');
  const closeBtn = modal.querySelector('.pm-close');

  const form = document.getElementById('paymentForm');
  const pmethod = document.getElementById('pmethod');
  const cardNumber = document.getElementById('cardNumber');
  const cardExp = document.getElementById('cardExp');
  const cardCvc = document.getElementById('cardCvc');
  const saveCardBtn = document.getElementById('saveCardBtn');
  const pmMessage = document.getElementById('pmMessage');

  const checkoutBtn = document.getElementById('checkoutBtn');

  // helpers
  function openModal(){
    modal.setAttribute('aria-hidden','false');
    modal.classList.add('open');
    // set default month to 12 (MM/YY)
    cardExp.value = '12/';
    // if saved card exists - populate
    const saved = localStorage.getItem('bw_saved_card');
    if(saved){
      try {
        const s = JSON.parse(saved);
        pmethod.value = s.method || '';
        // show masked number like 1234 **** **** 3456
        cardNumber.value = (s.numberMask || '');
        // set cvc length accordingly but do NOT fill cvc for security
        adjustCvcField();
      } catch(e){}
    } else {
      // clear fields
      clearFields();
    }
    pmMessage.innerText = '';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    modal.classList.remove('open');
  }
  function clearFields(){
    cardNumber.value = '';
    cardExp.value = '12/';
    cardCvc.value = '';
  }

  // adjust CVC length/placeholder on method change + reset fields as requested
  function adjustCvcField(){
    const method = pmethod.value;
    if(method === 'amex'){
      cardCvc.maxLength = 4;
      cardCvc.placeholder = '1234';
    } else {
      cardCvc.maxLength = 3;
      cardCvc.placeholder = '123';
    }
    // when payment method changes, clear kart fields (per request)
    cardNumber.value = '';
    // keep month=12
    cardExp.value = '12/';
    cardCvc.value = '';
  }

  pmethod.addEventListener('change', adjustCvcField);

  // open on checkout click; but if cart empty prevent open and show notice (cart.js already prevents open, but ensure here too)
  checkoutBtn && checkoutBtn.addEventListener('click', function (e) {
    // check cart via simpleCart if available
    if (window.simpleCart) {
      const all = window.simpleCart.getAll();
      const keys = Object.keys(all || {});
      if (keys.length === 0) {
        pmMessage.innerText = 'Няма артикули в количката.';
        pmMessage.style.color = '#ff8b8b';
        setTimeout(()=> pmMessage.innerText = '', 1500);
        return;
      }
    }
    openModal();
  });

  // close handlers
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e)=> { if(e.target.dataset.close) closeModal(); });

  // save card: store masked number and method (not full number) — but user asked to persist card; we'll store first4 + last4 + method
  saveCardBtn.addEventListener('click', function () {
    const method = pmethod.value;
    const numRaw = cardNumber.value.replace(/\s+/g,'');
    if(!method || numRaw.length < 8){
      pmMessage.innerText = 'Изберете метод и въведете валиден номер на карта за запазване.';
      pmMessage.style.color = '#ff8b8b';
      return;
    }
    const first4 = numRaw.slice(0,4);
    const last4 = numRaw.slice(-4);
    const mask = first4 + ' **** **** ' + last4;
    const toSave = { method: method, numberMask: mask, first4:first4, last4:last4 };
    try {
      localStorage.setItem('bw_saved_card', JSON.stringify(toSave));
      pmMessage.innerText = 'Картата е запазена.';
      pmMessage.style.color = '#b8ffb8';
    } catch(e){
      pmMessage.innerText = 'Неуспешно запазване.';
      pmMessage.style.color = '#ff8b8b';
    }
  });

  // validation helpers
  function validateForm(){
    pmMessage.innerText = '';
    const method = pmethod.value;
    if(!method){ pmMessage.innerText = 'Изберете начин за плащане.'; pmMessage.style.color = '#ff8b8b'; return false; }
    const num = cardNumber.value.replace(/\s+/g,'');
    if(num.length < 13){ pmMessage.innerText = 'Невалиден номер на карта.'; pmMessage.style.color = '#ff8b8b'; return false; }
    const exp = cardExp.value;
    if(!/^\d{2}\/\d{2}$/.test(exp)){ pmMessage.innerText = 'Валидностът трябва да е във формат MM/YY.'; pmMessage.style.color = '#ff8b8b'; return false; }
    // ensure month is 12
    const mm = exp.split('/')[0];
    if(mm !== '12') {
      pmMessage.innerText = 'Месецът автоматично трябва да е 12. Моля оставете 12.';
      pmMessage.style.color = '#ff8b8b';
      return false;
    }
    const cvc = cardCvc.value.trim();
    if(method === 'amex' && cvc.length !== 4){ pmMessage.innerText = 'AmEx изисква 4 цифри CVC.'; pmMessage.style.color = '#ff8b8b'; return false; }
    if((method === 'visa' || method === 'mastercard') && cvc.length !== 3){ pmMessage.innerText = 'Visa/Mastercard изискват 3 цифри CVC.'; pmMessage.style.color = '#ff8b8b'; return false; }
    return true;
  }

  // on submit: validate -> simulate success -> clear cart & close
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if(!validateForm()) return;
    // simulate processing...
    pmMessage.style.color = '#b8ffb8';
    pmMessage.innerText = 'Обработва се...';
    setTimeout(function () {
      pmMessage.innerText = 'Успешна поръчка';
      // clear cart via simpleCart API if exists
      try {
        if(window.simpleCart && typeof window.simpleCart.clear === 'function') {
          window.simpleCart.clear();
        }
        // close cart panel if open
        const panel = document.getElementById('cartPanel');
        if(panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }
      } catch(e){}
      // remove badge if present (cart.js will manage it on render)
      setTimeout(()=> {
        closeModal();
        pmMessage.innerText = '';
      }, 900);
    }, 900);
  });

  // small UX: formatting card number as user types (add spaces)
  cardNumber.addEventListener('input', function (e) {
    let v = cardNumber.value.replace(/\D/g,'').slice(0,16);
    let parts = [];
    for(let i=0;i<v.length;i+=4) parts.push(v.slice(i,i+4));
    cardNumber.value = parts.join(' ');
  });

  // ensure cardExp input masked for MM/YY
  cardExp.addEventListener('input', function () {
    let v = cardExp.value.replace(/\D/g,'').slice(0,4);
    if(v.length >= 3) cardExp.value = v.slice(0,2) + '/' + v.slice(2);
    else if(v.length >= 1) cardExp.value = (v.length===1 ? '0'+v : v) + '/';
  });

});
