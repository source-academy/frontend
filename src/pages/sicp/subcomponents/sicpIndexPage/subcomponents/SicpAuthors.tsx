import { H4 } from '@blueprintjs/core';

const originalAuthors = 'Harold Abelson and Gerald Jay Sussman';
const originalWithAuthors = 'with Julie Sussman';
const adaptedAuthors = 'Martin Henz and Tobias Wrigstad';
const adaptedWithAuthors = 'with Julie Sussman';
const developers = 'Samuel Fang';

function SicpAuthors() {
  return (
    <div className="sicp-authors">
      <H4>{originalAuthors}</H4>
      <p>
        {originalWithAuthors}
        <i>— original authors</i>
      </p>
      <H4>{adaptedAuthors}</H4>
      <p>
        {adaptedWithAuthors}
        <i>— adapters to JavaScript</i>
      </p>
      <H4>{developers}</H4>
      <p>
        <i>— designer and developer of this Interactive SICP JS edition</i>
      </p>
    </div>
  );
}

export default SicpAuthors;
