# Usage with Redux

#### 1. Add dependencies
``` bash
npm install airbrake-js redux-airbrake --save
```

#### 2. Import dependency
``` js
import AirbrakeClient from 'airbrake-js';
import airbrakeMiddleware from 'redux-airbrake';
```

#### 3. Configure & add middleware
``` js
const airbrake = new AirbrakeClient({
    projectId: '******',
    projectKey: '**************'
});

const errorMiddleware = airbrakeMiddleware(airbrake);

export const store = createStore(
    rootReducer,
    applyMiddleware(
        errorMiddleware
    )
);

export default store;
```

#### Adding notice annotations (optional)

It's possible to annotate error notices with all sorts of useful information at the time they're captured by supplying it in the object being reported.

``` js
const errorMiddleware = airbrakeMiddleware(airbrake, {
    noticeAnnotations: { context: { environment: window.ENV } }
});
```

#### Adding filters

Since an Airbrake instrace is passed to the middleware, you can simply add
filters to the instance as described here:

[https://github.com/airbrake/airbrake-js#filtering-errors](https://github.com/airbrake/airbrake-js#filtering-errors)

For full documentation, visit [redux-airbrake](https://github.com/alexcastillo/redux-airbrake) on GitHub.
