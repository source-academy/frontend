import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitGrading, submitGradingAndContinue } from 'src/actions';
import GradingEditor, { DispatchProps } from 'src/components/academy/grading/GradingEditor';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingSave: submitGrading,
      handleGradingSaveAndContinue: submitGradingAndContinue
    },
    dispatch
  );

const GradingEditorContainer = connect(
  null,
  mapDispatchToProps
)(GradingEditor);

export default GradingEditorContainer;
