'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type Props = {
  data: { date: string; value: number }[];
  emptyLabel?: string;
};

const WIDTH = 400;
const HEIGHT = 180;
const MARGIN = { top: 10, right: 10, bottom: 20, left: 0 };

export default function ChartLine({ data, emptyLabel }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const isEmpty = data.length === 0;

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const parsed = data.map((d) => ({ date: new Date(d.date), value: d.value }));

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([MARGIN.left, WIDTH - MARGIN.right]);

    const maxValue = d3.max(parsed, (d) => d.value) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(maxValue, 1)])
      .nice()
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    const path = svg
      .append('path')
      .datum(parsed)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-accent)')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(800)
      .attr('stroke-dashoffset', 0);

    svg
      .append('g')
      .selectAll('circle')
      .data(parsed)
      .join('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 0)
      .attr('fill', 'var(--color-accent)')
      .transition()
      .delay(800)
      .duration(200)
      .attr('r', 3);

    const xAxis = d3
      .axisBottom(x)
      .ticks(Math.min(parsed.length, 6))
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(5)
      .tickFormat((domainValue) => d3.timeFormat('%m/%d')(domainValue as Date));

    svg
      .append('g')
      .attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
      .call(xAxis)
      .call((g) => g.select('.domain').attr('stroke', 'var(--color-background-contrary)').attr('opacity', 0.2))
      .selectAll('text')
      .attr('fill', 'var(--color-background-contrary)')
      .style('font-size', '12px');

    svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSizeInner(0).tickSizeOuter(0).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').remove())
      .selectAll('text')
      .attr('fill', 'var(--color-background-contrary)')
      .style('font-size', '12px');
  }, [data]);

  return (
    <div className="relative min-h-0 flex-1">
      <svg ref={ref} width="100%" height="100%" />
      {isEmpty && emptyLabel && <div className="text-background-contrary/60 absolute inset-0 flex items-center justify-center text-sm">{emptyLabel}</div>}
    </div>
  );
}
