### React error handler

To report errors from a React app, you'll need to set up and use an
[`ErrorBoundary` component](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html)
and initialize an `Airbrake.Notifier` with your `projectId` and `projectKey`.

```js
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
```

Then you can use it as a regular component:

```html
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

Read [Error Handling in React 16](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html) for more details.
