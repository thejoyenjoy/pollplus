import React, {useState, useEffect} from 'react';
import PollService from '../Services/PollService';
import Aux from '../hoc/Aux';
import SurveyCard from './SurveyCard';

const MyPolls = () => {
  const [myPolls, setMyPolls] = useState([]);

  useEffect(() => {
    PollService.getMyPolls().then(data =>{
      setMyPolls(data.polls);
    });
  }, []);

  return(
    <Aux>
      <h3 className='mt-3'>Your Polls:</h3>
      <ul className='list-group'>
          {
            (myPolls !== undefined && myPolls.length !== 0) ?
              myPolls.slice(0).reverse().map(poll => {
                return <SurveyCard key={poll._id} survey={poll}/>
              }) 
            : <p>No created Polls yet</p>
          }
      </ul>
    </Aux>
  );
}

export default MyPolls;
