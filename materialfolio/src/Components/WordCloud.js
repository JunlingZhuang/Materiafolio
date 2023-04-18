import * as THREE from "three";
import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
// import randomWord from "random-words";

function Word({ children, opacity = 1, ...props }) {
  const color = new THREE.Color();
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
    if (hovered) document.body.style.cursor = "pointer";
    return () => (document.body.style.cursor = "auto");
  }, [hovered]);
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion);
    // Animate font color
    ref.current.material.color.lerp(
      color.set(hovered ? "#fa2720" : "white"),
      0.1
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
export default function Cloud({ count = 4, radius = 20, wordsList }) {
  // 使用 useMemo 计算 words
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    const phiSpan = Math.PI / (count + 1);
    const thetaSpan = (Math.PI * 2) / count;
    let k = 0; // 添加一个计数变量
    for (let i = 1; i < count + 1; i++)
      for (let j = 0; j < count; j++) {
        temp.push([
          new THREE.Vector3().setFromSpherical(
            spherical.set(radius, phiSpan * i, thetaSpan * j)
          ),
          wordsList[k], // 使用 wordsList 替换随机词汇
        ]);
        k++; // 更新计数变量
      }
    return temp;
  }, [count, radius, wordsList]);

  // 其他代码保持不变
  return words.map(([pos, word], index) => (
    <Word key={index} position={pos} children={word} />
  ));
}
