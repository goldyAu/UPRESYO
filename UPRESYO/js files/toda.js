
// Transport fare finder: Ikot / Tricycle tabs, From / To, number of riders, fare total.
(() => {
    // ------------------------------------------------------------------
    // PLACES AND FARE DATA
    // Fares are per rider, in pesos.
    // Each route is written once, in alphabetical order.
    // ------------------------------------------------------------------

    const PLACES = [
        'ADMIN',
        'EBL',
        'CSM',
        'DHK',
        'LIB',
        'BASAK',
        'HOLY SPIRIT/HIGHWAY'
    ];

    const FARES = {
        ikot: {
            'ADMIN|CSM': 10,
            'ADMIN|DHK': 10,
            'CSM|EBL': 10,
            'DHK|EBL': 10,
            'CSM|DHK': 10,
            'CSM|LIB': 10,
            'BASAK|CSM': 10,
            'CSM|HOLY SPIRIT/HIGHWAY': 15,
        },

        tricycle: {
            // ADMIN routes
            'ADMIN|EBL': { 1: 10, 2: 10, 3: 10 },
            'ADMIN|CSM': { 1: 15, 2: 15, 3: 10 },
            'ADMIN|LIB': { 1: 15, 2: 10, 3: 10 },
            'ADMIN|DHK': { 1: 20, 2: 15, 3: 15, 4: 10 },
            'ADMIN|BASAK': { 1: 15, 2: 10, 3: 10 },
            'ADMIN|HOLY SPIRIT/HIGHWAY': { 1: 25, 2: 20, 3: 20 },

            // EBL routes
            'CSM|EBL': { 1: 15, 2: 15, 3: 10 },
            'EBL|LIB': { 1: 15, 2: 10, 3: 10 },
            'DHK|EBL': { 1: 20, 2: 15, 3: 15, 4: 10 },
            'BASAK|EBL': { 1: 15, 2: 10, 3: 10 },
            'EBL|HOLY SPIRIT/HIGHWAY': { 1: 25, 2: 20, 3: 20 },

            // CSM routes
            'CSM|LIB': { 1: 10, 2: 10, 3: 10 },
            'CSM|DHK': { 1: 15, 2: 10, 3: 10 },
            'BASAK|CSM': { 1: 20, 2: 15, 3: 10 },
            'CSM|HOLY SPIRIT/HIGHWAY': { 1: 30, 2: 20, 3: 20 },

            // LIB routes
            'DHK|LIB': { 1: 20, 2: 15, 3: 10 },
            'BASAK|LIB': { 1: 20, 2: 15, 3: 10 },
            'LIB|HOLY SPIRIT/HIGHWAY': { 1: 25, 2: 20, 3: 20 },

            // DHK routes
            'BASAK|DHK': { 1: 25, 2: 20, 3: 15 },
            'DHK|HOLY SPIRIT/HIGHWAY': { 1: 30, 2: 25, 3: 20 },

            // BASAK route
            'BASAK|HOLY SPIRIT/HIGHWAY': { 1: 20, 2: 15, 3: 10 }
        }
    };

    const MODE_LABELS = {
        ikot: 'Ikot',
        tricycle: 'Tricycle'
    };

    // ------------------------------------------------------------------
    // HTML ELEMENTS
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
    const fareNote = document.getElementById('fareNote');
    const swapBtn = document.getElementById('swapBtn');

    const peso = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    });

    const state = {
        mode: 'tricycle',
        riders: '1'
    };

    // ------------------------------------------------------------------
    // POPULATE DROPDOWNS
    // ------------------------------------------------------------------

    [fromSelect, toSelect].forEach((select, i) => {
        const first = document.createElement('option');

        first.value = '';
        first.textContent = i === 0
            ? 'Choose starting point'
            : 'Choose destination';

        select.appendChild(first);

        PLACES.forEach((place) => {
            const option = document.createElement('option');

            option.value = place;
            option.textContent = place;

            select.appendChild(option);
        });
    });

    // ------------------------------------------------------------------
    // GET FARE
    // ------------------------------------------------------------------

    function fareFor(a, b, riders = 1) {
        const route = [a.trim().toUpperCase(), b.trim().toUpperCase()]
            .sort()
            .join('|');

        const fare = FARES[state.mode][route];

        if (fare === undefined) return undefined;

        // Fixed fares for Ikot
        if (typeof fare === 'number') return fare;

        // Tricycle fares
        if (riders >= 4 && fare[4] !== undefined) return fare[4];
        if (riders >= 3) return fare[3];

        return fare[riders];
    }

    // ------------------------------------------------------------------
    // GET NUMBER OF RIDERS
    // ------------------------------------------------------------------

    function riderCount() {
        if (state.riders !== 'more') {
            return Number(state.riders);
        }

        const n = parseInt(moreCount.value, 10);

        return Math.min(
            6,
            Math.max(3, Number.isNaN(n) ? 3 : n)
        );
    }

    // ------------------------------------------------------------------
    // DISPLAY HINT
    // ------------------------------------------------------------------

    function showHint(text) {
        result.innerHTML = '';

        const p = document.createElement('p');
        p.className = 'hint';
        p.textContent = text;

        result.appendChild(p);
    }

    // ------------------------------------------------------------------
    // UPDATE FARE DISPLAY
    // ------------------------------------------------------------------

    function updateFare() {
        const from = fromSelect.value;
        const to = toSelect.value;
        const riders = riderCount();

        const perRider = from && to && from !== to
            ? fareFor(from, to, riders)
            : undefined;

        fareOutput.textContent = perRider === undefined
            ? '\u2014'
            : peso.format(perRider * riders).replace('\u20B1', '');

        if (!from || !to) {
            fareNote.textContent = 'Pick where you\u2019re going';
        } else if (from === to) {
            fareNote.textContent = 'From and To are the same place';
        } else if (perRider === undefined) {
            fareNote.textContent =
                'No ' + MODE_LABELS[state.mode] +
                ' fare listed for this route yet';
        } else {
            fareNote.textContent =
                peso.format(perRider) +
                ' each \u00D7 ' +
                riders +
                (riders === 1 ? ' rider' : ' riders');
        }
    }

    // ------------------------------------------------------------------
    // CHANGE TRANSPORT MODE
    // ------------------------------------------------------------------

    function setMode(mode) {
        state.mode = mode;

        tabs.forEach((tab) => {
            tab.setAttribute(
                'aria-selected',
                String(tab.dataset.mode === mode)
            );
        });

        title.textContent = MODE_LABELS[mode] + ' fares';

        showHint('Fares will show here.');

        updateFare();
    }

    // ------------------------------------------------------------------
    // BROWSE FARES
    // ------------------------------------------------------------------

    function browse() {
        const from = fromSelect.value;
        const to = toSelect.value;
        const riders = riderCount();

        const noun = riders === 1 ? 'rider' : 'riders';

        // If both locations are selected, show the specific route
        if (from && to) {
            if (from === to) {
                showHint(
                    'Your starting point and destination are the same. Pick two different places.'
                );
                return;
            }

            const perRider = fareFor(from, to, riders);

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
            detail.textContent =
                MODE_LABELS[state.mode] +
                ' \u00B7 ' +
                riders +
                ' ' +
                noun +
                ' \u00B7 ' +
                peso.format(perRider) +
                ' each';

            const total = document.createElement('span');
            total.className = 'total';
            total.textContent =
                'Total ' + peso.format(perRider * riders);

            box.append(name, detail, total);
            result.appendChild(box);

            return;
        }

        // If no complete route is selected, display the available fares
        const rows = Object.entries(FARES[state.mode])
            .map(([key]) => {
                const route = key.split('|');

                return {
                    route,
                    fare: fareFor(route[0], route[1], riders)
                };
            })
            .filter(({ fare }) => fare !== undefined)
            .filter(({ route }) => !from || route.includes(from));

        result.innerHTML = '';

        const table = document.createElement('table');

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Route</th>
                    <th>Per rider</th>
                    <th>Total</th>
                </tr>
            </thead>
        `;

        const body = document.createElement('tbody');

        rows.forEach(({ route, fare }) => {
            let [a, b] = route;

            // Show the selected starting point first
            if (from && b === from) {
                [a, b] = [b, a];
            }

            const tr = document.createElement('tr');

            [
                a + ' \u2192 ' + b,
                peso.format(fare),
                peso.format(fare * riders)
            ].forEach((text) => {
                const td = document.createElement('td');

                td.textContent = text;

                tr.appendChild(td);
            });

            body.appendChild(tr);
        });

        table.appendChild(body);
        result.appendChild(table);
    }

    // ------------------------------------------------------------------
    // EVENT LISTENERS
    // ------------------------------------------------------------------

    // Switch between Ikot and Tricycle
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            setMode(tab.dataset.mode);

            history.replaceState(
                null,
                '',
                '#' + tab.dataset.mode
            );
        });
    });

    // Select number of riders
    riderButtons.forEach((button) => {
        button.addEventListener('click', () => {
            state.riders = button.dataset.riders;

            riderButtons.forEach((b) => {
                b.setAttribute(
                    'aria-pressed',
                    String(b === button)
                );
            });

            moreCount.hidden = state.riders !== 'more';

            if (state.riders === 'more') {
                moreCount.focus();
            }

            updateFare();
        });
    });

    // Update fare when locations change
    [fromSelect, toSelect].forEach((el) => {
        el.addEventListener('input', updateFare);
    });

    // Limit custom rider count to 6
    moreCount.addEventListener('input', () => {
        const value = parseInt(moreCount.value, 10);

        if (value > 6) {
            moreCount.value = 6;
        }

        updateFare();
    });

    // Browse fares button
    browseBtn.addEventListener('click', browse);

    // Swap From and To
    swapBtn.addEventListener('click', () => {
        const from = fromSelect.value;

        fromSelect.value = toSelect.value;
        toSelect.value = from;

        updateFare();
    });

    // ------------------------------------------------------------------
    // INITIALIZE TAB FROM URL HASH
    // ------------------------------------------------------------------

    const hash = location.hash.replace('#', '');

    setMode(
        MODE_LABELS[hash] ? hash : 'tricycle'
    );

})();
