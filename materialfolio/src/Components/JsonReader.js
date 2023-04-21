import React, { useEffect } from "react";
import * as d3 from "d3";

const JsonReader = ({ setJsonData }) => {
  useEffect(() => {
    d3.json("./CSV/Columbia_SVIpoints_4326_output.json").then((data) => {
      setJsonData(data);
      // console.log(data);
    });
  }, [setJsonData]);

  return null;
};

export default JsonReader;
