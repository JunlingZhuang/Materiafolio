// HeatmapLayer.js
import React, { useEffect } from "react";

const HeatmapLayer = ({ map }) => {
  // console.log(setHeatmapData);
  useEffect(() => {
    if (map) {
      fetch("./CSV/Columbia_SVIpoints_4326_output.json")
        .then((response) => response.json())
        .then((rawData) => {
          const foliageData = rawData.map((item) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [parseFloat(item.x), parseFloat(item.y)],
            },
            properties: {
              foliage: parseFloat(item.foliage),
            },
          }));
          // console.log("完整的 foliageData: ", foliageData);

          const geoJSONData = {
            type: "Feature",
            features: foliageData,
          };
          // console.log(geoJSONData);

          map.on("load", () => {
            map.addSource("foliage-heatmap", {
              type: "geojson",
              data: geoJSONData,
            });

            map.addLayer({
              id: "foliage-heatmap",
              type: "heatmap",
              source: "foliage-heatmap",
              paint: {
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["get", "foliage"],
                  0,
                  0,
                  1,
                  1,
                ],
                "heatmap-radius": 300000000,
                "heatmap-intensity": 1000000,
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
              },
            });
            const heatmapLayer = map.getLayer("foliage-heatmap");
            console.log(heatmapLayer); // 在这里打印 heatmapLayer
          });

          return () => {
            if (map.getLayer("foliage-heatmap")) {
              map.removeLayer("foliage-heatmap");
            }
            if (map.getSource("foliage-heatmap")) {
              map.removeSource("foliage-heatmap");
            }
          };
        });
    }
  }, [map]);

  return null;
};

export default HeatmapLayer;
