import { Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as qs from 'query-string'
import * as React from 'react'
import { HotKeys } from 'react-hotkeys'
import { RouteComponentProps } from 'react-router'

import WorkspaceContainer from '../containers/workspace'
import { SideContentTab } from './workspace/side-content'

export type PlaygroundProps = RouteComponentProps<{}>

const Playground: React.SFC<PlaygroundProps> = props => {
  return (
    <HotKeys className="Playground pt-dark" keyMap={keyMap}>
      <WorkspaceContainer
        libQuery={parseLibrary(props)}
        prgrmQuery={parsePrgrm(props)}
        sideContentTabs={[playgroundIntroduction]}
      />
    </HotKeys>
  )
}

const parsePrgrm = (props: PlaygroundProps) => qs.parse(props.location.search).prgrm

const parseLibrary = (props: PlaygroundProps) => {
  const libQuery = qs.parse(props.location.search).lib
  return libQuery === undefined ? undefined : parseInt(libQuery, 10)
}

const keyMap = {
  goGreen: 'h u l k'
}

const SICP_SITE = 'http://www.comp.nus.edu.sg/~henz/sicp_js/'
const CHAP = '\xa7'
const playgroundIntroduction: SideContentTab = {
  label: 'Introduction',
  icon: IconNames.COMPASS,
  body: (
    <Text>
      Welcome to the source-academy playground!
      <br />
      <br />
      The language <i>Source</i> is the official language of the textbook{' '}
      <i>Structure and Interpretation of Computer Programs, JavaScript Adaptation</i>. You have
      never heard of Source? No worries! It was invented just for the purpose of the book. Source is
      a sublanguage of ECMAScript 2016 (7th Edition) and defined in{' '}
      <a href={SICP_SITE}>
        {' '}
        the documents titled <i>"Source {CHAP}x"</i>
      </a>, where x refers to the respective textbook chapter. For example, Source {CHAP}3 is
      suitable for textbook Chapter 3 and the preceeding chapters.
      <br />
      <br />
      The playground comes with an editor and a REPL, on the left and right of the screen,
      respectively. You may customimse the layout of the playground by clicking and dragging on the
      right border of the editor, or the top border of the REPL.
    </Text>
  )
}

export default Playground
