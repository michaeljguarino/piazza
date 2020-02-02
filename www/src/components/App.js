import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';
import Theme from './Theme'

// import logo from './logo.svg';
import '../styles/App.css';
import Login from './Login'
import StructuredMessageTester from './tools/StructuredMessageTester'
import { ResetPassword } from './ResetPassword';


export default function App() {
  return (
    <Theme>
    {theme => (
      <Grommet theme={theme}>
        <Switch>
          <Route exact path="/" component={Piazza} />
          <Route exact path="/login" component={Login} />
          <Route path="/invite/:inviteToken" component={Login} />
          <Route path="/messageeditor" component={StructuredMessageTester} />
          <Route path='/reset-password' component={ResetPassword} />
        </Switch>
      </Grommet>
    )}
    </Theme>
  );
}