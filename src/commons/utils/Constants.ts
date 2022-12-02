import { Chapter, Variant } from 'js-slang/dist/types';
import moment, { Moment } from 'moment';

function isTrue(value?: string, defaultTo?: boolean): boolean {
  return typeof value === 'undefined' && typeof defaultTo !== 'undefined'
    ? defaultTo
    : typeof value === 'string' && value.toUpperCase() === 'TRUE';
}

const isTest = import.meta.env.NODE_ENV === 'test';

const sourceAcademyVersion = import.meta.env.VITE_VERSION || 'local';
const sourceAcademyEnvironment = import.meta.env.VITE_ENVIRONMENT || 'dev';
const sourceAcademyDeploymentName = import.meta.env.VITE_DEPLOYMENT_NAME || 'Source Academy';
const showResearchPrompt = isTest || isTrue(import.meta.env.VITE_SHOW_RESEARCH_PROMPT);
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const cadetLoggerUrl = isTest ? undefined : import.meta.env.VITE_CADET_LOGGER;
const cadetLoggerInterval = parseInt(import.meta.env.VITE_CADET_LOGGER_INTERVAL || '10000', 10);
const useBackend = !isTest && isTrue(import.meta.env.VITE_USE_BACKEND);
const defaultSourceChapter = Chapter.SOURCE_4;
const defaultSourceVariant = Variant.DEFAULT;
const defaultQuestionId = 0;
const maxBrowseIndex = 50;
const mobileBreakpoint = 768;
const urlShortenerBase = import.meta.env.VITE_URL_SHORTENER_BASE;
const urlShortenerSignature = import.meta.env.VITE_URL_SHORTENER_SIGNATURE;
const moduleBackendUrl = import.meta.env.VITE_MODULE_BACKEND_URL || 'modules';
const sharedbBackendUrl = import.meta.env.VITE_SHAREDB_BACKEND_URL || '';
const playgroundOnly = !isTest && isTrue(import.meta.env.VITE_PLAYGROUND_ONLY, true);
const enableGitHubAssessments = isTest || isTrue(import.meta.env.VITE_ENABLE_GITHUB_ASSESSMENTS);
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const googleAppId = import.meta.env.VITE_GOOGLE_APP_ID;
const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const githubOAuthProxyUrl = import.meta.env.VITE_GITHUB_OAUTH_PROXY_URL || '';
const sicpBackendUrl =
  import.meta.env.VITE_SICPJS_BACKEND_URL || 'https://sicp.sourceacademy.org/';
const workspaceSettingsLocalStorageKey = 'workspace-settings';

// For achievements feature (CA - Continual Assessment)
// TODO: remove dependency of the ca levels on the env file
const caFulfillmentLevel = isTest
  ? 24
  : parseInt(import.meta.env.VITE_CA_FULFILLMENT_LEVEL || '0');

const authProviders: Map<string, { name: string; endpoint: string; isDefault: boolean }> =
  new Map();

for (let i = 1; ; ++i) {
  const id = import.meta.env[`VITE_OAUTH2_PROVIDER${i}`];
  if (!id) {
    break;
  }

  const name = import.meta.env[`VITE_OAUTH2_PROVIDER${i}_NAME`] || 'Unnamed provider';
  const endpoint = import.meta.env[`VITE_OAUTH2_PROVIDER${i}_ENDPOINT`] || '';

  authProviders.set(id, { name, endpoint, isDefault: i === 1 });
}

const disablePeriods: Array<{ start: Moment; end: Moment; reason?: string }> = [];

if (!isTest) {
  for (let i = 1; ; ++i) {
    const startStr = import.meta.env[`VITE_DISABLE${i}_START`];
    const endStr = import.meta.env[`VITE_DISABLE${i}_END`];
    if (!startStr || !endStr) {
      break;
    }
    const reason = import.meta.env[`VITE_DISABLE${i}_REASON`];
    const start = moment(startStr);
    const end = moment(endStr);
    if (end.isBefore(start) || moment().isAfter(end)) {
      continue;
    }
    disablePeriods.push({ start, end, reason });
  }
}

export enum Links {
  githubIssues = 'https://github.com/source-academy/frontend/issues',
  githubOrg = 'https://github.com/source-academy',
  about = 'https://about.sourceacademy.org',

  moduleDetails = 'https://www.comp.nus.edu.sg/~cs1101s',
  luminus = 'https://luminus.nus.edu.sg/modules/41d42e9a-5880-43b5-8ee6-75f5a41355e3/announcements/active',
  piazza = 'https://piazza.com/class/kas136yscf8605',

  resourcesForEducators = 'https://about.sourceacademy.org/educator/README.html',
  resourcesForLearners = 'https://about.sourceacademy.org/learner/README.html',

  sourceAcademyAssets = 'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/',
  sourceDocs = 'https://docs.sourceacademy.org/',
  techSVC = 'mailto:techsvc@comp.nus.edu.sg',
  techSVCNumber = '6516 2736',
  textbook = 'https://sourceacademy.org/sicpjs/',
  playground = 'https://sourceacademy.org/playground',
  textbookChapter2_2 = 'https://sourceacademy.org/sicpjs/2.2',
  textbookChapter3_2 = 'https://sourceacademy.org/sicpjs/3.2',
  aceHotkeys = 'https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts',
  sourceHotkeys = 'https://github.com/source-academy/frontend/wiki/Source-Academy-Keyboard-Shortcuts',

  source_1 = 'https://docs.sourceacademy.org/source_1/',
  source_1_Lazy = 'https://docs.sourceacademy.org/source_1_lazy/',
  source_1_Wasm = 'https://docs.sourceacademy.org/source_1_wasm/',
  source_2 = 'https://docs.sourceacademy.org/source_2/',
  source_2_Lazy = 'https://docs.sourceacademy.org/source_2_lazy/',
  source_3 = 'https://docs.sourceacademy.org/source_3/',
  source_3_Concurrent = 'https://docs.sourceacademy.org/source_3_concurrent/',
  source_3_Nondet = 'https://docs.sourceacademy.org/source_3_non-det/',
  source_4 = 'https://docs.sourceacademy.org/source_4/',
  source_4_Gpu = 'https://docs.sourceacademy.org/source_4_gpu/',
  ecmaScript_2021 = 'https://262.ecma-international.org/12.0/'
}

const Constants = {
  sourceAcademyVersion,
  sourceAcademyEnvironment,
  sourceAcademyDeploymentName,
  showResearchPrompt,
  backendUrl,
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
  playgroundOnly,
  enableGitHubAssessments,
  sentryDsn,
  googleClientId,
  googleApiKey,
  googleAppId,
  githubClientId,
  githubOAuthProxyUrl,
  sharedbBackendUrl,
  disablePeriods,
  cadetLoggerInterval,
  sicpBackendUrl: sicpBackendUrl,
  workspaceSettingsLocalStorageKey,
  caFulfillmentLevel
};

export default Constants;
