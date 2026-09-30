import assert from 'assert';
import * as buffer from 'buffer';
import zlib from 'browserify-zlib';
import events from 'events';
import stream from 'stream-browserify';
import util from 'util/';

const modules = {
  assert,
  buffer,
  stream,
  events,
  util,
  zlib,
  async_hooks: { AsyncResource: class { runInAsyncScope(fn, receiver, ...args) { return fn.apply(receiver, args); } } },
  crypto: { getRandomValues: values => globalThis.crypto.getRandomValues(values) },
  child_process: { execSync() { throw new Error('Commande système indisponible dans le navigateur.'); } },
  '../package.json': { version: '0.0.19' },
};

globalThis.require = name => {
  if (!(name in modules)) throw new Error(`Module Node non pris en charge dans nwlink : ${name}`);
  return modules[name];
};
