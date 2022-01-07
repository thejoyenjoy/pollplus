import React, {useState, useContext, useEffect, useRef} from 'react';
import { withRouter } from 'react-router-dom';
import Option from './Option';
import PollService from '../Services/PollService';
import Message from './Message';
import Aux from '../hoc/Aux';
import { AuthContext } from '../Context/AuthContext';
import Checkbox from './Checkbox';

const CreateSurvey = (props) => {
  const [pollLabel, setPollLabel] = useState('');
  const [pollHint, setPollHint] = useState('');
  const [newPollOption, setNewPollOption] = useState('');
  const [pollOptions, setPollOptions] = useState([
    {
      optionLabel: 'Yes'
    },
    {
      optionLabel: 'No'
    }
  ]);
  
  const [allowParticipantOptions, setAllowParticipantOptions] = useState(false);
  const [requireAuthenticatedProfile, setRequireAuthenticatedProfile] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [pollPassword, setPollPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [update, setUpdate] = useState(false);
  const authContext = useContext(AuthContext);

  let timeId = useRef(null);

  useEffect(() =>{
    return() => {
      clearTimeout(timeId);
    }
  }, []);

  useEffect(() => {
    setIsLoading(false);
  },[update]);

  const showHideText = (showPassword) ? 'Hide' : 'Show';
  const pollOptionLabelsArray = pollOptions.map(a => a.optionLabel);
  const newPoll = {
    creator: authContext.user._id,
    creatorName: authContext.user.username,
    label: pollLabel,
    hint: pollHint,
    options: pollOptions,
    allowParticipantOptions: allowParticipantOptions,
    requireAuth: requireAuthenticatedProfile,
    requirePassword: requirePassword,
    pollPassword: pollPassword,
  };

  const resetForm = () => {
    setIsLoading(true);
    setPollOptions(
      [{
        optionLabel: 'Yes'
      },
      {
        optionLabel: 'No'
      }]);
    setPollLabel('');
    setNewPollOption('');
    setAllowParticipantOptions(false);
    setRequireAuthenticatedProfile(false);
    setRequirePassword(false);
    setPollPassword('');
    setUpdate(!update);
  };

  const onSubmit = e => {
    e.preventDefault();
    if (pollLabel !== '' && pollOptions.length >= 2) {
      if (requirePassword === true && pollPassword.length < 4) {
        setMessage({msgBody: 'Password must be greater than 4', msgError: true});
      } else {
        if(newPoll.requirePassword === false){
          delete newPoll['pollPassword'];
        }
        if(authContext.user._id === undefined){
          const msg = {msgBody: 'Something went wrong. Please reload to page', msgError: true};
          setMessage(msg);
        } else {
          PollService.postPoll(newPoll).then(data => {
            const { message, id } = data;
            resetForm();
            if(message.msgBody === 'UnAuthorized') {
              setMessage(message);
              authContext.setUser({username: '', role: ''});
              authContext.setIsAuthenticated(false);
            } else {
              setMessage(message);
              if(message.msgError === false){
                timeId = setTimeout(() => {
                  props.history.push(`/createPoll/${id}`);
                }, 2000)
              }
            }
          })
        }
      }
    } else {
      setMessage({msgBody: 'The Label cannot be empty and the number of options must be 2 or greater.', msgError: true});
    }
  }

  const onChangeNewOption = e => {
    setNewPollOption(e.target.value);
  }

  const onChangeLabel = e => {
    setPollLabel(e.target.value);
  }

  const onChangeHint = e => {
    setPollHint(e.target.value);
  }

  const onChangeOption = index => e => {
    let newArr = [...pollOptions];
    newArr[index] = {optionLabel: e.target.value};
    setPollOptions(newArr);
  }

  const onChangePassword = e => {
    setPollPassword(e.target.value);
  }

  const onClickAddNewOption = () => {
    if(newPollOption !== ''){
      setPollOptions([...pollOptions, {optionLabel: newPollOption}]);
      setNewPollOption('');
    } else {
      setMessage({msgBody: 'Option cannot be empty', msgError: true});
    }
  }

  const handleParticipantOption = () => {setAllowParticipantOptions(!allowParticipantOptions)};
  const handleRequireAuth = () => {setRequireAuthenticatedProfile(!requireAuthenticatedProfile)};
  const handleRequirePassword = () => {
    if (requirePassword === true){
      setPollPassword('');
      setShowPassword(false);
    }
    setRequirePassword(!requirePassword)
  };
  const handleShowPassword = () => {setShowPassword(!showPassword)};
  
  const handleDelete = ((index) => {
    setIsLoading(true);
    pollOptions.splice(index, 1);
    setUpdate(!update);
  });

  return(
    <Aux>
      <h3 className='mb-3'>Create New Poll:</h3>
      <form onSubmit={onSubmit}>

        <h5>Question:</h5>
        <input 
          type='text' 
          name='label' 
          value={pollLabel} 
          onChange={onChangeLabel}
          className='form-control mt-2 mb-3'
          placeholder='Please enter a question or a title'/>

        <h5>Hint:</h5>
        <input 
          type='text' 
          name='label' 
          value={pollHint}
          onChange={onChangeHint}
          className='form-control mt-2 mb-3'
          placeholder='Please enter a hint'/>

        {message ? <Message message={message}/> : null}

        <h5 className='mt-2 mb-3'>Options:</h5>
        {
          (pollOptions !== undefined && isLoading === false) ?
            pollOptionLabelsArray.map((option, index) => {
              return <Option 
                        key={index}
                        optionLabel={option}
                        index={index}
                        handleOnChange={onChangeOption(index)}
                        onClickBtn={handleDelete}/>
            }) 
            : <p>No new options</p>
        }

        <input 
          type='text' 
          name='option' 
          value={newPollOption} 
          onChange={onChangeNewOption}
          className='form-control'
          placeholder='New Option'/>
        
          <button 
            className='btn btn-secondary float-right mb-2 mt-2' 
            type='button' 
            onClick={onClickAddNewOption}>
              Add Option
          </button>
        
        <Checkbox name='allowParticipantOptions'
          checked={allowParticipantOptions}
          onChange={handleParticipantOption}
          label='Allow new Options from Participants'/>

        <Checkbox name='requireAuth'
          checked={requireAuthenticatedProfile}
          onChange={handleRequireAuth}
          label='Require authenticated Profile'/>

        <Checkbox name='requirePassword'
          checked={requirePassword}
          onChange={handleRequirePassword}
          label='Protect Poll by Password'/>
        
        <div className='input-group mb-3'>
          <div className='input-group-prepend'>
            <div className='input-group-text'>
              <input 
                type={ (showPassword) ? 'text' : 'password' } 
                name='password' 
                value={pollPassword} 
                onChange={onChangePassword} 
                disabled={!requirePassword}/>
            </div>
          </div>
          <button 
            className='btn btn-outline-secondary' 
            type='button' 
            onClick={handleShowPassword} 
            disabled={!requirePassword}>
              {showHideText}
            </button>
        </div>
        
        <div className='col-md-12 mb-3 text-center'> 
          <button className='btn btn-lg btn-primary' type='submit'>Save New Poll</button>
        </div>
      </form>
    </Aux>
  );
}

export default withRouter(CreateSurvey);
