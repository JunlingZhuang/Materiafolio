import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const CsvReader = () => {
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    d3.csv("./Test1.csv").then((data) => {
      setCsvData(data);
      console.log(data);
    });
  }, []);

  return null;
};

export default CsvReader;
