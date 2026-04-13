import { Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useState } from 'react';
import { useSession } from 'src/commons/utils/Hooks';

import { AssessmentOverview } from '../../../../commons/assessment/AssessmentTypes';
import ControlButton from '../../../../commons/ControlButton';
import LLMStatsDialog from './LLMStatsDialog';

type LLMStatsCellProps = {
  data: AssessmentOverview;
};

const LLMStatsCell: React.FC<LLMStatsCellProps> = ({ data }) => {
  const { enableLlmGrading } = useSession();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpen = useCallback(() => setDialogOpen(true), []);
  const handleClose = useCallback(() => setDialogOpen(false), []);

  if (!enableLlmGrading || !data.isLlmGraded) {
    return null;
  }

  return (
    <>
      <Tooltip content="LLM Statistics" placement="top">
        <ControlButton icon={IconNames.CHART} onClick={handleOpen} />
      </Tooltip>
      <LLMStatsDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        assessmentId={data.id}
        assessmentTitle={data.title}
      />
    </>
  );
};

export default LLMStatsCell;
