import initializeErrorTrapper from 'error-trapper';

export function initialize(application) {
  const trapper = application.lookup('service:error-trapper');
  initializeErrorTrapper(
    `${window.location.hash}/assets/esprima-bundle.js`,
    trapper.onError.bind(trapper)
  );
}

export default {
  initialize
};
