### Usage with Angular 2+ & TypeScript

### Create an error handler
The first step is to create an error handler with a `Notifier`
initialized with your `projectId` and `projectKey`. In this example the
handler will be in a file called `error_handler.ts`.

```ts
import { ErrorHandler } from '@angular/core';
import { Notifier } from '@airbrake/browser';

export class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: Notifier;

  constructor() {
    this.airbrake = new Notifier({
      projectId: 1,
      projectKey: 'FIXME'
    });
  }

  handleError(error: any): void {
    this.airbrake.notify(error);
  }
}
```

### Add the error handler to your `AppModule`

The last step is adding the `ErrorHandler` to your `AppModule`, then your app
will be ready to report errors to Airbrake.

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { AirbrakeErrorHandler } from './error_handler';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [{provide: ErrorHandler, useClass: AirbrakeErrorHandler}],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
