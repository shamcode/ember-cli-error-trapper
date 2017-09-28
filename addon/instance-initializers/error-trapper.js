import initializeErrorTrapper from 'error-trapper';

export function initialize() {
  initializeErrorTrapper(`${window.location.hash}/assets/esprima-bundle.js`);
}

export default {
  initialize
};
