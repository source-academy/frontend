import { connect, MapStateToProps } from 'react-redux'

import Profile, { StateProps } from '../components/dropdown/profile'
import { IState } from '../reducers/states'

// TODO: connect to actual state once backend implements these features
const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  grade: state.session.grade,
  maxGrade: undefined,
  maxXp: undefined,
  name: state.session.name,
  role: state.session.role,
  xp: undefined
})

export default connect(mapStateToProps)(Profile)
