/* eslint-disable simple-import-sort/imports */
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessment } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import { Assessment} from '../assessment/AssessmentTypes';


// import { DispatchProps, OwnProps, StateProps } from '../assessmentWorkspace/AssessmentWorkspace';
import AchievementCommentCard from './AchievementCommentCard';

export type DispatchProps = {
    handleAssessmentFetch: (assessmentId: number) => void;
}

export type OwnProps = {
    assessmentId: number;
  };
  
  export type StateProps = {
    assessment?: Assessment;
  }
// src/commons/achievement/AchievementCommentCardContainer.ts
// src/commons/assessmentWorkspace/AssessmentWorkspace.tsx

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    assessment: state.session.assessments.get(props.assessmentId),
  };
};

// const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentFetch: fetchAssessment,
    },
    dispatch
  );

const AchievementCommentCardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementCommentCard);

export default AchievementCommentCardContainer;