// kpiCards.js
const KpiCards = {

  render(containerId, rows) {
    const k = DataUtils.kpis(rows);
    const cards = [
      { label: 'Total Transactions', value: d3.format(',')(k.total) },
      { label: 'Fraud Rate', value: d3.format('.2%')(k.fraudRate), alert: k.fraudRate > 0.03 },
      { label: 'Total Spend', value: '$' + d3.format(',.0f')(k.totalSpend) },
      { label: 'Avg Transaction', value: '$' + d3.format(',.2f')(k.avgAmt) }
    ];

    const sel = d3.select('#' + containerId)
      .selectAll('.kpi-card')
      .data(cards);

    const enter = sel.enter().append('div').attr('class', 'kpi-card');
    enter.append('div').attr('class', 'label');
    enter.append('div').attr('class', 'value');

    const merged = enter.merge(sel);
    merged.classed('alert', d => !!d.alert);
    merged.select('.label').text(d => d.label);
    merged.select('.value').text(d => d.value);

    sel.exit().remove();
  }
};
