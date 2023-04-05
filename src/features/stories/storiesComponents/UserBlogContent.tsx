import { Chapter, Variant } from 'js-slang/dist/types';
import yaml from 'js-yaml';
import React from 'react';
import { useEffect, useState } from 'react';
import debounceRender from 'react-debounce-render';
import ReactMarkdown from 'react-markdown';
import Constants from 'src/commons/utils/Constants';
import { addStoryEnv, clearStoryEnv } from 'src/features/stories/StoriesActions';

import { store } from '../../../pages/createStore';
import SourceBlock from './SourceBlock';

type UserBlogProps = {
  fileContent: string | null;
};

export const DEFAULT_ENV = 'default';

const YAML_HEADER = '---';
const CONFIG_STRING = 'config';
const ENV_STRING = 'env';

function handleEnvironment(envConfig: any): void {
  for (const key in envConfig) {
    /*
    const chapterKey = envConfig[key].chapter;
    const variantKey = envConfig[key].variant;

    if (chapterKey in Chapter && variantKey in Variant) {
      store.dispatch(
        addStoryEnv(key, Chapter[chapterKey as keyof typeof Chapter], Variant[variantKey])
      );
    } else {
      store.dispatch(
        addStoryEnv(key, Constants.defaultSourceChapter, Constants.defaultSourceVariant)
      );
    }
    */

    const parsedChapter = envConfig[key].chapter;
    const parsedVariant = envConfig[key].variant;

    const envChapter = Object.values(Chapter)
      .filter(x => !isNaN(Number(x)))
      .includes(parsedChapter)
      ? parsedChapter
      : Constants.defaultSourceChapter;
    const envVariant = Object.values(Variant).includes(parsedVariant)
      ? parsedVariant
      : Constants.defaultSourceVariant;

    store.dispatch(addStoryEnv(key, envChapter, envVariant));
  }
}

function handleHeaders(headers: string): void {
  if (headers === '') {
    store.dispatch(
      addStoryEnv(DEFAULT_ENV, Constants.defaultSourceChapter, Constants.defaultSourceVariant)
    );
  } else {
    try {
      const headerObject = yaml.load(headers) as any;
      for (const key in headerObject) {
        if (key === CONFIG_STRING) {
          // handle DEFAULT by changing default env stuff
          //const chapterKey = headerObject[key].chapter;
          //const variantKey = headerObject[key].variant;
          const parsedChapter = headerObject[CONFIG_STRING].chapter;
          const parsedVariant = headerObject[CONFIG_STRING].variant;

          const envChapter = Object.values(Chapter)
            .filter(x => !isNaN(Number(x)))
            .includes(parsedChapter)
            ? parsedChapter
            : Constants.defaultSourceChapter;
          const envVariant = Object.values(Variant).includes(parsedVariant)
            ? parsedVariant
            : Constants.defaultSourceVariant;

          store.dispatch(addStoryEnv(DEFAULT_ENV, envChapter, envVariant));
          /*
          if (chapterKey in Chapter && variantKey in Variant) {
            store.dispatch(
              addStoryEnv(
                DEFAULT_ENV,
                Chapter[chapterKey as keyof typeof Chapter],
                Variant[variantKey]
              )
            );
          } else {
            store.dispatch(
              addStoryEnv(
                DEFAULT_ENV,
                Constants.defaultSourceChapter,
                Constants.defaultSourceVariant
              )
            );
          }
          */
        } else if (key === ENV_STRING) {
          handleEnvironment(headerObject[key]);
        }
      }
    } catch (err) {
      if (err instanceof yaml.YAMLException) {
        // default headers
        store.dispatch(
          addStoryEnv(DEFAULT_ENV, Constants.defaultSourceChapter, Constants.defaultSourceVariant)
        );
      }
    }
  }
}

function parseHeaders(content: string): { headersYaml: string; content: string } {
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

const UserBlog: React.FC<UserBlogProps> = props => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (props.fileContent !== null) {
      const { headersYaml, content } = parseHeaders(props.fileContent);
      setContent(content);
      store.dispatch(clearStoryEnv());
      handleHeaders(headersYaml);
    }
  }, [props.fileContent]);

  return props.fileContent === null ? (
    <p>Story not found</p>
  ) : content === '' ? (
    <div />
  ) : (
    <div className="userblogContent">
      <div className="content">
        <ReactMarkdown
          children={content}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-source(.*)/.exec(className || '');
              return !inline && match ? (
                <SourceBlock commands={match[1]}>{String(children)}</SourceBlock>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default debounceRender(UserBlog, 500);
