import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import "../styles/Mapbox.css";
import "mapbox-gl/dist/mapbox-gl.css";

async function fetchGeoJsonData() {
  const response = await fetch(
    "https://data.cityofnewyork.us/api/geospatial/cpf4-rkhq?method=export&format=GeoJSON"
  );
  const geojsonData = await response.json();
  return geojsonData;
}

class HeatmapLayer extends Component {
  componentDidMount() {
    const { map } = this.props;
    fetchGeoJsonData().then((geojsonData) => {
      this.addHeatmapLayer(map, geojsonData);
    });
  }
  addHeatmapLayer(map, geojsonData) {
    map.addSource("heatmap-source", {
      type: "geojson",
      data: geojsonData,
    });

    map.addLayer({
      id: "heatmap",
      type: "heatmap",
      source: "heatmap-source",
      paint: {
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "density"],
          0,
          0,
          5,
          1,
        ],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
      },
    });
  }

  render() {
    return null;
  }
}

export default HeatmapLayer;
