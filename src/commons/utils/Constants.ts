import { Chapter, Variant } from 'js-slang/dist/types';

import { AuthProviderType } from './AuthHelper';

function isTrue(value?: string, defaultTo?: boolean): boolean {
  return typeof value === 'undefined' && typeof defaultTo !== 'undefined'
    ? defaultTo
    : typeof value === 'string' && value.toUpperCase() === 'TRUE';
}

const isTest = process.env.NODE_ENV === 'test';

const sourceAcademyVersion = process.env.REACT_APP_VERSION || 'local';
const sourceAcademyEnvironment = process.env.REACT_APP_ENVIRONMENT || 'dev';
const sourceAcademyDeploymentName = isTest
  ? 'Source Academy @ NUS'
  : process.env.REACT_APP_DEPLOYMENT_NAME || 'Source Academy';
const showResearchPrompt = isTest || isTrue(process.env.REACT_APP_SHOW_RESEARCH_PROMPT);
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const storiesBackendUrl = process.env.REACT_APP_STORIES_BACKEND_URL;
const cadetLoggerUrl = isTest ? undefined : process.env.REACT_APP_CADET_LOGGER;
const cadetLoggerInterval = parseInt(process.env.REACT_APP_CADET_LOGGER_INTERVAL || '10000', 10);
const useBackend = !isTest && isTrue(process.env.REACT_APP_USE_BACKEND);
const defaultSourceChapter = Chapter.SOURCE_4;
const defaultSourceVariant = Variant.DEFAULT;
const defaultQuestionId = 0;
const maxBrowseIndex = 50;
const mobileBreakpoint = 768;
const urlShortenerBase = process.env.REACT_APP_URL_SHORTENER_BASE;
const urlShortenerSignature = process.env.REACT_APP_URL_SHORTENER_SIGNATURE;
const moduleBackendUrl = process.env.REACT_APP_MODULE_BACKEND_URL || 'modules';
const sharedbBackendUrl = process.env.REACT_APP_SHAREDB_BACKEND_URL || '';
const playgroundOnly = !isTest && isTrue(process.env.REACT_APP_PLAYGROUND_ONLY, true);
const sentryDsn = process.env.REACT_APP_SENTRY_DSN;
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
const googleAppId = process.env.REACT_APP_GOOGLE_APP_ID;
const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID || '';
const githubOAuthProxyUrl = process.env.REACT_APP_GITHUB_OAUTH_PROXY_URL || '';
const sicpBackendUrl =
  process.env.REACT_APP_SICPJS_BACKEND_URL || 'https://sicp.sourceacademy.org/';
const javaPackagesUrl = 'https://source-academy.github.io/modules/java/java-packages/src/';
const workspaceSettingsLocalStorageKey = 'workspace-settings';

// For achievements feature (CA - Continual Assessment)
// TODO: remove dependency of the ca levels on the env file
const caFulfillmentLevel = isTest
  ? 24
  : parseInt(process.env.REACT_APP_CA_FULFILLMENT_LEVEL || '0');

const authProviders: Map<
  string,
  { name: string; endpoint: string; isDefault: boolean; type: AuthProviderType }
> = new Map();

let hasNusAuthProviders = false;
const nusAuthProviders: Map<
  string,
  { name: string; endpoint: string; isDefault: boolean; type: AuthProviderType }
> = new Map();

for (let i = 1; ; ++i) {
  const id = process.env[`REACT_APP_NUS_SAML_PROVIDER${i}`];
  if (!id) {
    break;
  }

  hasNusAuthProviders = true;
  const name = process.env[`REACT_APP_NUS_SAML_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = process.env[`REACT_APP_NUS_SAML_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.SAML_SSO });
  nusAuthProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.SAML_SSO });
}

let hasOtherAuthProviders = false;
const otherAuthProviders: Map<
  string,
  { name: string; endpoint: string; isDefault: boolean; type: AuthProviderType }
> = new Map();

for (let i = 1; ; ++i) {
  const id = process.env[`REACT_APP_OAUTH2_PROVIDER${i}`];
  if (!id) {
    break;
  }

  hasOtherAuthProviders = true;
  const name = process.env[`REACT_APP_OAUTH2_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = process.env[`REACT_APP_OAUTH2_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: i === 1, type: AuthProviderType.OAUTH2 });
  otherAuthProviders.set(id, { name, endpoint, isDefault: i === 1, type: AuthProviderType.OAUTH2 });
}

for (let i = 1; ; ++i) {
  const id = process.env[`REACT_APP_CAS_PROVIDER${i}`];
  if (!id) {
    break;
  }

  hasOtherAuthProviders = true;
  const name = process.env[`REACT_APP_CAS_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = process.env[`REACT_APP_CAS_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.CAS });
  otherAuthProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.CAS });
}

for (let i = 1; ; ++i) {
  const id = process.env[`REACT_APP_SAML_PROVIDER${i}`];
  if (!id) {
    break;
  }

  hasOtherAuthProviders = true;
  const name = process.env[`REACT_APP_SAML_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = process.env[`REACT_APP_SAML_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.SAML_SSO });
  otherAuthProviders.set(id, { name, endpoint, isDefault: false, type: AuthProviderType.SAML_SSO });
}

const featureFlags = {
  enableSicpChatbot: isTrue(process.env.REACT_APP_FEATURE_ENABLE_SICP_CHATBOT)
};

export enum Links {
  githubIssues = 'https://github.com/source-academy/frontend/issues',
  githubOrg = 'https://github.com/source-academy',
  about = 'https://about.sourceacademy.org',

  resourcesForEducators = 'https://about.sourceacademy.org/educator/README.html',
  resourcesForLearners = 'https://about.sourceacademy.org/learner/README.html',

  sourceAcademyAssets = 'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/',
  sourceDocs = 'https://docs.sourceacademy.org/',
  textbook = 'https://sourceacademy.org/sicpjs/',
  playground = 'https://sourceacademy.org/playground',
  textbookChapter2_2 = 'https://sourceacademy.org/sicpjs/2.2',
  textbookChapter3_2 = 'https://sourceacademy.org/sicpjs/3.2',
  aceHotkeys = 'https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts',
  sourceHotkeys = 'https://github.com/source-academy/frontend/wiki/Source-Academy-Keyboard-Shortcuts',

  ecmaScript_2021 = 'https://262.ecma-international.org/12.0/'
}

const Constants = {
  sourceAcademyVersion,
  sourceAcademyEnvironment,
  sourceAcademyDeploymentName,
  showResearchPrompt,
  backendUrl,
  storiesBackendUrl,
  cadetLoggerUrl,
  useBackend,
  defaultSourceChapter,
  defaultSourceVariant,
  defaultQuestionId,
  maxBrowseIndex,
  mobileBreakpoint,
  urlShortenerBase,
  urlShortenerSignature,
  moduleBackendUrl,
  authProviders,
  hasNusAuthProviders,
  nusAuthProviders,
  hasOtherAuthProviders,
  otherAuthProviders,
  playgroundOnly,
  sentryDsn,
  googleClientId,
  googleApiKey,
  googleAppId,
  githubClientId,
  githubOAuthProxyUrl,
  sharedbBackendUrl,
  cadetLoggerInterval,
  sicpBackendUrl,
  javaPackagesUrl,
  workspaceSettingsLocalStorageKey,
  caFulfillmentLevel,
  featureFlags
};

export default Constants;
