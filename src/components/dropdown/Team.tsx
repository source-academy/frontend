import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
// import Contributors from '../Contributors'

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const dot = <span className="dot">&bull;</span>;

const Team: React.SFC<DialogProps> = props => (
  <Dialog
    className="team"
    icon={IconNames.PEOPLE}
    isCloseButtonShown={false}
    isOpen={props.isOpen}
    onClose={props.onClose}
    title="Contributors"
  >
    <div className={Classes.DIALOG_BODY}>
        <div className="leadership">
          <h5>
            <strong><u>2019 Leadership</u></strong>
          </h5>
          <p>
            Liow Jia Chen
            <br />
            <strong>(Backend)</strong>
          </p>
          {dot}
          <p>
            Ge Shuming
            <br />
            <strong>(Frontend)</strong>
          </p>
          {dot}
          <p>
            Rahul Rajesh
            <br />
            <strong>(DevOps)</strong>
          </p>
          {dot}
          <p>
            Daryl Tan
            <br />
            <strong>(Source)</strong>
          </p>
          {dot}
          <p>
            Martin Henz
            <br />
            <strong>(Coordination)</strong>
          </p>
        </div>
        <div className="hallOfFame">
          <h5>
            <strong><u>Hall of Fame</u></strong>
          </h5>
          <p>
            <strong>Cadet architect</strong>
          </p>
          <p>
            Evan Sebastian
          </p>
          <p>
            <strong>Cadet core team</strong>
          </p>
          <p>
            Julius Putra Tanu Setiaji {dot} Lee Ning Yuan {dot} Vignesh Shankar {dot} Thomas Tan {dot} Chen Shaowei
          </p>
          <p>
            <strong>Graphic design</strong>
          </p>
          <p>
            Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei
          </p>
        </div>
        <div className="contributors">
          <h5>
            <strong><u>All Contributors</u></strong>
          </h5>
          <p>
            Here goes the full list of contributors to the Source Academy with their pull requests in the repos:
            cadet, cadet-frontend, grader, js-slang, sharedb-ace-backend
          </p>
        </div>
        {/* <Contributors /> */}
    </div>
  </Dialog>
);

export default Team;