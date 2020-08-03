import { MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, Select } from '@blueprintjs/select';
import React from 'react';

import { UserSimpleState } from '../../features/achievement/AchievementTypes';

type AchievementNameFilterProps = {
  shouldFilter: boolean;
  name: string;
  studio: string;
  users: UserSimpleState[];

  filteredUserName: string;
  setFilteredUserName: any;
  filteredUserGroup: string;
};

function AchievementNameFilter(props: AchievementNameFilterProps) {
  const {
    shouldFilter,
    name,
    users,
    filteredUserName,
    setFilteredUserName,
    filteredUserGroup
  } = props;

  const usernames = users.filter(user => user.group === filteredUserGroup).map(user => user.name);

  const filterByName: ItemPredicate<string> = (query, name) => {
    return name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  };

  const selectionsRenderer: ItemRenderer<string> = (name, { handleClick }) => {
    return <MenuItem active={false} key={name} onClick={handleClick} text={name} />;
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
                items={usernames}
                itemRenderer={selectionsRenderer}
                noResults={<MenuItem disabled={true} text="No results." />}
                onItemSelect={(name: string) => setFilteredUserName(name)}
                filterable={true}
                itemPredicate={filterByName}
              >
                <h3>{filteredUserName === '' ? 'Name' : filteredUserName}</h3>
              </SelectionsComponent>
            </div>
          </Popover>
        </>
      ) : (
        <h3>{name}</h3>
      )}
    </>
  );
}

export default AchievementNameFilter;
