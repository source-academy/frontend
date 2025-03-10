import { Chapter, Variant } from 'js-slang/dist/types';
import yaml from 'js-yaml';
import React, { useEffect, useState } from 'react';
import debounceRender from 'react-debounce-render';
import Constants from 'src/commons/utils/Constants';
import { propsAreEqual } from 'src/commons/utils/MemoizeHelper';
// import { renderStoryMarkdown } from 'src/commons/utils/StoriesHelper';
import EditStoryCell from './EditStoryCell';
import StoriesActions from 'src/features/stories/StoriesActions';

import { store } from '../../../pages/createStore';
import ViewStoryCell from './ViewStoryCell';
import NewStoryCell from './CreateStoryCell';
import { TextInput } from '@tremor/react';
import { Menu, MenuItem } from '@blueprintjs/core';
import { styliseSublanguage } from 'src/commons/application/ApplicationTypes';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';
import { ControlButtonSaveButton } from 'src/commons/controlBar/ControlBarSaveButton';
import ControlBar, { ControlBarProps } from 'src/commons/controlBar/ControlBar';
import { useDispatch } from 'react-redux';
import { useTypedSelector } from 'src/commons/utils/Hooks';
// import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export const DEFAULT_ENV = 'default';

const YAML_HEADER = '---';
const CONFIG_STRING = 'config';
const ENV_STRING = 'env';

function handleEnvironment(envConfig: Record<string, any>): void {
  for (const [key, value] of Object.entries(envConfig)) {
    const { chapter, variant } = value;

    // TODO: Replace with language config object
    const envChapter = Object.values(Chapter)
      .filter(x => !isNaN(Number(x)))
      .includes(chapter)
      ? chapter
      : Constants.defaultSourceChapter;
    const envVariant = Object.values(Variant).includes(variant)
      ? variant
      : Constants.defaultSourceVariant;

    store.dispatch(StoriesActions.addStoryEnv(key, envChapter, envVariant));
  }
}

export function handleHeaders(headers: string): void {
  if (headers === '') {
    store.dispatch(
      StoriesActions.addStoryEnv(
        DEFAULT_ENV,
        Constants.defaultSourceChapter,
        Constants.defaultSourceVariant
      )
    );
    return;
  }
  try {
    const headerObject = yaml.load(headers) as Record<string, any>;
    for (const [key, value] of Object.entries(headerObject)) {
      switch (key) {
        case CONFIG_STRING:
          const { chapter, variant } = value;
          handleEnvironment({ [DEFAULT_ENV]: { chapter, variant } });
          break;
        case ENV_STRING:
          handleEnvironment(value);
          break;
        default:
          // Simply ignore the invalid key
          break;
      }
    }
  } catch (err) {
    if (err instanceof yaml.YAMLException) {
      // default headers
      store.dispatch(
        StoriesActions.addStoryEnv(
          DEFAULT_ENV,
          Constants.defaultSourceChapter,
          Constants.defaultSourceVariant
        )
      );
    }
  }
}

export function getYamlHeader(content: string): { header: string; content: string } {
  const startsWithHeaders = content.substring(0, YAML_HEADER.length) === YAML_HEADER;
  if (!startsWithHeaders) {
    return { header: '', content };
  }
  const endHeaderIndex = content.indexOf(YAML_HEADER, YAML_HEADER.length);
  if (endHeaderIndex === -1) {
    return { header: '', content };
  }

  return {
    header: content.substring(YAML_HEADER.length, endHeaderIndex),
    content: content.substring(endHeaderIndex + YAML_HEADER.length)
  };
}

export function getEnvironments(header: string): string[] {
  const environments: string[] = [];
  const temp = header.split("\n");
  for (let i = 2; i < temp.length - 1; i += 3) {
    environments.push(temp[i].substring(2, temp[i].length - 1));
  }
  return environments;
}

export function constructHeader(header: string, env: string, chapter: Chapter, variant: Variant): string {
  const newHeader: string[] = header.split('\n');
  newHeader.push(`  ${env}:`);
  newHeader.push(`    chapter: ${chapter}`);
  newHeader.push(`    variant: ${variant}`);
  return newHeader.join('\n');
}

