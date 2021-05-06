export const UPDATE_CHAPTER = 'UPDATE_CHAPTER';

export enum SicpChapter {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}

export type SicpState = {
    chapter: SicpChapter;
};