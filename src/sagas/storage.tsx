import { SagaIterator } from 'redux-saga'

export function* storageSaga(): SagaIterator {
  // yield takeLatest(actionTypes.SAVE_TO_DRIVE, function*() {
  //   const code = yield select((state: IState) => state.workspaces.playground.editorValue)
  //   const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter)
  //   const external = yield select((state: IState) => state.workspaces.playground.playgroundExternal)
  //
  //   const token = yield select((state: IState) => state.session.storageToken)
  //
  //   // tslint:disable-next-line:no-console
  //   console.log(`${code} ${chapter} ${external} ${token}`)
  //   // const newQueryString =
  //   //   code === '' || code === defaultEditorValue
  //   //     ? undefined
  //   //     : qs.stringify({
  //   //       prgrm: compressToEncodedURIComponent(code),
  //   //       chap: chapter,
  //   //       ext: external
  //   //     })
  //   // // yield put(actions.changeQueryString(newQueryString))
  // })
}

export default storageSaga
