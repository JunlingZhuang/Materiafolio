import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BarChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, 300])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([150, 0]);

    const xAxis = d3.axisBottom(xScale);
    svg.select(".x-axis").style("transform", "translateY(150px)").call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.select(".y-axis").call(yAxis);

    svg
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .style("transform", "scale(1, -1)")
      .attr("x", (d) => xScale(d.name))
      .attr("y", -150)
      .attr("width", xScale.bandwidth())
      .transition()
      .attr("height", (d) => 150 - yScale(d.value));
  }, [data]);

  return (
    <svg ref={ref} width={350} height={200}>
      <g className="x-axis" />
      <g className="y-axis" />
    </svg>
  );
};

export default BarChart;
