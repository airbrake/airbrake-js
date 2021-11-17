# Usage with Next.js
This is a sample application that can be found at
[Learn Next.js](https://nextjs.org/learn). It has been adapted to include
client-side and server-side error reporting with Airbrake.

To run the app, run `npm install` then `npm run dev`. The app will be available
at [http://localhost:3000](http://localhost:3000). Sample client-side
errors are triggered with a `Throw error` button on the [homepage](http://localhost:3000)
(`pages/index.js`). Sample server-side errors are triggered by visiting one of
the [blog post pages](http://localhost:3000/posts/ssg-ssr) (`posts/[id].js`).

## Client-side error reporting
To report client-side errors from a Next.js app, you'll need to set up and use an
[`ErrorBoundary` component](https://reactjs.org/docs/error-boundaries.html),
and initialize a `Notifier` with your `projectId` and `projectKey`.

```js
import React from 'react';
import { Notifier } from '@airbrake/browser';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.airbrake = new Notifier({
      projectId: 1,
      projectKey: 'FIXME'
    });
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // Send error to Airbrake
    this.airbrake.notify({
      error: error,
      params: {info: info}
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Then, you can use it as a regular component:

```html
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

## Server-side error reporting
To report server-side errors from a Next.js app, you'll need to [override the
default `Error` component](https://nextjs.org/docs/advanced-features/custom-error-page#more-advanced-error-page-customizing).
Define the file `pages/_error.js` and add the following code:

```js
function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  if (typeof window === "undefined") {
    const Airbrake = require('@airbrake/node')
    const airbrake = new Airbrake.Notifier({
      projectId: 1,
      projectKey: 'FIXME'
    });
    if (err) {
      airbrake.notify(err)
    }
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
```
