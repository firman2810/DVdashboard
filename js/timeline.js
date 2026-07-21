// timeline.js
// Task 6: Project progress timeline covering the last 5 months.
// Interactive: hover shows tooltip, click expands a description panel.
// This tracks the TEAM'S project process, not the finance dataset.

const ProjectTimeline = {

  milestones: [
    {
      phase: 'Project Initiation',
      start: '2026-02-20', end: '2026-03-17',
      color: '#4a7fb5',
      description: 'Selected the Finance domain, defined the business problem (fraud detection + spending patterns), identified stakeholders, and split responsibilities among the team (Haziq: EDA/Q1).'
    },
    {
      phase: 'Data Collection',
      start: '2026-03-17', end: '2026-04-11',
      color: '#3fb98a',
      description: 'Sourced the credit card transactions fraud detection dataset (Kaggle), reviewed available fields, and confirmed it supported both fraud and spending-pattern analysis.'
    },
    {
      phase: 'Data Cleaning',
      start: '2026-04-11', end: '2026-05-06',
      color: '#e6c66b',
      description: 'Sampled ~1.85M rows down to a 100k-row working set (4% oversampled fraud rate), derived new fields (hour, day of week, age, distance-to-merchant), and validated data quality.'
    },
    {
      phase: 'Dashboard Development',
      start: '2026-05-06', end: '2026-05-31',
      color: '#d4af37',
      description: 'Built the D3.js dashboard: KPI cards, filters, heat map, scatter plot matrix, category bar chart, trend line, drill-down table, and the three user-mode views (Analyst / Simplified / Kids).'
    },
    {
      phase: 'Testing & Validation',
      start: '2026-05-31', end: '2026-06-25',
      color: '#c56bd4',
      description: 'Cross-checked chart accuracy against raw aggregates, tested all interactive features (filtering, cross-filtering, drill-down, search), and reviewed usability across the three user modes.'
    },
    {
      phase: 'Deployment / Presentation',
      start: '2026-06-25', end: '2026-07-20',
      color: '#e2554f',
      description: 'Finalized the report, poster, and source files; rehearsed the in-class demonstration ahead of the Week 11 presentation.'
    }
  ],

  render(containerId, detailId) {
    const container = d3.select('#' + containerId);
    container.selectAll('*').remove();

    const parseDate = d3.timeParse('%Y-%m-%d');
    const data = this.milestones.map(d => ({ ...d, startDate: parseDate(d.start), endDate: parseDate(d.end) }));

    const width = container.node().clientWidth || 900;
    const rowHeight = 54;
    const height = data.length * rowHeight + 50;
    const margin = { top: 30, right: 30, bottom: 20, left: 20 };
    const innerW = width - margin.left - margin.right;

    const svg = container.append('svg').attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain([data[0].startDate, data[data.length - 1].endDate])
      .range([0, innerW]);

    // Month axis on top
    g.append('g')
      .call(d3.axisTop(x).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat('%b %Y')))
      .selectAll('text').style('font-size', '11px');

    const tooltip = this._tooltip();
    const detail = d3.select('#' + detailId);

    const rows = g.selectAll('.tl-row')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'tl-row')
      .attr('transform', (d, i) => `translate(0, ${i * rowHeight + 15})`);

    rows.append('rect')
      .attr('x', d => x(d.startDate))
      .attr('width', d => Math.max(4, x(d.endDate) - x(d.startDate)))
      .attr('height', 28)
      .attr('rx', 6)
      .attr('fill', d => d.color)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        tooltip.style('opacity', 1)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 20) + 'px')
          .html(`<strong>${d.phase}</strong><br>${d.start} to ${d.end}`);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0))
      .on('click', (event, d) => {
        detail.html(`<h4>${d.phase}</h4><p>${d.description}</p><p class="tl-range">${d.start} &rarr; ${d.end}</p>`);
        detail.classed('visible', true);
      });

    rows.append('text')
      .attr('x', d => x(d.startDate))
      .attr('y', -6)
      .style('font-size', '12px')
      .attr('fill', '#f2f4f8')
      .text(d => d.phase);

    // Default: show first milestone's detail
    detail.html(`<h4>${data[0].phase}</h4><p>${data[0].description}</p><p class="tl-range">${data[0].start} &rarr; ${data[0].end}</p>`);
    detail.classed('visible', true);
  },

  _tooltip() {
    let t = d3.select('body').select('.tooltip.timeline-tt');
    if (t.empty()) {
      t = d3.select('body').append('div').attr('class', 'tooltip timeline-tt').style('opacity', 0);
    }
    return t;
  }
};
