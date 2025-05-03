import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type trailsMonthData = {
    month: string; // 'YYYY/MM'
    total_distance_km: string;
};

type Props = {
    data: trailsMonthData[];
    mode?: 'year' | 'zoomIn';
};

export default function TrailsMonthData({ data, mode = 'year' }: Props) {
    const chartRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        d3.select(chartRef.current).selectAll('*').remove();

        const svg = d3.select(chartRef.current);
        const width = mode === 'year' ? 400 : 900;
        const height = mode === 'year' ? 200 : 400;
        const margin = { top: 5, right: 5, bottom: 20, left: 0 };

        const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));

        // 🔧 補滿最近六個月的資料（如果不足）
        const latest = sorted.length ? sorted[sorted.length - 1].month : d3.timeFormat('%Y/%m')(new Date());
        const [latestYear, latestMonth] = latest.split('/').map(Number);
        const baseDate = new Date(latestYear, latestMonth - 1); // JS 月份從 0 開始

        const fullRecent6Months: trailsMonthData[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setMonth(date.getMonth() - i);
            const label = d3.timeFormat('%Y/%m')(date);
            const existing = sorted.find((d) => d.month === label);
            fullRecent6Months.push(existing ?? { month: label, total_distance_km: '0' });
        }

        const shownData = data.length < 6 ? fullRecent6Months : mode === 'year' ? sorted.slice(-12) : sorted;

        console.log(shownData);

        const x = d3
            .scaleBand()
            .domain(shownData.map((d) => d.month))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(shownData, (d) => +d.total_distance_km)!])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.attr('viewBox', `0 0 ${width} ${height}`);

        svg.append('g')
            .selectAll('rect')
            .data(shownData)
            .join('rect')
            .attr('x', (d) => x(d.month)!)
            .attr('y', y(0))
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', '#ffff3c')
            .transition()
            .duration(800)
            .delay((_, i) => i * 20)
            .attr('y', (d) => y(+d.total_distance_km))
            .attr('height', (d) => y(0) - y(+d.total_distance_km));

        const xAxis = d3
            .axisBottom(x)
            .tickFormat((d) => {
                const [year, month] = String(d).split('/');
                const index = shownData.findIndex((v) => v.month === d);
                const isFirst = index === 0;
                const isJanuary = month === '01';
                const isEveryThird = index % 3 === 0;
                if (mode === 'zoomIn') {
                    if (index === 0) return `${year}`;
                    if (data.length > 24 && isJanuary) return `${year}`;
                }
                if (mode === 'year') {
                    if (isFirst || isJanuary) {
                        return `${year}/${month}`;
                    } else if (!isEveryThird && data.length > 6) {
                        return '';
                    } else {
                        return `${month}`;
                    }
                }
                return '';
            })
            .tickSizeInner(-6)
            .tickSizeOuter(0);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('dy', '1.2em');

        svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6).tickSizeInner(-6).tickSizeOuter(0));
    }, [data, mode]);

    return <svg ref={chartRef} width="100%" height="100%" />;
}
