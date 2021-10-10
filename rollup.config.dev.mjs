import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss';
import postcssLit from 'rollup-plugin-postcss-lit';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import glob from 'glob';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

export default {
  input: 'src/index.mjs',
  output: {
    file: 'dist/index.mjs',
    format: 'es'
  },
  plugins: [
    serve({
      open: false,
      contentBase: 'dist',
      host: '0.0.0.0',
      port: 8080,
    }),
    livereload({
      watch: 'dist',
      exts: [ 'html', 'mjs', 'css' ]
    }),
    postcss({
      inject: false,
    }),
    postcssLit({
      importPackage: 'lit',
    }),
    nodeResolve({
      browser: true,
    }),
    copy({
      flatten: false,
      targets: [
        { src: 'src/**/*.{html,woff2,svg,png,webmanifest}', dest: 'dist/' },
        { src: 'src/index.css', dest: 'dist/' }, // TODO: postcss
      ]
    }),
    {
      name: 'watch-external',
      buildStart() {
        const dir = dirname(fileURLToPath(import.meta.url));
        glob('src/**/*.{html,css,mjs}', {}, (err, files) => {
          if (err) throw err;
          for (const file of files) this.addWatchFile(resolve(dir, file));
        });
      }
    }
  ],
  watch: {
    include: './src/**',
    chokidar: true,
  },
};
