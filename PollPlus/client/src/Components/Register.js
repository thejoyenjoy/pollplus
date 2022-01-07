import React, {useState, useRef, useEffect} from 'react';
import AuthService from '../Services/AuthService';
import Message from '../Components/Message';
import Aux from '../hoc/Aux';

const Register = props => {
  const [user, setUser] = useState({username: '', email:'', password: '', role: 'user'});
  const [message, setMessage] = useState(null);
  let timeId = useRef(null);

  useEffect(() => {
    return() => {
      clearTimeout(timeId);
    }
  }, []);

  const onChange = e => {
    setUser({...user, [e.target.name] : e.target.value});
  }

  const resetForm = () => {
    setUser({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
  }

  const onSubmit = e => {
    e.preventDefault();
    AuthService.register(user).then(data => {
      const { message } = data;
      setMessage(message);
      resetForm();
      if (!message.msgError) {
        timeId = setTimeout(() => {
          props.history.push('/');
        }, 2000)
      }
    });
  }

  return(
    <Aux>
      <form onSubmit={onSubmit}>
        <h3 className='mt-3 mb-3'>Register</h3>

        <label className='mb-1'>Username:</label>
        <input 
          type='text' 
          name='username'
          value={user.username}
          onChange={onChange} 
          className='form-control mb-3'
          placeholder='enter username'/>

        <label className='mb-1'>Email:</label>
        <input 
          type='text' 
          name='email'
          value={user.email}
          onChange={onChange} 
          className='form-control mb-3'
          placeholder='enter email'/>

        <label className='mb-1'>Password:</label>
        <input 
          type='password' 
          name='password'
          value={user.password}
          onChange={onChange} 
          className='form-control mb-3rr'
          placeholder='enter password'/>

        <div className='col-md-12 text-center'> 
          <button name='button' className='btn btn-lg btn-primary mt-3 mb-3' type='submit'>Register</button> 
        </div>
        
        {message ? <Message message={message}/> : null}
      </form>
    </Aux>
  );
};

export default Register;
