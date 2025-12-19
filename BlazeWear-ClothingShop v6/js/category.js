document.addEventListener('DOMContentLoaded', () => {
  const gender = document.body.dataset.gender; // "women" | "men" | "kids"
  const params = new URLSearchParams(location.search);
  const cat = (params.get('cat') || '').toLowerCase();

  // Контейнери (ще са различни по страници, но id-тата са еднакви)
  const grid = document.getElementById('categoryGrid');
  const catTitle = document.getElementById('catTitle');
  const catSub = document.getElementById('catSub');
  const catSectionTitle = document.getElementById('catSectionTitle');
  const catSectionDesc = document.getElementById('catSectionDesc');

  if (!grid) return;

  // Вземаме продуктите от твоя глобален обект:
  const all = (window.BLAZE_PRODUCTS && window.BLAZE_PRODUCTS[gender]) ? window.BLAZE_PRODUCTS[gender] : {};
  const entries = Object.entries(all); // [id, product]

  // Заглавия за категории (можеш да добавяш)
  const CAT_LABELS = {
    clothes : "Дрехи",
    tshirts: "Тениски",
    hoodies: "Блузи & Суитшърти",
    shirts: "Ризи",
    jackets: "Якета & Палта",
    jeans: "Дънки",
    pants: "Панталони",
    skirts: "Поли",
    shoes: "Обувки",
    lifestyleSneakers: "Лайфстайл",
    runningSneakers: "Бягане",
    everydayBoots: "Ежедневни боти",
    treckingBoots: "Трекинг боти",
    premiumShoes: "Премиум обувки",
    outdoorShoes: "Обувки за открито",
    accessories: "Аксесоари",
    streetHat: "Шапки",
    streetBackpacks: "Раници",
    streetBags: "Чанти",
    belts: "Колани",
    winterScarves: "Шалове",
    witnerGloves: "Ръкавици",
    winterHatsAndHoods: "Шапки и качулки",
    allAccessories: "Всички аксесоари",
    new: "Нови",
    sale: "Разпродажба",
    sport: "Спорт",
    bestsellers: "Best sellers",
    streetwear: "Streetwear picks",
    

  };

  const label = CAT_LABELS[cat] || (cat ? cat : "Всички продукти");

  if (catTitle) catTitle.textContent = label;
  if (catSectionTitle) catSectionTitle.textContent = label;

  // Филтър: очакваме продукт.category да съдържа ключ като "tshirts", "jackets" и т.н.
  // Ако нямаш category полета, кажи ми и ще го направим да филтрира по друго (например по име/тагове).
  let filtered = entries;

  if (cat) {
    filtered = entries.filter(([id, p]) => {
      const c = String(p.category || '').toLowerCase();
      return c === cat;
    });
  }

  if (catSectionDesc) {
    catSectionDesc.textContent = filtered.length
      ? `Намерени продукти: ${filtered.length}`
      : `Няма продукти за тази категория.`;
  }

  if (!filtered.length) {
    grid.innerHTML = `<p style="opacity:.85">Няма продукти.</p>`;
    return;
  }

  // Къде води картата?
  const productPage =
    gender === 'women' ? 'productWoman.html' :
    gender === 'men' ? 'productMen.html' :
    'productKids.html';

  // Класове според темата, за да е 1:1 като твоите страници
  const prefix =
    gender === 'women' ? 'women' :
    gender === 'men' ? 'men' :
    'kids';

  grid.innerHTML = filtered.map(([id, p]) => {
    const price = (p.price || (p.sizes && p.sizes.XS) || 0);
    const img = p.mainImage || '';
    const name = p.name || id;

    return `
      <article class="${prefix}-product-card">
        <a href="${productPage}?id=${encodeURIComponent(id)}" class="${prefix}-product-thumb">
          <img src="${img}" alt="${name}">
        </a>
        <div class="${prefix}-product-meta">
          <h3>${name}</h3>
          <div class="${prefix}-product-price">${Number(price).toFixed(2)} лв</div>
        </div>
      </article>
    `;
  }).join('');
});
