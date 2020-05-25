import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { updateAssessment } from 'src/actions/session';
import { IAssessment } from 'src/commons/assessment/AssessmentTypes';
import MissionCreator from './MissionCreatorComponent';

interface IMissionCreatorDispatchProps {
  newAssessment: (assessment: IAssessment) => void;
}

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<IMissionCreatorDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MissionCreator);
