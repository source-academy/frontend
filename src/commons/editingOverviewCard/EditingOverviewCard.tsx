import {
  Button,
  Card,
  Classes,
  Dialog,
  DialogBody,
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
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Textarea from 'react-textarea-autosize';

import defaultCoverImage from '../../assets/default_cover_image.jpg';
import { AssessmentOverview, AssessmentType } from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import Markdown from '../Markdown';
import Constants from '../utils/Constants';
import { getPrettyDate } from '../utils/DateHelper';
import { exportXml, storeLocalAssessmentOverview } from '../XMLParser/XMLParserHelper';

type EditingOverviewCardProps = DispatchProps & StateProps;

type DispatchProps = {
  updateEditingOverview: (overview: AssessmentOverview) => void;
};

type StateProps = {
  listingPath: string;
  overview: AssessmentOverview;
  assessmentTypes: AssessmentType[];
};

export const EditingOverviewCard: React.FC<EditingOverviewCardProps> = props => {
  const [editingOverviewField, setEditingOverviewField] = useState('');
  const [fieldValue, setFieldValue] = useState<any>('');
  const [showOptionsOverlay, setShowOptionsOverlay] = useState(false);

  const saveEditOverview = (field: keyof AssessmentOverview) => (e: any) => {
    const overview = {
      ...props.overview,
      [field]: fieldValue
    };
    setEditingOverviewField('');
    setFieldValue('');
    storeLocalAssessmentOverview(overview);
    props.updateEditingOverview(overview);
  };

  const handleEditOverview = (e: any) => {
    setFieldValue(e.target.value);
  };

  const toggleEditField = (field: keyof AssessmentOverview) => (e: any) => {
    if (editingOverviewField !== field) {
      setEditingOverviewField(field);
      setFieldValue(props.overview[field]);
    }
  };

  const toggleOptionsOverlay = () => {
    setShowOptionsOverlay(!showOptionsOverlay);
  };

  const handleExportXml = (e: any) => {
    exportXml();
  };

  const makeEditingOverviewTextarea = (field: keyof AssessmentOverview) => (
    <Textarea
      autoFocus={true}
      className={'editing-textarea'}
      onChange={handleEditOverview}
      onBlur={saveEditOverview(field)}
      value={fieldValue}
    />
  );

  const makeEditingOverviewCard = (overview: AssessmentOverview) => (
    <div>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className="col-xs-3 listing-picture" onClick={toggleEditField('coverImage')}>
          {editingOverviewField === 'coverImage' ? (
            makeEditingOverviewTextarea('coverImage')
          ) : (
            <img
              alt="Assessment cover"
              className={`cover-image-${overview.status}`}
              src={overview.coverImage ? overview.coverImage : defaultCoverImage}
            />
          )}
        </div>

        <div className="col-xs-9 listing-text">
          {makeEditingOverviewCardTitle(overview, overview.title)}
          <div className="row listing-xp">
            <H6> {`Max XP: ${overview.maxXp}`} </H6>
          </div>
          <div className="row listing-description" onClick={toggleEditField('shortSummary')}>
            {editingOverviewField === 'shortSummary' ? (
              makeEditingOverviewTextarea('shortSummary')
            ) : (
              <Markdown content={createPlaceholder(overview.shortSummary)} />
            )}
          </div>
          <div className="listing-controls">
            <Text className="listing-due-date">
              <Icon className="listing-due-icon" iconSize={12} icon={IconNames.TIME} />
              <div className="date-container">Opens at:&nbsp;</div>
              <div className="date-container" onClick={toggleEditField('openAt')}>
                {editingOverviewField === 'openAt'
                  ? makeEditingOverviewTextarea('openAt')
                  : `${getPrettyDate(overview.openAt)}`}
              </div>

              <div className="date-container">&nbsp;&nbsp;Due:&nbsp;</div>
              <div className="date-container" onClick={toggleEditField('closeAt')}>
                {editingOverviewField === 'closeAt'
                  ? makeEditingOverviewTextarea('closeAt')
                  : `${getPrettyDate(overview.closeAt)}`}
              </div>
            </Text>
            <Button icon={IconNames.WRENCH} minimal={true} onClick={toggleOptionsOverlay}>
              Other Options
            </Button>
            <NavLink
              to={`${props.listingPath}/${overview.id.toString()}/${Constants.defaultQuestionId}`}
            >
              <ControlButton label="Edit mission" icon={IconNames.EDIT} />
            </NavLink>
          </div>
        </div>
      </Card>
    </div>
  );

  const makeEditingOverviewCardTitle = (overview: AssessmentOverview, title: string) => (
    <div className="row listing-title">
      <Text ellipsize={true} className={'col-xs-10'}>
        <H4 onClick={toggleEditField('title')}>
          {editingOverviewField === 'title'
            ? makeEditingOverviewTextarea('title')
            : createPlaceholder(title)}
        </H4>
      </Text>
      <div className="col-xs-2">{makeExportButton(overview)}</div>
    </div>
  );

  const makeExportButton = (overview: AssessmentOverview) => (
    <Button icon={IconNames.EXPORT} intent={Intent.DANGER} minimal={true} onClick={handleExportXml}>
      Save as XML
    </Button>
  );

  const saveCategory = (i: AssessmentType, e: any) => {
    const overview = {
      ...props.overview,
      category: i
    };
    storeLocalAssessmentOverview(overview);
    props.updateEditingOverview(overview);
  };

  const optionsOverlay = () => (
    <Dialog
      canOutsideClickClose={false}
      className="assessment-reset"
      icon={IconNames.WRENCH}
      isCloseButtonShown={true}
      isOpen={showOptionsOverlay}
      onClose={toggleOptionsOverlay}
      title="Other options"
    >
      <DialogBody>
        <H3>Assessment Type</H3>
        {assessmentTypeSelect(props.overview.type, saveCategory)}
        <H3>Number</H3>
        <div onClick={toggleEditField('number')}>
          {editingOverviewField === 'number'
            ? makeEditingOverviewTextarea('number')
            : createPlaceholder(props.overview.number || '')}
        </div>
        <H3>Story</H3>
        <div onClick={toggleEditField('story')}>
          {editingOverviewField === 'story'
            ? makeEditingOverviewTextarea('story')
            : createPlaceholder(props.overview.story || '')}
        </div>
        <br />
        <H3>Filename</H3>
        <div onClick={toggleEditField('fileName')}>
          {editingOverviewField === 'fileName'
            ? makeEditingOverviewTextarea('fileName')
            : createPlaceholder(props.overview.fileName || '')}
        </div>
      </DialogBody>
    </Dialog>
  );

  const assessmentTypeSelect = (
    assessmentType: AssessmentType,
    handleSelect = (i: AssessmentType, e?: React.SyntheticEvent<HTMLElement>) => {}
  ) => (
    <AssessmentTypeSelectComponent
      className={Classes.MINIMAL}
      items={props.assessmentTypes}
      onItemSelect={handleSelect}
      itemRenderer={assessmentTypeRenderer}
      filterable={false}
    >
      <Button minimal text={assessmentType} rightIcon={IconNames.DOUBLE_CARET_VERTICAL} />
    </AssessmentTypeSelectComponent>
  );

  return (
    <div>
      {optionsOverlay()}
      {makeEditingOverviewCard(props.overview)}
    </div>
  );
};

const createPlaceholder = (str: string): string => {
  if (str.match('^(\n| )*$')) {
    return 'Enter Value Here (If Applicable)';
  } else {
    return str;
  }
};

const AssessmentTypeSelectComponent = Select.ofType<AssessmentType>();

const assessmentTypeRenderer: ItemRenderer<AssessmentType> = (
  assessmentType,
  { handleClick, modifiers, query }
) => <MenuItem active={false} key={assessmentType} onClick={handleClick} text={assessmentType} />;
