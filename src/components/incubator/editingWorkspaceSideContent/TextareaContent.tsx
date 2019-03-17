import * as React from 'react';
import Textarea from 'react-textarea-autosize';

import { IAssessment } from '../../assessment/assessmentShape';
import Markdown from '../../commons/Markdown';
import { assignToPath, getValueFromPath } from './';

interface IProps {
  assessment: IAssessment;
  isNumber?: boolean;
  numberRange?: number[];
  path: Array<string | number>;
  useRawValue?: boolean;
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
    const filler = 'Please enter value (if applicable)';
    let display;
    if (this.state.isEditing) {
      display = <div onClick={this.toggleEditField()}>{this.makeEditingTextarea()}</div>;
    } else {
      const value = getValueFromPath(this.props.path, this.props.assessment);
      display = (
        <div onClick={this.toggleEditField()}>
          {this.state.useRawValue ? value : <Markdown content={value || filler} />}
        </div>
      );
    }
    return display;
  }

  private saveEditAssessment = (e: any) => {
    let fieldValue: number | string;
    if (this.state.isNumber) {
      const range = this.props.numberRange || [0];
      fieldValue = parseInt(this.state.fieldValue, 10);
      if (isNaN(fieldValue) || fieldValue < range[0]) {
        fieldValue = range[0];
      } else if (range.length > 1 && fieldValue > range[1]) {
        fieldValue = range[1];
      }
    } else {
      fieldValue = this.state.fieldValue;
    }
    const originalVal = getValueFromPath(this.props.path, this.props.assessment);
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
    const fieldVal = getValueFromPath(this.props.path, this.props.assessment) || '';
    this.setState({
      isEditing: true,
      fieldValue: typeof fieldVal === 'string' ? fieldVal : fieldVal.toString()
    });
  };
}

export default TextareaContent;
