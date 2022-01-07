import React from 'react';
import Aux from '../hoc/Aux';

const Checkbox = ({ type = 'checkbox', name, label, checked = false, onChange, readOnly, votes }) => {

  return (
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <div className="input-group-text">
          <input type={type} name={name} checked={checked} readOnly={readOnly} onChange={onChange} />
        </div>
      </div>
      {
        (votes >= 0) ? 
          <Aux>
            <div className='input-group-append overflow-auto'>
              <input readOnly={true} className='input-group-text' value={label}/>      
            </div>
            <div className='input-group-append'>
              <label className='input-group-text'>{votes}</label>
            </div>
          </Aux>              
        : <label className='input-group-text'>{label}</label>
      }
    </div>
  )
}
export default Checkbox;
