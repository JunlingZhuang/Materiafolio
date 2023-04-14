import React, { useState, useEffect } from "react";
import "../styles/Danmu.css";

function Danmu() {
  const [messages, setMessages] = useState([
    "111111111",
    "222222222",
    "3333333",
  ]);

  useEffect(() => {
    const container = document.getElementById("danmu-container");

    // 创建一个新的弹幕元素
    const messageElement = document.createElement("div");
    messageElement.classList.add("danmu-message");

    // 将数组中的第一个元素弹出，然后将其设置为弹幕内容
    const message = messages.shift();
    messageElement.textContent = message;

    // 将新的弹幕元素添加到容器中
    container.appendChild(messageElement);

    // 将弹幕内容添加到数组的末尾，以实现弹幕内容的循环播放
    setMessages([...messages, message]);

    // 设置定时器，5 秒后删除弹幕元素
    setTimeout(() => {
      container.removeChild(messageElement);
    }, 5000);
  }, [messages]);

  return <div id="danmu-container" className="danmu-container"></div>;
}

export default Danmu;
