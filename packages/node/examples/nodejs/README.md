# Using Airbrake with Node.js

#### 1. Install the package
```shell
npm install @airbrake/node
```

#### 2. Include @airbrake/node in your app
Include the required Airbrake libraries in your `app.js`

```js
const Airbrake = require('@airbrake/node');
```

#### 3. Configure Airbrake with your project's credentials

```js
const airbrake = new Airbrake.Notifier({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
});
```

#### 4. Run your app
The last step is to run your app. To test that you've configured Airbrake
correctly, you can throw an error inside any of your routes:
```js
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
  throw new Error('I am an uncaught exception');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

Any unhandled errors that are thrown will now be reported to Airbrake. See the
[basic usage](https://github.com/airbrake/airbrake-js/tree/master/packages/node#basic-usage)
to learn how to manually send errors to Airbrake.


**Note:** to see this all in action, take a look at our
[example `app.js` file](https://github.com/airbrake/airbrake-js/blob/master/packages/node/examples/nodejs/app.js)
and to run the example, follow the next steps.


# Running the example app

If you want to run this example application locally, follow these steps:

#### 1. Clone the airbrake-js repo:
```shell
git clone git@github.com:airbrake/airbrake-js.git
```
#### 2. Navigate to this directory:
```
cd airbrake-js/packages/node/examples/nodejs
```
#### 3. Run the following commands while providing your `project ID` and `project API key`
```shell
npm install
AIRBRAKE_PROJECT_ID=your-id AIRBRAKE_PROJECT_KEY=your-key node app.js
firefox localhost:3000
```
