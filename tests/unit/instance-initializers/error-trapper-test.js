import Ember from 'ember';
import { initialize } from 'dummy/instance-initializers/error-trapper';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import WRAP from 'error-trapper/macros/wrap-function.macro';
import PARSE_SCOPE from 'error-trapper/macros/parse-scope.macro';

let trapperOnError = function() {};

module('Unit | Instance Initializer | error trapper', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.appInstance = this.application.buildInstance();
      this.appInstance.lookup = () => Ember.Service.extend({
        onError() {
          trapperOnError(...arguments);
        }
      }).create();
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

  WRAP(() => {
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

test('wrap function', function(assert) {
  const done = assert.async();
  initialize(this.appInstance);

  const func1 = WRAP(function(value) {
    return this.settings.baseNumber * value;
  }, (e, context) => {
    const keys = Object.keys( context );
    assert.ok(e instanceof TypeError, 'must be instance of TypeError');
    assert.equal(keys.length, 1, '1 variables');
    assert.equal(context.value, undefined, 'value');
    done();
  });

  func1();
});

test('parse scope', function(assert) {
  const done = assert.async();
  initialize(this.appInstance);
  (() => {
    var foo = 42; // eslint-disable-line no-unused-vars
    try {
      return foo.baseNumber.foo * 42;
    } catch (e) {
      PARSE_SCOPE((scope) => {
        const keys = Object.keys(scope);
        assert.equal(keys.length, 1, '1 variables');
        assert.equal(scope.foo, 42, 'foo');
        done();
      });
    }
  })()
});

test('global callback', function(assert) {
  const done = assert.async();

  trapperOnError = (e, scope) => {
    const keys = Object.keys( scope );
    assert.ok(e instanceof TypeError, 'must be instance of TypeError');
    assert.equal(keys.length, 1, '1 variables');
    assert.equal(scope.value, undefined, 'value');
    done();
  };

  initialize(this.appInstance);

  const func1 = WRAP(function(value) {
    return this.settings.baseNumber * value;
  });

  func1();
});
