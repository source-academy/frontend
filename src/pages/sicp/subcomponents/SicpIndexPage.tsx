import { H1, H2, H4 } from '@blueprintjs/core';
import * as React from 'react';

import SicpToc from './SicpToc';

const originalAuthors = 'Harold Abelson and Gerald Jay Sussman';
const originalWithAuthors = 'with Julie Sussman';
const adaptedAuthors = 'Martin Henz and Tobias Wrigstad';
const adaptedWithAuthors =
  'with Chan Ger Hean, He Xinyue, Liu Hang, Feng Piaopiao, Jolyn Tan and Wang Qian';

const authors = (
  <div className="sicp-authors">
    <br />
    <H4>{originalAuthors}</H4>
    <p>
      {originalWithAuthors}
      <i>— original authors</i>
    </p>
    <br />
    <H4>{adaptedAuthors}</H4>
    <p>
      {adaptedWithAuthors}
      <i>— adapters to JavaScript</i>
    </p>
  </div>
);

const bookTitle = (
  <div>
    <H1>Structure and Interpretation of Computer Programs</H1>
    <H2>— JavaScript Adaptation</H2>
  </div>
);

const licenses = (
  <div className="sicp-licenses">
    <div>
      <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">
        <img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" alt="CC BY-NC-SA 4.0" />
      </a>
    </div>
    <div>
      <p>
        This work is licensed under a{' '}
        <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">
          Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
        </a>
        .
      </p>
    </div>
    <br />
    <div>
      <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow">
        <img
          src="https://camo.githubusercontent.com/46d38fe6087a9b9bdf7e45458901b818765b8391/68747470733a2f2f75706c6f61642e77696b696d656469612e6f72672f77696b6970656469612f636f6d6d6f6e732f7468756d622f372f37392f4c6963656e73655f69636f6e2d67706c2e7376672f353070782d4c6963656e73655f69636f6e2d67706c2e7376672e706e67"
          alt="GPL 3"
          data-canonical-src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png"
        />
      </a>
    </div>
    <div>
      <p>
        All JavaScript programs in this work are licensed under the{' '}
        <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="nofollow">
          GNU General Public License Version 3
        </a>
        .
      </p>
    </div>
    <br />
    <div>
      <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">
        <img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" alt="CC BY-NC-SA 4.0" />
      </a>
    </div>
    <div>
      <p>
        The final version of this work will be published by The MIT Press under a{' '}
        <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" rel="nofollow">
          Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License
        </a>
        .
      </p>
    </div>
    <br />
  </div>
);

const SicpIndexPage: React.FC = () => {
  return (
    <div className="sicp-index-page">
      <div className="sicp-cover">
        <img src="http://source-academy.github.io/sicp/sicp.png" alt="SICP" />
        <div className="sicp-cover-text">
          {bookTitle}
          {authors}
        </div>
      </div>
      <br />
      <H2>Content</H2>
      <SicpToc />
      <br />
      <H2>Licenses</H2>
      {licenses}
    </div>
  );
};

export default SicpIndexPage;
