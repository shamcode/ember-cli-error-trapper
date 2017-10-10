import Service from '@ember/service';

export default Service.extend({
  /**
   * Global callback for error-trapper/macros/wrap-function.macro
   * @param {Error} err
   * @param {Object} scope
   */
  // eslint-disable-next-line no-unused-vars
  onError(err, scope) {}
});
