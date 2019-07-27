import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';

// import logo from './logo.svg';
import '../styles/App.css';
import Login from './Login'

const theme = {
  global: {
    colors: {
      brand: '#3b5998'
    },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
};

function App() {
  return (
    <Grommet theme={theme} false>
      <Switch>
        <Route exact path="/" component={Piazza} />
        <Route exact path="/login" component={Login} />
      </Switch>
    </Grommet>
  );
}

export default App;
