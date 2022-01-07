import React from 'react';
import Aux from '../hoc/Aux';
import Option from './Option';

const PollItem = (props) => {
  const pollOptions = props.options;
  const pollLabel = props.label;

  return(
    <Aux>
      <div className='input-group mb-3'>
        <label htmlFor='label'>{pollLabel}</label>
        {
          pollOptions.map((option, index) => {
            const optionInput = option.optionLabel;
            return <Option key={index} optionLabel={optionInput}/>
          })
        }
      </div>
    </Aux>
  );
}

export default PollItem;
