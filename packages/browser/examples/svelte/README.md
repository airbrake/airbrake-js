# Usage with Svelte

Integration with Svelte is as simple as adding `handleError` hooks (Server or Client):

- For server error handling, add `handleError` of `HandleServerError` type
- For handle error of client add `handleError` of `HandleClientError` type

## App configuration

```ts
// app.d.ts

// Add interface of Error

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
  namespace App {
    interface Error {
      message: unknown;
      errorId: string;
    }
  }
}

export {};
```

## Server Hook

To establish an error handler for the server, use a `Notifier` with your `projectId` and `projectKey` as parameters. In this case, the handler will be located in the file `src/hooks.server.js`.

```js
// src/hooks.server.js
import crypto from 'crypto';
import { Notifier } from '@airbrake/browser';

var airbrake = new Notifier({
  projectId: 1, // Airbrake project id
  projectKey: 'FIXME', // Airbrake project API key
});

airbrake.addFilter(function (notice) {
  notice.context.hooks = 'server';
  return notice;
});

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
  const errorId = crypto.randomUUID();
  // example integration with https://airbrake.io/
  airbrake.notify({
    error: error,
    params: { errorId: errorId, event: event },
  });

  return {
    message: error,
    errorId,
  };
}
```

## Client Hook

To establish an error handler for the client, use a `Notifier` with your `projectId` and `projectKey` as parameters. In this case, the handler will be located in the file `src/hooks.client.js`.

```js
// src/hooks.client.js
import crypto from 'crypto';
import { Notifier } from '@airbrake/browser';

var airbrake = new Notifier({
  projectId: 1, // Airbrake project id
  projectKey: 'FIXME', // Airbrake project API key
});

airbrake.addFilter(function (notice) {
  notice.context.hooks = 'client';
  return notice;
});

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
  const errorId = crypto.randomUUID();
  // example integration with https://airbrake.io/
  airbrake.notify({
    error: error,
    params: { errorId: errorId, event: event },
  });

  return {
    message: error,
    errorId,
  };
}
```

## Test

To test that server hook has been installed correctly in your Svelte project.

```js
// +page.server.js

import { error } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const post = await db.getPost(params.slug);

  if (!post) {
    throw error(404, {
      message: 'Not found',
    });
  }

  return { post };
}
```

To test that client hook has been installed correctly in your Svelte project, just open up the JavaScript console in your internet browser and paste in:

```js
window.onerror('TestError: This is a test', 'path/to/file.js', 123);
```
