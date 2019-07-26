import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'

// import logo from './logo.svg';
import '../styles/App.css';
import Login from './Login'

function App() {
  return (
    <div className="center w85">
      <div className="ph3 pv1 background-gray">
        <Switch>
          <Route exact path="/" component={Piazza} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
