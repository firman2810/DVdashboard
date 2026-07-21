// data.js
// Loads the sampled CSV and provides shared aggregation helpers.
// Every chart module reads from `state.filteredData` (see main.js) and
// calls these helpers rather than re-implementing aggregation logic.

const DataUtils = {

  parseRow(d) {
    return {
      trans_num: d.trans_num,
      date: new Date(d.trans_date_trans_time),
      hour: +d.hour,
      day_of_week: d.day_of_week,
      month: d.month,
      merchant: d.merchant,
      category: d.category,
      amt: +d.amt,
      gender: d.gender,
      age: +d.age,
      job: d.job,
      city: d.city,
      state: d.state,
      city_pop: +d.city_pop,
      distance_km: +d.distance_km,
      is_fraud: +d.is_fraud
    };
  },

  async load(path) {
    const raw = await d3.csv(path, this.parseRow);
    return raw;
  },

  // ---- Aggregation helpers, all operate on an array of parsed rows ----

  kpis(rows) {
    const total = rows.length;
    const fraudCount = d3.sum(rows, d => d.is_fraud);
    const totalSpend = d3.sum(rows, d => d.amt);
    const avgAmt = total ? totalSpend / total : 0;
    return {
      total,
      fraudCount,
      fraudRate: total ? fraudCount / total : 0,
      totalSpend,
      avgAmt
    };
  },

  // hour (0-23) x day_of_week fraud rate matrix
  heatmapData(rows) {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const grouped = d3.rollup(
      rows,
      v => ({ count: v.length, fraudRate: d3.mean(v, d => d.is_fraud) }),
      d => d.day_of_week,
      d => d.hour
    );
    const cells = [];
    days.forEach(day => {
      for (let h = 0; h < 24; h++) {
        const entry = grouped.get(day)?.get(h);
        cells.push({
          day, hour: h,
          count: entry ? entry.count : 0,
          fraudRate: entry ? entry.fraudRate : 0
        });
      }
    });
    return { days, cells };
  },

  categorySummary(rows) {
    const grouped = d3.rollup(
      rows,
      v => ({
        count: v.length,
        totalSpend: d3.sum(v, d => d.amt),
        fraudCount: d3.sum(v, d => d.is_fraud),
        fraudRate: d3.mean(v, d => d.is_fraud)
      }),
      d => d.category
    );
    return Array.from(grouped, ([category, vals]) => ({ category, ...vals }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  },

  monthlyTrend(rows) {
    const grouped = d3.rollup(
      rows,
      v => ({ totalSpend: d3.sum(v, d => d.amt), count: v.length }),
      d => d.month
    );
    return Array.from(grouped, ([month, vals]) => ({ month, ...vals }))
      .sort((a, b) => a.month.localeCompare(b.month));
  },

  // Sample down further for scatter plot rendering performance (browser-safe point count)
  scatterSample(rows, n = 2000) {
    if (rows.length <= n) return rows;
    const fraud = rows.filter(d => d.is_fraud);
    const legit = rows.filter(d => !d.is_fraud);
    const legitSampleN = Math.max(0, n - fraud.length);
    const shuffled = d3.shuffle(legit.slice());
    return fraud.concat(shuffled.slice(0, legitSampleN));
  }
};
