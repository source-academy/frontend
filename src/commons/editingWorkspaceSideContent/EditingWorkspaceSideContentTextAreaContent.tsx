import React, { useState } from 'react';
import Textarea from 'react-textarea-autosize';

import { Assessment } from '../assessment/AssessmentTypes';
import Markdown from '../Markdown';
import { assignToPath, getValueFromPath } from './EditingWorkspaceSideContentHelper';

type TextAreaContentProps = DispatchProps & StateProps;

type DispatchProps = {
  processResults?: (newVal: string | number) => string | number;
  updateAssessment: (assessment: Assessment) => void;
};

type StateProps = {
  assessment: Assessment;
  isNumber?: boolean;
  path: Array<string | number>;
  useRawValue?: boolean;
};

export const TextAreaContent: React.FC<TextAreaContentProps> = props => {
  const isNumberVal = props.isNumber || false;

  const [isEditing, setIsEditing] = useState(false);
  const [isNumber] = useState(isNumberVal);
  const [fieldValue, setFieldValue] = useState('');
  const [useRawValue] = useState(props.useRawValue || isNumberVal);

  const saveEditAssessment = (e: any) => {
    let parsedFieldValue: number | string;
    if (isNumber) {
      parsedFieldValue = parseInt(fieldValue, 10);
      if (isNaN(parsedFieldValue)) {
        parsedFieldValue = getValueFromPath(props.path, props.assessment);
      }
    } else {
      parsedFieldValue = fieldValue;
    }
    const originalVal = getValueFromPath(props.path, props.assessment);
    if (props.processResults) {
      parsedFieldValue = props.processResults(parsedFieldValue);
    }
    if (parsedFieldValue !== originalVal) {
      const assessmentVal = props.assessment;
      assignToPath(props.path, parsedFieldValue, assessmentVal);
      props.updateAssessment(assessmentVal);
    }

    setIsEditing(false);
  };

  const handleEditAssessment = (e: any) => {
    setFieldValue(e.target.value);
  };

  const makeEditingTextarea = () => (
    <Textarea
      autoFocus={true}
      className="editing-textarea"
      onChange={handleEditAssessment}
      onBlur={saveEditAssessment}
      value={fieldValue}
    />
  );

  const toggleEditField = () => (e: any) => {
    if (!isEditing) {
      const fieldVal = getValueFromPath(props.path, props.assessment) || '';
      setIsEditing(true);
      setFieldValue(typeof fieldVal === 'string' ? fieldVal : fieldVal.toString());
    }
  };

  let display;
  if (isEditing) {
    display = makeEditingTextarea();
  } else {
    const filler = 'Please enter value (if applicable)';
    let value = getValueFromPath(props.path, props.assessment);
    if (!props.isNumber) {
      value = value || '';
      value = value.match(/^\s*$/) ? filler : value;
    }
    if (useRawValue) {
      display = value;
    } else {
      display = <Markdown content={value} />;
    }
  }
  return <div onClick={toggleEditField()}>{display}</div>;
};

export default TextAreaContent;
