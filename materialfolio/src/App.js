import React, { Component } from "react";
import MapboxMap from "./Components/Mapbox.js";

class App extends Component {
  render() {
    return (
      <div className="app">
        <MapboxMap />
      </div>
    );
  }
}

export default App;
