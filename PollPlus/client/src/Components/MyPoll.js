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

const MyPoll = (props) => {
  const [myPoll, setMyPoll] = useState([]);
  const [optionArrayLabels, setOptionArrayLabels]  = useState([]);
  const [optionArrayVotes, setOptionArrayVotes]  = useState([]);
  const [newOption, setNewOption] = useState('');
  const [message, setMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const id = props.match.params.id;
  const authContext = useContext(AuthContext);

  useEffect(() => {
    let timeID = null;
    let firstRender = true;
    
    if (firstRender === true) {
      socket.emit('room', {room: id});
      PollService.getMyPoll(id).then(data => {
        const { message, poll } = data;
        if (message !== undefined) {
          setMessage(message);
          if (message.msgBody !== undefined ) {
            if (message.msgBody === 'UnAuthorized') {
              timeID = setTimeout(() => {
                props.history.push('/polls');
              }, 2000)
            }
          }
        } else {
          if (poll !== null) {
            setMyPoll(poll);
          } else {
            setMessage({msgBody: 'This Poll was deleted', msgError: true})
            timeID = setTimeout(() => {
              props.history.push('/votes');
            }, 2000)
          }
          firstRender = false;
        }
      });
    }

    socket.on('update', payload => {
      PollService.getMyPoll(id).then(data =>{
        setMyPoll(data.poll);
      });
    });

    return() => {
      socket.emit('leave room', {
        room: id
      });
      clearTimeout(timeID);
    }
  }, [id, props.history]); //only re-run the effect if new event or url change

  useEffect(() => {
    if(myPoll.options){
      if(myPoll.options.length >= 1 ){
        let optionLabels = [];
        let optionVotes = [];
        myPoll.options.map(item => {
          optionLabels.push(item.optionLabel);
          optionVotes.push(item.votes);
          return null;
        });
        setOptionArrayLabels(optionLabels);
        setOptionArrayVotes(optionVotes);
      } else {
        setMessage({msgBody: 'There are no options yet ', msgError: true});
      }
    } 
  }, [myPoll]);

  var QRCode = require('qrcode.react');
  const linkToVote = 'localhost:3000/vote/' + id; 

  const downloadQR = () => {
    const canvas = document.getElementById('123456');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = '123456.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const emitUpdateToOtherUser = () => {
    socket.emit('update', {
      room: id
    });
  }

  const handleDelete = () => {
    PollService.deleteMyPoll(id).then(data => {
      const { message } = data;
      if(message.msgBody === 'UnAuthorized') {
        setMessage(message);
        authContext.setUser({username : '', role :''});
        authContext.setIsAuthenticated(false);
      } else {
        let timeID = null;
        setMessage(message);
        emitUpdateToOtherUser();
        timeID = setTimeout(() => {
          props.history.push('/polls');
        }, 2000)
      }
    });
  }

  const onChangeOption = e => {
    setNewOption(e.target.value);
  }

  const resetUser = (message) => {
    setMessage(message);
    authContext.setUser({username : '', role :''});
    authContext.setIsAuthenticated(false);
  }

  const onClickAddOption = () => {
    if (newOption !== '') {
      const isNewOptionInOption = optionArrayLabels.some(substring => newOption === substring) ? true : false;

      (isNewOptionInOption === true)
        ? setMessage({msgBody: 'The new option is already an option!', msgError: true})
        : PollService.patchOption(id, newOption).then(data => {
          const { message } = data;
          if (message.msgBody === 'UnAuthorized'){
            resetUser(message);
          }

          (message.msgError === true)
            ? setMessage(message)
            : setMessage({msgBody: 'You successfully added the option: ' + newOption, msgError: false});
              emitUpdateToOtherUser();
              PollService.getMyPoll(props.match.params.id).then(data =>{
                setMyPoll(data.poll);
              });
              setNewOption('');
          });
    } else {
      setMessage({msgBody: 'The new option cannot be empty!', msgError: true});
    }
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
                    <h5>Hint:</h5>
                    <label>{myPoll.hint}</label>
                  </Aux>
                
              }
              <h5>Options:</h5>
              {
                (myPoll.options !== undefined) ? 
                  myPoll.options.map((option, index) => {
                    return <Checkbox
                      key={index}
                      readOnly={true}
                      label={option.optionLabel}
                      votes={option.votes}/>
                  })
                  : null
              }

              {message ? <Message message={message}/> : null}

              <Option
                optionLabel={newOption}
                buttonLabel='Add'
                handleOnChange={onChangeOption}
                onClickBtn={onClickAddOption}/>

              {
                (myPoll.voted === undefined || myPoll.voted === [] )
                ? null
                : <h5>Total Votes: {myPoll.voted.length}</h5>
              }

              <div align='center'>
                <QRCode
                  id='123456'
                  value={`http://localhost:3000/vote/${id}`}
                  size={290}
                  level={'H'}
                  includeMargin={true}
                />
              </div>

              <div className='mb-3' align='center'>
                <button 
                  className='btn btn-primary' 
                  onClick={downloadQR}>Download QR Code as PNG
                </button>
              </div>

              <div className='input-group mt-5 mb-3'>
                <input type='text' className='form-control text-center p-2' disabled={true} value={linkToVote}/>
                <div className='input-group-append'>
                  <button 
                    className='btn btn-outline-secondary'
                    onClick={() =>  navigator.clipboard.writeText(`http://localhost:3000/vote/${id}`, setCopySuccess('Copied!'))}>
                    Copy
                  </button>
                </div>
              </div>

              {
                (copySuccess !== '') ? 
                  <div className='p-2 mb-3 bg-success text-white text-center'>
                    {copySuccess}
                  </div>
                  : null
              }

              <h5>Settings:</h5>
              <Checkbox
                readOnly={true}
                label='Allow options from participants'
                checked={myPoll.allowParticipantOptions}/>

              <Checkbox
                readOnly={true}
                label='Require authenticated profile'
                checked={myPoll.requireAuth}/>

              <Checkbox
                readOnly={true}
                label='require password'
                checked={myPoll.requirePassword}/>
            </Aux>
          : (myPoll === null)
            ? <h5>Poll was deleted!</h5>
            : <h5>loading</h5>
        }
        </div>
        <div className='col-md-6'>
          {
            (myPoll !== undefined && myPoll !== [] && myPoll !== null) 
            ? <BarChart
                title={myPoll.label}
                optionLabels={optionArrayLabels}
                optionVotes={optionArrayVotes}/>
            : <h5>loading</h5>
          }
          <button className='btn btn-outline-danger mt-3 float-right' onClick={handleDelete}>
            Delete this poll
          </button>
        </div>
      </div>
    </Aux>
  );
}

export default withRouter(MyPoll);
