import React, { Component } from "react";
import MapboxMap from "./Components/Mapbox.js";
import CsvReader from "./Components/CsvReader.js";

class App extends Component {
  render() {
    return (
      <div className="app">
        <MapboxMap />
        <CsvReader />
      </div>
    );
  }
}

export default App;
