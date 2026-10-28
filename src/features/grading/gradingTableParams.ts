import type { ColumnFieldsKeys, ColumnFiltersState } from './GradingTypes';
import { ColumnFields, SortStates } from './GradingTypes';

export const GRADING_PAGE_SIZES = [10, 15, 25, 50];

const DEFAULT_PAGE_SIZE = GRADING_PAGE_SIZES[0];

const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'size';
const SHOW_PARAM = 'show';
const GROUPS_PARAM = 'groups';
const SORT_PARAM = 'sort';
const SORT_DIRECTION_PARAM = 'dir';

const BREADCRUMB_FILTER_FIELDS: string[] = [
  ColumnFields.assessmentName,
  ColumnFields.assessmentType,
  ColumnFields.studentName,
  ColumnFields.studentUsername,
  ColumnFields.groupName,
  ColumnFields.progressStatus,
];

const SORTABLE_FIELDS: string[] = [...BREADCRUMB_FILTER_FIELDS, ColumnFields.xp];

const SORT_DIRECTION_BY_PARAM = {
  asc: SortStates.ASC,
  desc: SortStates.DESC,
} as const;

export type GradingTableSort = {
  sortBy: ColumnFieldsKeys;
  direction: SortStates.ASC | SortStates.DESC;
};

export type GradingTableParams = {
  page: number; // 0 indexed, but 1-based in the URL
  pageSize: number;
  showAllSubmissions: boolean; // `undefined` means the role-based default
  showUserGroups: boolean | undefined;
  sort: GradingTableSort | undefined;
  columnFilters: ColumnFiltersState;
};

export function parseGradingTableParams(searchParams: URLSearchParams): GradingTableParams {
  const page = Number(searchParams.get(PAGE_PARAM));
  const pageSize = Number(searchParams.get(PAGE_SIZE_PARAM));
  const groups = searchParams.get(GROUPS_PARAM);
  const sortBy = searchParams.get(SORT_PARAM);
  const direction = searchParams.get(SORT_DIRECTION_PARAM);

  const columnFilters: ColumnFiltersState = [];
  searchParams.forEach((value, id) => {
    const isDuplicate = columnFilters.some(filter => filter.id === id && filter.value === value);
    if (BREADCRUMB_FILTER_FIELDS.includes(id) && value !== '' && !isDuplicate) {
      columnFilters.push({ id, value });
    }
  });

  return {
    page: Number.isInteger(page) && page >= 1 ? page - 1 : 0,
    pageSize: GRADING_PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    showAllSubmissions: searchParams.get(SHOW_PARAM) === 'all',
    showUserGroups: groups === 'mine' ? true : groups === 'all' ? false : undefined,
    sort:
      sortBy !== null &&
      SORTABLE_FIELDS.includes(sortBy) &&
      (direction === 'asc' || direction === 'desc')
        ? { sortBy: sortBy as ColumnFieldsKeys, direction: SORT_DIRECTION_BY_PARAM[direction] }
        : undefined,
    columnFilters,
  };
}

// only keep track of params when changed, defaults are not included
export function applyGradingTableParams(
  searchParams: URLSearchParams,
  changes: Partial<GradingTableParams>,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  if ('page' in changes) {
    if (changes.page !== undefined && changes.page > 0) {
      next.set(PAGE_PARAM, String(changes.page + 1));
    } else {
      next.delete(PAGE_PARAM);
    }
  }

  if ('pageSize' in changes) {
    if (changes.pageSize !== undefined && changes.pageSize !== DEFAULT_PAGE_SIZE) {
      next.set(PAGE_SIZE_PARAM, String(changes.pageSize));
    } else {
      next.delete(PAGE_SIZE_PARAM);
    }
  }

  if ('showAllSubmissions' in changes) {
    if (changes.showAllSubmissions) {
      next.set(SHOW_PARAM, 'all');
    } else {
      next.delete(SHOW_PARAM);
    }
  }

  if ('showUserGroups' in changes) {
    if (changes.showUserGroups !== undefined) {
      next.set(GROUPS_PARAM, changes.showUserGroups ? 'mine' : 'all');
    } else {
      next.delete(GROUPS_PARAM);
    }
  }

  if ('sort' in changes) {
    if (changes.sort !== undefined) {
      next.set(SORT_PARAM, changes.sort.sortBy);
      next.set(SORT_DIRECTION_PARAM, changes.sort.direction === SortStates.ASC ? 'asc' : 'desc');
    } else {
      next.delete(SORT_PARAM);
      next.delete(SORT_DIRECTION_PARAM);
    }
  }

  if ('columnFilters' in changes) {
    BREADCRUMB_FILTER_FIELDS.forEach(field => next.delete(field));
    changes.columnFilters
      ?.filter(({ id }) => BREADCRUMB_FILTER_FIELDS.includes(id))
      .forEach(({ id, value }) => next.append(id, String(value)));
  }

  return next;
}
