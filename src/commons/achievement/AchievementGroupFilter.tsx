import { MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';

import { UserSimpleState } from '../../commons/application/ApplicationTypes';

type AchievementGroupFilterProps = {
  shouldFilter: boolean;
  studio: string;
  users: UserSimpleState[];

  filteredUserGroup: string;
  setFileredUserGroup: any;
};

function AchievementGroupFilter(props: AchievementGroupFilterProps) {
  const { shouldFilter, studio, users, filteredUserGroup, setFileredUserGroup } = props;

  const userGroups = users.map(user => user.group);
  const distinctUserGroups = [...new Set(userGroups)];

  const FilterByGroup: ItemPredicate<string> = (query, group) => {
    return group.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const selectionsRenderer: ItemRenderer<string> = (group, { handleClick }) => {
    return <MenuItem active={false} key={group} onClick={handleClick} text={group} />;
  };

  const SelectionsComponent = Select.ofType<string>();

  return (
    <>
      {shouldFilter ? (
        <>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK_TARGET_ONLY}
            position={Position.TOP}
          >
            <div>
              <SelectionsComponent
                items={distinctUserGroups}
                onItemSelect={(group: string) => setFileredUserGroup(group)}
                itemRenderer={selectionsRenderer}
                noResults={<MenuItem disabled={true} text="No results." />}
                filterable={true}
                itemPredicate={FilterByGroup}
              >
                <h3>{filteredUserGroup === '' ? 'Studio' : filteredUserGroup}</h3>
              </SelectionsComponent>
            </div>
          </Popover>
        </>
      ) : (
        <h3>{studio}</h3>
      )}
    </>
  );
}

export default AchievementGroupFilter;
