import React, {useState, useContext} from 'react';
import AuthService from '../Services/AuthService';
import Message from '../Components/Message';
import MyPolls from '../Components/MyPolls';
import {AuthContext} from '../Context/AuthContext';
import Aux from '../hoc/Aux';

const Home = props => {
  const [user, setUser] = useState({username: '', password: ''});
  const [message, setMessage] = useState(null);
  const authContext = useContext(AuthContext);

  const onChange = e => {
    setUser({...user, [e.target.name] : e.target.value});
  }

  const onSubmit = e => {
    e.preventDefault();
    AuthService.login(user).then(data => {
      const { isAuthenticated, user, message} = data;
      if(isAuthenticated){
        authContext.setUser(user);
        authContext.setIsAuthenticated(isAuthenticated);
        props.history.push('/');
      } else {
        setMessage(message);
      }
    });
  }

  return(
    <Aux>
      {
        (authContext.isAuthenticated) 
          ? <MyPolls/>
          : <form onSubmit={onSubmit}>
            <h3 className='mt-3 mb-3'>Sign in</h3>
            <label htmlFor='username' className='mb-1'>Username:</label>
            <input 
              type='text' 
              name='username' 
              onChange={onChange} 
              className='form-control mb-3'
              placeholder='enter username'/>
            <label htmlFor='password' className='mb-1'>Password:</label>
            <input 
              type='password' 
              name='password'
              onChange={onChange} 
              className='form-control mb-3' 
              placeholder='enter password'/>
            <div className='col-md-12 text-center'> 
              <button className='btn btn-lg btn-primary' type='submit'>Login</button>
            </div>
          </form>
      }
      {message ? <Message message={message}/> : null}
    </Aux>
  );
};

export default Home;
