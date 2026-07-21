// scatterMatrix.js
// Advanced visualization #2: Scatter Plot Matrix across amt / age / distance_km.
// Justification (for report): a single scatter plot can only show 2
// variables; fraud often only becomes visible as an outlier cluster when
// viewed across combinations of variables (e.g. high amount + large
// distance-from-home + certain age band). The matrix reveals which pairs
// separate fraud from legitimate transactions best.

const ScatterMatrix = {

  render(containerId, rows) {
    const vars = [
      { key: 'amt', label: 'Amount ($)' },
      { key: 'age', label: 'Age' },
      { key: 'distance_km', label: 'Distance (km)' }
    ];
    const data = DataUtils.scatterSample(rows, 1500);

    const container = d3.select('#' + containerId);
    container.selectAll('*').remove();

    const size = 130;
    const pad = 24;
    const n = vars.length;
    const totalSize = n * size + (n + 1) * pad + 40;

    const svg = container.append('svg')
      .attr('width', '100%')
      .attr('viewBox', `0 0 ${totalSize} ${totalSize}`);

    const tooltip = this._tooltip();

    const scales = vars.map(v => d3.scaleLinear()
      .domain(d3.extent(data, d => d[v.key])).nice()
      .range([0, size]));

    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const gx = 40 + col * (size + pad);
        const gy = 20 + row * (size + pad);
        const g = svg.append('g').attr('transform', `translate(${gx},${gy})`);

        if (row === col) {
          g.append('rect').attr('width', size).attr('height', size)
            .attr('fill', '#16294a').attr('stroke', '#1f3a63');
          g.append('text')
            .attr('x', size / 2).attr('y', size / 2)
            .attr('text-anchor', 'middle').attr('fill', '#b8c2d4')
            .style('font-size', '11px')
            .text(vars[row].label);
          continue;
        }

        const xScale = scales[col], yScale = scales[row];
        g.append('rect').attr('width', size).attr('height', size)
          .attr('fill', 'none').attr('stroke', '#1f3a63');

        g.selectAll('circle')
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d[vars[col].key]))
          .attr('cy', d => size - yScale(d[vars[row].key]))
          .attr('r', 2.5)
          .attr('fill', d => d.is_fraud ? '#e2554f' : '#4a7fb5')
          .attr('opacity', d => d.is_fraud ? 0.9 : 0.35)
          .on('mousemove', (event, d) => {
            tooltip.style('opacity', 1)
              .style('left', (event.pageX + 12) + 'px')
              .style('top', (event.pageY - 20) + 'px')
              .html(`${d.category}<br>$${d.amt.toFixed(2)} | age ${d.age} | ${d.distance_km.toFixed(0)}km${d.is_fraud ? '<br><strong style="color:#e2554f">FRAUD</strong>' : ''}`);
          })
          .on('mouseleave', () => tooltip.style('opacity', 0));

        if (row === n - 1) {
          g.append('text').attr('x', size / 2).attr('y', size + 16)
            .attr('text-anchor', 'middle').style('font-size', '9px').attr('fill', '#7c8aa3')
            .text(vars[col].label);
        }
      }
    }
  },

  _tooltip() {
    let t = d3.select('body').select('.tooltip.scatter-tt');
    if (t.empty()) {
      t = d3.select('body').append('div').attr('class', 'tooltip scatter-tt').style('opacity', 0);
    }
    return t;
  }
};
