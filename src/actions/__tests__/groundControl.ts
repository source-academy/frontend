import * as actionTypes from '../actionTypes';
import {
  changeDateAssessment,
  deleteAssessment,
  publishAssessment,
  uploadAssessment
} from '../groundControl';

test('changeDateAssessment generates correct action object', () => {
  const id = 10;
  const openAt = '2020-01-01T00:00:00.000Z';
  const closeAt = '2021-01-01T00:00:00.000Z';
  const action = changeDateAssessment(id, openAt, closeAt);
  expect(action).toEqual({
    type: actionTypes.CHANGE_DATE_ASSESSMENT,
    payload: {
      id,
      openAt,
      closeAt
    }
  });
});

test('deleteAssessment generates correct action object', () => {
  const id = 12;
  const action = deleteAssessment(id);
  expect(action).toEqual({
    type: actionTypes.DELETE_ASSESSMENT,
    payload: id
  });
});

test('publishAssessment generates correct action object', () => {
  const id = 54;
  const togglePublishTo = false;
  const action = publishAssessment(togglePublishTo, id);
  expect(action).toEqual({
    type: actionTypes.PUBLISH_ASSESSMENT,
    payload: {
      togglePublishTo,
      id
    }
  });
});

test(' generates correct action object', () => {
  const file = new File([''], 'testFile');
  const forceUpdate = true;
  const action = uploadAssessment(file, forceUpdate);
  expect(action).toEqual({
    type: actionTypes.UPLOAD_ASSESSMENT,
    payload: {
      file,
      forceUpdate
    }
  });
});
