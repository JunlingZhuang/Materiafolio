import { Component } from "react";
import { MaterialList1 } from "./MaterialList1";
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from "!mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

class MarkerLayer extends Component {
  constructor(props) {
    super(props);
    this.markers = [];
  }

  componentDidMount() {
    this.addMarkers();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.jsonData !== this.props.jsonData) {
      this.removeMarkers();
      this.addMarkers();
    }
  }

  componentWillUnmount() {
    this.removeMarkers();
  }

  addMarkers() {
    const jsonData = this.props.jsonData;
    // console.log(jsonData);
    //bool for color mode
    let materialList = MaterialList1.map((material) => material.name);

    if (!jsonData) {
      return;
    }

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
    this.markers = newMarkers;
    // this.setState({ markers: newMarkers });

    // 添加标记的逻辑和代码...
    // 将之前在 MapboxMap 组件中的 addPointsFromJson 代码移至这里
    // 使用 this.markers 数组存储添加的标记
  }

  removeMarkers() {
    // 删除标记的逻辑和代码...
    // 使用 this.markers 数组中的 marker.remove() 方法移除标记
    this.markers.forEach((marker) => {
      marker.remove();
    });
    this.markers = [];
  }

  render() {
    return null; // 这是一个无需渲染任何内容的组件，因为它只负责处理标记的添加和删除
  }
}

export default MarkerLayer;
