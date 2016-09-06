'use strict';

module.exports = function funnel(promiseFn, delay = 50) {
  let awaiting = null;
  let nextArgs = null;

  const funnelled = function(...args) {
    if (awaiting) {
      nextArgs = args;
      return awaiting;
    }
    const active = promiseFn(...args);
    awaiting = active
      .then(() => new Promise(resolve => setTimeout(resolve, delay)))
      .then(() => {
        const argv = nextArgs;
        nextArgs = null;
        awaiting = null;
        if (argv !== null) {
          return funnelled(...argv);
        }
      });
    return active;
  };

  return funnelled;
};
