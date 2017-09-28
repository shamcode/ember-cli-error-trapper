import Ember from 'ember';
import { initialize } from 'dummy/instance-initializers/error-trapper';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import ERROR_TRAP from 'error-trapper/macros/trap.macro';

module('Unit | Instance Initializer | error trapper', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
    });
  },
  afterEach() {
    Ember.run(this.appInstance, 'destroy');
    destroyApp(this.application);
  }
});

test('it works', function(assert) {
  const done = assert.async();
  initialize(this.appInstance);

  ERROR_TRAP(() => {
    const foo = { firstName: 'Andy' };
    const bar = foo.lastName.toString; // eslint-disable-line no-unused-vars
  }, (e, context) => {
    const keys = Object.keys(context);
    assert.ok(e instanceof TypeError, 'must be instance of TypeError');
    assert.equal(keys.length, 2, '2 variables');
    assert.equal(context.foo.firstName, 'Andy', 'foo.firstName');
    assert.equal(context.bar, undefined, 'bar');
    done();
  })();
});
