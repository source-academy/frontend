import { Drawer, DrawerSize, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import SessionActions from '../application/actions/SessionActions';
import { AssessmentStatuses, AssessmentType } from '../assessment/AssessmentTypes';
import Constants from '../utils/Constants';
import { useSession } from '../utils/Hooks';
import ProfileCard from './ProfileCard';

export type ProfileProps = OwnProps;

type OwnProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Profile: React.FC<ProfileProps> = props => {
  // FIXME: `xp` is actually of type number | undefined here!
  // Fix the session type, then remove the typecast below
  const {
    isLoggedIn,
    isEnrolledInACourse,
    name,
    role,
    assessmentOverviews,
    assessmentConfigurations,
    xp,
    courseId
  } = useSession();

  const dispatch = useDispatch();
  useEffect(() => {
    if (isLoggedIn && isEnrolledInACourse && !assessmentOverviews) {
      // If assessment overviews are not loaded, fetch them
      dispatch(SessionActions.fetchAssessmentOverviews());
    }
  }, [assessmentOverviews, dispatch, isLoggedIn, isEnrolledInACourse, xp]);

  useEffect(() => {
    if (isEnrolledInACourse && !xp) {
      dispatch(SessionActions.fetchTotalXp());
    }
  }, [isEnrolledInACourse, dispatch, xp]);

  const [isLoaded, setIsLoaded] = useState(
    isLoggedIn && isEnrolledInACourse && assessmentOverviews
  );

  useEffect(() => {
    setIsLoaded(isLoggedIn && isEnrolledInACourse && assessmentOverviews);
  }, [assessmentOverviews, isLoggedIn, isEnrolledInACourse]);

  // Render
  let content: JSX.Element;

  if (!isLoaded) {
    content = <NonIdealState description="Loading..." icon={<Spinner />} />;
  } else {
    // Check if there are any closed assessments, else render a placeholder <div>
    const numClosed = assessmentOverviews!.filter(
      item => item.status === AssessmentStatuses.submitted
    ).length;

    const userXp = xp || 0;
    const caFulfillmentLevel = Constants.caFulfillmentLevel;
    const fullXp = caFulfillmentLevel * 1000;

    const userDetails = (
      <div className="profile-header">
        <div className="profile-username">
          <div className="name">{name}</div>
          <div className="role">{role}</div>
        </div>
      </div>
    );

    if (numClosed === 0) {
      content = (
        <div className="profile-content">
          {userDetails}
          <div className="profile-placeholder" data-testid="profile-placeholder">
            There are no closed assessments to render grade and XP of.
          </div>
        </div>
      );
    } else {
      // Performs boundary checks if denominator is 0 or if it exceeds 1 (100%)
      const getFrac = (num: number, den: number): number => {
        return den <= 0 || num / den > 1 ? 1 : num / den;
      };

      // Given a fraction between 0 and 1 inclusive, returns a className to apply colour with CSS
      const parseColour = (frac: number): string => {
        return frac < 0
          ? ''
          : frac >= 0.8
            ? ' progress-steelblue'
            : frac >= 0.45
              ? ' progress-deepskyblue'
              : ' progress-skyblue';
      };

      // Given an assessment category, return its icon
      const renderIcon = (assessmentType: AssessmentType) => {
        const icons: IconName[] = [
          IconNames.FLAME,
          IconNames.LIGHTBULB,
          IconNames.PREDICTIVE_ANALYSIS,
          IconNames.COMPARISON,
          IconNames.MANUAL
        ];
        if (assessmentConfigurations) {
          const index = assessmentConfigurations.findIndex(c => c.type === assessmentType);

          // For rendering hidden assessments not visible to the student
          // e.g. studio participation marks
          return index > 0 ? icons[index] : IconNames.PULSE;
        } else {
          // Should never hit this case as there are no assessments, submissions or answers
          // if there are no assessmentTypes
          return IconNames.PULSE;
        }
      };

      // Build condensed assessment cards from an array of assessments
      const summaryCallouts = assessmentOverviews!
        .filter(item => item.isGradingPublished)
        .map((assessment, index) => {
          return (
            <ProfileCard
              key={index}
              item={assessment}
              getFrac={getFrac}
              parseColour={parseColour}
              renderIcon={renderIcon}
              courseId={courseId}
            />
          );
        });

      content = (
        <div className="profile-content">
          {userDetails}

          <div className="profile-progress" data-testid="profile-progress">
            <div className="profile-xp">
              <Spinner
                className={'profile-spinner' + parseColour(getFrac(userXp, fullXp))}
                size={144}
                value={getFrac(userXp, fullXp)}
                data-testid="profile-spinner"
              />
              <div className="type" data-testid="profile-type">
                XP Progress
              </div>
              <div className="total-value" data-testid="profile-total-value">
                {userXp} / {fullXp}*
              </div>
              <div className="percentage" data-testid="profile-percentage">
                {(getFrac(userXp, fullXp) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="profile-xp-footer">
            *{fullXp}XP needed to reach full CA level of {caFulfillmentLevel}
          </div>
          <div className="profile-callouts" data-testid="profile-callouts">
            {summaryCallouts}
          </div>
        </div>
      );
    }
  }

  return (
    <Drawer
      className="profile"
      icon={IconNames.USER}
      isCloseButtonShown={true}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="User Profile"
      position="left"
      size={DrawerSize.SMALL}
    >
      {content}
    </Drawer>
  );
};

export default Profile;
