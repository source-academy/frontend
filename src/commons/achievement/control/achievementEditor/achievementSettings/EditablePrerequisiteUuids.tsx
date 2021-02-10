import { MenuItem } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect } from '@blueprintjs/select';
import { useContext } from 'react';
import { AchievementContext } from 'src/features/achievement/AchievementConstants';

type EditablePrerequisiteUuidsProps = {
  changePrerequisiteUuids: (prerequisiteUuids: number[]) => void;
  uuid: number;
  prerequisiteUuids: number[];
};

function EditablePrerequisiteUuids(props: EditablePrerequisiteUuidsProps) {
  const { changePrerequisiteUuids, uuid, prerequisiteUuids } = props;

  const inferencer = useContext(AchievementContext);
  const availableUuids = inferencer.listAvailablePrerequisiteUuids(uuid);
  const getUuid = (title: string) => inferencer.getUuidByTitle(title);
  const getTitle = (uuid: number) => inferencer.getTitleByUuid(uuid);

  const PrerequisiteSelect = MultiSelect.ofType<number>();
  const prerequisiteRenderer: ItemRenderer<number> = (uuid, { handleClick }) => (
    <MenuItem key={uuid} onClick={handleClick} text={getTitle(uuid)} />
  );

  const selectedPrereqs = new Set(prerequisiteUuids);
  const availablePrereqs = new Set(availableUuids);

  const selectPrereq = (selectUuid: number) => {
    selectedPrereqs.add(selectUuid);
    availablePrereqs.delete(selectUuid);
    changePrerequisiteUuids([...selectedPrereqs]);
  };

  const removePrereq = (removeUuid?: number) => {
    if (removeUuid === undefined) return;

    selectedPrereqs.delete(removeUuid);
    availablePrereqs.add(removeUuid);
    changePrerequisiteUuids([...selectedPrereqs]);
  };

  return (
    <PrerequisiteSelect
      itemRenderer={prerequisiteRenderer}
      items={[...availablePrereqs]}
      noResults={<MenuItem disabled={true} text="No available achievement" />}
      onItemSelect={selectPrereq}
      selectedItems={[...selectedPrereqs]}
      tagInputProps={{ onRemove: title => removePrereq(getUuid(title!.toString())) }}
      tagRenderer={getTitle}
    />
  );
}

export default EditablePrerequisiteUuids;
