import LayOut from "./Components/Layout.js";

const App = () => {
  // const [csvData, setCsvData] = useState([]);

  return (
    <div>
      {/* <CsvReader setCsvData={setCsvData} />
      <MapboxMap csvData={csvData} /> */}
      <LayOut />
    </div>
  );
};

export default App;
