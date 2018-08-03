import { Classes, Dialog } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

type DialogProps = {
  isOpen: boolean
  onClose: () => void
}

const Help: React.SFC<DialogProps> = props => (
  <Dialog
    className="help"
    icon={IconNames.ERROR}
    isOpen={props.isOpen}
    onClose={props.onClose}
    title="Help"
  >
    <div className={Classes.DIALOG_BODY}>
      <p>Please use the following resources when you encounter issues with this system.</p>
      <ul>
        <li>
          For critical technical issues that seriously affect your learning experience, email the
          Technical Services of the NUS School of Computing at{' '}
          <a href="mailto:techsvc@comp.nus.edu.sg">techsvc@comp.nus.edu.sg</a> or call 6516 2736.
        </li>
        <li>
          For non-critical technical issues, such as enhancement suggestions, please use the issue
          system of the{' '}
          <a href="https://github.com/source-academy">Source Academy repositories on GitHub</a>.
        </li>
        <li>
          For issues related to the content of missions, quests, paths and contests, use the
          respective forum at <a href="https://piazza.com/nus.edu.sg/fall2018/cs1101s"> piazza</a>,{' '}
          or approach your Avenger, Reflection instructor or lecturer.
        </li>
      </ul>
    </div>
  </Dialog>
)

export default Help
