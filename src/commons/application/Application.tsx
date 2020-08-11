import { Variant } from 'js-slang/dist/types';
import { decompressFromEncodedURIComponent } from 'lz-string';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import Achievement from 'src/pages/achievement/AchievementContainer';

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

class Application extends React.Component<ApplicationProps, {}> {
  public componentDidMount() {
    parsePlayground(this.props);
  }

  public render() {
    const fullPaths = Constants.playgroundOnly
      ? null
      : [
          <Route path="/academy" component={toAcademy(this.props)} key={0} />,
          <Route
            path={'/mission-control/:assessmentId(-?\\d+)?/:questionId(\\d+)?'}
            render={toIncubator}
            key={1}
          />,
          <Route path="/achievement" component={toAchievement(this.props)} key={2} />,
          <Route path="/login" render={toLogin(this.props)} key={3} />
        ];

    return (
      <div className="Application">
        <NavigationBar
          handleLogOut={this.props.handleLogOut}
          role={this.props.role}
          name={this.props.name}
          title={this.props.title}
        />
        <div className="Application__main">
          <Switch>
            <Route path="/playground" component={Playground} />
            <Route path="/contributors" component={Contributors} />
            <Route path="/sourcecast" component={SourcecastContainer} />
            {fullPaths}
            <Route
              exact={true}
              path="/"
              render={Constants.playgroundOnly ? this.redirectToPlayground : this.redirectToAcademy}
            />
            <Route component={NotFound} />
          </Switch>
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
 * A user routes to /achievement,
 *  1. If the user is logged in, render the Achievement component
 *  2. If the user is not logged in, redirect to /login
 */
const toAchievement = (props: ApplicationProps) =>
  props.accessToken === undefined || props.role === undefined
    ? () => <Redirect to="/login" />
    : () => <Achievement />;

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
