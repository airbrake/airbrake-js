# Usage with Redux

#### 1. Add dependencies
``` bash
npm install airbrake-js redux-airbrake --save
```

#### 2. Import dependency
``` js
import airbrakeMiddleware from 'redux-airbrake';
```

#### 3. Configure & add middleware
``` js
const errorMiddleware = airbrakeMiddleware({
    projectId: '******',
    projectKey: '**************'
});

export const store = createStore(
    rootReducer,
    applyMiddleware(
        errorMiddleware
    )
);

export default store;
```

#### Adding notice metadata (optional)

``` js
const errorMiddleware = airbrakeMiddleware({
    projectId: '******',
    projectKey: '**************'
}, {
    context: { environment: window.ENV }
});
```

[redux-airbrake](https://github.com/alexcastillo/redux-airbrake) on GitHub.