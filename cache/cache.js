'use strict';

const Redis = require('ioredis');

class Cache extends Redis {
  constructor(redisConfig = {}) {
    super(redisConfig);
    this.init();
  }

  // -------------------- init --------------------

  init() {
    // 兼容 {key: *, expire: *}
    utils.getClassMethod(Redis).forEach(method => {
      Redis.Command.setArgumentTransformer(method, args => {
        if (this.isCacheKey(args[0])) args[0] = args[0].key;
        return args;
      });
    });

    // 初始化 lua 脚本
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

  async set(key, value, expire) {
    await super.set(key, JSON.stringify(value));
    if (expire) {
      await super.expire(key, expire);
    }
  }

  async get(key, fn, expire, refresh) {
    const value = await super.get(key);
    if (value && !refresh) {
      return JSON.parse(value);
    } else {
      if (typeof fn === 'function') {
        const ret = await fn();
        await this.set(key, ret, expire);
        return ret;
      } else {
        return null;
      }
    }
  }

  incr(key, value = 1) {
    return super.incrby(key, value);
  }

  // -------------------- hash --------------------

  async hset(key, field, value, expire) {
    await super.hset(key, field, JSON.stringify(value));
    if (expire) {
      await super.expire(key, expire)
    }
  }

  async hget(key, field, fn, expire) {
    const value = await super.hget(key, field);
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

  hincr(key, field, value = 1) {
    return super.hincrby(key, field, value);
  }

  // -------------------- set --------------------

  async sadd(key, member, expire) {
    await super.sadd(key, member);
    if (expire) {
      await super.expire(key, expire)
    }
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
