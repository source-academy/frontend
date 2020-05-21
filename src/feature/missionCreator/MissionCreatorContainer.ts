import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { updateAssessment } from '../../actions/session';
import { IAssessment } from '../assessment/AssessmentTypes';
import MissionCreator from './MissionCreatorComponent';

interface IXMLReaderDispatchProps {
  newAssessment: (assessment: IAssessment) => void;
}

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<IXMLReaderDispatchProps, {}> = (dispatch: Dispatch<any>) =>
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
