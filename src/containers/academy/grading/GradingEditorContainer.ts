import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitGrading, submitGradingAndContinue } from '../../../actions';
import GradingEditor, { DispatchProps } from '../../../components/academy/grading/GradingEditor';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleGradingSave: submitGrading,
      handleGradingSaveAndContinue: submitGradingAndContinue
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(GradingEditor);
