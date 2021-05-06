import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { updateSicpChapter } from 'src/features/sicp/SicpActions';
import { SicpChapter } from 'src/features/sicp/SicpTypes';

import Sicp, { DispatchProps, StateProps } from './Sicp';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
    chapter: state.sicp.chapter!
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
bindActionCreators(
{
    handleChangeChapter: (chapter: SicpChapter) => updateSicpChapter(chapter)
},
dispatch
);

const SicpContainer = connect(mapStateToProps, mapDispatchToProps)(Sicp);

export default SicpContainer;
