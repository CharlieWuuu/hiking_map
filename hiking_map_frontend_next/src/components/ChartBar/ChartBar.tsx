'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type Props = {
  data: { label: string; value: number }[];
  emptyLabel?: string;
};

const WIDTH = 400;
const HEIGHT = 180;
const MARGIN = { top: 10, right: 5, bottom: 20, left: 0 };

export default function ChartBar({ data, emptyLabel }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const isEmpty = data.every((d) => d.value === 0);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([MARGIN.left, WIDTH - MARGIN.right])
      .padding(0.1);

    const maxValue = d3.max(data, (d) => d.value) ?? 0;
    const y = d3
      .scaleLinear()
      .domain([0, Math.max(maxValue, 1)])
      .nice()
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    svg
      .append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.label)!)
      .attr('y', y(0))
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', 'var(--color-accent)')
      .transition()
      .duration(800)
      .delay((_, i) => i * 20)
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => y(0) - y(d.value));

    const xAxis = d3.axisBottom(x).tickSizeInner(0).tickSizeOuter(0).tickPadding(5);

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
      // 值域很小時（例如全為 0）取 5 個刻度會四捨五入成重複的整數，改用實際整數刻度
      .call(
        d3
          .axisLeft(y)
          .tickValues(d3.range(0, Math.floor(y.domain()[1]) + 1).filter((_, i, arr) => arr.length <= 6 || i % Math.ceil(arr.length / 6) === 0))
          .tickSizeInner(0)
          .tickSizeOuter(0)
          .tickFormat(d3.format('d'))
      )
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
