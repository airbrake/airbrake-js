# Usage with Angular 2 & TypeScript

Create `error_handler.ts`:

```TypeScript
import { ErrorHandler } from '@angular/core';
import AirbrakeClient from 'airbrake-js';

export class AirbrakeErrorHandler implements ErrorHandler {
  airbrake: AirbrakeClient;

  constructor() {
    this.airbrake = new AirbrakeClient({
      projectId: 1,
      projectKey: 'FIXME'
    });
  }

  handleError(error: any): void {
    this.airbrake.notify(error);
  }
}
```

Add `ErrorHandler` provider to your `AppModule`:

```TypeScript
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
