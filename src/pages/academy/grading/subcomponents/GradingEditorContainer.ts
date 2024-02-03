import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import GradingEditor from './GradingEditor';

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const GradingEditorContainer = connect(null, mapDispatchToProps)(GradingEditor);

export default GradingEditorContainer;
