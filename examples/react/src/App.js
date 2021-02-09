import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import d3 from "d3"
import mpld3 from "mpld3"
import sciris from "sciris-js"

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [graphData, setGraphData] = useState({});

  useEffect(() => {
    fetch('/api/get_time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  function getDots() {
    document.getElementById('randomgraph').innerHTML = 'hi'; // Clear the DOM before redrawing
    // fetch('/showgraph')
        // .then(res => res.json()).then(data => {
        //   setGraphData(data);
        // });
    sciris.rpcs.rpc('showgraph')
    // // axios.post('http://localhost:8080/api/showgraph') // Use a POST request to pass along the value.
        .then(function (response) {
          console.log(response)
          console.log(response.data)
          document.getElementById('randomgraph').innerHTML = 'hi2'; // Clear the DOM before redrawing
          mpld3.draw_figure('randomgraph', response.data);
        })
  }

  return (
    <div className="App">
      <header className="App-header">

        ... Hi, I am version 1 ...

        <p>The current time is {currentTime}.</p>

        <div id="app">
          <h1>Hello, graph!</h1>
          <button onClick={getDots}>Get new dots</button>
          <div id="randomgraph"></div>
        </div>
      </header>
    </div>
  );
}

export default App;