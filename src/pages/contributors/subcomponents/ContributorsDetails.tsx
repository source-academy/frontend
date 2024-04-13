import { Card, Elevation, H3, H5 } from '@blueprintjs/core';
import React from 'react';
import classes from 'src/styles/Contributors.module.scss';

import { Links } from '../../../commons/utils/Constants';

const dot = <span className={classes['dot']}>&bull;</span>;

const ContributorsDetails: React.FC = () => (
  <div className={classes['outsideDetails']}>
    <Card className={classes['contributorsDetails']} elevation={Elevation.ONE}>
      <H3>The Team behind the Source Academy</H3>
      <p className={classes['description']}>
        The <i>Source Academy</i> is designed and developed by a team of students, most of who have
        used the system to learn the fundamentals of computing and enjoyed it. This page includes
        all developers who contributed to the Source Academy <i>Strange</i> (2024) and its
        precursors <i>Merlin</i> (2023), <i>Rook</i> (2022), <i>Knight</i> (2020) and <i>Cadet</i>{' '}
        (2018). These versions succeeded Source Academy 2 (2017) and ultimately the original Source
        Academy (2016).
      </p>
      <div className={classes['leadership']}>
        <H5>
          <strong>
            <u>2024 Leadership (Strange)</u>
          </strong>
        </H5>
        <p>
          Richard Dominick
          <br />
          <strong>(CTO)</strong>
        </p>
        {dot}
        <p>
          Zhang Yao
          <br />
          <strong>(Frontend)</strong>
        </p>
        {dot}
        <p>
          Richard Dominick
          <br />
          <strong>(Backend)</strong>
        </p>
        {dot}
        <p>
          Lee Hyung Woon
          <br />
          <strong>(Game)</strong>
        </p>
        {dot}
        <p>
          Kyriel Mortel Abad
          <br />
          <strong>(Languages)</strong>
        </p>
        {dot}
        <p>
          Lee Yi
          <br />
          <strong>(Modules)</strong>
        </p>
        {dot}
        <p>
          Boyd Anderson,
          <br />
          Martin Henz,
          <br />
          Eldric Liew,
          <br />
          Low Kok Lim,
          <br />
          Sanka Rasnayaka
          <br />
          <strong>(Coordination)</strong>
        </p>
      </div>
      <div className={classes['hallOfFame']}>
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
          Julius Putra Tanu Setiaji {dot} Lee Ning Yuan {dot} Vignesh Shankar {dot} Thomas Tan {dot}{' '}
          Chen Shaowei
        </p>
        <p>
          <strong>Graphic design</strong>
        </p>
        <p>
          Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei {dot} Sigmund Chianasta
        </p>
      </div>
      <div className={classes['leadership']}>
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
      <div className={classes['leadership']}>
        <p className={classes['evenWider']}>
          <strong>2020 Leadership (Knight)</strong>
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
        <p className={classes['wider']}>
          Tee Hao Wei
          <br />
          (Backend &amp; DevOps)
        </p>
      </div>
      <div className={classes['leadership']}>
        <p>
          <strong>2021 Leadership</strong>
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
          (Frontend)
        </p>
        {dot}
        <p className={classes['evenWider']}>
          Daryl Tan, Thomas Tan
          <br />
          (Source)
        </p>
        {dot}
        <p className={classes['wider']}>
          Tee Hao Wei
          <br />
          (Backend &amp; DevOps)
        </p>
      </div>
      <div className={classes['leadership']}>
        <p className={classes['evenWider']}>
          <strong>2022 Leadership (Rook)</strong>
        </p>
        <br />
        <p>
          Tee Hao Wei
          <br />
          (CTO)
        </p>
        {dot}
        <p>
          Chow En Rong
          <br />
          (Frontend)
        </p>
        {dot}
        <p>
          Chen Yanyu
          <br />
          (Backend)
        </p>
        {dot}
        <p>
          Samuel Fang
          <br />
          (SICP JS)
        </p>
        {dot}
        <p>
          Gokul Rajiv,
          <br />
          Lee Hyung Woon
          <br />
          (Game)
        </p>
        {dot}
        <p>
          Shen Yi Hong,
          <br />
          Zhan Jie,
          <br />
          Thomas Tan
          <br />
          (Source)
        </p>
        {dot}
        <p>
          Bryan Loh,
          <br />
          Marcus Tang
          <br />
          (Modules)
        </p>
      </div>
      <div className={classes['leadership']}>
        <p className={classes['evenWider']}>
          <strong>2023 Leadership (Merlin)</strong>
        </p>
        <br />
        <p>
          Richard Dominick
          <br />
          <strong>(CTO)</strong>
        </p>
        {dot}
        <p>
          Chow En Rong,
          <br />
          Shen Yi Hong
          <br />
          <strong>(Frontend)</strong>
        </p>
        {dot}
        <p>
          Chen Yanyu
          <br />
          <strong>(Backend)</strong>
        </p>
        {dot}
        <p>
          Gokul Rajiv,
          <br />
          Lee Hyung Woon
          <br />
          <strong>(Game)</strong>
        </p>
        {dot}
        <p>
          Shen Yi Hong,
          <br />
          Zhan Jie,
          <br />
          <strong>(Source)</strong>
        </p>
        {dot}
        <p>
          Lee Yi,
          <br />
          Joel Leow
          <br />
          <strong>(Modules)</strong>
        </p>
        {dot}
        <p>
          Richard Dominick
          <br />
          <strong>(Robotics)</strong>
        </p>
      </div>
      <div className={classes['contributors']}>
        <H5>
          <strong>
            <u>All Contributors</u>
          </strong>
        </H5>
        <p>
          Below are all contributors to the{' '}
          <a href={Links.githubOrg}>GitHub repositories of the Source Academy</a>. Feel free to join
          us!
        </p>
      </div>
    </Card>
  </div>
);

export default ContributorsDetails;
