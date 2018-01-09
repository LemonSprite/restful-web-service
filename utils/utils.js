'use strict'

module.exports = {
  getClassMethod(targetClass) {
    return Object.getOwnPropertyNames(targetClass.prototype)
      .filter(method => method !== 'constructor');
  },

  getClientIP() {
    
  }
};
