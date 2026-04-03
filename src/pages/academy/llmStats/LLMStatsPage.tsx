import React from 'react';

import LLMStatsTab from '../../../commons/adminStats/LLMStatsTab';
import ContentDisplay from '../../../commons/ContentDisplay';

const LLMStatsPage: React.FC = () => {
  return <ContentDisplay display={<LLMStatsTab />} fullWidth={false} />;
};

export const Component = LLMStatsPage;
Component.displayName = 'LLMStatsPage';

export default LLMStatsPage;
