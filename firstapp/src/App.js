import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  componentDidMount() {
    axios.get('http://127.0.0.1:5000/api/data')
    // axios.get('http://localhost:5000/api/data')
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  render() {
    return (
      <div className="App">
        {/* Your app components here */}
      </div>
    );
  }
}

export default App;
