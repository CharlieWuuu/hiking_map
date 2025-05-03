import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type countyOrder = {
    county: string;
    county_count: number;
};

type Props = {
    data: countyOrder[];
};

export default function countyOrder({ data }: Props) {
    const chartRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        d3.select(chartRef.current).selectAll('*').remove();

        const svg = d3.select(chartRef.current);
        const width = 400;
        const height = 200;
        const margin = { top: 5, right: 5, bottom: 20, left: 0 };

        const x = d3
            .scaleBand()
            .domain(data.map((d) => d.county))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => +d.county_count)!])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.attr('viewBox', `0 0 ${width} ${height}`);

        // 長出動畫的直條圖
        svg.append('g')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', (d) => x(d.county)!)
            .attr('y', y(0))
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', '#ffff3c')
            .transition()
            .duration(800)
            .delay((_, i) => i * 20)
            .attr('y', (d) => y(+d.county_count))
            .attr('height', (d) => y(0) - y(+d.county_count));

        // 自訂 X 軸刻度格式
        const xAxis = d3
            .axisBottom(x)
            .tickFormat((_, i) => {
                return data[i].county;
            })
            .tickSizeInner(-6)
            .tickSizeOuter(0);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('dy', '1em');

        // Y 軸
        svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6).tickSizeInner(-6).tickSizeOuter(0));
    }, [data]);

    return <svg ref={chartRef} width="100%" height="100%" />;
}
