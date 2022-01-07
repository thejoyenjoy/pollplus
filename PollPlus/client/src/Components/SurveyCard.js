import React from 'react';
import { Link } from 'react-router-dom';
import Aux from '../hoc/Aux';

const SurveyCard = props => {
  const survey = props.survey;
  const creatorName = survey.creatorName;
  const pollLabel = survey.label;
  const created = survey.created;
  const votes = survey.voted.length;
  const linkType = props.linkType;

  const pollLink = () => {
    if (linkType === 'vote') {
      const voteLink = '/vote/' + props.survey._id;
      return voteLink;
    } else {
      const pollLink = '/poll/' + props.survey._id;
      return pollLink;
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(options)
  }

  const createdReadableString = formatDate(created);

  return(
    <Aux>
      <Link to={pollLink} style={{textDecoration: 'none', color: 'black', marginTop: '1rem'}}>
        <div className='card mt-2 mb-1'>
          <h5 className='card-header'>{pollLabel}</h5>
          <div className='card-body'>
            <div className='row'>

              <div className='col-md-3'>
                <span>created by: {creatorName}</span>
              </div>

              <div className='col-md-3'>
                <span>created: {createdReadableString}</span>
              </div>

              <div className='col-md-3'>
                <span>Type: Poll</span>
              </div>

              <div className='col-md-3'>
                <span>Votes: {votes}</span>
              </div>

            </div>    
          </div>
        </div>
      </Link>
    </Aux>
  );
}

export default SurveyCard;
