import * as React from 'react';
import Textarea from 'react-textarea-autosize';

import { IAssessment } from '../../assessment/assessmentShape';
import Markdown from '../../commons/Markdown';

interface IProps {
  assessment: IAssessment;
  filler?: string;
  isNumber?: boolean;
  path: Array<string | number>;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  isEditing: boolean;
  isNumber: boolean;
  fieldValue: string;
}

export class TextareaContent extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      isEditing: false,
      isNumber: this.props.isNumber || false,
      fieldValue: ""
    };
  }

  public render() {
  	let display;
  	if(this.state.isEditing) {
  		display = <div onClick={this.toggleEditField()}>
  			{this.makeEditingTextarea()}
  		</div>;
  	} else {
  		const value = getValueFromPath(this.props.path, this.props.assessment);
  		display = (<div onClick={this.toggleEditField()}>
  			{this.state.isNumber ? 
  				value : 
  				<Markdown content={value || this.props.filler || "Please enter value"} />
  			}
  		</div>);
  	}
   	return display;
  }

  private saveEditAssessment = (e: any) => {
    const fieldValue = this.state.isNumber ? parseInt(this.state.fieldValue, 10) : this.state.fieldValue;
    const assessmentVal = this.props.assessment;
    assignToPath(this.props.path, fieldValue, assessmentVal);
    this.setState({
      isEditing: false
    });
    this.props.updateAssessment(assessmentVal);
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


const getValueFromPath = (path: Array<string | number>, obj: any): any => {
  for (const next of path) {
    obj = obj[next];
  }
  return obj;
};

const assignToPath: any = (path: Array<string | number>, value: any, obj: any): void => {
  let i = 0;
  for (i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
};

export default TextareaContent;