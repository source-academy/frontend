export function UnexpectedError() {
  return (
    <div data-testid="sicp-unexpected-error">
      Something unexpected went wrong trying to load this page. Please try refreshing the page. If
      the issue persists, kindly let us know by filing an issue at{' '}
      <a href="https://github.com/source-academy/frontend">
        https://github.com/source-academy/frontend
      </a>
      .
    </div>
  );
}

export function PageNotFoundError() {
  return (
    <div data-testid="sicp-page-not-found-error">
      We could not find the page you were looking for. Please check the URL again. If you believe
      the URL is correct, kindly let us know by filing an issue at{' '}
      <a href="https://github.com/source-academy/frontend">
        https://github.com/source-academy/frontend
      </a>
      .
    </div>
  );
}

export function ParsingError() {
  return (
    <div data-testid="sicp-parsing-error">
      An error occured while loading the page. Kindly let us know by filing an issue at{' '}
      <a href="https://github.com/source-academy/frontend">
        https://github.com/source-academy/frontend
      </a>{' '}
      and we will get it fixed as soon as possible.
    </div>
  );
}
