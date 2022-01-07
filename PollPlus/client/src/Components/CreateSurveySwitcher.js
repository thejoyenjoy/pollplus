import React, {useState} from 'react';
import Aux from '../hoc/Aux';
import CreateSurvey from './CreateSurvey';

const CreateSurveySwitcher = () => {
  const [selectedOption, setSelectedOption] = useState('SingleChoice');

  const surveyOptions = ['SingleChoice', 'MultipleChoice', 'Text'];
  const optArr = surveyOptions.map(optArr => optArr);

  const handleSelectChange = (e) => {
    setSelectedOption(surveyOptions[e.target.value])
  };

  const switcher = () => {
    switch (selectedOption) {
      case 'SingleChoice':
        return <CreateSurvey/>;

      case 'MultipleChoice':
        return <h3>Create Multiple Choice</h3>;

      case 'Text':
        return <h3>Create Text Survey</h3>;

      default:
        return null;
    }
  }

  return(
    <Aux>
      <h2 className='mt-3 mb-3'>Choose your Poll Type</h2>
      <div className='input-group mb-3'>
        <div className='input-group-prepend'>
          <label className='input-group-text' htmlFor='inputGroupSelect01'>Poll Types</label>
        </div>

        <select
          onChange={e => handleSelectChange(e)}
          className='custom-select' >
          {
            optArr.map(( address, key ) =>
              <option 
                key={key}
                value={key}>
                {address}
              </option>
            )
          }
        </select>
      </div>

      <div>
        {switcher()}
      </div>
    </Aux>
  );
}

export default CreateSurveySwitcher;