type Props = {
  isViewOnly: boolean;
};

const UserBlogContent: React.FC<Props> = ({ 
    isViewOnly,
  }) => {

  const [newEnv, setNewEnv] = useState<string>("");
  // TODO: enable different variant
  const variant: Variant = Variant.DEFAULT;
  const [currentChapter, setEnvChapter] = useState<Chapter>(Chapter.SOURCE_1);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { currentStory: story, currentStoryId: storyId } = useTypedSelector(store => store.stories);
  const { content: contents, header: header } = story!; 
  const [envs, setEnvs] = useState<string[]>(getEnvironments(header));

  useEffect(() => {
    // const header = getYamlHeader(fileContent).header;
    store.dispatch(StoriesActions.clearStoryEnv());
    handleHeaders(header);
    setEnvs(getEnvironments(header));
    console.log("header resets");
  }, [header]);

  if (!story) {
    // will never reach here, as it has been check in Story.tsx
    return <div></div>;
  }

  const editHeader = (newHeader: string) => {
    console.log("header is editted");
    const newStory = {...story, header: newHeader};
    dispatch(StoriesActions.setCurrentStory(newStory));
    dispatch(StoriesActions.saveStory(newStory, storyId!));
  }

  const saveButClicked = () => {
    setNewEnv("");
    setIsDirty(false);
    if (newEnv.trim() === "") {
      showWarningMessage("environment name cannot be empty");
      return;
    } else if (envs.includes(newEnv)) {
      showWarningMessage(`${newEnv} already exists!`)
      return;
    }
    const newHeader = header.concat(`
  ${newEnv}:
    chapter: ${currentChapter}
    variant: default`
    );
    editHeader(newHeader);
  }

  const controlBarProps: ControlBarProps = {
    editorButtons: [
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "5px",
          alignItems: 'center',
          justifyContent: "space-between",
          width: "100%"
        }}>
        <TextInput
          maxWidth="max-w-xl"
          placeholder="Enter New Environment"
          value={newEnv}
          onChange={e => {
            setNewEnv(e.target.value);
            if (e.target.value.trim() !== "") {
              setIsDirty(true);
            } else {
              setIsDirty(false);
            }
          }}
        />
        <Menu style={{margin: "0px"}}>
          <MenuItem text={styliseSublanguage(currentChapter, variant)}>
            <MenuItem onClick={() => setEnvChapter(1)} text={styliseSublanguage(Chapter.SOURCE_1, variant)}/>
            <MenuItem onClick={() => setEnvChapter(2)} text={styliseSublanguage(Chapter.SOURCE_2, variant)}/>
            <MenuItem onClick={() => setEnvChapter(3)} text={styliseSublanguage(Chapter.SOURCE_3, variant)}/>
            <MenuItem onClick={() => setEnvChapter(4)} text={styliseSublanguage(Chapter.SOURCE_4, variant)}/>
          </MenuItem>
        </Menu>
        <ControlButtonSaveButton
          key="save_story"
          onClickSave={saveButClicked}
          hasUnsavedChanges={isDirty}
        />
      </div>
    ]
  };

  return contents.length > 0 ? (
    <div className="userblogContent">
      {!isViewOnly && <ControlBar {...controlBarProps}/>}
      {isViewOnly 
      ? contents.map((story, key) => <ViewStoryCell
          key={key}
          story={story}
        />)
      // : <SortableContext items={contents.map((content) => {
      //   return {
      //     ...content,
      //     id: content.index,
      //   }
      // })} strategy={verticalListSortingStrategy}>
      : contents.map((_, key) => { 
        return <EditStoryCell 
            key={key}
            index={key}
          />})}
        {/* </SortableContext>} */}
      {!isViewOnly && <div className='content'>
        <NewStoryCell 
          index={contents.length}
        />
      </div>}
    </div>
  ) : (
    <div />
  );
};

export default React.memo(debounceRender(UserBlogContent, 500), propsAreEqual);
