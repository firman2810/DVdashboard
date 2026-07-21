// main.js
// App state + orchestration. Every filter/click handler mutates `state`
// then calls applyFilters(), which re-derives filteredData and re-renders
// whatever is visible in the current mode. This keeps cross-filtering and
// drill-down consistent across all charts.

const state = {
  mode: 'analyst',
  filters: { start: null, end: null, categories: [], states: [], search: '' },
  selectedCategory: null,
  rawData: [],
  filteredData: [],
  elderlyRangeMonths: '3' // kept independent from the analyst filters
};

function applyFilters() {
  const f = state.filters;
  state.filteredData = state.rawData.filter(d => {
    if (f.start && d.date < f.start) return false;
    if (f.end && d.date > f.end) return false;
    if (f.categories.length && !f.categories.includes(d.category)) return false;
    if (f.states.length && !f.states.includes(d.state)) return false;
    if (state.selectedCategory && d.category !== state.selectedCategory) return false;
    return true;
  });
  renderAll();
}

function renderAll() {
  const rows = state.filteredData;

  if (state.mode === 'analyst') {
    KpiCards.render('kpi-cards', rows);
    Heatmap.render('chart-heatmap', rows, onHeatmapCellClick);
    ScatterMatrix.render('chart-scatter', rows);
    CategoryBar.render('chart-category', rows, state.selectedCategory, onCategoryBarClick);
    TrendLine.render('chart-trend', rows);
    DrilldownTable.render('drilldown-table', 'table-count', rows, state.filters.search);

    d3.select('#active-crossfilter')
      .attr('hidden', state.selectedCategory ? null : true)
      .text(state.selectedCategory ? `Filtered to: ${state.selectedCategory} ✕` : '')
      .on('click', () => { state.selectedCategory = null; applyFilters(); });

  } else if (state.mode === 'elderly') {
    const elderlyRows = getElderlyRows();
    KpiCards.render('kpi-cards-elderly', elderlyRows);
    TrendLine.render('chart-trend-elderly', elderlyRows, { height: 320, strokeWidth: 4, pointRadius: 5 });

  } else if (state.mode === 'kids') {
    KidsDonut.render('chart-donut-kids', rows);

  } else if (state.mode === 'timeline') {
    ProjectTimeline.render('chart-timeline', 'timeline-detail');
  }
}

// ---- Cross-filter / drill-down handlers ----
function onCategoryBarClick(category) {
  state.selectedCategory = (state.selectedCategory === category) ? null : category;
  applyFilters();
}

function onHeatmapCellClick(cell) {
  // Drill down: show only this hour+day slice in the table, without
  // touching state.filteredData (so charts above stay put and the user
  // can compare multiple cells without losing overall context).
  const slice = state.filteredData.filter(d => d.day_of_week === cell.day && d.hour === cell.hour);
  DrilldownTable.render('drilldown-table', 'table-count', slice, state.filters.search);
  document.getElementById('drilldown-table').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- Elderly "show me" date-range dropdown ----
// Kept fully independent of the analyst filters/state.filteredData so
// switching modes never cross-contaminates the other view's data.
function getElderlyRows() {
  const value = state.elderlyRangeMonths;
  if (value === 'all') return state.rawData;
  const now = d3.max(state.rawData, d => d.date) || new Date();
  const start = d3.utcMonth.offset(now, -(+value));
  return state.rawData.filter(d => d.date >= start);
}

function applyElderlyRange(value) {
  state.elderlyRangeMonths = value;
  if (state.mode === 'elderly') renderAll();
}

// ---- Mode toggle wiring ----
function setMode(mode) {
  state.mode = mode;
  state.selectedCategory = null;
  document.querySelectorAll('.mode-btn').forEach(b => {
    const active = b.dataset.mode === mode;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });
  document.body.className = 'mode-' + mode;
  document.getElementById('view-analyst').hidden = mode !== 'analyst';
  document.getElementById('view-elderly').hidden = mode !== 'elderly';
  document.getElementById('view-kids').hidden = mode !== 'kids';
  document.getElementById('view-timeline').hidden = mode !== 'timeline';
  renderAll();
}

// ---- Init ----
async function init() {
  const rows = await DataUtils.load('data/fraud_sample_100k.csv');
  state.rawData = rows;
  state.filteredData = rows;

  // Populate category / state filter dropdowns
  const categories = Array.from(new Set(rows.map(d => d.category))).sort();
  const states = Array.from(new Set(rows.map(d => d.state))).sort();

  const catSel = d3.select('#filter-category');
  catSel.selectAll('option').data(categories).enter().append('option')
    .attr('value', d => d).text(d => d);

  const stateSel = d3.select('#filter-state');
  stateSel.selectAll('option').data(states).enter().append('option')
    .attr('value', d => d).text(d => d);

  // Wire up filter controls
  d3.select('#filter-start').on('change', function () {
    state.filters.start = this.value ? new Date(this.value) : null;
    applyFilters();
  });
  d3.select('#filter-end').on('change', function () {
    state.filters.end = this.value ? new Date(this.value) : null;
    applyFilters();
  });
  d3.select('#filter-category').on('change', function () {
    state.filters.categories = Array.from(this.selectedOptions).map(o => o.value);
    applyFilters();
  });
  d3.select('#filter-state').on('change', function () {
    state.filters.states = Array.from(this.selectedOptions).map(o => o.value);
    applyFilters();
  });
  d3.select('#filter-search').on('input', function () {
    state.filters.search = this.value;
    DrilldownTable.render('drilldown-table', 'table-count', state.filteredData, state.filters.search);
  });
  d3.select('#filter-reset').on('click', () => {
    state.filters = { start: null, end: null, categories: [], states: [], search: '' };
    state.selectedCategory = null;
    document.getElementById('filter-start').value = '';
    document.getElementById('filter-end').value = '';
    document.getElementById('filter-category').selectedIndex = -1;
    document.getElementById('filter-state').selectedIndex = -1;
    document.getElementById('filter-search').value = '';
    applyFilters();
  });

  d3.select('#filter-range-elderly').on('change', function () {
    applyElderlyRange(this.value);
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  applyElderlyRange('3'); // default elderly view to last 3 months
  state.mode = 'analyst';
  applyFilters();
}

init();
