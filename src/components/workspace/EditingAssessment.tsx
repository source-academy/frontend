import { IAssessment } from "../assessment/assessmentShape";

import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import {
    Button,
    // Card,
    // Elevation,
    // Icon,
    // IconName,
    Intent,
    // Text,
  } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { updateAssessment } from "../../actions/session";

// import * as React from 'react'
// import { NavLink } from 'react-router-dom'
// import Textarea from 'react-textarea-autosize';

// import { IAssessmentOverview, IQuestion, IAssessment } from '../assessment/assessmentShape'
// import { controlButton } from '../commons'

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
    path: Array<(string | number)>,
    newAssessment: (assessment: IAssessment) => void,
}

interface IState {
    assessment: IAssessment | null,
    fieldValue: string,
    isVisible: boolean,
}

// const textareaStyle = {
//     "height": "100%",
//     "width": "100%",
//     "overflow": "hidden" as "hidden",
//     "resize": "none" as "none"
// }

export class EditingAssessment extends React.Component<IProps, IState> {
    public constructor(props: any) {
        super(props)
        this.state = {
            assessment: null,
            fieldValue: '',
            isVisible: false,
        }
    }

    public componentDidMount(){
        const assessment = localStorage.getItem("MissionEditingAssessmentSA");
        if (assessment) {
            this.setState({ assessment: JSON.parse(assessment) });
        }
    }

    public render() {
        return <div onClick={this.toggleAssessmentField(this.props.path)}>
            {
                this.state.isVisible 
                    ? <input type="text" value={this.state.fieldValue} onChange={this.handleEditingAssessment} onBlur={this.saveAssessment(this.props.path)}/>
                    : this.makeEditButton() 
            }
        </div>;
    }

    // private makeEditingAssessmentTextarea = () => 
    //     <Textarea
    //         autoFocus={true}
    //         style={textareaStyle}
    //         onChange={this.handleEditingAssessment}
    //         onBlur={this.saveAssessment(this.props.path)}
    //         value={this.state.fieldValue}
    //         onClick={this.toggleAssessmentField(this.props.path)}
    //     />

    private toggleVisible = (e: any) => {
        this.setState((state, props) => ({ isVisible: !this.state.isVisible }));
    }

    private makeEditButton = () => (
        <Button
        // disabled={overview.status !== AssessmentStatuses.attempted}
        icon={IconNames.CONFIRM}
        intent={Intent.DANGER}
        minimal={true}
        // intentional: each menu renders own version of onClick
        // tslint:disable-next-line:jsx-no-lambda
        onClick={this.toggleVisible}
        >
        Edit {this.props.path[this.props.path.length - 1]}
        </Button>
    )

    private saveAssessment = (path: any) => (e: any) => {
        const assessment = this.state.assessment
        this.assignFieldToPath(0, path, assessment, this.state.fieldValue)
        // tslint:disable-next-line:no-console
        // console.log(assessment);
        localStorage.setItem('MissionEditingAssessmentSA', JSON.stringify(assessment));
        this.setState((state, props) => ({ isVisible: !this.state.isVisible }));
        if (assessment) {
            this.props.newAssessment(assessment)
            // tslint:disable-next-line:no-console
            console.log("updated");
        }
    }
    
    private handleEditingAssessment = (e: any) => this.setState({ fieldValue: e.target.value })

    private pathToField: any = (i: number, path: any, obj: any) => {
        return path.length - 1 === i ? obj[path[i]] : this.pathToField(i + 1, path, obj[path[i]])
    }

    private assignFieldToPath: any = (i: number, path: any, obj: any, value: any) => {
        if (path.length - 1 === i) {
            obj[path[i]] = value
        } else {
            this.assignFieldToPath(i + 1, path, obj[path[i]], value)
        } 
    }
    
    private toggleAssessmentField = (path: any) => (e: any) => {
        this.setState({
            fieldValue: this.pathToField(0, path, this.state.assessment)
        });
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditingAssessment)