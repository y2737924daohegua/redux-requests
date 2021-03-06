---
title: resetRequests
description: resetRequests API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`resetRequests` is a built-in action to reset requests state.
Sometimes you might need to clear data and errors of your requests, including both queries and mutations.
You can use `resetRequests` action to do it. For example:

```js
import { resetRequests } from '@redux-requests/core';

// clear everything
dispatch(resetRequests());

// clear errors and data for FETCH_BOOKS query
dispatch(resetRequests([FETCH_BOOKS]));

// clear errors if any for for DELETE_BOOKS mutation
dispatch(resetRequests([DELETE_BOOKS]));

// clear errors and data for FETCH_BOOKS and FETCH_BOOK with 1 request key
dispatch(
  resetRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]),
);
```

What is important, `resetRequests` apart from reset also aborts all pending requests of the given types.
You can prevent it by passing 2nd argument `dispatch(resetRequests([FETCH_BOOKS], false))`

Also note that `resetRequests` also sets query `pristine` to `true` and clears cache if set.

Moreover, it is possible to prevent reset of queries which are cached by passing 3rd argument `resetCached` (`true` by default), for example `dispatch(resetRequests([FETCH_BOOKS], false, false))`

Last but not least, it also stops all pollings for requests of the given types.
