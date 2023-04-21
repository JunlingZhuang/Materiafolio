import * as THREE from "three";
import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
// import randomWord from "random-words";

function Word({ children, wordcolor, ...props }) {
  // console.log(children);
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

    // 假设我们有一个名为 targetOpacity 的目标透明度变量
    let targetOpacity = hovered ? 1 : wordcolor === "black" ? 0.3 : 1;

    // 使用 THREE.MathUtils.lerp 方法进行插值
    ref.current.material.opacity = THREE.MathUtils.lerp(
      ref.current.material.opacity,
      targetOpacity,
      0.08
    );

    // Animate font color
    ref.current.material.color.lerp(
      // color.set(hovered ? "#fa2720" : materialOpacity[children] || "white"),
      // 0.1
      // color.set(hovered ? wordcolor : "white"),
      // 0.1
      color.set(hovered ? "red" : wordcolor),
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
  materialOpacity,
}) {
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
      wordcolor={materialOpacity[word] || "white"}
    />
  ));
}
