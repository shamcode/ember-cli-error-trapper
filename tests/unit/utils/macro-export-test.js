import { module, test } from 'qunit';
import ERROR_TRAP from 'error-trapper/macros/trap.macro';

module('Unit | macro export');

test('ERROR_TRAP exports', (assert) => {
  function trimCode(code) {
    return code.replace(/\s/g, '')
  }

  const code = ERROR_TRAP(
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
              if (parsedError.success) {
                var context = ErrorTrapper.normalizeForStringify(eval(parsedError.code));
                (function () { /* process error */ })(e, context, ___SCOPE_CLOSURE_VARIABLE___);
              } else {
                (function () { /* process error */ })(e, {});
              }
            });
          }
        }
      }`
    ),
    'macro transpiling'
  );
});
