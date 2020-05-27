import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  submitGrading,
  submitGradingAndContinue
} from '../../../../commons/application/actions/SessionActions';
import GradingEditor, { DispatchProps } from './GradingEditorComponent';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
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
