// Transport fare finder: Ikot / Tricycle tabs, From / To, number of riders, fare total.
(() => {
  // ------------------------------------------------------------------
  // SAMPLE DATA. Replace the place names and fares with the real ones.
  // Fares are per rider, in pesos. Each pair is written once, in either
  // order: 'Location A|Location B' also works for B to A.
  // ------------------------------------------------------------------
  const PLACES = ['ADMIN', 'EBL', 'CSM', 'DHK' , 'LIB' , 'BASAK' , 'HOLY SPIRIT/HIGHWAY'];

  const FARES = {
    ikot: {
      'ADMIN|CSM': 10,
      'ADMIN|DHK': 10,
      'EBL|CSM': 10,
      'EBL|DHK': 10,
      'CSM|DHK': 10,
      'CSM|LIB': 10,
      'CSM|BASAK': 10,
      'CSM|HOLY SPIRIT/HIGHWAY': 15,
    },
    tricycle: {
      'ADMIN|EBL': 10,
      'ADMIN|CSM': 15,
      'ADMIN|DHK': 20,
      'EBL|CSM': 10,
      'EBL|DHK': 15,
      'CSM|DHK': 10,
    },
  };

  const MODE_LABELS = { ikot: 'Ikot', tricycle: 'Tricycle' };
  // ------------------------------------------------------------------

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const title = document.getElementById('fareTitle');
  const fromSelect = document.getElementById('fromSelect');
  const toSelect = document.getElementById('toSelect');
  const riderButtons = Array.from(document.querySelectorAll('.rider-options button'));
  const moreCount = document.getElementById('moreCount');
  const fareOutput = document.getElementById('fareOutput');
  const browseBtn = document.getElementById('browseBtn');
  const result = document.getElementById('result');

  const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  const state = { mode: 'tricycle', riders: '1' };

  // Fill both drop-downs
  [fromSelect, toSelect].forEach((select, i) => {
    const first = document.createElement('option');
    first.value = '';
    first.textContent = i === 0 ? 'Choose starting point' : 'Choose destination';
    select.appendChild(first);
    PLACES.forEach((place) => {
      const option = document.createElement('option');
      option.value = place;
      option.textContent = place;
      select.appendChild(option);
    });
  });

  const fareFor = (a, b) => FARES[state.mode][[a, b].sort().join('|')];

  function riderCount() {
    if (state.riders !== 'more') return Number(state.riders);
    const n = parseInt(moreCount.value, 10);
    return Math.min(50, Math.max(3, Number.isNaN(n) ? 3 : n));
  }

  function showHint(text) {
    result.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = text;
    result.appendChild(p);
  }

  // The fare box updates live as you change the choices
  function updateFare() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const perRider = from && to && from !== to ? fareFor(from, to) : undefined;
    fareOutput.textContent = perRider === undefined ? '\u2014' : peso.format(perRider * riderCount()).replace('\u20B1', '');
  }

  function setMode(mode) {
    state.mode = mode;
    tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.mode === mode)));
    title.textContent = MODE_LABELS[mode] + ' fares';
    showHint('Fares will show here.');
    updateFare();
  }

  // "Browse fares": show the chosen route, or a list of fares if no route is chosen yet
  function browse() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const riders = riderCount();
    const noun = riders === 1 ? 'rider' : 'riders';

    if (from && to) {
      if (from === to) {
        showHint('Your starting point and destination are the same. Pick two different places.');
        return;
      }
      const perRider = fareFor(from, to);
      if (perRider === undefined) {
        showHint('No fare is listed for that route yet.');
        return;
      }
      result.innerHTML = '';
      const box = document.createElement('div');
      box.className = 'summary';
      const name = document.createElement('span');
      name.className = 'route-name';
      name.textContent = from + ' \u2192 ' + to;
      const detail = document.createElement('span');
      detail.textContent = MODE_LABELS[state.mode] + ' \u00B7 ' + riders + ' ' + noun + ' \u00B7 ' + peso.format(perRider) + ' each';
      const total = document.createElement('span');
      total.className = 'total';
      total.textContent = 'Total ' + peso.format(perRider * riders);
      box.append(name, detail, total);
      result.appendChild(box);
      return;
    }

    // No full route chosen: list the fares (only routes from the chosen starting point, if any)
    const rows = Object.entries(FARES[state.mode])
      .map(([key, fare]) => ({ route: key.split('|'), fare }))
      .filter(({ route }) => !from || route.includes(from));

    result.innerHTML = '';
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Route</th><th>Per rider</th><th>Total</th></tr></thead>';
    const body = document.createElement('tbody');
    rows.forEach(({ route, fare }) => {
      let [a, b] = route;
      if (from && b === from) [a, b] = [b, a]; // show the chosen starting point first
      const tr = document.createElement('tr');
      [a + ' \u2192 ' + b, peso.format(fare), peso.format(fare * riders)].forEach((text) => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);
    result.appendChild(table);
  }

  // Events
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setMode(tab.dataset.mode);
      history.replaceState(null, '', '#' + tab.dataset.mode);
    });
  });

  riderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.riders = button.dataset.riders;
      riderButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      moreCount.hidden = state.riders !== 'more';
      if (state.riders === 'more') moreCount.focus();
      updateFare();
    });
  });

  [fromSelect, toSelect, moreCount].forEach((el) => {
    el.addEventListener('input', updateFare);
  });

  browseBtn.addEventListener('click', browse);

  // Open the right tab from the link (transport.html#ikot or transport.html#tricycle)
  const hash = location.hash.replace('#', '');
  setMode(MODE_LABELS[hash] ? hash : 'tricycle');
})();