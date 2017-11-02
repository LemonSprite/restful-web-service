'use strict';

const Redis = require('ioredis');

const redis = new Redis(config.redis);

module.exports = {
  set,
  get,
  incr,

  hset,
  hget,
  hdel,
  hincr,

  sadd,
  spop,
  srem,
  sismember,

  zrank,
  zrange,
  zrevrange,
  zcount,
  zadd,
  zcard,
  zrem,
  zremrangebyscore,

  pipeline,
  scan,
  hscan,

  del,
  ttl,

  flushdb,

  genKey
};

async function set(key, value, expire) {
  await redis.set(key, JSON.stringify(value));
  await setExpire(key, expire);
}

async function get(key, func, expire) {
  const value = await redis.get(key);
  if (value) {
    return JSON.parse(value);
  } else {
    if (typeof func === 'function') {
      const content = await func();
      await set(key, content, expire);
      return content;
    } else {
      return null;
    }
  }
}

function incr(key, value = 1) {
  return redis.incrby(key, value);
}

async function hset(key, field, value, expire) {
  await redis.hset(key, field, JSON.stringify(value));
  await setExpire(key, expire);
}

async function hget(key, field, func, expire) {
  const value = await redis.hget(key, field);
  if (value) {
    return JSON.parse(value);
  } else {
    if (typeof func === 'function') {
      const content = await func();
      await hset(key, field, content, expire);
      return content;
    } else {
      return null;
    }
  }
}

function hdel(key, field) {
  return redis.hdel(key, field);
}

function hincr(key, field, value = 1) {
  return redis.hincrby(key, field, value);
}

async function sadd(key, member, expire) {
  await redis.sadd(key, member);
  await setExpire(key, expire);
}

function sismember(key, member) {
  return redis.sismember(key, member);
}

function spop(key) {
  return redis.spop(key);
}

function srem(key, member) {
  return redis.srem(key, member);
}

async function zrank(key, member, func) {
  await getCacheIfEmpty(key, func);
  return redis.zrank(key, member);
}

async function zrange(key, start, end, func, opts) {
  await getCacheIfEmpty(key, func);
  if (opts) {
    return redis.zrange(key, start, end, opts);
  } else {
    return redis.zrange(key, start, end);
  }
}

async function zrevrange(key, start, end, func, opts) {
  await getCacheIfEmpty(key, func);
  if (opts) {
    return redis.zrevrange(key, start, end, opts);
  } else {
    return redis.zrevrange(key, start, end);
  }
}

function zcount(key, min, max) {
  return redis.zcount(key, min, max);
}

function zremrangebyscore(key, min, max) {
  return redis.zremrangebyscore(key, min, max);
}

function zadd(key, value) {
  return redis.zadd(key, value);
}

function zcard(key) {
  return redis.zcard(key);
}

function zrem(key, member) {
  return redis.zrem(key, member);
}

function pipeline() {
  return redis.pipeline();
}

function scan({match, count}, dataFunc, endFunc = () => null) {
  const stream = redis.scanStream({match, count});
  stream.on('data', dataFunc);
  stream.on('end', endFunc);
}

function hscan(key, {match, count}, dataFunc, endFunc = () => null) {
  const stream = redis.hscanStream(key, {match, count});
  stream.on('data', dataFunc);
  stream.on('end', endFunc);
}

function ttl(key) {
  return redis.ttl(key);
}

function del(key) {
  return redis.del(key);
}

function flushdb() {
  return redis.flushdb();
}

function genKey() {
  return Array.from(arguments).join(':');
}

async function getCacheIfEmpty(key, func) {
  if (typeof func === 'function' && !(await redis.zcard(key))) {
    const ret = await func();
    const values = ret.reduce((arr, val) => arr.concat(val), []);
    return values.length &&  redis.zadd(key, values);
  }
}

function setExpire(key, expire) {
  if (Number.isInteger(expire)) {
    return redis.expire(key, expire);
  }
}
