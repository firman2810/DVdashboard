// drilldownTable.js
const DrilldownTable = {

  render(containerId, countId, rows, searchTerm = '') {
    let filtered = rows;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = rows.filter(d => d.merchant.toLowerCase().includes(term));
    }
    // cap render for browser performance; the count label shows the true total
    const display = filtered.slice(0, 200);

    d3.select('#' + countId).text(`(showing ${display.length} of ${filtered.length})`);

    const container = d3.select('#' + containerId);
    container.selectAll('*').remove();
    const scroll = container.append('div').attr('class', 'table-scroll');
    const table = scroll.append('table').attr('class', 'txn-table');
    const thead = table.append('thead').append('tr');
    ['Date', 'Merchant', 'Category', 'Amount', 'State', 'Fraud'].forEach(h => thead.append('th').text(h));

    const tbody = table.append('tbody');
    const tr = tbody.selectAll('tr').data(display).enter().append('tr')
      .classed('is-fraud', d => d.is_fraud === 1);

    tr.append('td').text(d => d3.timeFormat('%Y-%m-%d %H:%M')(d.date));
    tr.append('td').text(d => d.merchant);
    tr.append('td').text(d => d.category);
    tr.append('td').text(d => '$' + d.amt.toFixed(2));
    tr.append('td').text(d => d.state);
    tr.append('td').text(d => d.is_fraud ? 'Yes' : 'No');
  }
};
