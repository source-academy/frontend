import { FileInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { parseString } from 'xml2js';

import {
  Assessment,
  AssessmentOverview,
  assessmentTemplate,
  overviewTemplate
} from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import {
  makeEntireAssessment,
  retrieveLocalAssessment,
  storeLocalAssessment,
  storeLocalAssessmentOverview
} from '../XMLParser/XMLParserHelper';

type MissionCreatorProps = DispatchProps & OwnProps;

export type DispatchProps = {
  newAssessment: (assessment: Assessment) => void;
};

type OwnProps = {
  updateEditingOverview: (overview: AssessmentOverview) => void;
};

function MissionCreator(props: MissionCreatorProps) {
  const [fileInputText, setFileInputText] = React.useState('Import XML');
  let fileReader: FileReader | undefined = undefined;

  React.useEffect(() => {
    const assessment = retrieveLocalAssessment();
    if (assessment) {
      props.newAssessment(assessment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.newAssessment]);

  const handleFileRead = (file: any) => (e: any) => {
    if (!fileReader) {
      return;
    }
    const content = fileReader.result;
    if (content) {
      parseString(content, (err: any, result: any) => {
        console.dir(file);
        try {
          const entireAssessment: [AssessmentOverview, Assessment] = makeEntireAssessment(result);
          entireAssessment[0].fileName = file.name.slice(0, -4);
          storeLocalAssessmentOverview(entireAssessment[0]);
          props.updateEditingOverview(entireAssessment[0]);

          storeLocalAssessment(entireAssessment[1]);
          props.newAssessment(entireAssessment[1]);
          setFileInputText('Success!');
        } catch (err) {
          console.log(err);
          setFileInputText('Invalid XML!');
        }
      });
    }
  };

  const handleChangeFile = (e: any) => {
    const files = e.target.files;
    if (e.target.files) {
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead(files[0]);
      fileReader.readAsText(files[0]);
    }
  };

  const makeMission = () => {
    storeLocalAssessmentOverview(overviewTemplate());
    props.updateEditingOverview(overviewTemplate());
    storeLocalAssessment(assessmentTemplate());
    props.newAssessment(assessmentTemplate());
  };

  return (
    <div>
      <div>Please ensure that the xml uploaded is trustable.</div>
      <div>
        <FileInput
          text={fileInputText}
          inputProps={{ accept: '.xml' }}
          onChange={handleChangeFile}
        />
      </div>
      <div>
        <ControlButton label="Make New Mission" icon={IconNames.NEW_OBJECT} onClick={makeMission} />
      </div>
    </div>
  );
}

export default MissionCreator;
