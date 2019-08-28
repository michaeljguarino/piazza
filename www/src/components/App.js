import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';
import {SearchInput} from './utils/SelectSearchInput'

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
  button: {
    padding: {
      horizontal: '6px',
      vertical: '2px'
    }
  },
  select: {
    searchInput: SearchInput
  },
  textInput: {
    extend: {
      fontWeight: 400
    }
  },
  layer: {
    zIndex: 25
  },
  global: {
    colors: {
      brand: '#2F415B',
      'accent-1': '#CF6D57',
      focus: '#CF6D57',
      'brand-heavy': '#263449',
      'brand-light': '#6d7a8c',
      'brand-medium': '#59677c',
      'highlight': '#cdd7e5',
      'highlight-dark': '#a4acb7',
      notif: '#EB4D5C',
      'light-hover': '#EDEDED'
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
        <Route path="/invite/:inviteToken" component={Login} />
      </Switch>
    </Grommet>
  );
}

export default App;
