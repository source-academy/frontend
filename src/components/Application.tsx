import { decompressFromEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Academy from '../containers/academy';
import Login from '../containers/LoginContainer';
import Playground from '../containers/PlaygroundContainer';
import { Role, sourceChapters } from '../reducers/states';
import { ExternalLibraryName, ExternalLibraryNames } from './assessment/assessmentShape';
import NavigationBar from './NavigationBar';
import NotFound from './NotFound';

export interface IApplicationProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export interface IStateProps {
  accessToken?: string;
  currentPlaygroundChapter: number;
  role?: Role;
  title: string;
  name?: string;
  currentPlaygroundExternalLibrary: ExternalLibraryName;
}

export interface IDispatchProps {
  handleClearContext: (chapter: number, externalLibraryName: ExternalLibraryName) => void;
  handleEditorValueChange: (val: string) => void;
  handleEnsureLibrariesLoaded: () => void;
  handleLogOut: () => void;
  handlePlaygroundExternalSelect: (external: ExternalLibraryName) => void;
}

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
            <Route path="/playground" component={Playground} />
            <Route path="/login" render={toLogin(this.props)} />
            <Route exact={true} path="/" render={this.redirectToAcademy} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }

  private redirectToAcademy = () => <Redirect to="/academy" />;
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
  <Login ivleToken={qs.parse(props.location.search).token} />
);

const parsePlayground = (props: IApplicationProps) => {
  const prgrm = parsePrgrm(props);
  const chapter = parseChapter(props) || props.currentPlaygroundChapter;
  const externalLibraryName = parseExternalLibrary(props) || props.currentPlaygroundExternalLibrary;
  if (prgrm) {
    props.handleEditorValueChange(prgrm);
    props.handleEnsureLibrariesLoaded();
    props.handleClearContext(chapter, externalLibraryName);
    props.handlePlaygroundExternalSelect(externalLibraryName);
  }
};

const parsePrgrm = (props: RouteComponentProps<{}>) => {
  const qsParsed = qs.parse(props.location.hash);
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm;
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined;
};

const parseChapter = (props: RouteComponentProps<{}>) => {
  const chapQuery = qs.parse(props.location.hash).chap;
  const chap = chapQuery === undefined ? NaN : parseInt(chapQuery, 10);
  return sourceChapters.includes(chap) ? chap : undefined;
};

const parseExternalLibrary = (props: RouteComponentProps<{}>) => {
  const ext = qs.parse(props.location.hash).ext || '';
  return Object.values(ExternalLibraryNames).includes(ext) ? ext : ExternalLibraryNames.NONE;
};

export default Application;
