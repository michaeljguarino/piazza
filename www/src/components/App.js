import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';

// import logo from './logo.svg';
import '../styles/App.css';
import Login from './Login'

const theme = {
  anchor: {
    hover: {
      textDecoration: 'none',
      extend: 'font-weight: 600'
    },
    fontWeight: 400,
  },
  global: {
    colors: {
      brand: '#2F415B',
      'accent-1': '#CF6D57',
      focus: '#CF6D57'
    },
    drop: {
      border: {
        radius: '2px'
      }
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
