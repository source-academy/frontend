import React from 'react';

import Markdown from '../Markdown';

const SideContentMissionTask: React.FC = props => {
  return (
    <div>
      <Markdown content={'SAMPLE TEXT'} openLinksInNewWindow={true} />
    </div>
  );
};

export default SideContentMissionTask;
