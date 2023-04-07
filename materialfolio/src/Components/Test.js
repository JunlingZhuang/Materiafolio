import React, { useEffect, useState } from "react";
import csvParse from "csv-parse";

const Test = () => {
  const [parsedData, setParsedData] = useState([]);

  useEffect(() => {
    const csvData = `id,x,y
    1,11,23
    2,21,43
    3,31,53
    4,41,63`;

    csvParse(csvData, { columns: true }, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        setParsedData(data);
        console.log(data);
      }
    });
  }, []);

  return null;
};
export default Test;
