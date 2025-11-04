import { Context } from 'js-slang';
import { Variant } from 'js-slang/dist/types';
import { call } from 'redux-saga/effects';

import {
  getBlockExtraMethodsString,
  getBlockExtraMethodsStringTypedVariant,
  getDifferenceInMethods,
  getStoreExtraMethodsString
} from '../../../utils/JsSlangHelper';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { evalCodeSaga } from './evalCode';

export function* blockExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  unblockKey?: string
) {
  // Extract additional methods available in the elevated context relative to the context
  const toBeBlocked = getDifferenceInMethods(elevatedContext, context);
  if (unblockKey) {
    const storeValues = getStoreExtraMethodsString(toBeBlocked, unblockKey);
    const storeValuesFilePath = '/storeValues.js';
    const storeValuesFiles = {
      [storeValuesFilePath]: storeValues
    };
    yield call(
      evalCodeSaga,
      storeValuesFiles,
      storeValuesFilePath,
      elevatedContext,
      execTime,
      EVAL_SILENT,
      workspaceLocation
    );
  }

  const nullifier =
    context.variant === Variant.TYPED
      ? getBlockExtraMethodsStringTypedVariant(toBeBlocked)
      : getBlockExtraMethodsString(toBeBlocked);
  const nullifierFilePath = '/nullifier.js';
  const nullifierFiles = {
    [nullifierFilePath]: nullifier
  };
  yield call(
    evalCodeSaga,
    nullifierFiles,
    nullifierFilePath,
    elevatedContext,
    execTime,
    EVAL_SILENT,
    workspaceLocation
  );
}
