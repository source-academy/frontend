import { Card, Text } from '@blueprintjs/core'
import * as React from 'react'

const SideContent: React.SFC<{}> = () => (
  <div className="side-content">
    <Card>
      <Text className="side-content-text">{welcome}</Text>
    </Card>
  </div>
)

const SICP_SITE = 'http://www.comp.nus.edu.sg/~henz/sicp_js/'
const CHAP = '\xa7'

const welcome = (
  <>
    Welcome to the source-academy playground!
    <br />
    <br />
    The language <i>Source</i> is the official language of the textbook{' '}
    <i>Structure and Interpretation of Computer Programs, JavaScript Adaptation</i>. You have never
    heard of Source? No worries! It was invented just for the purpose of the book. Source is a
    sublanguage of ECMAScript 2016 (7th Edition) and defined in{' '}
    <a href={SICP_SITE}>
      the documents titled <i>"Source {CHAP}x"</i>
    </a>, where x refers to the respective textbook chapter. For example, Source {CHAP}3 is suitable
    for textbook Chapter 3 and the preceeding chapters.
    <br />
    <br />
    The playground comes with an editor and a REPL, on the left and right of the screen,
    respectively. You may customimse the layout of the playground by clicking and dragging on the
    right border of the editor, or the top border of the REPL.
  </>
)

export default SideContent
