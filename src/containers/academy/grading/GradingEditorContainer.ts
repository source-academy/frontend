import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitGrading } from '../../../actions';
import GradingEditor, { DispatchProps } from '../../../components/academy/grading/GradingEditor';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleGradingSave: submitGrading
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(GradingEditor);
