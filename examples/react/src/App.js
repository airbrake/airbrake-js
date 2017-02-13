import React from 'react';
import Component from './airbrake';
import logo from './logo.svg';
import './App.css';


class App extends Component {
  unsafeRender() {
    if (true) {
      throw new Error('hello from React');
    }
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
