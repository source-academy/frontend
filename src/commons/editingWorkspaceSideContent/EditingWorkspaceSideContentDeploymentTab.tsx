import { Divider, Switch } from '@blueprintjs/core';

import { type Assessment, emptyLibrary, type Library } from '../assessment/AssessmentTypes';
import DeploymentLanguageSelect from './DeploymentLanguageSelect';
import { assignToPath, getValueFromPath } from './EditingWorkspaceSideContentHelper';

type Props = {
  updateAssessment: (assessment: Assessment) => void;
  assessment: Assessment;
  label: string;
  pathToLibrary: Array<string | number>;
  pathToCopy?: Array<string | number>;
  isOptionalDeployment: boolean;
};

function DeploymentTab({
  updateAssessment,
  assessment,
  label,
  pathToLibrary,
  pathToCopy,
  isOptionalDeployment,
}: Props) {
  const isEmptyLibrary = (path: Array<string | number> = pathToLibrary) => {
    return getValueFromPath(path.concat(['chapter']), assessment) === -1;
  };

  const handleChapterSelect = (chapter: number) => {
    const deployment = getValueFromPath(pathToLibrary, assessment) as Library;
    deployment.chapter = chapter;
    updateAssessment(assessment);
  };

  const handleSwitchDeployment = () => {
    if (isEmptyLibrary()) {
      let library = getValueFromPath(pathToCopy || ['globalDeployment'], assessment) as Library;
      if (library.chapter === -1) {
        library = assessment.globalDeployment!;
      }
      library = JSON.parse(JSON.stringify(library));
      assignToPath(pathToLibrary, library, assessment);
    } else {
      assignToPath(pathToLibrary, emptyLibrary(), assessment);
    }
    updateAssessment(assessment);
  };

  const deploymentTab = () => {
    const deployment = getValueFromPath(pathToLibrary, assessment) as Library;
    return (
      <div>
        <Divider />
        Interpreter:
        <br />
        <DeploymentLanguageSelect chapter={deployment.chapter} onSelect={handleChapterSelect} />
      </div>
    );
  };

  if (!isOptionalDeployment) {
    return (
      <div>
        {label + ' Deployment'}
        <br />
        {deploymentTab()}
      </div>
    );
  }
  return (
    <div>
      <Switch
        checked={!isEmptyLibrary()}
        label={'Enable ' + label + ' Deployment'}
        onChange={handleSwitchDeployment}
      />
      {isEmptyLibrary() ? null : deploymentTab()}
    </div>
  );
}

export default DeploymentTab;
