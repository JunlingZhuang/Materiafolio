import React, { useState, useEffect, useRef } from "react";
import "../styles/TerminalEffect.css";

const TerminalEffect = ({ commandList }) => {
  const [currentText, setCurrentText] = useState("");
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    let currentCommandIndex = 0;
    let currentCharIndex = 0;

    let timeoutId;
    const typeWriter = () => {
      if (currentCommandIndex < commandList.length) {
        const command = commandList[currentCommandIndex];
        if (currentCharIndex < command.length) {
          setCurrentText(
            (prevText) => prevText + command.charAt(currentCharIndex)
          );
          currentCharIndex++;
          timeoutId = setTimeout(typeWriter, 10);
        } else {
          currentCommandIndex++;
          setCurrentText((prevText) => prevText + " \n");
          currentCharIndex = 0;
          timeoutId = setTimeout(typeWriter, 100);
        }
      } else {
        // 当显示完commandList中所有内容时，将索引重置为0，重新开始循环
        currentCommandIndex = 0;
        typeWriter();
      }
    };

    typeWriter();
    console.log("start typewriter");
    return () => {
      console.log("stop typewriter");
      clearTimeout(timeoutId);
    };
  }, [commandList]);

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop =
        terminalContainerRef.current.scrollHeight; // 自动滚动到底部
    }
  }, [currentText]);

  return (
    <div className="terminal-effect" ref={terminalContainerRef}>
      <pre>{currentText}</pre>
    </div>
  );
};

export default TerminalEffect;
