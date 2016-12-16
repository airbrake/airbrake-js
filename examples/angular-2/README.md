# Usage with Angular 2 & TypeScript

An example Angular 2 configuration:

```TypeScript
class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: airbrakeJs.Client;

  constructor() {
    this.airbrake = new airbrakeJs.Client({
      projectId: 1234,
      projectKey: 'abc123'
    });
  }

  handleError(error) {
    airbrake.notify(error);
  }
}

@NgModule({
  providers: [{provide: ErrorHandler, useClass: AirbrakeErrorHandler}]
})

class MyModule {}
```
