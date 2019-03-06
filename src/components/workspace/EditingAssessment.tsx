import { IAssessment } from "../assessment/assessmentShape";

import * as React from 'react'
// import AceEditor from "react-ace";
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { updateAssessment } from "../../actions/session";

export interface IDispatchProps {
    newAssessment: (assessment: IAssessment) => void
}
  
const mapStateToProps: MapStateToProps<{}, any, {}> = (_, ownProps) => ownProps

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
    bindActionCreators(
        {
        newAssessment: updateAssessment,
        },
        dispatch
    )

interface IProps {
    assessment: IAssessment,
    path: Array<(string | number)>,
    newAssessment: (assessment: IAssessment) => void,
}

interface IState {
    fieldValue: string,
}

export class EditingAssessment extends React.Component<IProps, IState> {
    public constructor(props: any) {
        super(props)
        this.state = {
            fieldValue: this.pathToField(0, this.props.path, this.props.assessment),
        }
    }

    public render() {
        return <div onClick={this.saveAssessment(this.props.path)} onBlur={this.saveAssessment(this.props.path)}>
                <textarea value={this.state.fieldValue}
                          onChange={this.handleEditingAssessment} 
                          onBlur={this.saveAssessment(this.props.path)}
                />      
        </div>;
    }

    private saveAssessment = (path: any) => (e: any) => {
        const assessment = this.props.assessment
        this.assignFieldToPath(0, path, assessment, this.state.fieldValue)
        // const maxGrade: number = assessment.questions.map(qn => qn.maxGrade).reduce((acc, grade) => acc + grade);
        // assessment.maxGrade = maxGrade;
        // tslint:disable-next-line:no-console
        console.log(assessment);
        localStorage.setItem('MissionEditingAssessmentSA', JSON.stringify(assessment));
        if (assessment) {
            this.props.newAssessment(assessment)
        }
    }
    
    private handleEditingAssessment = (e: any) => this.setState({ fieldValue: e.target.value })

    private pathToField: any = (i: number, path: any, obj: any) => {
        return path.length < i 
                ? obj 
                : path.length - 1 === i ? obj[path[i]] : this.pathToField(i + 1, path, obj[path[i]])
    }

    private assignFieldToPath: any = (i: number, path: any, obj: any, value: any) => {
        if (path.length - 1 === i) {
            obj[path[i]] = value
        } else {
            this.assignFieldToPath(i + 1, path, obj[path[i]], value)
        } 
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditingAssessment)