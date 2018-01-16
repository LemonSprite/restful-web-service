'use strict';

const Redis = require('ioredis');

class Cache extends Redis {
  constructor(redisConfig = {}) {
    super(redisConfig);
    this.init();
  }

  // -------------------- init --------------------

  init() {
    this.listenConnect();
    // this.compatibleCacheKey();
    this.initLuaScript();
  }

  listenConnect() {
    this.on('connect', () => {
      logger.info('redis connected');
    });
    this.on('error', err => {
      logger.error('redis connect error: ', err);
    })
  }

  // compatibleCacheKey() {
  //   utils.getClassMethod(Redis).forEach(method => {
  //     Redis.Command.setArgumentTransformer(method, args => {
  //       if (this.isCacheKey(args[0])) args[0] = args[0].key;
  //       return args;
  //     });
  //   });
  // }

  initLuaScript() {
    const luaPath = path.join(__dirname, 'lua-script');
    fs.readdirSync(luaPath)
      .forEach(file => {
        const lua = fs.readFileSync(path.join(luaPath, file), {encoding: 'utf8'});
        const numberOfKeys = _.uniq(lua.match(/KEYS\[\d+]/g)).length;
        const methodName = file.split('.')[0];
        this.defineCommand(methodName, {numberOfKeys, lua});

        const luaMethod = this[methodName];
        this[methodName] = (...args) => {
          for (let i = 0; i < numberOfKeys; i++) {
            if (this.isCacheKey(args[i])) args[i] = args[i].key;
          }
          return luaMethod.apply(this, args);
        };
      })
  }

  // -------------------- string --------------------

  async set({key, expire}, value) {
    const ret = await super.set(key, JSON.stringify(value));
    await this.setExpire(key, expire);
    return ret;
  }

  async get({key, expire}, fn, refresh) {
    const value = await super.get(key);
    if (value && !refresh) {
      return JSON.parse(value);
    } else {
      if (typeof fn === 'function') {
        const ret = await fn();
        await this.set({key, expire}, ret);
        return ret;
      } else {
        return null;
      }
    }
  }

  del({key}) {
    return super.del(key);
  }

  async incr({key, expire}, value = 1) {
    const ret = await super.incrby(key, value);
    await this.setExpire(key, expire);
    return ret;
  }

  // -------------------- hash --------------------

  async hset({key, field, expire}, value) {
    const ret = await super.hset(key, field, JSON.stringify(value));
    await this.setExpire(key, expire);
    return ret;
  }

  async hget({key, field, expire}, fn, refresh) {
    const value = await super.hget(key, field);
    if (value && !refresh) {
      return JSON.parse(value);
    } else {
      if (typeof fn === 'function') {
        const ret = await fn();
        await this.hset({key, field, expire}, ret);
        return ret;
      } else {
        return null;
      }
    }
  }

  hdel({key, field}) {
    return super.hdel(key, field);
  }

  async hincr({key, field, expire}, value = 1) {
    const ret = await super.hincrby(key, field, value);
    await this.setExpire(key, expire);
    return ret;
  }

  // -------------------- set --------------------

  async sadd({key, expire}, member) {
    const ret = await super.sadd(key, member);
    await this.setExpire(key, expire);
    return ret;
  }

  // -------------------- zset --------------------

  async zrank(key, member, fn) {
    await this.getCacheIfEmpty(key, fn);
    return super.zrank(key, member);
  }

  async zrange(key, start, end, fn, opts) {
    await this.getCacheIfEmpty(key, fn);
    if (opts) {
      return super.zrange(key, start, end, opts);
    } else {
      return super.zrange(key, start, end);
    }
  }

  async zrevrange(key, start, end, fn, opts) {
    await this.getCacheIfEmpty(key, fn);
    if (opts) {
      return super.zrevrange(key, start, end, opts);
    } else {
      return super.zrevrange(key, start, end);
    }
  }

  // -------------------- scan/hscan --------------------

  scanStream({match, count}, dataFn, endFn = () => null) {
    const stream = super.scanStream({match, count});
    stream.on('data', dataFn);
    stream.on('end', endFn);
  }

  hscanStream(key, {match, count}, dataFn, endFn = () => null) {
    const stream = super.hscanStream(key, {match, count});
    stream.on('data', dataFn);
    stream.on('end', endFn);
  }

  // -------------------- other --------------------

  setExpire(key, expire) {
    if (!expire) return;

    if (typeof expire === 'number' && expire >= 0) {
      return super.expire(key, expire);
    } else {
      throw new TypeError('expire must be a positive number');
    }
  }

  async getCacheIfEmpty(key, fn) {
    if (typeof fn === 'function' && !(await super.zcard(key))) {
      const ret = await fn();
      const value = ret.reduce((arr, val) => arr.concat(val), []);
      return value.length &&  super.zadd(key, value);
    }
  }

  genKey() {
    return Array.from(arguments).join(':');
  }

  isCacheKey(key) {
    return typeof key === 'object' && key.key;
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

module.exports = new Cache();
