### Usage with Angular 2+ & TypeScript

### Create an error handler
The first step is to create an error handler with a `Notifier`
initialized with your `projectId` and `projectKey`. In this example the
handler will be in a file called `airbrake-error-handler.ts`.

```ts
// src/app/airbrake-error-handler.ts

import { ErrorHandler } from '@angular/core';
import { Notifier } from '@airbrake/browser';

export class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: Notifier;

  constructor() {
    this.airbrake = new Notifier({
      projectId: 1,
      projectKey: 'FIXME',
      environment: 'production'
    });
  }

  handleError(error: any): void {
    this.airbrake.notify(error);
  }
}
```

### Add the error handler to your `AppModule`

The last step is adding the `AirbrakeErrorHandler` to your `AppModule`, then
your app will be ready to report errors to Airbrake.

```ts
// src/app/app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { AirbrakeErrorHandler } from './airbrake-error-handler';

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

To test that Airbrake has been installed correctly in your Angular project,
just open up the JavaScript console in your internet browser and paste in:

```js
window.onerror("TestError: This is a test", "path/to/file.js", 123);
```
