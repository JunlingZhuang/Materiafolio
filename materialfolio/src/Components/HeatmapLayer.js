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
            type: "FeatureCollection",
            features: foliageData,
          };
          console.log("处理后的GeoJSON数据：", geoJSONData);

          // console.log(geoJSONData);
          if (map.loaded()) {
            map.addSource("foliage-heatmap", {
              type: "geojson",
              data: geoJSONData,
            });

            map.addLayer({
              id: "foliageheatmap",
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
                "heatmap-radius": 120,
                "heatmap-intensity": 0.8,
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
          }
          return () => {
            if (map.getLayer("foliageheatmap")) {
              map.removeLayer("foliageheatmap");
            }
            if (map.getSource("foliageheatmap")) {
              map.removeSource("foliageheatmap");
            }
          };
        });
    }
  }, [map]);

  return null;
};

export default HeatmapLayer;
