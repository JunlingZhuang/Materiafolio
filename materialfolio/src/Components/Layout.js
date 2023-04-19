// 导入 React 及相关组件
import { Container, Row, Col } from "react-bootstrap";
import MapboxMap from "./Mapbox.js";
import CsvReader from "./CsvReader.js";
import React, { useState } from "react";
import Cloud from "./WordCloud.js";
import { Text, TrackballControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MaterialList } from "./MaterialList.js";
import TerminalEffect from "./TerminalEffect.js";
import BarChart from "./Barchart.js";
import "../styles/LayOut.css";

// import Danmu from "./Danmu.js";

function LayOut() {
  const [materialOpacity, setMaterialOpacity] = useState({});

  function updateCloudMaterialOpacity(newOpacity) {
    setMaterialOpacity(newOpacity);
  }
  const [csvData, setCsvData] = useState([]);

  const data = [
    { name: "A", value: 30 },
    { name: "B", value: 50 },
    { name: "C", value: 10 },
    { name: "D", value: 20 },
  ];
  const commandList = [
    " Saralee submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic ]",
    " Junling submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [chalkboard, clutter, concrete, cork, engineeredstone,fabric,fiberglass]",
    " Neil submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic ]",
    " Zoe submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic ]",
  ];
  // "Junling submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic,chalkboard, clutter, concrete, cork, engineeredstone,fabric,fiberglass]",

  return (
    <Container fluid className="layout-container">
      {/* 顶部 Row */}
      <Row className="layout-row-top">
        <h1>Materialfolio</h1>
      </Row>
      <Row className="layout-row">
        <Col md={4} lg={4} xl={4} xxl={4} className="layout-col-left">
          <Container className="layout-d3-container">
            {/* <BarChart data={data} /> */}
          </Container>
          <Container className="layout-canvas-container">
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0, 35], fov: 90 }}
              className="layout-canvas"
            >
              <fog attach="fog" args={["#202025", 0, 80]} />
              <Cloud
                count={8}
                radius={20}
                wordsList={MaterialList}
                materialOpacity={materialOpacity}
              />
              <TrackballControls />
            </Canvas>
          </Container>
        </Col>
        <Col md={8} lg={8} xl={8} xxl={8} className="layout-col-right">
          <Container className="layout-map-container">
            <CsvReader setCsvData={setCsvData} />
            <MapboxMap
              csvData={csvData}
              updateCloudMaterialOpacity={updateCloudMaterialOpacity}
            />
          </Container>
        </Col>
      </Row>

      <Row className="layout-row-bottom">
        <TerminalEffect commandList={commandList} />
      </Row>
    </Container>
  );
}

export default LayOut;