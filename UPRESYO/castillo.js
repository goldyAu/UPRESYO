// Search, filter (All / Meal / Drinks / Snacks) and sort for the eatery page.
// The menu items live in eatery.html. Each <li class="item"> has:
//   data-category="meal | drink | snack"   (matches the filter chips)
//   data-price="15"                         (a number, used for sorting)
(() => {
  const menu = document.querySelector('.menu');
  const items = Array.from(menu.querySelectorAll('.item'));
  const chips = Array.from(document.querySelectorAll('.chip'));
  const searchInput = document.querySelector('.search input');
  const results = document.getElementById('results');
  const emptyMsg = document.getElementById('emptyMsg');
  const sortBtn = document.getElementById('sortBtn');
  const sortMenu = document.getElementById('sortMenu');
  const sortOptions = Array.from(sortMenu.querySelectorAll('button'));

  const FILTER_LABELS = { all: 'All', meal: 'Meal', drink: 'Drinks', snack: 'Snacks' };
  const SORT_LABELS = {
    'default': 'Default order',
    'name-asc': 'Name: A to Z',
    'name-desc': 'Name: Z to A',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
  };

  const state = { filter: 'all', query: '', sort: 'default' };
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  // Remember the original order so "Default order" can restore it
  items.forEach((item, i) => { item.dataset.index = i; });

  const getName = (item) => item.querySelector('h2').textContent.trim();
  const getPrice = (item) => {
    const p = parseFloat(item.dataset.price);
    return Number.isNaN(p) ? null : p;
  };

  function compare(a, b) {
    switch (state.sort) {
      case 'name-asc':
        return collator.compare(getName(a), getName(b));
      case 'name-desc':
        return collator.compare(getName(b), getName(a));
      case 'price-asc':
      case 'price-desc': {
        const pa = getPrice(a);
        const pb = getPrice(b);
        if (pa === null && pb === null) return collator.compare(getName(a), getName(b));
        if (pa === null) return 1;   // items without a price always go last
        if (pb === null) return -1;
        const diff = state.sort === 'price-asc' ? pa - pb : pb - pa;
        return diff || collator.compare(getName(a), getName(b));
      }
      default:
        return a.dataset.index - b.dataset.index;
    }
  }

  function update() {
    // 1. Sort (re-orders the list in the page)
    // (only touch the page if the order actually changed, so animations don't replay)
    const sorted = [...items].sort(compare);
    const inOrder = sorted.every((item, i) => menu.children[i] === item);
    if (!inOrder) sorted.forEach((item) => menu.appendChild(item));

    // 2. Filter + search (hide anything that doesn't match)
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    items.forEach((item) => {
      const inCategory = state.filter === 'all' || item.dataset.category === state.filter;
      const searchable = (getName(item) + ' ' + item.querySelector('.category').textContent).toLowerCase();
      const matches = inCategory && (!q || searchable.includes(q));
      item.hidden = !matches;
      if (matches) shown++;
    });

    // 3. Tell the user what they are looking at
    let text = 'Showing ' + shown + (shown === 1 ? ' item' : ' items');
    if (state.filter !== 'all') text += ' in ' + FILTER_LABELS[state.filter];
    if (q) text += ' matching \u201C' + state.query.trim() + '\u201D';
    if (state.sort !== 'default') text += ' \u00B7 ' + SORT_LABELS[state.sort];
    results.textContent = text;
    emptyMsg.hidden = shown !== 0;
  }

  // Filter chips
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      update();
    });
  });

  // Search
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    update();
  });

  // Sort menu
  function setMenu(open) {
    sortMenu.hidden = !open;
    sortBtn.setAttribute('aria-expanded', String(open));
  }

  sortBtn.addEventListener('click', () => setMenu(sortMenu.hidden));

  sortOptions.forEach((option) => {
    option.addEventListener('click', () => {
      state.sort = option.dataset.sort;
      sortOptions.forEach((o) => o.classList.toggle('is-active', o === option));
      setMenu(false);
      update();
    });
  });

  document.addEventListener('click', (e) => {
    if (!sortMenu.hidden && !e.target.closest('.sort-wrap')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sortMenu.hidden) {
      setMenu(false);
      sortBtn.focus();
    }
  });

  update();
})();