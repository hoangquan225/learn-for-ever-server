import fs from 'fs';
import dotenv from 'dotenv';
import {expand} from 'dotenv-expand';

const NODE_ENV = process.env.NODE_ENV || 'development';

const dotenvFiles = [
  `.env`,
  `.env.${NODE_ENV}`
].filter(Boolean);

const config = () => {
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      expand(
        dotenv.config({
          path: dotenvFile
        })
      );
    }
  });
};

export default {
  config
};
