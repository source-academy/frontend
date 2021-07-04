import {
  Button,
  Card,
  Classes,
  Dialog,
  Elevation,
  H3,
  H4,
  H6,
  Icon,
  Intent,
  MenuItem,
  Text
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import Textarea from 'react-textarea-autosize';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import { AssessmentOverview, AssessmentType } from '../assessment/AssessmentTypes';
import controlButton from '../ControlButton';
import Markdown from '../Markdown';
import Constants from '../utils/Constants';
import { getPrettyDate } from '../utils/DateHelper';
import { assessmentTypeLink } from '../utils/ParamParseHelper';
import { exportXml, storeLocalAssessmentOverview } from '../XMLParser/XMLParserHelper';

type EditingOverviewCardProps = DispatchProps & StateProps;

type DispatchProps = {
  updateEditingOverview: (overview: AssessmentOverview) => void;
};

type StateProps = {
  listingPath?: string;
  overview: AssessmentOverview;
  assessmentTypes: AssessmentType[];
};

type State = {
  editingOverviewField: string;
  fieldValue: any;
  showOptionsOverlay: boolean;
};

export class EditingOverviewCard extends React.Component<EditingOverviewCardProps, State> {
  public constructor(props: EditingOverviewCardProps) {
    super(props);
    this.state = {
      editingOverviewField: '',
      fieldValue: '',
      showOptionsOverlay: false
    };
  }

  public render() {
    return (
      <div>
        {this.optionsOverlay()}
        {this.makeEditingOverviewCard(this.props.overview)}
      </div>
    );
  }

  private saveEditOverview = (field: keyof AssessmentOverview) => (e: any) => {
    const overview = {
      ...this.props.overview,
      [field]: this.state.fieldValue
    };
    this.setState({
      editingOverviewField: '',
      fieldValue: ''
    });
    storeLocalAssessmentOverview(overview);
    this.props.updateEditingOverview(overview);
  };

  private handleEditOverview = () => (e: any) => {
    this.setState({
      fieldValue: e.target.value
    });
  };

  private toggleEditField = (field: keyof AssessmentOverview) => (e: any) => {
    if (this.state.editingOverviewField !== field) {
      this.setState({
        editingOverviewField: field,
        fieldValue: this.props.overview[field]
      });
    }
  };

  private toggleOptionsOverlay = () => {
    this.setState({
      showOptionsOverlay: !this.state.showOptionsOverlay
    });
  };

  private handleExportXml = (e: any) => {
    exportXml();
  };

  private makeEditingOverviewTextarea = (field: keyof AssessmentOverview) => (
    <Textarea
      autoFocus={true}
      className={'editing-textarea'}
      onChange={this.handleEditOverview()}
      onBlur={this.saveEditOverview(field)}
      value={this.state.fieldValue}
    />
  );

  private makeEditingOverviewCard = (overview: AssessmentOverview) => (
    <div>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className="col-xs-3 listing-picture" onClick={this.toggleEditField('coverImage')}>
          {this.state.editingOverviewField === 'coverImage' ? (
            this.makeEditingOverviewTextarea('coverImage')
          ) : (
            <img
              alt="Assessment cover"
              className={`cover-image-${overview.status}`}
              src={overview.coverImage ? overview.coverImage : defaultCoverImage}
            />
          )}
        </div>

        <div className="col-xs-9 listing-text">
          {this.makeEditingOverviewCardTitle(overview, overview.title)}
          <div className="row listing-xp">
            <H6> {`Max XP: ${overview.maxXp}`} </H6>
          </div>
          <div className="row listing-description" onClick={this.toggleEditField('shortSummary')}>
            {this.state.editingOverviewField === 'shortSummary' ? (
              this.makeEditingOverviewTextarea('shortSummary')
            ) : (
              <Markdown content={createPlaceholder(overview.shortSummary)} />
            )}
          </div>
          <div className="listing-controls">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              <div className="date-container">Opens at:&nbsp;</div>
              <div className="date-container" onClick={this.toggleEditField('openAt')}>
                {this.state.editingOverviewField === 'openAt'
                  ? this.makeEditingOverviewTextarea('openAt')
                  : `${getPrettyDate(overview.openAt)}`}
              </div>

              <div className="date-container">&nbsp;&nbsp;Due:&nbsp;</div>
              <div className="date-container" onClick={this.toggleEditField('closeAt')}>
                {this.state.editingOverviewField === 'closeAt'
                  ? this.makeEditingOverviewTextarea('closeAt')
                  : `${getPrettyDate(overview.closeAt)}`}
              </div>
            </Text>
            {this.makeOptionsButton()}
            {makeOverviewCardButton(overview, this.props.listingPath)}
          </div>
        </div>
      </Card>
    </div>
  );

  private makeEditingOverviewCardTitle = (overview: AssessmentOverview, title: string) => (
    <div className="row listing-title">
      <Text ellipsize={true} className={'col-xs-10'}>
        <H4 onClick={this.toggleEditField('title')}>
          {this.state.editingOverviewField === 'title'
            ? this.makeEditingOverviewTextarea('title')
            : createPlaceholder(title)}
        </H4>
      </Text>
      <div className="col-xs-2">{this.makeExportButton(overview)}</div>
    </div>
  );

  private makeExportButton = (overview: AssessmentOverview) => (
    <Button
      icon={IconNames.EXPORT}
      intent={Intent.DANGER}
      minimal={true}
      // intentional: each menu renders own version of onClick
      // tslint:disable-next-line:jsx-no-lambda
      onClick={this.handleExportXml}
    >
      Save as XML
    </Button>
  );

  private makeOptionsButton = () => (
    <Button icon={IconNames.WRENCH} minimal={true} onClick={this.toggleOptionsOverlay}>
      Other Options
    </Button>
  );

  private saveCategory = (i: AssessmentType, e: any) => {
    const overview = {
      ...this.props.overview,
      category: i
    };
    storeLocalAssessmentOverview(overview);
    this.props.updateEditingOverview(overview);
  };

  private optionsOverlay = () => (
    <Dialog
      canOutsideClickClose={false}
      className="assessment-reset"
      icon={IconNames.WRENCH}
      isCloseButtonShown={true}
      isOpen={this.state.showOptionsOverlay}
      onClose={this.toggleOptionsOverlay}
      title="Other options"
    >
      <div className={Classes.DIALOG_BODY}>
        <H3>Assessment Type</H3>
        {this.assessmentTypeSelect(this.props.overview.type, this.saveCategory)}
        <H3>Number</H3>
        <div onClick={this.toggleEditField('number')}>
          {this.state.editingOverviewField === 'number'
            ? this.makeEditingOverviewTextarea('number')
            : createPlaceholder(this.props.overview.number || '')}
        </div>
        <H3>Story</H3>
        <div onClick={this.toggleEditField('story')}>
          {this.state.editingOverviewField === 'story'
            ? this.makeEditingOverviewTextarea('story')
            : createPlaceholder(this.props.overview.story || '')}
        </div>
        <br />
        <H3>Filename</H3>
        <div onClick={this.toggleEditField('fileName')}>
          {this.state.editingOverviewField === 'fileName'
            ? this.makeEditingOverviewTextarea('fileName')
            : createPlaceholder(this.props.overview.fileName || '')}
        </div>
      </div>
    </Dialog>
  );

  private assessmentTypeSelect = (
    assessmentType: AssessmentType,
    handleSelect = (i: AssessmentType, e?: React.SyntheticEvent<HTMLElement>) => {}
  ) => (
    <AssessmentTypeSelectComponent
      className={Classes.MINIMAL}
      items={this.props.assessmentTypes}
      onItemSelect={handleSelect}
      itemRenderer={assessmentTypeRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={assessmentType}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </AssessmentTypeSelectComponent>
  );
}

const createPlaceholder = (str: string): string => {
  if (str.match('^(\n| )*$')) {
    return 'Enter Value Here (If Applicable)';
  } else {
    return str;
  }
};

const makeOverviewCardButton = (overview: AssessmentOverview, listingPath: string | undefined) => {
  const label: string = 'Edit mission';
  listingPath = listingPath || '/academy/' + assessmentTypeLink(overview.type);
  return (
    <NavLink to={listingPath + `/${overview.id.toString()}/${Constants.defaultQuestionId}`}>
      {controlButton(label, IconNames.EDIT)}
    </NavLink>
  );
};

const AssessmentTypeSelectComponent = Select.ofType<AssessmentType>();

const assessmentTypeRenderer: ItemRenderer<AssessmentType> = (
  assessmentType,
  { handleClick, modifiers, query }
) => <MenuItem active={false} key={assessmentType} onClick={handleClick} text={assessmentType} />;
