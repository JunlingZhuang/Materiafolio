// 导入 React 及相关组件
import { useMemo, useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import MapboxMap from "./Mapbox.js";
import JsonReader from "./JsonReader.js";
import Cloud from "./WordCloud.js";
import { TrackballControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MaterialList } from "./MaterialList.js";
import TerminalEffect from "./TerminalEffect.js";
import BarChart from "./Barchart.js";
import "../styles/LayOut.css";
import HeatmapLayer from "./HeatmapLayer.js";

// import Danmu from "./Danmu.js";

function LayOut() {
  const [word, setWord] = useState(""); // 在此定义 word 和 setWord
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);

  const handleWordClick = (clickedWord) => {
    // console.log("Clicked word:", clickedWord);
    setWord(clickedWord); // 将点击的词存储在状态中
  };

  const [mapInstance, setMapInstance] = useState(null);
  // console.log(mapInstance);

  const containerRef = useRef();

  // 定义鼠标悬停和离开的事件处理器
  const handleMouseEnter = () => {
    containerRef.current.classList.add("layout-canvas-container-hover");
  };

  const handleMouseLeave = () => {
    containerRef.current.classList.remove("layout-canvas-container-hover");
  };

  const [formattedMaterialHoverList, setMaterialOpacity] = useState([]);
  const [formattedMaterialClickList, setMaterialColor] = useState({});

  function updateCloudMaterialColorandOpacity(newOpacity) {
    setMaterialOpacity(newOpacity);
  }

  function updateCloudMaterialColorClick(newColor) {
    setMaterialColor(newColor);
  }

  const [jsonData, setJsonData] = useState([]);
  const convertedData = useMemo(() => {
    return formattedMaterialHoverList
      .filter((item) => item.ratio > 0.01) // 过滤掉ratio小于0.01的数据点
      .map((item) => {
        return {
          name: item.name,
          value: Number(item.ratio),
          color: item.color,
        };
      });
  }, [formattedMaterialHoverList]);

  const commandList = [
    " Saralee submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic ]",
    " Junling submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [concrete, cork, engineeredstone,fabric,fiberglass]",
    " Neil submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic ]",
    " Zoe submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [glass, carpet,cilingtile,ceramic ]",
    " Ziyu submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [liquid, cork,cilingtile,ceramic ]",
  ];
  // "Junling submitted a new image, submitted at [40.8075° N, 73.9626° W], containing building materials [cardboard, carpet,cilingtile,ceramic,chalkboard, clutter, concrete, cork, engineeredstone,fabric,fiberglass]",

  return (
    <Container fluid className="layout-container">
      {/* 顶部 Row */}
      <Row className="layout-row-top">
        <h1>Materialfolio</h1>
      </Row>
      <Row className="layout-row">
        <Col md={5} lg={5} xl={5} xxl={5} className="layout-col-left">
          <Row>
            <Col md={2} lg={2} xl={2} xxl={2} className="layout-d3-col">
              <Container className="layout-d3-container">
                <BarChart data={convertedData} />
              </Container>
            </Col>
            <Col
              md={10}
              lg={10}
              xl={10}
              xxl={10}
              className="layout-wordcloud-col"
            >
              <Container
                className="layout-canvas-container"
                ref={containerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
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
                    formattedMaterialHoverList={formattedMaterialHoverList}
                    formattedMaterialClickList={formattedMaterialClickList}
                    onWordClick={handleWordClick} // 传递回调函数
                  />
                  <TrackballControls />
                </Canvas>
              </Container>
            </Col>
          </Row>
        </Col>
        <Col md={7} lg={7} xl={7} xxl={7} className="layout-col-right">
          <Container className="layout-map-container">
            <JsonReader setJsonData={setJsonData} />
            <HeatmapLayer
              map={mapInstance}
              selectedWord={word}
              isHeatmapVisible={isHeatmapVisible}
            />
            <MapboxMap
              onMapLoad={setMapInstance}
              jsonData={jsonData}
              updateCloudMaterialColorandOpacity={
                updateCloudMaterialColorandOpacity
              }
              updateCloudMaterialColorClick={updateCloudMaterialColorClick}
              isHeatmapVisible={isHeatmapVisible}
              setIsHeatmapVisible={setIsHeatmapVisible}
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
