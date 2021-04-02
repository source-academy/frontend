import { Card, Elevation } from '@blueprintjs/core';
import { H3, H5 } from '@blueprintjs/core';
import * as React from 'react';

import { Links } from '../../../commons/utils/Constants';

const dot = <span className="dot">&bull;</span>;

class ContributorsDetails extends React.Component {
  public render() {
    return (
      <div className="outsideDetails">
        <Card className="contributorsDetails" elevation={Elevation.ONE}>
          <H3>The People behind Source Academy</H3>
          <p>
            The <i>Source Academy</i> is designed by and for students of the National University of
            Singapore. Students who completed the CS1101S module come back to coach their juniors as
            "Avengers" or to further develop and improve the Academy. This page includes all
            developers who contributed to the Source Academy <i>Knight</i> (2020-21) and its its
            precursor, <i>Cadet</i> (2018). Both of these succeeded Source Academy 2 (2017) and
            ultimately the original Source Academy (2016).
          </p>
          <div className="leadership">
            <H5>
              <strong>
                <u>2021 Leadership</u>
              </strong>
            </H5>
            <p>
              Tiffany Chong
              <br />
              <strong>(Game)</strong>
            </p>
            {dot}
            <p>
              Anthony Halim
              <br />
              <strong>(Frontend)</strong>
            </p>
            {dot}
            <p className="wider">
              Daryl Tan,
              <br />
              Thomas Tan
              <br />
              Thomas Tan
              <br />
              <strong>(Source)</strong>
            </p>
            {dot}
            <p className="wider">
              Tee Hao Wei
              <br />
              <strong>(Backend &amp; DevOps)</strong>
            </p>
            {dot}
            <p>
              Martin Henz,
              <br />
              Boyd Anderson,
              <br />
              Low Kok Lim,
              <br />
              Eldric Liew
              <br />
              <strong>(Coordination)</strong>
            </p>
          </div>
          <div className="hallOfFame">
            <H5>
              <strong>
                <u>Hall of Fame</u>
              </strong>
            </H5>
            <p>
              <strong>Cadet architect</strong>
            </p>
            <p>Evan Sebastian</p>
            <p>
              <strong>Cadet core team</strong>
            </p>
            <p>
              Julius Putra Tanu Setiaji {dot} Lee Ning Yuan {dot} Vignesh Shankar {dot} Thomas Tan{' '}
              {dot} Chen Shaowei
            </p>
            <p>
              <strong>Graphic design</strong>
            </p>
            <p>
              Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei {dot} Sigmund Chianasta
            </p>
          </div>
          <div className="leadership">
            <p>
              <strong>2019 Leadership</strong>
            </p>
            <br />
            <p>
              Liow Jia Chen
              <br />
              (Backend)
            </p>
            {dot}
            <p>
              Ge Shuming
              <br />
              (Frontend)
            </p>
            {dot}
            <p>
              Rahul Rajesh
              <br />
              (DevOps)
            </p>
            {dot}
            <p>
              Daryl Tan
              <br />
              (Source)
            </p>
            {dot}
            <p>
              She Jiayu
              <br />
              (Tools)
            </p>
          </div>
          <div className="leadership">
            <p>
              <strong>2020 Leadership</strong>
            </p>
            <br />
            <p>
              Tiffany Chong
              <br />
              (Game)
            </p>
            {dot}
            <p>
              Anthony Halim
              <br />
              (Architecture)
            </p>
            {dot}
            <p>
              Kan Yip Keng, Jet
              <br />
              (Frontend)
            </p>
            {dot}
            <p>
              Low Jun Kai, Sean
              <br />
              (Frontend)
            </p>
            {dot}
            <p>
              Daryl Tan
              <br />
              (Source)
            </p>
            {dot}
            <p className="wider">
              Tee Hao Wei
              <br />
              (Backend &amp; DevOps)
            </p>
          </div>
          <div className="contributors">
            <H5>
              <strong>
                <u>All Contributors</u>
              </strong>
            </H5>
            <p>
              Below are all contributors to the{' '}
              <a href={Links.githubOrg}>GitHub repositories of the Source Academy</a>.
            </p>
          </div>
        </Card>
      </div>
    );
  }
}

export default ContributorsDetails;
