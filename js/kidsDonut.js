// kidsDonut.js
// Early-childhood view: reframed as a "money habits" financial-literacy
// visual. Minimal text, large icons, bright colors, single chart, no
// filters/drill-down -- per the rubric's early-childhood design row.

const KidsDonut = {

  icons: {
    grocery_pos: '🛒', grocery_net: '🛒', gas_transport: '⛽', shopping_pos: '🛍️',
    shopping_net: '🛍️', food_dining: '🍔', entertainment: '🎮', kids_pets: '🐶',
    home: '🏠', health_fitness: '💪', personal_care: '🧴', travel: '✈️',
    misc_pos: '✨', misc_net: '✨'
  },

  render(containerId, rows) {
    const summary = DataUtils.categorySummary(rows).slice(0, 8); // keep it simple
    const container = d3.select('#' + containerId);
    container.selectAll('*').remove();

    const width = Math.min(container.node().clientWidth || 500, 500);
    const height = 420;
    const radius = Math.min(width, height - 120) / 2 - 10;

    const svg = container.append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${width / 2},${(height - 100) / 2 + 10})`);

    const color = d3.scaleOrdinal()
      .domain(summary.map(d => d.category))
      .range(['#e6c66b', '#e2554f', '#3fb98a', '#4a7fb5', '#c56bd4', '#f2934e', '#5fd1c9', '#d4af37']);

    const pie = d3.pie().value(d => d.totalSpend).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
    const labelArc = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

    g.selectAll('path')
      .data(pie(summary))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.category))
      .attr('stroke', '#1a2f4a')
      .attr('stroke-width', 3);

    g.selectAll('text.icon')
      .data(pie(summary))
      .enter()
      .append('text')
      .attr('class', 'icon')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '26px')
      .text(d => this.icons[d.data.category] || '💰');

    // Simple legend below, big text, category name only (no numbers/percentages)
    const legend = svg.append('g').attr('transform', `translate(20, ${height - 90})`);
    const cols = 4;
    summary.forEach((d, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const lg = legend.append('g').attr('transform', `translate(${col * 120}, ${row * 32})`);
      lg.append('rect').attr('width', 16).attr('height', 16).attr('rx', 4).attr('fill', color(d.category));
      lg.append('text').attr('x', 22).attr('y', 13).style('font-size', '13px').attr('fill', '#f2f4f8')
        .text(this.friendlyName(d.category));
    });
  },

  friendlyName(cat) {
    const names = {
      grocery_pos: 'Groceries', grocery_net: 'Groceries', gas_transport: 'Gas & Rides',
      shopping_pos: 'Shopping', shopping_net: 'Shopping', food_dining: 'Food',
      entertainment: 'Fun & Games', kids_pets: 'Pets', home: 'Home',
      health_fitness: 'Health', personal_care: 'Personal Care', travel: 'Travel',
      misc_pos: 'Other', misc_net: 'Other'
    };
    return names[cat] || cat;
  }
};
