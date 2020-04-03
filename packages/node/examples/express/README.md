# Using Airbrake with Express.js

This example Node.js application uses Express.js and sets up Airbrake to report
errors and performance data. To adapt this example to your app, follow these
steps:

#### 1. Install the package
```shell
npm install @airbrake/node
```

#### 2. Include @airbrake/node and the Express.js instrumentation in your app
Include the required Airbrake libraries in your `app.js`

```js
const Airbrake = require('@airbrake/node');
const airbrakeExpress = require('@airbrake/node/dist/instrumentation/express');
```

#### 3. Configure Airbrake with your project's credentials

```js
const airbrake = new Airbrake.Notifier({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
});
```

#### 4. Add the Airbrake Express middleware
This middleware should be added before any routes are defined.

```js
app.use(airbrakeExpress.makeMiddleware(airbrake));
```

#### 5. Add the Airbrake Express error handler
The error handler middleware should be defined last. For more info on how this
works, see the official
[Express error handling doc](http://expressjs.com/en/guide/error-handling.html).

```js
app.use(airbrakeExpress.makeErrorHandler(airbrake));
```

#### 6. Run your app
The last step is to run your app. To test that you've configured Airbrake
correctly, you can throw an error inside any of your routes:
```js
app.get('/hello/:name', function hello(_req, _res) {
  throw new Error('hello from Express');
});
```

Any unhandled errors that are thrown will now be reported to Airbrake. See the
[basic usage](https://github.com/airbrake/airbrake-js/tree/master/packages/node#basic-usage)
to learn how to manually send errors to Airbrake.


**Note:** to see this all in action, take a look at our
[example `app.js` file](https://github.com/airbrake/airbrake-js/blob/master/packages/node/examples/express/app.js)
and to run the example, follow the next steps.


# Running the example app

If you want to run this example application locally, follow these steps:

#### 1. Clone the airbrake-js repo:
```shell
git clone git@github.com:airbrake/airbrake-js.git
```
#### 2. Navigate to this directory:
```
cd airbrake-js/packages/node/examples/express
```
#### 3. Run the following commands while providing your `project ID` and `project API key`
```shell
npm install
AIRBRAKE_PROJECT_ID=your-id AIRBRAKE_PROJECT_KEY=your-key node app.js
firefox localhost:3000
```
