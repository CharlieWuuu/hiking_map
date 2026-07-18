'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type Props = {
  label: string;
  value: number;
  size?: number;
  strokeWidth?: number;
};

export default function AchievementRing({ label, value, size = 120, strokeWidth = 10 }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const group = svg.append('g').attr('transform', `translate(${size / 2}, ${size / 2})`);

    group.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', 'var(--color-background)').attr('stroke-width', strokeWidth);

    const arc = group
      .append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-accent)')
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', circumference)
      .attr('stroke-dashoffset', circumference)
      .attr('transform', 'rotate(-90)');

    arc
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', circumference * (1 - Math.min(value / 100, 1)));

    group
      .append('text')
      .text(`${value}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.15em')
      .attr('font-size', size * 0.28)
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--color-accent)');

    group
      .append('text')
      .text('／100')
      .attr('text-anchor', 'middle')
      .attr('dy', size * 0.16)
      .attr('font-size', size * 0.09)
      .attr('fill', 'var(--color-background-contrary)')
      .attr('opacity', 0.6);
  }, [value, size, strokeWidth]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} />
      <span className="text-background-contrary text-sm">{label}</span>
    </div>
  );
}
