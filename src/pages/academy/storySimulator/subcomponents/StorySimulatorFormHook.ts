import React from 'react';
import { ChapterDetail } from 'src/features/storySimulator/StorySimulatorTypes';

export const useInput = (chapterDetail: ChapterDetail, field: string) => {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!chapterDetail) {
      setValue('');
      return;
    }
    setValue(chapterDetail[field]);
  }, [chapterDetail, field]);

  return {
    value,
    setValue,
    bind: {
      value,
      onChange: (event: any) => {
        setValue(event.target.value);
      }
    }
  };
};
