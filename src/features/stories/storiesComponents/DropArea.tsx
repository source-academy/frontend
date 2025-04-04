import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import { useDragItem } from '../DragContext';
import StoriesActions from '../StoriesActions';

interface DropAreaProps {
  dropIndex: number;
}

const DropArea: React.FC<DropAreaProps> = ({ dropIndex }) => {
  const [showDrop, setShowDrop] = useState<boolean>(false);
  const dragItem = useDragItem();
  const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
  const dispatch = useDispatch();

  if (!story) {
    // will never reached here, as story has been checked in Story.tsx
    return <div></div>;
  }

  const onDrop = () => {
    const contents = story!.content;
    const dragIndex = dragItem!.index!;
    if (dragIndex > dropIndex) {
      console.log('front');
      for (let i = dropIndex + 1; i < dragIndex; i++) {
        contents[i].index += 1;
      }
      contents[dragIndex].index = dropIndex + 1;
    } else if (dragIndex < dropIndex) {
      console.log('back');
      console.log(dragIndex, dropIndex);
      for (let i = dragIndex + 1; i <= dropIndex; i++) {
        contents[i].index -= 1;
      }
      contents[dragIndex].index = dropIndex;
    } else {
      return;
    }
    contents.sort((a, b) => a.index - b.index);
    console.log(contents);
    const newStory = { ...story, content: [...contents] };
    dispatch(StoriesActions.setCurrentStory(newStory));
    dispatch(StoriesActions.saveStory(newStory, storyId!));
  };

  return (
    <div
      className={showDrop ? 'drop-area' : 'hide-drop'}
      onDragEnter={() => setShowDrop(true)}
      onDragLeave={() => setShowDrop(false)}
      onDrop={() => {
        onDrop();
        setShowDrop(false);
      }}
      onDragOver={e => e.preventDefault()}
    >
      Drop Here
    </div>
  );
};

export default DropArea;
