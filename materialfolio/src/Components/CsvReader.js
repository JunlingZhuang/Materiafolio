import React, { useEffect } from "react";
import * as d3 from "d3";

const CsvReader = ({ setCsvData }) => {
  useEffect(() => {
    d3.csv("./Test.csv").then((data) => {
      setCsvData(data);
      console.log(data);
    });
  }, [setCsvData]);

  return null;
};

export default CsvReader;
