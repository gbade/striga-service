import * as tsConfig from 'tsconfig-paths';
import * as tsConfigJson from '../tsconfig.json';

const baseUrl = tsConfigJson.compilerOptions.outDir;
const paths = tsConfigJson.compilerOptions.paths;

tsConfig.register({
  baseUrl,
  paths,
});
