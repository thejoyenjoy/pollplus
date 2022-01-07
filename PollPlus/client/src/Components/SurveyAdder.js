import React from 'react';
import Message from './Message';
import Aux from '../hoc/Aux';


const SurveyAdder = ({ inputId, onChangeId, inputPassword, onChangePassword, handleSubmitForm, submitMessage }) => {
  const message = (submitMessage) ? submitMessage : null;

  function handleChangeId(event) {
    // invoke callback with the new value
    onChangeId(event.target.value);
  }

  function handleChangePassword(event) {
    onChangePassword(event.target.value);
  }

  return(
    <Aux>
      <div className='card'>
        <div className='card-header'>
          Add a Poll to your collection
        </div>

        <div className='card-body'>
          <div className='input-group mb-3'>
            <div className='input-group-prepend'>
              <span
                className='input-group-text'
                id='inputGroup-sizing-default'>Poll ID:</span>
            </div>
            <input
              type='text'
              className='form-control'
              value={inputId}
              onChange={handleChangeId}
              aria-label='Default'
              aria-describedby='inputGroup-sizing-default'/>
          </div>

          <div className='input-group mb-3'>
            <div className='input-group-prepend'>
              <span className='input-group-text' id='inputGroup-sizing-default'>Password:</span>
            </div>
            <input
              type='text'
              className='form-control'
              value={inputPassword}
              onChange={handleChangePassword}
              placeholder='enter password if required'
              aria-label='Default'
              aria-describedby='inputGroup-sizing-default'/>
          </div>

          {message ? <Message message={message}/> : null}

          <button
            className='btn btn-primary float-right'
            type='button'
            onClick={handleSubmitForm}>Submit</button>
        </div>
      </div>
    </Aux>
  );
}

export default SurveyAdder;
