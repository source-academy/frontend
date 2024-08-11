import React from 'react';

const NusLogin: React.FC = () => {
  return <div>NusLogin</div>;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = NusLogin;
Component.displayName = 'NusLogin';

export default NusLogin;
