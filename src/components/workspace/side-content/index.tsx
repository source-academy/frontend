import { Card, Text } from '@blueprintjs/core'
import * as React from 'react'

const SideContent: React.SFC<{}> = () => (
  <div className="side-content">
    <Card>
      <Text className="side-content-text">
        Welcome to the playground!
        <br />
        <br />
        Customise the horizontal layout of the playground by dragging the right border of the editor
        left or right; similarly, you can control the layout of the side content by dragging the
        bottom border of this text box up and down.
        <br />
        <br />
        The <i>Source</i> is the official language of the text book
        <i>Structure and Interpretation of Coputer Programs, Javascript Adaptation</i>. It was
        invented just for the purposes of the book. Source is a sublanguage of ECMAScript 2016.
        <br />
        <br />
        You can find the specifications for the Source{' '}
        <a href="http://www.comp.nus.edu.sg/~henz/sicp_js/source_1.pdf">here</a>.
      </Text>
    </Card>
  </div>
)

export default SideContent
