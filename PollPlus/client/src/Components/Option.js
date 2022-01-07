import React from 'react';
 
const Option = ({optionLabel, index, onClickBtn, handleOnChange, buttonLabel}) => {
  
  const handleOnClickButton = () => {
    (index) ?
      onClickBtn(index)
    : onClickBtn();
  }

  return(
    <div className='input-group mb-3'>
      <div className='input-group-prepend'>
        <div className='input-group-text'>
          <input
            type='radio'
            checked={false}
            readOnly={true}
            aria-label='Radio button for following text input'/>

        </div>
      </div>
      <input 
        type='text' 
        value={optionLabel}
        className='form-control' 
        aria-label='option' 
        onChange={handleOnChange}/>
      <div className='input-group-append'>
        <button 
          className='btn btn-outline-secondary' 
          type='button' 
          onClick={ handleOnClickButton }>
            { (buttonLabel) ? buttonLabel : 'Delete' }
        </button>
      </div>
    </div>
  );
};
 
export default Option;
