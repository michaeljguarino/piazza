import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';
import Theme from './Theme'
import Login from './Login'
import StructuredMessageTester from './tools/StructuredMessageTester'
import { ResetPassword, ChangePassword } from './ResetPassword';
import Directory from './tools/Directory';

// import logo from './logo.svg';
import '../styles/App.css';


export default function App() {
  return (
    <Theme>
    {theme => (
      <Grommet theme={theme}>
        <Switch>
          <Route exact path="/" component={Piazza} />
          <Route exact path="/login" component={Login} />
          <Route exact path='/directory' component={Directory} />
          <Route path='/conv/:conversationId' component={Piazza} />
          <Route path="/invite/:inviteToken" component={Login} />
          <Route path="/messageeditor" component={StructuredMessageTester} />
          <Route path='/reset-password/:token' component={ChangePassword} />
          <Route path='/reset-password' component={ResetPassword} />
        </Switch>
      </Grommet>
    )}
    </Theme>
  );
}