import { describe, expect, test } from 'vitest';

import {
  applyGradingTableParams,
  type GradingTableParams,
  parseGradingTableParams,
} from './gradingTableParams';
import { SortStates } from './GradingTypes';

describe('parseGradingTableParams', () => {
  test('uses defaults for an empty URL', () => {
    expect(parseGradingTableParams(new URLSearchParams())).toEqual({
      page: 0,
      pageSize: 10,
      showAllSubmissions: false,
      showUserGroups: undefined,
      sort: undefined,
      columnFilters: [],
    });
  });

  test('reads every param', () => {
    const params = new URLSearchParams(
      'page=3&size=25&show=all&groups=mine&sort=studentName&dir=desc&groupName=1A&assessmentType=Missions&groupName=1B',
    );
    expect(parseGradingTableParams(params)).toEqual({
      page: 2,
      pageSize: 25,
      showAllSubmissions: true,
      showUserGroups: true,
      sort: { sortBy: 'studentName', direction: SortStates.DESC },
      columnFilters: [
        { id: 'groupName', value: '1A' },
        { id: 'assessmentType', value: 'Missions' },
        { id: 'groupName', value: '1B' },
      ],
    });
  });

  test.each(['abc', '0', '-3', '1.5', ''])('falls back to the first page for page=%s', page => {
    expect(parseGradingTableParams(new URLSearchParams({ page })).page).toBe(0);
  });

  test.each(['7', '100', 'abc'])('falls back to the default page size for size=%s', size => {
    expect(parseGradingTableParams(new URLSearchParams({ size })).pageSize).toBe(10);
  });

  test('reads groups=all as false and ignores unknown values', () => {
    expect(parseGradingTableParams(new URLSearchParams('groups=all')).showUserGroups).toBe(false);
    expect(parseGradingTableParams(new URLSearchParams('groups=x')).showUserGroups).toBeUndefined();
  });

  test.each(['sort=actionsIndex&dir=asc', 'sort=foo&dir=asc', 'sort=xp&dir=up', 'sort=xp'])(
    'ignores an invalid sort (%s)',
    search => {
      expect(parseGradingTableParams(new URLSearchParams(search)).sort).toBeUndefined();
    },
  );

  test('ignores unknown, unfilterable, empty and duplicate filters', () => {
    const params = new URLSearchParams(
      'foo=bar&xp=10&actionsIndex=1&studentName=&groupName=1A&groupName=1A',
    );
    expect(parseGradingTableParams(params).columnFilters).toEqual([
      { id: 'groupName', value: '1A' },
    ]);
  });
});

describe('applyGradingTableParams', () => {
  test('only touches the given keys', () => {
    const params = new URLSearchParams('page=3&groupName=1A&other=x');
    expect(applyGradingTableParams(params, { pageSize: 25 }).toString()).toBe(
      'page=3&groupName=1A&other=x&size=25',
    );
  });

  test('leaves defaults out', () => {
    const params = new URLSearchParams('page=3&size=25&show=all&groups=mine&sort=xp&dir=asc');
    const next = applyGradingTableParams(params, {
      page: 0,
      pageSize: 10,
      showAllSubmissions: false,
      showUserGroups: undefined,
      sort: undefined,
    });
    expect(next.toString()).toBe('');
  });

  test('replaces all breadcrumb filters', () => {
    const params = new URLSearchParams('groupName=1A&studentName=Alice');
    const next = applyGradingTableParams(params, {
      columnFilters: [{ id: 'progressStatus', value: 'graded' }],
    });
    expect(next.toString()).toBe('progressStatus=graded');
  });

  test('round-trips through parseGradingTableParams', () => {
    const state: GradingTableParams = {
      page: 4,
      pageSize: 50,
      showAllSubmissions: true,
      showUserGroups: false,
      sort: { sortBy: 'xp', direction: SortStates.ASC },
      columnFilters: [
        { id: 'assessmentName', value: 'Mission 1 & 2' },
        { id: 'studentUsername', value: 'e0123456' },
      ],
    };
    const params = applyGradingTableParams(new URLSearchParams(), state);
    expect(parseGradingTableParams(params)).toEqual(state);
  });
});
