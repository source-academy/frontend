import { decompressFromEncodedURIComponent } from 'lz-string';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import { Variant } from 'js-slang/dist/types';

import Academy from '../../pages/academy/AcademyContainer';
import Contributors from '../../pages/contributors/Contributors';
import Login from '../../pages/login/LoginContainer';
import MissionControlContainer from '../../pages/missionControl/MissionControlContainer';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/PlaygroundContainer';
import SourcecastContainer from '../../pages/sourcecast/SourcecastContainer';
import NavigationBar from '../navigationBar/NavigationBar';
import Constants from '../utils/Constants';
import { stringParamToInt } from '../utils/ParamParseHelper';
import { parseQuery } from '../utils/QueryHelper';
import { Role, sourceLanguages } from './ApplicationTypes';
import { ExternalLibraryName } from './types/ExternalTypes';
import AchievementContainer from 'src/pages/achievements/AchievementContainer';
export type ApplicationProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleClearContext: (
    chapter: number,
    variant: Variant,
    externalLibraryName: ExternalLibraryName
  ) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleEnsureLibrariesLoaded: () => void;
  handleLogOut: () => void;
  handleExternalLibrarySelect: (external: ExternalLibraryName) => void;
  handleSetExecTime: (execTime: string) => void;
};

export type StateProps = {
  accessToken?: string;
  currentPlaygroundChapter: number;
  currentPlaygroundVariant: Variant;
  role?: Role;
  title: string;
  name?: string;
  currentExternalLibrary: ExternalLibraryName;
};

const assessmentRegExp = ':assessmentId(-?\\d+)?/:questionId(\\d+)?';

class Application extends React.Component<ApplicationProps, {}> {
  public componentDidMount() {
    parsePlayground(this.props);
  }

  public render() {
    return (
      <div className="Application">
        <NavigationBar
          handleLogOut={this.props.handleLogOut}
          role={this.props.role}
          name={this.props.name}
          title={this.props.title}
        />
        <div className="Application__main">
          {/* Unfortunately Switches cannot contain fragments :( */}
          {Constants.playgroundOnly ? (
            <Switch>
              <Route path="/playground" component={Playground} />
              <Route path="/contributors" component={Contributors} />
              <Route path="/sourcecast" component={SourcecastContainer} />
              <Route exact={true} path="/" render={this.redirectToPlayground} />
              <Route component={NotFound} />
            </Switch>
          ) : (
            <Switch>
              <Route path="/academy" component={toAcademy(this.props)} />
              <Route path={`/mission-control/${assessmentRegExp}`} render={toIncubator} />
              <Route path="/playground" component={Playground} />
              <Route path="/login" render={toLogin(this.props)} />
              <Route path="/contributors" component={Contributors} />
              <Route path="/sourcecast" component={SourcecastContainer} />
              <Route path="/achievements" component={toAchievements(this.props)} />
              <Route exact={true} path="/" render={this.redirectToAcademy} />
              <Route component={NotFound} />
            </Switch>
          )}
        </div>
      </div>
    );
  }

  private redirectToPlayground = () => <Redirect to="/playground" />;
  private redirectToAcademy = () => <Redirect to="/academy" />;
}

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = (props: ApplicationProps) =>
  props.accessToken === undefined || props.role === undefined
    ? () => <Redirect to="/login" />
    : () => <Academy accessToken={props.accessToken} role={props.role!} />;

/**
 * A user routes to /achievements,
 *  1. If the user is logged in, render the Achievements component
 *  2. If the user is not logged in, redirect to /login
 */
const toAchievements = (props: ApplicationProps) =>
  props.accessToken === undefined || props.role === undefined
    ? () => <AchievementContainer /> // Replace with <Redirect to="/login" /> during prod
    : () => <AchievementContainer />;

const toLogin = (props: ApplicationProps) => () => {
  const qstr = parseQuery(props.location.search);

  return (
    <Login
      code={qstr.code}
      providerId={qstr.provider}
      providers={[...Constants.authProviders.entries()].map(([id, { name }]) => ({
        id,
        name
      }))}
    />
  );
};

const parsePlayground = (props: ApplicationProps) => {
  const prgrm = parsePrgrm(props);
  const chapter = parseChapter(props) || props.currentPlaygroundChapter;
  const variant = parseVariant(props, chapter) || props.currentPlaygroundVariant;
  const externalLibraryName = parseExternalLibrary(props) || props.currentExternalLibrary;
  const execTime = parseExecTime(props);
  if (prgrm) {
    props.handleEditorValueChange(prgrm);
    props.handleEnsureLibrariesLoaded();
    props.handleClearContext(chapter, variant, externalLibraryName);
    props.handleExternalLibrarySelect(externalLibraryName);
    props.handleSetExecTime(execTime);
  }
};

const toIncubator = (routerProps: RouteComponentProps<any>) => <MissionControlContainer />;

const parsePrgrm = (props: RouteComponentProps<{}>) => {
  const qsParsed = parseQuery(props.location.hash);
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm;
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined;
};

const parseChapter = (props: RouteComponentProps<{}>) => {
  return stringParamToInt(parseQuery(props.location.hash).chap) || undefined;
};

const parseVariant = (props: RouteComponentProps<{}>, chap: number) => {
  const variantQuery = parseQuery(props.location.hash).variant;
  // find a language with this variant and chapter (if any)
  const matchingLang = sourceLanguages.find(
    language => language.chapter === chap && language.variant === variantQuery
  );

  const variant: Variant = matchingLang ? matchingLang.variant : 'default';

  return variant;
};

const parseExternalLibrary = (props: RouteComponentProps<{}>) => {
  const ext = parseQuery(props.location.hash).ext || '';
  return Object.values(ExternalLibraryName).find(v => v === ext) || ExternalLibraryName.NONE;
};

const parseExecTime = (props: RouteComponentProps<{}>) => {
  const time = parseQuery(props.location.hash).exec || '1000';
  // Parse the time string to a number, defaulting execTime to 1000
  const execTime = stringParamToInt(time) || 1000;
  return `${execTime < 1000 ? 1000 : execTime}`;
};

export default Application;
