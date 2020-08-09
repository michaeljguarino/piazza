import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Piazza from './Piazza'
import { Grommet } from 'grommet';
import Workspace from './Workspace'
import Login from './Login'
import UserEdit from './users/UserEdit';
import StructuredMessageTester from './tools/StructuredMessageTester'
import { ResetPassword, ChangePassword } from './ResetPassword';
import Directory from './tools/Directory';
import { pdfjs } from 'react-pdf';
// import logo from './logo.svg';
import '../styles/App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function App() {
  return (
    <Workspace>
    {theme => (
      <Grommet theme={theme}>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path='/directory' component={Directory} />
          <Route exact path='/profile' component={UserEdit} />
          <Route exact path='/wk/:workspace' component={Piazza} />
          <Route path='/wk/:workspace/:conversationId' component={Piazza} />
          <Route path="/invite/:inviteToken" component={Login} />
          <Route path="/messageeditor" component={StructuredMessageTester} />
          <Route path='/reset-password/:token' component={ChangePassword} />
          <Route path='/reset-password' component={ResetPassword} />
          <Route path="/" component={Piazza} />
        </Switch>
      </Grommet>
    )}
    </Workspace>
  );
}