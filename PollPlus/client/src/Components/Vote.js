import React, {useState, useEffect, useContext} from 'react';
import { withRouter } from 'react-router-dom';
import PollService from '../Services/PollService';
import Checkbox from './Checkbox';
import Option from './Option';
import Message from './Message';
import BarChart from './BarChart';
import { AuthContext } from '../Context/AuthContext';
import Aux from '../hoc/Aux';

const io = require('socket.io-client');
var socket = io('http://localhost:5000', {transports: ['websocket', 'polling', 'flashsocket']});

const Vote = (props) => {
  const [myPoll, setMyPoll] = useState([]);
  const [message, setMessage] = useState(null);
  const [optionArray, setOptionArray] = useState([]);
  const [optionArrayLabels, setOptionArrayLabels] = useState([]);
  const [optionArrayVotes, setOptionArrayVotes] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [voteID, setVoteID] = useState('');

  const match = props.match;
  const authContext = useContext(AuthContext);
  const userID = authContext.user._id;

  const fetchPollData = () => {
    PollService.getSavedPoll(match.params.id).then(data =>{
      setMyPoll(data.poll);
    });
  }

  useEffect(() => {
    let timeID = null;
    let firstRender = true;

    if (firstRender === true) {
      PollService.getSavedPoll(match.params.id).then(data => {
        const { message } = data;
        if (message.msgBody ===  'UnAuthorizedCreator') {
          setMessage({ msgBody: "You're the creator of this Poll. We'll redirect you to your Poll!", msgError: true });
          timeID = setTimeout(() => {
            props.history.push('/poll/' + match.params.id);
          }, 2000);
        } else {
          if(message.msgBody === 'UnAuthorized') {
            setMessage({ msgBody: 'Please save the vote in your vote collection first!', msgError: true });
            timeID = setTimeout(() => {
              props.history.push({
                pathname: '/votes',
                redirectedPollID: match.params.id });
            }, 2000);
          } else {
            if (data.poll !== null) {
              socket.emit('room', {room: match.params.id});
              setMyPoll(data.poll);
            } else {
              setMessage({ msgBody: 'This Poll was deleted', msgError: true })
              timeID = setTimeout(() => {
                props.history.push('/votes');
              }, 2000)
            }
            firstRender = false;
          }
        }
      });
    }

    socket.on('update', payload => {
      PollService.getSavedPoll(match.params.id).then(data => {
        const { message } = data;
        if (message.msgBody === 'NotFound'){
          setMessage({msgBody: 'This Poll was deleted', msgError: true})
          timeID = setTimeout(() => {
            props.history.push('/votes');
          }, 2000)
        } else {
          if (data.poll !== null) {
            setMyPoll(data.poll);
          } else {
            setMessage({msgBody: 'This Poll was deleted', msgError: true})
            timeID = setTimeout(() => {
              props.history.push('/votes');
            }, 2000)
          }
        }
      });
    });
    return() => {
      socket.emit('leave room', {
        room: match.params.id
      });
      clearTimeout(timeID);
    }
  }, [match.params.id, props.history]); //only re-run the effect if new message comes in

  useEffect(() => {
    if(myPoll.options){
      if(myPoll.options.length >=1 ){
        let options = [];
        let optionLabels = [];
        let optionVotes = [];
        myPoll.options.map(item => {
          options.push({label: item.optionLabel, _id: item._id, checked: false, votes: item.votes});
          optionLabels.push(item.optionLabel);
          optionVotes.push(item.votes);
          return null;
        });
        setOptionArray(options);
        setOptionArrayLabels(optionLabels);
        setOptionArrayVotes(optionVotes);
      } else {
        setMessage({msgBody: 'There are no options yet ', msgError: true});
      }
    }
  }, [myPoll]);

  const onChangeCheckbox = (index) => {
    const cbIndex = index;
    if(myPoll.options){
      let options = []
      myPoll.options.map((item, index) => {
        if (index === cbIndex) {
          options.push({label: item.optionLabel, _id:item._id, checked: true, votes:item.votes});
          setVoteID(item._id);
        } else {
          options.push({label: item.optionLabel, _id:item._id, checked: false, votes:item.votes});
        }
        return null;
      });
      setOptionArray(options);
    }
  }

  const resetUser = (message) => {
    setMessage(message);
    authContext.setUser({username : '', role :''});
    authContext.setIsAuthenticated(false);
  }

  const submitVote = () => {
    const hasVoted = (myPoll.voted.indexOf(userID) > -1) ? true : false;
    (hasVoted)
      ? setMessage({msgBody: 'You already Voted!', msgError: true})
      : (voteID !== '' && voteID.length === 24)
        ? PollService.patchVote(match.params.id, voteID).then(data => {
            const { message } = data;
            if(message.msgBody === 'UnAuthorized') {
              resetUser(message);
            } else {
              setMessage(message);
              emitUpdateToOtherUser();
              fetchPollData();
            }
          })
        : setMessage({msgBody: 'No selected Option', msgError: true});
  }

  const onChangeOption = e => {
    setNewOption(e.target.value);
  }

  const onClickAddOption = () => {
    if (myPoll.allowParticipantOptions === true) {
      if (newOption !== '') {
        const isNewOptionInOption = optionArray.filter(function(e) { return e.label === newOption; }).length > 0;
        (isNewOptionInOption === true)
          ? setMessage({msgBody: 'The new option is already an option!', msgError: true})
          : PollService.patchOption(match.params.id, newOption).then(data => {
              const { message } = data;
              (message.msgBody === 'UnAuthorized')
                ? resetUser(message)
                : setMessage({msgBody: 'You successfully added the option: ' + newOption, msgError: false});
                    emitUpdateToOtherUser();
                    fetchPollData();
                    setNewOption('');
            });
      } else {
        setMessage({msgBody: 'The new option cannot be empty!', msgError: true});
      }
    } else {
      setMessage({msgBody: 'You cannot add an option!', msgError: true});
    }
  }

  const emitUpdateToOtherUser = () => {
    socket.emit('update', {
      room: match.params.id
    });
  }

  return(
    <Aux>
      <p className='text-center mt-1 mb-1'>Question:</p>
      <h3 className='text-center mt-0 mb-2'>{myPoll.label}</h3>
      <div className='row'>
        <div className='col-md-6'>
        {
          (myPoll !== undefined && myPoll !== [] && myPoll !== null) ? 
            <Aux>
              {
                (myPoll.hint === undefined || myPoll.hint === '' )
                ? null
                :  <Aux>
                    <h5 className='mb-1'>Hint:</h5>
                    <p className='mb-2'>{myPoll.hint}</p>
                  </Aux>
              }
              {message ? <Message message={message}/> : null}
              <h5>Options:</h5>
              {
                (optionArray.length !== 0 && optionArray) ? 
                  optionArray.map((option, index) => {
                    return <Checkbox  key={optionArray[index]._id} 
                                      checked={optionArray[index].checked} 
                                      onChange={() => onChangeCheckbox(index)} 
                                      label={optionArray[index].label} 
                                      votes={optionArray[index].votes}/>
                  })
                  : null
              }

              {
                (myPoll.allowParticipantOptions) ?
                  <Aux>
                    <h5>New Option:</h5>
                    <Option optionLabel={newOption} buttonLabel='Add' handleOnChange={onChangeOption} onClickBtn={onClickAddOption}/>
                  </Aux>
                : null
              }

              <Aux>
                <button className='btn btn-primary float-right' onClick={submitVote}>
                  Vote
                </button>
              </Aux>

              {
                (myPoll.voted === undefined || myPoll.voted === [] )
                ? null
                : <Aux>
                    <h5>Total Votes: {myPoll.voted.length}</h5>
                  </Aux>
              }
            </Aux>
          : (myPoll === null)
            ? <h5>Poll was deleted!</h5>
            : <h5>loading</h5>
        }
        </div>

        <div className='col-md-6'>
          {
            (myPoll !== undefined && myPoll !== [] && myPoll !== null) 
            ? <BarChart title={myPoll.label} optionLabels={optionArrayLabels} optionVotes={optionArrayVotes} />
            : <h5>loading</h5>
          }
        </div>
      </div>
    </Aux>
  );
}

export default withRouter(Vote);
