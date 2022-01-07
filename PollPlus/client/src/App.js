import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import NavBar from './Components/Navbar';
import PrivateRoute from './hoc/PrivateRoute';
import UnPrivateRoute from './hoc/UnPrivateRoute';
import Home from './Components/Home';
import Register from './Components/Register';
import MyPolls from './Components/MyPolls';
import MyPoll from './Components/MyPoll';
import Votes from './Components/Votes';
import Vote from './Components/Vote';
import Admin from './Components/Admin';
import CreateSurveySwitcher from './Components/CreateSurveySwitcher';
import CreateSurveySuccess from './Components/CreateSurveySuccess';

function App() {
  return (
    <Router>
      <NavBar/>
      <Route exact path='/' component={Home}/>
      <UnPrivateRoute path='/register' component={Register}/>
      <PrivateRoute path='/createPoll/:id' roles={['user', 'admin']} component={CreateSurveySuccess}/>
      <PrivateRoute exact path='/createPoll' roles={['user', 'admin']} component={CreateSurveySwitcher}/>
      <PrivateRoute path='/polls' roles={['user', 'admin']} component={MyPolls}/>
      <PrivateRoute exact path='/poll/:id' roles={['user', 'admin']} component={MyPoll}/>
      <PrivateRoute exact path='/votes' roles={['user', 'admin']} component={Votes}/>
      <PrivateRoute exact path='/vote/:id' roles={['user', 'admin']} component={Vote}/>
      <PrivateRoute path='/admin' roles={['admin']} component={Admin}/>
    </Router>
  );
}

export default App;
