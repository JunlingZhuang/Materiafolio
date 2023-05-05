import { useEffect, useState, useRef, useCallback } from "react";

const HeatmapLayer = ({ map, selectedWord, isHeatmapVisible }) => {
  const [rawData, setRawData] = useState([]);
  const prevSelectedWordRef = useRef();

  useEffect(() => {
    if (map) {
      fetch("./CSV/Columbia_SVIpoints_4326_output.json")
        .then((response) => response.json())
        .then((data) => {
          setRawData(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [map]);

  console.log(isHeatmapVisible);

  const createSelectedData = useCallback(() => {
    return rawData.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(item.x), parseFloat(item.y)],
      },
      properties: {
        [selectedWord]: parseFloat(item[selectedWord]),
      },
    }));
  }, [rawData, selectedWord]);

  const addHeatmapLayer = useCallback(
    (geoJSONData) => {
      map.addSource("selected-heatmap", {
        type: "geojson",
        data: geoJSONData,
      });

      map.addLayer({
        id: "selectedwordheatmap",
        type: "heatmap",
        source: "selected-heatmap",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", selectedWord],
            0,
            ["get", selectedWord],
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
        layout: {
          visibility: isHeatmapVisible ? "visible" : "none", // 根据父组件传递的 isHeatmapVisible 状态确定热力图的可见性
        },
      });
    },
    [map, selectedWord]
  );

  useEffect(() => {
    if (
      map &&
      rawData.length > 0 &&
      selectedWord !== prevSelectedWordRef.current
    ) {
      if (map.getLayer("selectedwordheatmap")) {
        map.removeLayer("selectedwordheatmap");
        console.log("remove Layer");
      }
      if (map.getSource("selected-heatmap")) {
        map.removeSource("selected-heatmap");
        console.log("remove Source");
      }
      prevSelectedWordRef.current = selectedWord;

      const selectedData = createSelectedData();

      const geoJSONData = {
        type: "FeatureCollection",
        features: selectedData,
      };

      addHeatmapLayer(geoJSONData);
    }

    return () => {
      if (map && map.getLayer("selectedwordheatmap")) {
        map.removeLayer("selectedwordheatmap");
        console.log("remove Layer");
      }
      if (map && map.getSource("selected-heatmap")) {
        map.removeSource("selected-heatmap");
        console.log("remove Source");
      }
    };
  }, [map, selectedWord, rawData, addHeatmapLayer, createSelectedData]);

  return null;
};

export default HeatmapLayer;
