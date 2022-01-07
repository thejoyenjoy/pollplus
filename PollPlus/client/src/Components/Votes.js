import React, {useState, useEffect, useContext, useRef} from 'react';
import PollService from '../Services/PollService';
import { AuthContext } from '../Context/AuthContext';
import Aux from '../hoc/Aux';
import SurveyCard from './SurveyCard';
import SurveyAdder from './SurveyAdder';

const Votes = (props) => {
  const [myPolls, setMyPolls] = useState([]);
  const [newPollId, setNewPollId] = useState('');
  const [newPollPassword, setNewPollPassword] = useState('');
  const [submitMessage, setSubmitMessage] = useState(null); 
  
  useEffect(() => {
    const isRedirectedPollID = (props.location.redirectedPollID) ? true : false;
    if(isRedirectedPollID === true){
      setNewPollId(props.location.redirectedPollID);
    }
    PollService.getSavedPolls().then(data =>{
      setMyPolls(data.polls);
    });
  }, [props.location.redirectedPollID]);

  const authContext = useContext(AuthContext);
  let timeID = useRef(null);

  const onChangePassword = (value) => {
    setNewPollPassword(value);
  }

  const onChangeId = value =>{
    setNewPollId(value);
  }

  const onClickSavePoll = (params) => {
    const hashCodeLength = 24
    if (newPollId.length === hashCodeLength) {
      const passwordLength = newPollPassword.length;
      if(passwordLength === 0 || passwordLength >= 4 ){
        PollService.savedPoll(newPollId, newPollPassword).then(data => {
          const {message} = data;
          if(!message.msgError){
            setSubmitMessage(message);
            timeID = setTimeout(() => {
              props.history.push('/vote/' + newPollId);
            }, 2000)
          }
          else if(message.msgBody === 'UnAuthorized') {
            submitMessage(message);
            authContext.setUser({username : '', role :''});
            authContext.setIsAuthenticated(false);
          } else {
            setSubmitMessage(message);
          }
        })
      } else {
        setSubmitMessage({msgBody: 'If there is a password for this poll, it must be at least 4 characters long!', msgError: true});
      }  
    } else {
      setSubmitMessage({msgBody: 'The ID of the poll must be exact 24 characters long!', msgError: true});
    }
  }

  return(
    <Aux>
      <SurveyAdder
        inputId={newPollId}
        onChangeId={onChangeId}
        inputPassword={newPollPassword}
        onChangePassword={onChangePassword}
        handleSubmitForm={onClickSavePoll}
        submitMessage={submitMessage}/>

      <h1>Saved Polls:</h1>
      <ul className='list-group'>
          {
            (myPolls !== undefined && myPolls.length !== 0) ?
              myPolls.slice(0).reverse().map(poll => {
                return <SurveyCard key={poll._id} survey={poll} linkType='vote'/>
              }) :
            <p>No saved Polls yet</p>
          }
      </ul>
    </Aux>
  );
}

export default Votes;
