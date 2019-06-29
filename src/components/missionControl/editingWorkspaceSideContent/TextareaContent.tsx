import * as React from 'react';
import Textarea from 'react-textarea-autosize';

import { IAssessment } from '../../assessment/assessmentShape';
import Markdown from '../../commons/Markdown';
import { assignToPath, getValueFromPath } from './';

interface IProps {
  assessment: IAssessment;
  isNumber?: boolean;
  path: Array<string | number>;
  useRawValue?: boolean;
  processResults?: (newVal: string | number) => string | number;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  isEditing: boolean;
  isNumber: boolean;
  fieldValue: string;
  useRawValue: boolean;
}

export class TextareaContent extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    const isNumberVal = this.props.isNumber || false;
    this.state = {
      isEditing: false,
      isNumber: isNumberVal,
      fieldValue: '',
      useRawValue: this.props.useRawValue || isNumberVal
    };
  }

  public render() {
    let display;
    if (this.state.isEditing) {
      display = this.makeEditingTextarea();
    } else {
      const filler = 'Please enter value (if applicable)';
      let value = getValueFromPath(this.props.path, this.props.assessment);
      if (!this.props.isNumber) {
        value = value || '';
        value = value.match(/^\s*$/) ? filler : value;
      }
      if (this.state.useRawValue) {
        display = value;
      } else {
        display = <Markdown content={value} />;
      }
    }
    return <div onClick={this.toggleEditField()}>{display}</div>;
  }

  private saveEditAssessment = (e: any) => {
    let fieldValue: number | string;
    if (this.state.isNumber) {
      fieldValue = parseInt(this.state.fieldValue, 10);
      if (isNaN(fieldValue)) {
        fieldValue = getValueFromPath(this.props.path, this.props.assessment);
      }
    } else {
      fieldValue = this.state.fieldValue;
    }
    const originalVal = getValueFromPath(this.props.path, this.props.assessment);
    if (this.props.processResults) {
      fieldValue = this.props.processResults(fieldValue);
    }
    if (fieldValue !== originalVal) {
      const assessmentVal = this.props.assessment;
      assignToPath(this.props.path, fieldValue, assessmentVal);
      this.props.updateAssessment(assessmentVal);
    }

    this.setState({
      isEditing: false
    });
  };

  private handleEditAssessment = (e: any) => {
    this.setState({
      fieldValue: e.target.value
    });
  };

  private makeEditingTextarea = () => (
    <Textarea
      autoFocus={true}
      className={'editing-textarea'}
      onChange={this.handleEditAssessment}
      onBlur={this.saveEditAssessment}
      value={this.state.fieldValue}
    />
  );

  private toggleEditField = () => (e: any) => {
    if (!this.state.isEditing) {
      const fieldVal = getValueFromPath(this.props.path, this.props.assessment) || '';
      this.setState({
        isEditing: true,
        fieldValue: typeof fieldVal === 'string' ? fieldVal : fieldVal.toString()
      });
    }
  };
}

export default TextareaContent;
