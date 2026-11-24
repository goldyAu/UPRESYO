// Search, category filtering, sorting, and reset controls for all canteen pages.
(() => {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  const items = Array.from(menu.querySelectorAll('.item'));
  const chips = Array.from(document.querySelectorAll('.chip'));
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const resetFilters = document.getElementById('resetFilters');
  const results = document.getElementById('resultCount');
  const emptyMsg = document.getElementById('emptyState');
  const sortBtn = document.getElementById('sortBtn');
  const sortMenu = document.getElementById('sortMenu');
  const sortLabel = document.getElementById('sortLabel');
  const sortOptions = sortMenu ? Array.from(sortMenu.querySelectorAll('[data-sort]')) : [];

  const SORT_LABELS = {
    default: 'Default order',
    'name-asc': 'Name: A to Z',
    'name-desc': 'Name: Z to A',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low'
  };

  const state = { filter: 'all', query: '', sort: 'default' };
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

  // Preserve the original menu order for the Default order option.
  items.forEach((item, index) => { item.dataset.index = String(index); });

  const getName = (item) => {
    const heading = item.querySelector('.item-name, h2');
    return heading ? heading.textContent.trim() : '';
  };

  const getPrice = (item) => {
    const price = Number.parseFloat(item.dataset.price);
    return Number.isFinite(price) ? price : null;
  };

  function compare(a, b) {
    if (state.sort === 'name-asc') return collator.compare(getName(a), getName(b));
    if (state.sort === 'name-desc') return collator.compare(getName(b), getName(a));

    if (state.sort === 'price-asc' || state.sort === 'price-desc') {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (priceA === null && priceB === null) return collator.compare(getName(a), getName(b));
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      const difference = state.sort === 'price-asc' ? priceA - priceB : priceB - priceA;
      return difference || collator.compare(getName(a), getName(b));
    }

    return Number(a.dataset.index) - Number(b.dataset.index);
  }

  function update() {
    const sortedItems = [...items].sort(compare);
    sortedItems.forEach((item) => menu.appendChild(item));

    const query = state.query.trim().toLowerCase();
    const activeFilter = state.filter.toLowerCase();
    let shown = 0;

    items.forEach((item) => {
      const categoryElement = item.querySelector('.item-cat, .category');
      const categoryText = categoryElement ? categoryElement.textContent.trim().toLowerCase() : '';
      const categoryValue = (item.dataset.category || '').trim().toLowerCase();
      const matchesCategory = activeFilter === 'all' ||
        categoryValue === activeFilter || categoryText === activeFilter;
      const searchableText = (getName(item) + ' ' + categoryText).toLowerCase();
      const matchesSearch = !query || searchableText.includes(query);
      const visible = matchesCategory && matchesSearch;

      item.hidden = !visible;
      if (visible) shown += 1;
    });

    if (results) {
      let message = `Showing ${shown} ${shown === 1 ? 'item' : 'items'}`;
      if (activeFilter !== 'all') message += ` · ${state.filter}`;
      if (query) message += ` · Search: “${state.query.trim()}”`;
      if (state.sort !== 'default') message += ` · ${SORT_LABELS[state.sort]}`;
      results.textContent = message;
    }

    if (emptyMsg) emptyMsg.hidden = shown !== 0;
    if (clearSearch) clearSearch.hidden = !state.query;
    if (sortLabel) sortLabel.textContent = state.sort === 'default' ? 'Sort by' : SORT_LABELS[state.sort];
  }

  chips.forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.classList.contains('active')));
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter || 'all';
      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
      update();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value;
      update();
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      state.query = '';
      update();
    });
  }

  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      state.filter = 'all';
      state.query = '';
      state.sort = 'default';

      if (searchInput) searchInput.value = '';

      chips.forEach((chip) => {
        const active = (chip.dataset.filter || 'all').toLowerCase() === 'all';
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', String(active));
      });

      sortOptions.forEach((option) => {
        const active = option.dataset.sort === 'default';
        option.classList.toggle('active', active);
      });

      if (sortMenu) sortMenu.hidden = true;
      if (sortBtn) sortBtn.setAttribute('aria-expanded', 'false');
      update();
    });
  }

  function setSortMenu(open) {
    if (!sortMenu || !sortBtn) return;
    sortMenu.hidden = !open;
    sortBtn.setAttribute('aria-expanded', String(open));
  }

  if (sortBtn && sortMenu) {
    sortBtn.addEventListener('click', () => setSortMenu(sortMenu.hidden));

    sortOptions.forEach((option) => {
      option.addEventListener('click', () => {
        state.sort = option.dataset.sort || 'default';
        sortOptions.forEach((other) => other.classList.toggle('active', other === option));
        setSortMenu(false);
        update();
      });
    });

    document.addEventListener('click', (event) => {
      if (!sortMenu.hidden && !event.target.closest('.sort-wrap')) setSortMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !sortMenu.hidden) {
        setSortMenu(false);
        sortBtn.focus();
      }
    });
  }

  update();
})();
