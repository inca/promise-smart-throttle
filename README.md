# Promise Smart Throttle

## The Problem

Say you have a Promise-based API like this:

```es6
function searchBooks(q) {
  // performs XHR, returns a Promise
  return new Promise(...);
}
```

Say you have a Search input and you would like the results
to be be available as soon as possible.

Normally you would simply attach an `input` event listener:

```es6
input.addEventListener('input', ev => searchBooks(ev.target.value));
```

But now your server will receive too many requests
(one per user's keystroke).

In order to prevent this you would typically use `debounce` or `throttle`,
but these are only configured using static timeout:

* set it too high — say goodbye to "as soon as possible" requirement,
* set it too low — say hello to redundant requests.

Basically, you want the first request to be fired immediately, while
all subsequent keystrokes queued until the first request resolves —
and then you only want to fire _one more request_ with most recent query.

You could also give a try to concurrency limit libraries like
[throat](https://www.npmjs.com/package/throat),
but in this specific case you actually want intermediate requests
to be discarded, not queued and executed serially.

## The Solution

That's exactly what `promise-smart-throttle` is for.

You simply wrap your function:

```es6
const throttle = require('promise-smart-throttle');

const throttledSearchBooks = throttle(searchBooks);

// ...

input.addEventListener('input', ev => throttledSearchBooks(ev.target.value));
```

Now the requests will be fired exactly at the rate your server can handle.

## Bonus

You can even throw in a second argument:

```es6
const throttledSearchBooks = throttle(searchBooks, 100);
```

This will add a delay _after the active promise resolves_,
in case you also want to slow it down a bit
(like you do with regular throttle utils).

## Internals

Let's introduce some terms first:

Please observe the exact semantics of how it works
(and what resolves with what) by reading [test specs](test/throttle.test.js).

Specifically,

* "first call" always resolves ASAP (no delay added)
* all subsequent calls do not fire until (first call + delay) resolves
* intermediate calls are basically discarded and resolve to the same
  promise as the last call
