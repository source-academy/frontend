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
          <H3>The people behind Source Academy</H3>
          <p>
            The <i>Source Academy</i> is designed by and for students of the National University of
            Singapore. Students who completed the CS1101S module come back to coach their juniors as
            "Avengers" or to further develop and improve the Academy. This page includes all
            developers who contributed to the Source Academy <i>Knight</i> (2020) and its its
            precursor, <i>Cadet</i> (2018). Both of these succeeded Source Academy 2 (2017) and
            ultimately the original Source Academy (2016).
          </p>
          <div className="leadership">
            <H5>
              <strong>
                <u>2020 Leadership</u>
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
              <strong>(Architecture)</strong>
            </p>
            {dot}
            <p>
              Kan Yip Keng, Jet
              <br />
              <strong>(Frontend)</strong>
            </p>
            {dot}
            <p>
              Low Jun Kai, Sean
              <br />
              <strong>(Frontend)</strong>
            </p>
            {dot}
            <p>
              Daryl Tan
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
              Martin Henz
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
              Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei
            </p>
          </div>
          <div className="leadership">
            <H5>
              <strong>
                <u>2019 Leadership</u>
              </strong>
            </H5>
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
              She Jiayu
              <br />
              <strong>(Tools)</strong>
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
