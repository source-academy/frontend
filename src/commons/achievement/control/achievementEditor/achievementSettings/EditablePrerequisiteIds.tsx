import { MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';
import React, { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type EditablePrerequisiteIdsProps = {
  availableIds: number[];
  changePrerequisiteIds: (prerequisiteIds: number[]) => void;
  prerequisiteIds: number[];
};

function EditablePrerequisiteIds(props: EditablePrerequisiteIdsProps) {
  const { availableIds, changePrerequisiteIds, prerequisiteIds } = props;

  const inferencer = useContext(AchievementContext);
  const getId = (title: string) => inferencer.getIdByTitle(title);
  const getTitle = (id: number) => inferencer.getTitleById(id);

  const PrerequisiteSelect = MultiSelect.ofType<number>();
  const prerequisiteRenderer: ItemRenderer<number> = (id, { handleClick }) => (
    <MenuItem key={id} onClick={handleClick} text={getTitle(id)} />
  );

  const selectedPrereqs = new Set(prerequisiteIds);
  const availablePrereqs = new Set(availableIds);

  const handleSelectPrereq = (selectId: number) => {
    selectedPrereqs.add(selectId);
    availablePrereqs.delete(selectId);
    changePrerequisiteIds([...selectedPrereqs]);
  };

  const handleRemovePrereq = (removeId?: number) => {
    if (removeId === undefined) return;
    
    selectedPrereqs.delete(removeId);
    availablePrereqs.add(removeId);
    changePrerequisiteIds([...selectedPrereqs]);
  };

  return (
    <PrerequisiteSelect
      itemRenderer={prerequisiteRenderer}
      items={[...availablePrereqs]}
      noResults={<MenuItem disabled={true} text="No available achievement" />}
      onItemSelect={handleSelectPrereq}
      selectedItems={[...selectedPrereqs]}
      tagInputProps={{ onRemove: title => handleRemovePrereq(getId(title)) }}
      tagRenderer={getTitle}
    />
  );
}

export default EditablePrerequisiteIds;
