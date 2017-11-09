'use strict';

const Redis = require('ioredis');

class Cache {
  constructor(redisConfig) {
    this.redis = new Redis(redisConfig);
  }

  // -------------------- string --------------------

  async set(key, value, expire) {
    await this.redis.set(key, JSON.stringify(value));
    await this.setExpire(key, expire);
  }

  async get(key, fn, expire) {
    const value = await this.redis.get(key);
    if (value) {
      return JSON.parse(value);
    } else {
      if (typeof fn === 'function') {
        const content = await fn();
        await this.set(key, content, expire);
        return content;
      } else {
        return null;
      }
    }
  }

  incr(key, value = 1) {
    return this.redis.incrby(key, value);
  }

  // -------------------- hash --------------------

  async hset(key, field, value, expire) {
    await this.redis.hset(key, field, JSON.stringify(value));
    await this.setExpire(key, expire);
  }

  async hget(key, field, fn, expire) {
    const value = await this.redis.hget(key, field);
    if (value) {
      return JSON.parse(value);
    } else {
      if (typeof fn === 'function') {
        const content = await fn();
        await this.hset(key, field, content, expire);
        return content;
      } else {
        return null;
      }
    }
  }

  hdel(key, field) {
    return this.redis.hdel(key, field);
  }

  hincr(key, field, value = 1) {
    return this.redis.hincrby(key, field, value);
  }

  // -------------------- set --------------------

  async sadd(key, member, expire) {
    await this.redis.sadd(key, member);
    await this.setExpire(key, expire);
  }

  sismember(key, member) {
    return this.redis.sismember(key, member);
  }

  spop(key) {
    return this.redis.spop(key);
  }

  srem(key, member) {
    return this.redis.srem(key, member);
  }

  // -------------------- zset --------------------

  zadd(key, value) {
    return this.redis.zadd(key, value);
  }

  zcard(key) {
    return this.redis.zcard(key);
  }

  zscore(key) {
    return this.redis.zscore(key);
  }

  zrem(key, member) {
    return this.redis.zrem(key, member);
  }

  async zrank(key, member, fn) {
    await this.getCacheIfEmpty(key, fn);
    return this.redis.zrank(key, member);
  }

  async zrange(key, start, end, fn, opts) {
    await this.getCacheIfEmpty(key, fn);
    if (opts) {
      return this.redis.zrange(key, start, end, opts);
    } else {
      return this.redis.zrange(key, start, end);
    }
  }

  async zrevrange(key, start, end, fn, opts) {
    await this.getCacheIfEmpty(key, fn);
    if (opts) {
      return this.redis.zrevrange(key, start, end, opts);
    } else {
      return this.redis.zrevrange(key, start, end);
    }
  }

  zcount(key, min, max) {
    return this.redis.zcount(key, min, max);
  }

  zremrangebyscore(key, min, max) {
    return this.redis.zremrangebyscore(key, min, max);
  }

  // -------------------- other --------------------

  pipeline() {
    return this.redis.pipeline();
  }

  scan({match, count}, dataFn, endFn = () => null) {
    const stream = this.redis.scanStream({match, count});
    stream.on('data', dataFn);
    stream.on('end', endFn);
  }

  hscan(key, {match, count}, dataFn, endFn = () => null) {
    const stream = this.redis.hscanStream(key, {match, count});
    stream.on('data', dataFn);
    stream.on('end', endFn);
  }

  ttl(key) {
    return this.redis.ttl(key);
  }

  del(key) {
    return this.redis.del(key);
  }

  flushdb() {
    return this.redis.flushdb();
  }

  async getCacheIfEmpty(key, fn) {
    if (typeof fn === 'function' && !(await this.redis.zcard(key))) {
      const ret = await fn();
      const values = ret.reduce((arr, val) => arr.concat(val), []);
      return values.length &&  this.redis.zadd(key, values);
    }
  }

  setExpire(key, expire) {
    if (Number.isInteger(expire)) {
      return this.redis.expire(key, expire);
    }
  }

  genKey() {
    return Array.from(arguments).join(':');
  }

  parseZset(values, schema) {
    const ret = [];
    for (let i = 0, len = values.length; i < len; i++) {
      const item = {};
      item[schema[0]] = values[i];
      item[schema[1]] = +values[i + 1];
      ret.push(item);
    }
    return ret;
  }
}

module.exports = new Cache(config.redis);