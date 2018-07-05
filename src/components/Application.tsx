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
  handleFetchTokens: (ivleToken: string) => void
  handleFetchUsername: () => void
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
          <Route path="/login" component={Login} />
          <Route exact={true} path="/" component={redirectToNews} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  )
}

const toAcademy = (props: IApplicationProps) => {
  const ivleToken = qs.parse(props.location.search).token
  if (ivleToken !== undefined) {
    props.handleFetchTokens(ivleToken) // just received a callback from IVLE
    props.handleFetchUsername()
    return () => <Redirect to="/playground" /> // TODO: spawn loading
  } else if (props.accessToken === undefined) {
    return () => <Redirect to="/login" />
  } else {
    return () => <Academy accessToken={props.accessToken} />
  }
}

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
