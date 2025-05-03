import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type Props = {
    value: number;
    size?: number;
    strokeWidth?: number;
};

export default function Hundred({ value, size = 300, strokeWidth = 15 }: Props) {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        const svg = d3.select(ref.current);
        svg.selectAll('*').remove(); // 清除前一次渲染

        const group = svg.append('g').attr('transform', `translate(${size / 2}, ${size / 2})`);

        // 背景圓圈
        group.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', '#1e1e1e').attr('stroke-width', strokeWidth);

        // 前景圓圈（進度）
        const arc = group.append('circle').attr('r', radius).attr('fill', 'none').attr('stroke', '#ffff3c').attr('stroke-width', strokeWidth).attr('stroke-linecap', 'round').attr('stroke-dasharray', circumference).attr('stroke-dashoffset', circumference).attr('transform', 'rotate(-90)');

        arc.transition()
            .duration(1000)
            .attr('stroke-dashoffset', circumference * (1 - value / 100));

        // 中央數字
        group
            .append('text')
            .text(`${value}`)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', size * 0.35)
            .attr('fill', '#ffff3c');
    }, [value, size, strokeWidth]);

    return <svg ref={ref} width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} />;
}
