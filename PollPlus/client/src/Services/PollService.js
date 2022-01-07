export default {
  getMyPolls: () => {
    return fetch('/user/polls').then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'Unauthorized', msgError: true}}
      }
    });
  },
  getSavedPolls: () => {
    return fetch('/user/votes').then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'Unauthorized', msgError: true}}
      }
    });
  },
  postPoll: poll => {
    return fetch('/user/poll', {
      method: 'post',
      body: JSON.stringify(poll),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      }
    });
  },
  getMyPoll: id => {
    return fetch('/user/poll/' + id).then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      }
    });
  },
  deleteMyPoll: (pollID) => {
    return fetch('/user/poll/' + pollID, {
      method: 'delete',
    }).then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      }
    });
  },
  getSavedPoll: id => {
    return fetch('/user/vote/' + id).then(res => {
      if (res.status === 401) {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      } 
      if (res.status === 404) {
        return {message: {msgBody: 'NotFound', msgError: true}}
      }
      if (res.status === 406) {
        return {message: {msgBody: 'UnAuthorizedCreator', msgError: true}}
      }
      return res.json().then(data => data);
    });
  },
  savedPoll: (pollID, pollPassword) => {
    const body = {pollID, pollPassword};
    return fetch('/user/votes/' + pollID, {
      method: 'put',
      body: JSON.stringify(body),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => {
        if (res.status !== 401) {
          return res.json().then(data => data);
        } else {
          return res.json().then(data => data);
        }
    })
  },
  patchVote: (pollID, voteID) => {
    return fetch('/user/poll/' + pollID, {
      method: 'PATCH',
      body: JSON.stringify({voteID: voteID}),
      headers:{
        'Content-Type': 'application/json'
      }}
    ).then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      }
    });
  },
  patchOption: (pollID, newOption) => {
    return fetch('/user/poll/' + pollID, {
      method: 'PATCH',
      body: JSON.stringify({newOption: newOption}),
      headers:{
        'Content-Type': 'application/json'
      }}
    ).then(res => {
      if (res.status !== 401) {
        return res.json().then(data => data);
      } else {
        return {message: {msgBody: 'UnAuthorized', msgError: true}}
      }
    });
  },
}
