import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  reautogradeAnswer,
  submitGrading,
  submitGradingAndContinue
} from '../../../../commons/application/actions/SessionActions';
import GradingEditor, { DispatchProps } from './GradingEditor';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleGradingSave: submitGrading,
      handleGradingSaveAndContinue: submitGradingAndContinue,
      handleReautogradeAnswer: reautogradeAnswer
    },
    dispatch
  );

const GradingEditorContainer = connect(null, mapDispatchToProps)(GradingEditor);

export default GradingEditorContainer;
