import styles from './Data_User_Chart.module.scss';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useGeojson } from '../context/GeojsonContext';

export default function Data_User_Chart() {
    const { geojson } = useGeojson();
    const chartRef_index = useRef(null);

    useEffect(() => {
        if (!geojson?.features?.length) return;

        // 時間排序
        const sorted = [...geojson.features].sort((a, b) => new Date(a.properties?.time as string).getTime() - new Date(b.properties?.time as string).getTime());

        // 組圖表資料
        const chartData = sorted.map((d, i) => ({
            time: new Date(d.properties?.time as string),
            index: i + 1,
        }));

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        // 清空並建立 SVG
        const svg = d3
            .select(chartRef_index.current)
            .html('')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // x: 時間軸
        const x = d3
            .scaleTime()
            .domain(d3.extent(chartData, (d) => d.time) as [Date, Date])
            .range([0, width]);

        // y: 累計 index 軸
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(chartData, (d) => d.index)!])
            .range([height, 0]);

        // 折線圖
        const line = d3
            .line<{ time: Date; index: number }>()
            .x((d) => x(d.time))
            .y((d) => y(d.index));

        svg.append('path').datum(chartData).attr('fill', 'none').attr('stroke', '#ffff3c').attr('stroke-width', 2).attr('d', line);
        svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickSizeInner(-6).tickSizeOuter(0));

        svg.append('g').call(d3.axisLeft(y).tickSizeInner(-6).tickSizeOuter(0));
    }, [geojson]);

    const chartRef_length = useRef(null);
    function movingAverage(data: number[], windowSize: number): number[] {
        return data.map((_, i, arr) => {
            const start = Math.max(0, i - windowSize);
            const end = i + 1;
            const window = arr.slice(start, end);
            const avg = window.reduce((a, b) => a + b, 0) / window.length;
            return avg;
        });
    }

    useEffect(() => {
        if (!geojson?.features?.length) return;

        // 組圖表資料
        const chartData = geojson.features
            .filter((f) => f.properties?.time && f.properties?.length)
            .map((f) => ({
                time: new Date(f.properties?.time),
                length: +f.properties?.length,
            }))
            .sort((a, b) => a.time.getTime() - b.time.getTime());

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        // 清空並建立 SVG
        const svg = d3
            .select(chartRef_length.current)
            .html('')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3
            .scaleTime()
            .domain(d3.extent(chartData, (d) => d.time) as [Date, Date])
            .range([0, width]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(chartData, (d) => d.length)!])
            .range([height, 0]);

        svg.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => x(d.time))
            .attr('y', (d) => y(d.length))
            .attr('width', '2')
            .attr('height', (d) => height - y(d.length))
            .attr('fill', '#ffff3c');

        svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickSizeInner(-6).tickSizeOuter(0));
        svg.append('g').call(d3.axisLeft(y).tickSizeInner(-6).tickSizeOuter(0));

        // 額外建立一個 scaleTime 給趨勢線用
        const xLine = d3
            .scaleTime()
            .domain(d3.extent(chartData, (d) => d.time) as [Date, Date])
            .range([0, width]);

        const smoothData = chartData.map((d, i) => ({
            time: d.time,
            length: movingAverage(
                chartData.map((d) => d.length),
                50,
            )[i],
        }));

        const trendLine = d3
            .line<{ time: Date; length: number }>()
            .curve(d3.curveBasis)
            .x((d) => xLine(d.time))
            .y((d) => y(d.length));

        svg.append('path')
            .datum(smoothData)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4 4') // 虛線
            .attr('d', trendLine);
    }, [geojson]);

    return (
        <div className={styles.Data_User_Chart}>
            <h2>Charlie 的統計</h2>
            <div>
                <h3>頻率</h3>
                <div ref={chartRef_index}></div>
            </div>
            <div>
                <h3>歷次長度</h3>
                <div ref={chartRef_length}></div>
            </div>
        </div>
    );
}
