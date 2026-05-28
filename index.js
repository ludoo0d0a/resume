import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { render } = require('jsonresume-theme-ludoo');

export { render };
export default { render };
