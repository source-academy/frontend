import { MenuItem } from '@blueprintjs/core';
import { ItemPredicate, ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { without } from 'lodash';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';
import { AchievementItem } from 'src/features/achievement/AchievementTypes';

type Props = {
  changePrerequisiteUuids: (prerequisiteUuids: string[]) => void;
  uuid: string;
  prerequisiteUuids: string[];
};

const EditablePrerequisiteUuids: React.FC<Props> = ({
  changePrerequisiteUuids,
  uuid,
  prerequisiteUuids
}) => {
  const enablePrerequisites = false;

  const inferencer = useContext(AchievementContext);
  const availableUuids: string[] = enablePrerequisites
    ? inferencer.listAvailablePrerequisiteUuids(uuid)
    : [];
  const selectedUuids = prerequisiteUuids.filter(
    uuid => !inferencer.isInvalidAchievement(inferencer.getAchievement(uuid))
  );

  const getUuid = (title: string) => inferencer.getUuidByTitle(title);

  const PrerequisiteSelect = MultiSelect.ofType<AchievementItem>();
  const prerequisiteRenderer: ItemRenderer<AchievementItem> = (achievement, { handleClick }) => (
    <MenuItem key={achievement.uuid} onClick={handleClick} text={achievement.title} />
  );
  const prerequisitePredicate: ItemPredicate<AchievementItem> = (query, item) =>
    item.title.toLowerCase().includes(query.toLowerCase());

  const selectedPrereqs = new Set(selectedUuids);
  const availablePrereqs = new Set(without(availableUuids, ...selectedUuids));

  const selectPrereq = (selectUuid: string) => {
    selectedPrereqs.add(selectUuid);
    availablePrereqs.delete(selectUuid);
    changePrerequisiteUuids([...selectedPrereqs]);
  };

  const removePrereq = (removeUuid?: string) => {
    if (removeUuid === undefined) return;

    selectedPrereqs.delete(removeUuid);
    availablePrereqs.add(removeUuid);
    changePrerequisiteUuids([...selectedPrereqs]);
  };

  return (
    <PrerequisiteSelect
      itemRenderer={prerequisiteRenderer}
      items={[...availablePrereqs].map(uuid => inferencer.getAchievement(uuid))}
      noResults={<MenuItem disabled={true} text="No available achievement" />}
      onItemSelect={achievement => selectPrereq(achievement.uuid)}
      selectedItems={[...selectedPrereqs].map(uuid => inferencer.getAchievement(uuid))}
      tagInputProps={{ onRemove: title => removePrereq(getUuid(title!.toString())) }}
      tagRenderer={achievement => achievement.title}
      itemPredicate={prerequisitePredicate}
      resetOnSelect={true}
    />
  );
};

export default EditablePrerequisiteUuids;
