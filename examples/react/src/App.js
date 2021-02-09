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
    document.getElementById('randomgraph').innerHTML = 'Graph rendering...'; // Clear the DOM before redrawing
    sciris.rpcs.rpc('showgraph')
        .then(function (response) {
          console.log(response)
          console.log(response.data)
          document.getElementById('randomgraph').innerHTML = ''; // Clear the DOM before redrawing
          mpld3.draw_figure('randomgraph', response.data);
        })
  }

  return (
    <div className="App">
      <header className="App-header">

        <h1>Hello Graph</h1>
        <p>Hi, I am a simple React app!</p>

        <p>The current time is {currentTime}, showing that vanilla fetch() still works.</p>

        <div id="app">
          <button onClick={getDots}>Get new dots</button>
          <div id="randomgraph"></div>
        </div>
      </header>
    </div>
  );
}

export default App;