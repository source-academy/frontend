import _ from 'lodash';
import { request } from 'src/commons/sagas/RequestsSaga';

import { store } from '../../../pages/createStore';
import { toTxtPath } from '../assets/TextAssets';
import SourceAcademyGame from '../SourceAcademyGame';
import { GameChapter } from './GameChapterTypes';

/**
 * Fetches all chapters from the backend
 *
 * @returns {Promise<GameChapter[]>} - All the chapter objects in a list
 */
export async function fetchGameChapters(): Promise<GameChapter[]> {
  const courseId = store.getState().session.courseId;
  const response = await request(`courses/${courseId}/stories`, 'GET', {
    accessToken: SourceAcademyGame.getInstance().getAccountInfo().accessToken,
    refreshToken: SourceAcademyGame.getInstance().getAccountInfo().refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  if (!response) return [];
  const chapterDetails = response.status === 200 ? await response.json() : [];
  const sortedChapters = _.sortBy(chapterDetails, chapterDetail => new Date(chapterDetail.openAt));
  sortedChapters.forEach(chapter => (chapter.filenames = chapter.filenames.map(toTxtPath)));
  return sortedChapters;
}
