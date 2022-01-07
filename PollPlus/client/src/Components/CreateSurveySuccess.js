import React, {useState} from 'react';
import { withRouter, useHistory } from 'react-router-dom'
import Aux from '../hoc/Aux';

const CreateSurveySuccess = ({ match }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const history = useHistory();
  var QRCode = require('qrcode.react');

  const id = match.params.id
  const linkToVote = 'localhost:3000/vote/' + id; 
  const qrCodeDownloadName = 'PollPlusQRC' + id + '.png';

  const downloadQR = () => {
    const canvas = document.getElementById('123456');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = qrCodeDownloadName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return(
    <Aux>
      <h1 className='text-center pt-3'>Poll has been successfully created and published</h1>
      <h2 className='text-center pt-3'>You can share the link below to the participants</h2>

      <div align='center'>
        <QRCode
          id='123456'
          value={linkToVote}
          size={290}
          level={'H'}
          includeMargin={true}
        />
       </div>

       <div className='mb-3' align='center'>
        <button className='btn btn-primary' onClick={downloadQR}>Download QR Code as PNG</button>
       </div>

      <div className='input-group mb-3'>
        <input type='text' className='form-control text-center p-2' disabled={true} value={linkToVote}/>
        <div className='input-group-append'>
          <button
            className='btn btn-outline-secondary' 
            onClick={() =>  navigator.clipboard.writeText(linkToVote, setCopySuccess('Copied!'))}>
              Copy
          </button>
        </div>
      </div>

      {
        (copySuccess !== '')
          ? <div className='p-2 mb-3 bg-success text-white text-center'>
              {copySuccess}
            </div>
          : null
      }

       <div className='d-flex justify-content-between mt-5 mb-5'>
        <button
          className='btn btn-primary'
          type='link'
          onClick={() => history.push('/createPoll')}>
            Create New Poll
        </button>

        <button
          className='btn btn-primary'
          type='link'
          onClick={() => history.push('/polls')}>
            Go to My Polls
        </button>

        <button
          className='btn btn-primary'
          type='link'
          onClick={() => history.push(`/poll/${id}`)}>
            Show Results
        </button>
       </div>
    </Aux>
  );
}

export default withRouter(CreateSurveySuccess);
