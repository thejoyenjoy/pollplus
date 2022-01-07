import React, {useContext} from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../Services/AuthService';
import { AuthContext } from '../Context/AuthContext';
import Aux from '../hoc/Aux';

const Navbar = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useContext(AuthContext);

  const onClickLogoutHandeler = () => {
    AuthService.logout().then(data => {
      if(data.success){
        setUser(data.user);
        setIsAuthenticated(false);
      }
    }).catch( err => console.log('err :>> ', err));
  }

  const unauthenticatedNavBar = () => {
    return(
      <Aux>
        <Link to='/'>
          <li className='nav-item nav-link active'>
            Login
          </li>
        </Link>
        <Link to='/register'>
          <li className='nav-item nav-link active'>
            Register
          </li>
        </Link>
      </Aux>
    );
  }

  const authenticatedNavBar = () => {
    return(
      <Aux>
        <Link to='/polls'>
          <li className='nav-item nav-link'>
            My Polls
          </li>
        </Link>
        <Link to='/createPoll'>
          <li className='nav-item nav-link'>
            Create Poll
          </li>
        </Link>
        <Link to='/votes'>
          <li className='nav-item nav-link'>
            Vote
          </li>
        </Link>
        {
          user.role === 'admin' ?
            <Link to='/admin'>
              <li className='nav-item nav-link'>
                Admin Panel
              </li>
            </Link>
          : null
        }
        <button 
          type='button' 
          className='btn btn-link nav-item nav-link' 
          onClick={onClickLogoutHandeler}>Logout
        </button>
      </Aux>
    );
  }

  return(
    <nav className='navbar navbar-expand-sm navbar-light bg-light'>
      <Link to='/'>
        <div className='navbar-brand'>PollPlus</div>
      </Link>
    
      <button className='navbar-toggler'
        type='button'
        data-toggle='collapse'
        data-target='#navbarNav'
        aria-controls='navbarNav' 
        aria-expanded='false'
        aria-label='Toggle navigation'>
            
        <span className='navbar-toggler-icon'></span>
      </button>
      <div className='collapse navbar-collapse' id='navbarNav'>
        <ul className='navbar-nav'>
          { !isAuthenticated ? unauthenticatedNavBar() : authenticatedNavBar()}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar;
