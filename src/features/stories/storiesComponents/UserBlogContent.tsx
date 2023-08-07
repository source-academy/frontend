import { Chapter, Variant } from 'js-slang/dist/types';
import yaml from 'js-yaml';
import React, { useEffect, useState } from 'react';
import debounceRender from 'react-debounce-render';
import Constants from 'src/commons/utils/Constants';
import { propsAreEqual } from 'src/commons/utils/MemoizeHelper';
import { renderStoryMarkdown } from 'src/commons/utils/StoriesHelper';
import { addStoryEnv, clearStoryEnv } from 'src/features/stories/StoriesActions';

import { store } from '../../../pages/createStore';

type UserBlogProps = {
  fileContent: string;
};

export const DEFAULT_ENV = 'default';

const YAML_HEADER = '---';
const CONFIG_STRING = 'config';
const ENV_STRING = 'env';

function handleEnvironment(envConfig: Record<string, any>): void {
  for (const [key, value] of Object.entries(envConfig)) {
    const { chapter, variant } = value;

    const envChapter = Object.values(Chapter)
      .filter(x => !isNaN(Number(x)))
      .includes(chapter)
      ? chapter
      : Constants.defaultSourceChapter;
    const envVariant = Object.values(Variant).includes(variant)
      ? variant
      : Constants.defaultSourceVariant;

    store.dispatch(addStoryEnv(key, envChapter, envVariant));
  }
}

function handleHeaders(headers: string): void {
  if (headers === '') {
    store.dispatch(
      addStoryEnv(DEFAULT_ENV, Constants.defaultSourceChapter, Constants.defaultSourceVariant)
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
    console.warn(err);
    if (err instanceof yaml.YAMLException) {
      // default headers
      store.dispatch(
        addStoryEnv(DEFAULT_ENV, Constants.defaultSourceChapter, Constants.defaultSourceVariant)
      );
    }
  }
}

function parseYamlHeaders(content: string): { headersYaml: string; content: string } {
  // check if file contains headers
  if (content.substring(0, YAML_HEADER.length) !== YAML_HEADER) {
    return {
      headersYaml: '',
      content: content
    };
  }
  const headerEnd = content.indexOf(YAML_HEADER, YAML_HEADER.length);
  if (headerEnd === -1) {
    return {
      headersYaml: '',
      content: content
    };
  }
  const yamlString = content.substring(YAML_HEADER.length, headerEnd);
  return {
    headersYaml: yamlString,
    content: content.substring(headerEnd + YAML_HEADER.length)
  };
}

const UserBlogContent: React.FC<UserBlogProps> = props => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const { headersYaml, content } = parseYamlHeaders(props.fileContent);
    setContent(content);
    store.dispatch(clearStoryEnv());
    handleHeaders(headersYaml);
  }, [props.fileContent]);

  return content ? (
    <div className="userblogContent">
      <div className="content">{renderStoryMarkdown(content)}</div>
    </div>
  ) : (
    <div />
  );
};

export default React.memo(debounceRender(UserBlogContent, 500), propsAreEqual);
