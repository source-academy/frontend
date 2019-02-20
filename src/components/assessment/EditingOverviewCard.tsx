import {
  Button,
  Card,
  Elevation,
  Icon,
  IconName,
  Intent,
  Text,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'
import Textarea from 'react-textarea-autosize';

import defaultCoverImage from '../../assets/default_cover_image.jpg'
import { getPrettyDate } from '../../utils/dateHelpers'
import { assessmentCategoryLink } from '../../utils/paramParseHelpers'
import { exportXml } from '../../utils/xmlParser'

import { IAssessmentOverview } from '../assessment/assessmentShape'
import { controlButton } from '../commons'
import Markdown from '../commons/Markdown'

const DEFAULT_QUESTION_ID: number = 0

type Props = {
	overview: IAssessmentOverview,
	updateEditingOverview: (overview: IAssessmentOverview) => void
}

interface IState {
	editingOverviewField: string,
  fieldValue: any
}

const textareaStyle = {
	"height": "100%",
	"width": "100%",
  "overflow": "hidden" as "hidden",
  "resize": "none" as "none"
}

export class EditingOverviewCard extends React.Component<Props, IState> {
	public constructor(props: Props) {
    super(props)
    this.state = {
      editingOverviewField: '',
      fieldValue: ''
    }
  }

  public render() {
  	return <div>
  		{this.makeEditingOverviewCard(this.props.overview)}
  	</div>;
  }

  private saveEditOverview = (field: keyof IAssessmentOverview) => (e: any) =>{
    const overview = {
        ...this.props.overview,
      [field]: this.state.fieldValue
    }
  	this.setState({
      editingOverviewField: '',
      fieldValue:''
    })
    localStorage.setItem('MissionEditingOverviewSA', JSON.stringify(overview));
    this.props.updateEditingOverview(overview);
  }

  private handleEditOverview = () => (e: any) =>{
    this.setState({
      fieldValue:e.target.value
    })
  }
  
  private toggleEditField = (field: keyof IAssessmentOverview) => (e: any) => {
    this.setState({ 
      editingOverviewField: field,
      fieldValue: this.props.overview[field]
    })
  }

  private handleExportXml = () => (e: any) => {
    exportXml();
  }

  private makeEditingOverviewTextarea = (field: keyof IAssessmentOverview) => 
    <Textarea
      style={textareaStyle}
      onChange={this.handleEditOverview()}
      onBlur={this.saveEditOverview(field)}
      value={this.state.fieldValue}
    />

  private makeEditingOverviewCard = (
    overview: IAssessmentOverview
  ) => (
    <div>
      You can edit this card
      <Card className="row listing" elevation={Elevation.ONE}>

        <div className="col-xs-3 listing-picture" onClick={this.toggleEditField("coverImage")}>
          {this.state.editingOverviewField === 'coverImage' ? (
              this.makeEditingOverviewTextarea('coverImage')
          ) : (
            <img
              className={`cover-image-${overview.status}`}
              src={overview.coverImage ? overview.coverImage : defaultCoverImage}
            />
          )}
        </div>

        <div className="col-xs-9 listing-text">
          {this.makeEditingOverviewCardTitle(
            overview,
            overview.title
          )}
          <div className="row listing-grade">
            <h6>
              {' '}
              {`Max Grade: ${overview.maxGrade}`}
              {' '}
            </h6>
          </div>
          <div className="row listing-xp">
            <h6>
              {' '}
              {`Max XP: ${overview.maxXp}`}
              {' '}
            </h6>
          </div>
          <div className="row listing-description" onClick={this.toggleEditField('shortSummary')}>
          	{this.state.editingOverviewField === 'shortSummary' ? (
              this.makeEditingOverviewTextarea('shortSummary')
            ) : (
              <Markdown content={overview.shortSummary} />
            )}
        
          </div>
          <div className="listing-controls">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              <div className="date-container">Opens at:&nbsp;</div>
              <div className="date-container" onClick={this.toggleEditField("openAt")}>
                {this.state.editingOverviewField === "openAt" 
                ? this.makeEditingOverviewTextarea("openAt")
                : `${getPrettyDate(overview.openAt)}`}
              </div>

              <div className="date-container">&nbsp;&nbsp;Due:&nbsp;</div>
              <div className="date-container" onClick={this.toggleEditField("closeAt")}> 
                {this.state.editingOverviewField === "closeAt" 
                ? this.makeEditingOverviewTextarea("closeAt")
                : `${getPrettyDate(overview.closeAt)}`}
              </div>
            </Text>
            {makeOverviewCardButton(overview)}
          </div>
        </div>
      </Card>
    </div>
  )

  private makeEditingOverviewCardTitle = (
  	overview: IAssessmentOverview,
    title: string
  ) => (
    <div className="row listing-title">
      <Text ellipsize={true} className={'col-xs-10'}>
        <h4 onClick={this.toggleEditField("title")}>
          { this.state.editingOverviewField === 'title' 
            ? this.makeEditingOverviewTextarea('title')
            : title 
          }{' '}
        </h4>
      </Text>
      <div className="col-xs-2">{this.makeSubmissionButton(overview)}</div>
    </div>
  )

  private makeSubmissionButton = (
	  overview: IAssessmentOverview
	) => (
	  <Button
	    // disabled={overview.status !== AssessmentStatuses.attempted}
	    icon={IconNames.CONFIRM}
	    intent={Intent.DANGER}
	    minimal={true}
	    // intentional: each menu renders own version of onClick
	    // tslint:disable-next-line:jsx-no-lambda
	    onClick={this.handleExportXml()}
	  >
	    Export XML
	  </Button>
	)

}

const makeOverviewCardButton = (overview: IAssessmentOverview) => {
  const icon: IconName = IconNames.EDIT;
  const label: string = "Edit mission";
  return (
    <NavLink
      to={`/academy/${assessmentCategoryLink(
        overview.category
      )}/${overview.id.toString()}/${DEFAULT_QUESTION_ID}`}
    >
      {controlButton(label, icon)}
    </NavLink>
  )
}
