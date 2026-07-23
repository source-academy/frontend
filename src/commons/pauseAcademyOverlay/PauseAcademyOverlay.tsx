import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import { useState } from 'react';

import classes from '../../styles/PauseAcademyOverlay.module.scss';

type Props = {
  reason?: string;
  onSubmit: (resumeCode: string) => void;
};

export const PauseAcademyOverlay: React.FC<Props> = props => {
  const [resumeCode, setResumeCode] = useState('');

  return (
    <div className={classes['overlay']}>
      <p className={classes['title-label']}>Source Academy Paused</p>
      {props.reason && <p className={classes['reason-label']}>Reason: {props.reason}</p>}
      <p className={classes['info-label']}>Please inform any of the invigilators</p>
      <FormGroup inline label="Course Resume Code" labelFor="courseResumeCode">
        <InputGroup
          id="courseResumeCode"
          defaultValue=""
          onChange={e => setResumeCode((e.target as HTMLInputElement).value)}
        />
      </FormGroup>
      <Button text="Submit" onClick={() => props.onSubmit(resumeCode)} />
    </div>
  );
};
