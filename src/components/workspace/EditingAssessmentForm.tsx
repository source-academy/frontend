import { IAssessment } from "../assessment/assessmentShape";

import * as React from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import { updateAssessment } from "../../actions/session";
import EditingAssessment from './EditingAssessment';

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
}

const divStyle = {
    "display": "flex",
    "flex-direction": "column",
    "max-width": "70%",
    "overflow": 'auto' as 'auto',
    "background": "#2D3E50",
    "margin": "auto",
    "padding": "2em",
    "border-radius": "0.2em",
}

export class EditingAssessmentForm extends React.Component<IProps, IState> {
    public constructor(props: any) {
        super(props)
        this.state = {
            assessment: null,
        }
    }

    public componentDidMount(){
        const assessment = localStorage.getItem("MissionEditingAssessmentSA");
        if (assessment) {
            this.setState({ assessment: JSON.parse(assessment) });
        }
    }

    public render() {
        return <div style={divStyle}>
            {(this.state.assessment) 
                ? this.objToForm(this.state.assessment!.questions, this.props.path.concat(["questions"]), ["library"]) 
                : undefined}
        </div>;
    }

    private objToForm: any = (obj: any, path: Array<(string | number)>, blacklist: Array<(string | number)>) => {
        if (obj) {
            return Object.keys(obj).map(key => {
                if (blacklist.indexOf(key) < 0) {
                    if (typeof obj[key] !== 'object') {
                        return <React.Fragment>
                            <tr>
                                <td>{key}</td> 
                                <td><EditingAssessment path={path.concat([key])} assessment={this.state.assessment}/></td>
                            </tr>
                        </React.Fragment>
                    } else {
                        return <React.Fragment key={path[path.length - 1]}> 
                            <table>
                                <td>{path[path.length - 1]}</td>
                                <td>{this.objToForm(obj[key], path.concat([key]), blacklist)}</td>
                            </table>
                        </React.Fragment>
                    }
                } else {
                    return undefined;
                }
            });
        } else {
            return undefined;
        }
    }

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
}

export default connect(mapStateToProps, mapDispatchToProps)(EditingAssessmentForm)