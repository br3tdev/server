import app from "../src/app"
import { register } from 'tsconfig-paths';

const config = require('./tsconfig-paths.config');
register(config);

export default app;