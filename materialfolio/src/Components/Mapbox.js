import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/Mapbox.css";

class MapboxMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -74.006,
      lat: 40.7128,
      zoom: 12,
      markers: [],
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
      this.addPointsFromCsv(this.props.csvData);
    });
  }
  //check if csv props update
  componentDidUpdate(prevProps) {
    if (prevProps.csvData !== this.props.csvData) {
      this.addPointsFromCsv(this.props.csvData);
    }
  }

  addPointsFromCsv = (csvData) => {
    const { markers } = this.state;

    markers.forEach((marker) => {
      marker.remove();
    });

    const newMarkers = csvData
      .map((row) => {
        const lat = parseFloat(row.y);
        const lng = parseFloat(row.x);

        // console.log("Row data:", row);
        // console.log("Parsed lat, lng:", lat, lng);

        if (isNaN(lat) || isNaN(lng)) {
          // 如果经纬度值无效，则跳过该点
          console.warn("Invalid LngLat:", lat, lng);
          return null;
        }
        const el = document.createElement("div");
        el.className = "custom-marker";

        // 鼠标悬停事件监听器
        el.addEventListener("mouseenter", () => {
          el.classList.add("custom-marker-hover");
        });

        el.addEventListener("mouseleave", () => {
          el.classList.remove("custom-marker-hover");
        });

        return new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(this.map);
      })
      .filter((marker) => marker !== null); // 过滤掉无效的标记
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

        // 发送图片到后端并接收裁剪后的图片
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });

        // 用裁剪后的图片替换原图片
        if (response.ok) {
          const blob = await response.blob();
          const croppedImageUrl = URL.createObjectURL(blob);
          img.src = croppedImageUrl;
        } else {
          console.error("Failed to get cropped image from server.");
        }

        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(img);

        const marker = new mapboxgl.Marker({
          color: "#FFFFFF",
          draggable: true,
        })
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

  render() {
    const { mapLoaded } = this.state;

    return (
      <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
    );
  }
}

export default MapboxMap;
