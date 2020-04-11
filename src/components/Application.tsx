import { decompressFromEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Academy from '../containers/academy';
import Login from '../containers/LoginContainer';
import Material from '../containers/material/MaterialContainer';
import MissionControlContainer from '../containers/missionControl';
import Playground from '../containers/PlaygroundContainer';
import Sourcecast from '../containers/sourcecast/SourcecastContainer';
import { languageURLNames, Role } from '../reducers/states';
import { stringParamToInt } from '../utils/paramParseHelpers';
import { ExternalLibraryName, ExternalLibraryNames } from './assessment/assessmentShape';
import Contributors from './contributors';
import NavigationBar from './NavigationBar';
import NotFound from './NotFound';

import { Variant } from 'js-slang/dist/types';

export interface IApplicationProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export interface IStateProps {
  accessToken?: string;
  currentPlaygroundChapter: number;
  currentPlaygroundVariant: Variant;
  currentPlaygroundWasmEnabled: boolean;
  role?: Role;
  title: string;
  name?: string;
  currentExternalLibrary: ExternalLibraryName;
}

export interface IDispatchProps {
  handleClearContext: (
    chapter: number,
    variant: Variant,
    wasmEnabled: boolean,
    externalLibraryName: ExternalLibraryName
  ) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleEnsureLibrariesLoaded: () => void;
  handleLogOut: () => void;
  handleExternalLibrarySelect: (external: ExternalLibraryName) => void;
  handleSetExecTime: (execTime: string) => void;
}

const assessmentRegExp = ':assessmentId(-?\\d+)?/:questionId(\\d+)?';

class Application extends React.Component<IApplicationProps, {}> {
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
          <Switch>
            <Route path="/academy" component={toAcademy(this.props)} />
            <Route path={`/mission-control/${assessmentRegExp}`} render={toIncubator} />
            <Route path="/playground" component={Playground} />
            <Route path="/login" render={toLogin(this.props)} />
            <Route path="/contributors" component={Contributors} />
            <Route path="/material" component={Material} />
            <Route path="/sourcecast" component={Sourcecast} />
            <Route exact={true} path="/" render={this.redirectToPlayground} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }

  private redirectToPlayground = () => <Redirect to="/playground" />;
}

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = (props: IApplicationProps) =>
  props.accessToken === undefined || props.role === undefined
    ? () => <Redirect to="/login" />
    : () => <Academy accessToken={props.accessToken} role={props.role!} />;

const toLogin = (props: IApplicationProps) => () => (
  <Login luminusCode={qs.parse(props.location.search).code} />
);

const parsePlayground = (props: IApplicationProps) => {
  const prgrm = parsePrgrm(props);
  const chapter = parseChapter(props) || props.currentPlaygroundChapter;
  const variant = parseVariant(props) || props.currentPlaygroundVariant;
  const wasmEnabled = parseWasmEnabled(props) || props.currentPlaygroundWasmEnabled;
  const externalLibraryName = parseExternalLibrary(props) || props.currentExternalLibrary;
  const execTime = parseExecTime(props);
  if (prgrm) {
    props.handleEditorValueChange(prgrm);
    props.handleEnsureLibrariesLoaded();
    props.handleClearContext(chapter, variant, wasmEnabled, externalLibraryName);
    props.handleExternalLibrarySelect(externalLibraryName);
    props.handleSetExecTime(execTime);
  }
};

const toIncubator = (routerProps: RouteComponentProps<any>) => <MissionControlContainer />;

const parsePrgrm = (props: RouteComponentProps<{}>) => {
  const qsParsed = qs.parse(props.location.hash);
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm;
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined;
};

const parseChapter = (props: RouteComponentProps<{}>) => {
  const chapQuery = qs.parse(props.location.hash).chap;

  const chap: number = languageURLNames.has(chapQuery)
    ? languageURLNames.get(chapQuery)!.chapter
    : chapQuery === undefined
    ? NaN
    : parseInt(chapQuery, 10);

  return chap ? chap : undefined;
};

const parseVariant = (props: RouteComponentProps<{}>) => {
  const chapQuery = qs.parse(props.location.hash).chap;

  const variant: Variant = languageURLNames.has(chapQuery)
    ? languageURLNames.get(chapQuery)!.variant
    : 'default';

  return variant;
};

const parseWasmEnabled = (props: RouteComponentProps<{}>) => {
  const chapQuery = qs.parse(props.location.hash).chap;

  const wasmEnabled: boolean = languageURLNames.has(chapQuery)
    ? languageURLNames.get(chapQuery)!.wasmEnabled
    : 'false';

  return wasmEnabled;
};

const parseExternalLibrary = (props: RouteComponentProps<{}>) => {
  const ext = qs.parse(props.location.hash).ext || '';
  return Object.values(ExternalLibraryNames).includes(ext) ? ext : ExternalLibraryNames.NONE;
};

const parseExecTime = (props: RouteComponentProps<{}>) => {
  const time = qs.parse(props.location.hash).exec || '1000';
  // Parse the time string to a number, defaulting execTime to 1000
  const execTime = stringParamToInt(time) || 1000;
  return `${execTime < 1000 ? 1000 : execTime}`;
};

export default Application;
