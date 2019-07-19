import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { uploadMaterial } from '../../../actions/materials';
import { fetchGradingOverviews, unsubmitSubmission } from '../../../actions/session';
import Material, { IDispatchProps, IStateProps } from '../../../components/academy/materials';
import { IState } from '../../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  data: state.session.gradingOverviews
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleUnsubmitSubmission: unsubmitSubmission,
      handleUploadMaterial: uploadMaterial
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Material);
