import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import "../styles/BarChart.css";

const BarChart = ({ data }) => {
  const ref = useRef();
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(350);

  useEffect(() => {
    function updateSize() {
      const containerWidth = ref.current.parentElement.offsetWidth;
      const containerHeight = ref.current.parentElement.offsetHeight;
      setWidth(containerWidth);
      setHeight(containerHeight);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const svg = d3.select(ref.current);

    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const totalValue = data.reduce((sum, d) => sum + d.value, 0);

    const yScale = d3
      .scaleLinear()
      .domain([0, totalValue])
      .range([innerHeight, 0]);

    const xScale = d3
      .scaleBand()
      .domain(["Stacked Bar"])
      .range([0, innerWidth]);
    // .padding(0.2);

    const colorScale = scaleOrdinal(schemeCategory10);

    // const xAxis = d3.axisBottom(xScale);
    // svg
    //   .select(".x-axis")
    //   .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
    //   .call(xAxis);

    // const yAxis = d3.axisLeft(yScale);
    // svg
    //   .select(".y-axis")
    //   .attr("transform", `translate(${margin.left},${margin.top})`)
    //   .call(yAxis);

    let currentY = 0;
    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", margin.left)
      .attr("y", (d) => {
        const yPos = yScale(currentY + d.value);
        currentY += d.value;
        return yPos;
      })
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke","white")
      .attr("stroke-width", "1px"); /* 边框宽度 */

    currentY = 0;
    svg
      .selectAll(".bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", margin.left + xScale.bandwidth() / 2)
      .attr("y", (d, i) => {
        const yPos = yScale(currentY + d.value / 2);
        currentY += d.value;
        return yPos;
      })
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => {
        const percentage = ((d.value / totalValue) * 100).toFixed(1);
        return `${percentage}%`;
      });
  }, [data, height]);

  return (
    <svg ref={ref} width={width} height={height}>
      {/* <g className="x-axis" />
      <g className="y-axis" /> */}
    </svg>
  );
};

export default BarChart;
