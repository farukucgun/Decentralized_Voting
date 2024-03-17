import React from 'react';
import LoadingImage from '../../assets/loading.png'
import './Loading.css'; 

const Loading = () => {
  return (
    <div className="loading">
      <img src={LoadingImage} alt="Loading" />
    </div>
  );
};

export default Loading;
