import * as THREE from "three";
import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { MaterialList1 } from "./MaterialList1";
// import randomWord from "random-words";

function Word({ children, opacity, wordColor, ...props }) {
  // 添加一个新的状态：currentColor
  const [currentColor, setCurrentColor] = useState("white");
  // console.log(wordColor);
  // console.log(children);
  const color = new THREE.Color();
  // console.log(wordColor);
  const fontProps = {
    // font: "/Inter-Bold.woff",
    fontSize: 2.5,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const over = (e) => (e.stopPropagation(), setHovered(true));
  const out = () => setHovered(false);
  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "auto";
    }
    setCurrentColor(wordColor || "white");
  }, [wordColor, hovered]);
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion);

    // 假设我们有一个名为 targetOpacity 的目标透明度变量
    // let targetOpacity = hovered ? 1 : opacity === 0 ? 0.3 : 1;
    let targetOpacity;
    if (hovered) {
      targetOpacity = 1;
    } else if (opacity == true) {
      targetOpacity = 0.05;
    } else {
      targetOpacity = 1;
    }

    // let targetOpacity = 1;

    // 使用 THREE.MathUtils.lerp 方法进行插值
    ref.current.material.opacity = THREE.MathUtils.lerp(
      ref.current.material.opacity,
      targetOpacity,
      0.08
    );

    // Animate font color
    ref.current.material.color.lerp(
      color.set(hovered ? "red" : currentColor),
      0.2
    );
  });
  return (
    <Text
      ref={ref}
      onPointerOver={over}
      onPointerOut={out}
      onClick={() => console.log("clicked")}
      {...props}
      {...fontProps}
      children={children}
    />
  );
}
// 在 Cloud 组件中添加 wordsList 属性
export default function Cloud({
  count = 4,
  radius = 20,
  wordsList,
  formattedMaterialHoverList,
  formattedMaterialClickList,
}) {
  function getRatioByName(word, Listname, datatype) {
    for (const key in Listname) {
      if (Listname[key].name === word) {
        return Listname[key][datatype];
      }
    }
  }
  // 使用 useMemo 计算 words
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    const phiSpan = Math.PI / (count + 1);
    const thetaSpan = (Math.PI * 2) / count;
    let k = 0; // 添加一个计数变量

    // 添加缩放因子
    const scaleX = 1;
    const scaleY = 1; // 调整 Y 轴缩放因子以改变椭圆体的高度
    const scaleZ = 1;

    for (let i = 1; i < count + 1; i++)
      for (let j = 0; j < count; j++) {
        const pos = new THREE.Vector3().setFromSpherical(
          spherical.set(radius, phiSpan * i, thetaSpan * j)
        );
        // 应用缩放因子
        pos.x *= scaleX;
        pos.y *= scaleY;
        pos.z *= scaleZ;

        temp.push([pos, wordsList[k]]); // 使用 wordsList 替换随机词汇
        k++; // 更新计数变量
      }
    return temp;
  }, [count, radius, wordsList]);

  // 其他代码保持不变
  return words.map(([pos, word], index) => (
    <Word
      key={index}
      position={pos}
      children={word}
      opacity={getRatioByName(word, formattedMaterialHoverList, "hide")}
      wordColor={
        getRatioByName(word, formattedMaterialClickList, "ratio") > 0.01
          ? getRatioByName(word, formattedMaterialClickList, "color")
          : "grey"
      }
    />
  ));
}
