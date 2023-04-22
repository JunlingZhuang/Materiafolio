import React, { Component, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/Mapbox.css";
import { MaterialList1 } from "./MaterialList1";

// import HeatmapLayer from './HeatmapLayer'; // 导入 HeatmapLayer 组件

class MapboxMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -73.9626,
      lat: 40.8075,
      zoom: 16,
      // doubleClickZoom: false, // 禁用双击放大功能
      markers: [],
      isMapClickEnabled: true, // 添加这个状态变量
      modeText: "Mode: Upload", // 设置初始值
      isMaterialColor: false, // 添加这个状态变量
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
      attributionControl: false, // 移除版权信息
    });
    this.map.on("zoom", this.handleMapZoom);

    this.map.on("click", this.handleMapClick);
    this.map.on("load", () => {
      this.addPointsFromJson(this.props.jsonData);
    });
  }
  //check if Json props update
  componentDidUpdate(prevProps) {
    if (prevProps.jsonData !== this.props.jsonData) {
      this.addPointsFromJson(this.props.jsonData);
    }
  }

  addPointsFromJson = (jsonData) => {
    //bool for color mode

    let materialList = MaterialList1.map((material) => material.name);
    // console.log(materialList);
    // console.log(materialList.includes("none"));
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

        const el = document.createElement("div");
        el.className = "custom-marker";

        // 从 SVI_ID 获取图像路径
        const imagePath1 = `./SVI_Images/${sviId}.jpg`; // 请根据实际情况修改路径
        const imagePath2 = `./Segemented_Images/${sviId}.png`;
        // 初始状态为第一张图片

        let currentImagePath = imagePath1;
        const img = new Image();

        el.addEventListener("click", () => {
          // 切换图片路径
          currentImagePath =
            currentImagePath === imagePath1 ? imagePath2 : imagePath1;
          // console.log(currentImagePath);
          img.src = currentImagePath;

          //切换颜色
          this.setState(
            (prevState) => {
              // console.log(
              //   "Previous isMaterialColor:",
              //   prevState.isMaterialColor
              // );
              return { isMaterialColor: !prevState.isMaterialColor };
            },
            () => {
              // 将处理颜色切换的代码放入此回调函数中
              // console.log("after isMaterialColor:", this.state.isMaterialColor);

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
          img.style.backgroundColor = "transparent"; // 添加这一行
          const customPopupStyle = `
          background-color: black;
          border: 1px solid white;
          border-radius: 4px;
          padding: 5px;
          box-sizing: border-box;
        `;
          const popup = new mapboxgl.Popup({
            offset: 25,
            className: "custom-popup",
          }).setDOMContent(img);

          marker.setPopup(popup);
          marker.togglePopup();

          const formattedMaterialHoverList = [];
          let maxMaterialName = "";
          let maxValue = -Infinity;
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
          // console.log(formattedMaterialHoverList);
          // 从图库中根据最大值材料的名字获取对应的图片
          const imagePath_material = `./Material_images/${maxMaterialName}.jpg`;
          // 将获取到的图片设置为 marker 的背景图
          el.style.backgroundImage = `url(${imagePath_material})`;
          el.style.backgroundSize = "cover";

          //hover function
          el.classList.add("custom-marker-hover");
          // console.log(el);

          // 更新词云组件的透明度
          console.log(formattedMaterialHoverList);

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
                color: "white",
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
          // console.log(formattedMaterialClickList);
          this.props.updateCloudMaterialColorandOpacity(
            formattedMaterialHoverList
          );
          this.props.updateCloudMaterialColorClick(formattedMaterialClickList);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(this.map);

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

  // handleColorToggle = () => {
  //   this.setState((prevState) => ({
  //     isMaterialColor: !prevState.isMaterialColor,
  //   }));
  // };
  handleMapClick = async (e) => {
    // console.log(this.state.isMapClickEnabled);
    if (!this.state.isMapClickEnabled) {
      return; // 如果点击事件被禁用，直接返回
    }

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
    const { mapLoaded } = this.state;
    return (
      <div ref={(el) => (this.mapContainer = el)} className="mapContainer">
        <button className="mapbox-button" onClick={this.handleButtonClick}>
          {this.state.modeText}
        </button>
      </div>
    );
  }
}

export default MapboxMap;
