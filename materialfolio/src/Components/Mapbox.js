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
    });

    this.map.on("click", this.handleMapClick);
  }

  componentWillUnmount() {
    this.state.markers.forEach((marker) => {
      marker.remove();
    });

    this.map.off("click", this.handleMapClick);
    this.map.remove();
  }

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

        const marker = new mapboxgl.Marker()
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
    return (
      <div ref={(el) => (this.mapContainer = el)} className="mapContainer" />
    );
  }
}

export default MapboxMap;
