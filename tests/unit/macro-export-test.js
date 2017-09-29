import { module, test } from 'qunit';
import WRAP from 'error-trapper/macros/wrap-function.macro';
import PARSE_SCOPE from 'error-trapper/macros/parse-scope.macro';

module('Unit | macro export');

function trimCode(code) {
  return code.replace(/\s/g, '')
}

test('wrap-function.macro exports', (assert) => {
  const code = WRAP(
    () => {var foo = 42; return foo;},
    () => {/* process error */}
  );

  assert.equal(
    trimCode(code.toString()),
    trimCode(`
      function() {
        var ___SCOPE_CLOSURE_VARIABLE___;
        try { 
          var foo = 42; return foo; 
        } catch (e) {
          try {
            throw new Error();
          } catch (localError) {
            ErrorTrapper.parseError(localError, function (parsedError) {
              var context = parsedError.success ? ErrorTrapper.normalizeForStringify(eval(parsedError.code)): {};
              (function () { /* process error */ })(e, context, ___SCOPE_CLOSURE_VARIABLE___);
            });
          }
        }
      }`
    ),
    'macro transpiling'
  );
});


test('parse-scope exports', (assert) => {
  function trimCode(code) {
    return code.replace(/\s/g, '')
  }

  function code() {
    try {
      /* code */
    } catch (e) {
      PARSE_SCOPE((scope) => { return scope;});
    }
  }

  assert.equal(
    trimCode(code.toString()),
    trimCode(`
      function code() {
        try { 
          /* code */
        } catch (e) {
          var ___SCOPE_CLOSURE_VARIABLE___;
          try {
            throw new Error();
          } catch (localError) {
            ErrorTrapper.parseError(localError, function(parsedError) {
              var scope = {};
              if (parsedError.success) {
                scope = ErrorTrapper.normalizeForStringify(eval(parsedError.code));
                delete scope['Error']; 
              }
              (function (scope) { return scope; })(scope, ___SCOPE_CLOSURE_VARIABLE___);
            });
          }
        }
      }`
    ),
    'macro transpiling'
  );
});
