globalThis.process = globalThis.process || {
  browser: true,
  env: Object.create(null),
  versions: Object.create(null),
  nextTick(callback, ...args) {
    if (typeof queueMicrotask === 'function') queueMicrotask(() => callback(...args));
    else setTimeout(() => callback(...args), 0);
  },
  cwd() { return '/'; },
  umask() { return 0; },
};
