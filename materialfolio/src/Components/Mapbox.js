import React, { Component } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from "!mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/Mapbox.css";
import { MaterialList1 } from "./MaterialList1";

class MapboxMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -73.9626,
      lat: 40.8075,
      zoom: 16,
      // doubleClickZoom: false, // 禁用双击放大功能
      markers: [],
      isMapClickEnabled: false, // 添加这个状态变量
      modeText: "Mode: View", // 设置初始值
      isMaterialColor: false, // 添加这个状态变量
      lines: [], //add Line layer
      // isHeatmapVisible: false,
    };
  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;

    mapboxgl.accessToken =
      "pk.eyJ1IjoianVubGluZ3podWFuZzA2MTIiLCJhIjoiY2w2ZWM0bWJ2MDB6aTNubXhsdG8zZTJ3dSJ9.Eeqn1X7BTGldAw2_yNGbsw";

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/junlingzhuang0612/cl6faj43y001315qk9lz1aa65",
      center: [lng, lat],
      zoom: zoom,
      pitch: 0, // 设置 pitch 属性为 0，即 2D 模式
      attributionControl: false,
    });

    this.map.on("zoom", this.handleMapZoom);

    this.map.on("click", this.handleMapClick);
    this.map.on("load", () => {
      this.props.onMapLoad(this.map);
      this.addPointsFromJson(this.props.jsonData);
      this.setState({ isHeatmapVisible: false });
    });
  }
  toggleHeatmapVisibility = async () => {
    const { isHeatmapVisible, setIsHeatmapVisible } = this.props;
    await setIsHeatmapVisible(!isHeatmapVisible);
    console.log(isHeatmapVisible);
    const heatmapLayerId = "selectedwordheatmap";
    const visibility = this.props.isHeatmapVisible ? "visible" : "none";
    this.map.setLayoutProperty(heatmapLayerId, "visibility", visibility);
  };

  //check if Json props update
  componentDidUpdate(prevProps) {
    if (prevProps.jsonData !== this.props.jsonData) {
      this.addPointsFromJson(this.props.jsonData);
    }
  }

  addPointsFromJson = (jsonData) => {
    //bool for color mode
    let materialList = MaterialList1.map((material) => material.name);

    const { markers } = this.state;

    markers.forEach((marker) => {
      marker.remove();
    });

    const newMarkers = jsonData
      .map((row) => {
        // console.log(row);
        const lat = parseFloat(row.y);
        const lng = parseFloat(row.x);
        const sviId = row.SVI_ID;
        // console.log(sviId);

        if (isNaN(lat) || isNaN(lng)) {
          // console.warn("Invalid LngLat:", lat, lng);
          return null;
        }
        // 计算出当前数据对象中最大的材料比例所对应的材料名称
        let maxMaterialName = "";
        let maxValue = -Infinity;
        for (const material in row) {
          if (materialList.includes(material)) {
            if (row[material] > maxValue) {
              maxValue = row[material];
              maxMaterialName = material;
            }
          }
        }
        // console.log(maxMaterialName);

        const el = document.createElement("div");
        el.className = "custom-marker";

        // 从 SVI_ID 获取图像路径
        const imagePath1 = `./SVI_Images/${sviId}.jpg`;
        const imagePath2 = `./Segemented_Images/${sviId}.png`;
        // 初始状态为第一张图片

        let currentImagePath = imagePath1;
        const img = new Image();

        el.addEventListener("click", () => {
          function getColorByDistance(
            distance,
            minDistance,
            maxDistance,
            baseColor
          ) {
            const ratio =
              (distance - minDistance) / (maxDistance - minDistance);

            // 将 baseColor（格式为 "rgb(r, g, b)"）转换为一个包含 r、g、b 数值的数组
            const colorArray = baseColor
              .substring(4, baseColor.length - 1)
              .split(", ")
              .map((value) => parseInt(value));

            // 使用线性插值方法生成渐变颜色
            const r = Math.round(colorArray[0] + (255 - colorArray[0]) * ratio);
            const g = Math.round(colorArray[1] + (255 - colorArray[1]) * ratio);
            const b = Math.round(colorArray[2] + (255 - colorArray[2]) * ratio);

            return `rgb(${r},${g},${b})`;
          }

          function getDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // 地球半径，单位：千米
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // 距离，单位：千米
            return d * 1000; // 距离，单位：米
          }

          this.setState((prevState) => ({
            toggleLines: !prevState.toggleLines,
          }));
          // 删除先前创建的连线
          this.state.lines.forEach((line) => {
            console.log(line.id);
            if (this.map.getLayer(line.id)) {
              this.map.removeLayer(line.id);
              this.map.removeSource(line.id);
            }
          });
          // 获取当前marker
          const clickedMarker = marker;
          const clickedLngLat = [
            parseFloat(clickedMarker.relatedData.x),
            parseFloat(clickedMarker.relatedData.y),
          ];

          // 找到具有相同最高比例材料的其他 marker
          const relatedMarkers = this.state.markers.filter((m) => {
            return m.maxMaterial === maxMaterialName;
          });
          // });
          if (this.state.toggleLines) {
            relatedMarkers.forEach((marker) => {
              const relatedData = marker.relatedData;

              const relatedLngLat = [
                parseFloat(relatedData.x),
                parseFloat(relatedData.y),
              ];
              // 计算距离
              const distance = getDistance(
                clickedLngLat[1],
                clickedLngLat[0],
                relatedLngLat[1],
                relatedLngLat[0]
              );

              // 获取最小和最大距离（可根据实际需求进行调整）
              const minDistance = 0;
              const maxDistance = 5000;

              // 根据 maxMaterialName 查找对应的颜色
              const baseColor = MaterialList1.find(
                (m) => m.name === maxMaterialName
              ).color;

              // 根据距离生成渐变颜色
              const lineColor = getColorByDistance(
                distance,
                minDistance,
                maxDistance,
                baseColor
              );
              const lineCoordinates = [clickedLngLat, relatedLngLat];

              const newLine = {
                id: `line-${clickedMarker._pos.x}-${clickedMarker._pos.y}-${marker._pos.x}-${marker._pos.y}`,

                type: "line",
                source: {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: lineCoordinates,
                    },
                  },
                },
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": lineColor,
                  "line-width": 0.5,
                },
              };
              if (!this.map.getLayer(newLine.id)) {
                this.map.addLayer(newLine);
                this.setState((prevState) => ({
                  lines: [...prevState.lines, newLine],
                }));
              }
            });
          }
          // 切换图片路径
          currentImagePath =
            currentImagePath === imagePath1 ? imagePath2 : imagePath1;
          // console.log(currentImagePath);
          img.src = currentImagePath;

          //切换颜色
          this.setState(
            (prevState) => {
              return { isMaterialColor: !prevState.isMaterialColor };
            },
            () => {
              const formattedMaterialClickList = [];

              for (const material in row) {
                if (materialList.includes(material)) {
                  const materialColor = this.state.isMaterialColor
                    ? MaterialList1.find((m) => m.name === material).color
                    : "white";
                  formattedMaterialClickList.push({
                    name: material,
                    ratio: row[material],
                    color: materialColor,
                  });
                }
              }
              this.props.updateCloudMaterialColorClick(
                formattedMaterialClickList
              );
            }
          );
        });

        el.addEventListener("mouseenter", () => {
          img.src = currentImagePath;
          img.style.width = "200px";
          img.style.backgroundColor = "transparent";
          const popup = new mapboxgl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setDOMContent(img);

          marker.setPopup(popup);
          marker.togglePopup();

          const formattedMaterialHoverList = [];

          for (const material in row) {
            const ifHide = row[material] < 0.01;
            if (materialList.includes(material)) {
              const materialColor = MaterialList1.find(
                (m) => m.name === material
              ).color;
              formattedMaterialHoverList.push({
                name: material,
                ratio: row[material],
                color: materialColor,
                hide: ifHide,
              });

              if (row[material] > 0.01 && row[material] > maxValue) {
                maxValue = row[material];
                maxMaterialName = material;
              }
            }
          }
          // 从图库中根据最大值材料的名字获取对应的图片
          const imagePath_material = `./Material_images/${maxMaterialName}.jpg`;
          // 将获取到的图片设置为 marker 的背景图
          el.style.backgroundImage = `url(${imagePath_material})`;
          el.style.backgroundSize = "cover";

          //hover function
          el.classList.add("custom-marker-hover");

          this.props.updateCloudMaterialColorandOpacity(
            formattedMaterialHoverList
          );
        });

        el.addEventListener("mouseleave", () => {
          this.setState({ isMaterialColor: false });
          currentImagePath = imagePath1;
          img.src = currentImagePath;
          el.style.opacity = 0.5;

          el.classList.remove("custom-marker-hover");
          marker.togglePopup();

          const formattedMaterialClickList = [];

          for (const material in row) {
            if (materialList.includes(material)) {
              const materialColor = this.state.isMaterialColor
                ? MaterialList1.find((m) => m.name === material).color
                : "white";
              formattedMaterialClickList.push({
                name: material,
                ratio: row[material],
                color: materialColor,
              });
            }
          }

          const formattedMaterialHoverList = [];

          for (const material in row) {
            if (materialList.includes(material)) {
              const materialColor = MaterialList1.find(
                (m) => m.name === material
              ).color;
              formattedMaterialHoverList.push({
                name: material,
                ratio: row[material],
                color: materialColor,
                hide: false,
              });
            }
          }
          this.props.updateCloudMaterialColorandOpacity(
            formattedMaterialHoverList
          );
          this.props.updateCloudMaterialColorClick(formattedMaterialClickList);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(this.map);

        // 为 marker 添加额外的属性，存储相关数据
        marker.relatedData = row;
        marker.maxMaterial = maxMaterialName; // 添加 maxMaterial 属性

        return marker;
      })
      .filter((marker) => marker !== null);

    this.setState({ markers: newMarkers });
  };

  componentWillUnmount() {
    this.map.off("zoom", this.handleMapZoom);
    this.state.markers.forEach((marker) => {
      marker.remove();
    });

    this.map.off("click", this.handleMapClick);
    this.map.remove();
  }
  handleMapZoom = () => {
    const zoom = this.map.getZoom();
    const markers = this.state.markers;
    markers.forEach((marker) => {
      const markerElement = marker.getElement();
      const newSize = Math.max(2, 2 * Math.pow(1.8, zoom - 12));
      markerElement.style.width = `${newSize}px`;
      markerElement.style.height = `${newSize}px`;
    });
  };

  handleMapClick = async (e) => {
    // console.log(this.state.isMapClickEnabled);
    if (!this.state.isMapClickEnabled) {
      return; // 如果点击事件被禁用，直接返回
    }
    console.log(e.lngLat);
    const { lng, lat } = e.lngLat;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const img = new Image();
        img.src = reader.result;
        img.style.width = "200px";

        // Send images to the backend and receive the cropped images
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });

        // Replace the original image with the cropped image
        if (response.ok) {
          const blob = await response.blob();
          const croppedImageUrl = URL.createObjectURL(blob);
          img.src = croppedImageUrl;
        } else {
          // console.error("Failed to get cropped image from server.");
        }

        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(img);
        const el = document.createElement("div");
        el.className = "custom-marker"; // 使用自定义样式
        const marker = new mapboxgl.Marker({ element: el, draggable: false }) // 使用自定义元素
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(this.map);

        marker.getElement().addEventListener("mouseenter", () => {
          marker.togglePopup();
        });

        marker.getElement().addEventListener("mouseleave", () => {
          marker.togglePopup();
        });

        this.setState((prevState) => ({
          markers: [...prevState.markers, marker],
        }));
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };
  handleButtonClick = () => {
    const newModeText = this.state.isMapClickEnabled
      ? "Mode: View"
      : "Mode: Upload";
    this.setState((prevState) => ({
      isMapClickEnabled: !prevState.isMapClickEnabled,
      modeText: newModeText, // 新增 modeText 状态变量
    }));
  };

  render() {
    const { isHeatmapVisible } = this.props;
    console.log(isHeatmapVisible);

    return (
      <div ref={(el) => (this.mapContainer = el)} className="mapContainer">
        <button className="mapbox-button" onClick={this.handleButtonClick}>
          {this.state.modeText}
        </button>
        <button
          className="heatmap-button "
          onClick={this.toggleHeatmapVisibility}
        >
          {isHeatmapVisible ? "Hide Heatmap" : "Show Heatmap"}
        </button>
      </div>
    );
  }
}

export default MapboxMap;
