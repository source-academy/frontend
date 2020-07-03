import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { updateAssessment } from '../../actions/session';
import { IAssessment } from '../../components/assessment/assessmentShape';
import { ImportFromFileComponent } from '../../components/missionControl/ImportFromFileComponent';

interface IDispatchProps {
  newAssessment: (assessment: IAssessment) => void;
}

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportFromFileComponent);
