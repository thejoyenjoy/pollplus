import React from 'react';

const getStyle = (props)=>{
  let baseClass = 'alert ';

  (props.message.msgError) ?
    baseClass = baseClass + 'alert-danger' :
    baseClass = baseClass + 'alert-primary';

  return baseClass + ' text-center';
}

const Message = props => {
  return(
    <div className={ getStyle(props) } role='alert'>
      { props.message.msgBody }
    </div>
  )
}

export default Message;
