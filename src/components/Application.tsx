import { decompressFromEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import * as React from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router'

import Academy from '../containers/academy'
import Announcements from '../containers/AnnouncementsContainer'
import Login from '../containers/LoginContainer'
import Playground from '../containers/PlaygroundContainer'
import { sourceChapters } from '../reducers/states'
import NavigationBar from './NavigationBar'
import NotFound from './NotFound'

export interface IApplicationProps extends IDispatchProps, RouteComponentProps<{}> {
  title: string
  accessToken?: string
  username?: string
}

export interface IDispatchProps {
  handleChangeChapter: (chapter: number) => void
  handleEditorValueChange: (val: string) => void
}

const Application: React.SFC<IApplicationProps> = props => {
  const redirectToNews = () => <Redirect to="/news" />

  parsePlayground(props)

  return (
    <div className="Application">
      <NavigationBar title={props.title} username={props.username} />
      <div className="Application__main">
        <Switch>
          <Route path="/academy" component={toAcademy(props)} />
          <Route path="/news" component={Announcements} />
          <Route path="/material" component={Announcements} />
          <Route path="/playground" component={Playground} />
          <Route path="/status" component={Announcements} />
          <Route path="/login" render={toLogin(props)} />
          <Route exact={true} path="/" render={redirectToNews} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = (props: IApplicationProps) =>
  props.accessToken === undefined
    ? () => <Redirect to="/login" />
    : () => <Academy accessToken={props.accessToken} />

const toLogin = (props: IApplicationProps) => () => (
  <Login ivleToken={qs.parse(props.location.search).token} />
)

const parsePlayground = (props: IApplicationProps) => {
  const prgrm = parsePrgrm(props)
  const lib = parseLib(props)
  if (prgrm) {
    props.handleEditorValueChange(prgrm)
  }
  if (lib) {
    props.handleChangeChapter(lib)
  }
}

const parsePrgrm = (props: RouteComponentProps<{}>) => {
  const qsParsed = qs.parse(props.location.hash)
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined
}

const parseLib = (props: RouteComponentProps<{}>) => {
  const libQuery = qs.parse(props.location.hash).lib
  const lib = libQuery === undefined ? NaN : parseInt(libQuery, 10)
  return sourceChapters.includes(lib) ? lib : undefined
}

export default Application
