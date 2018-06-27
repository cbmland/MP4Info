import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import browsersync from 'rollup-plugin-browsersync'
const sync = {
    logPrefix:"insgeek",
    files:[
        './build'
    ],server: {
        baseDir: "build",
        directory: false,
     
        index: "index.html"
    },port:80,
    ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
    }
}

const ugoptions = {
    parse: {
        // parse options
    },
    compress: {
        // compress options
    },
    mangle: {
        // mangle options

        properties: {
            // mangle property options
        }
    },
    output: {
        // output options
    },
    sourceMap: {
        // source map options
    },
    nameCache: null, // or specify a name cache object
    toplevel: false,
    ie8: false,
    warnings: false,
}
export default {
	input: 'src/main.js',
	output: {
        file: 'build/js/mp4.info.min.js',
        format: 'iife',
        name: 'MP4',
        extend:true,
             sourcemap: true
    },

  plugins: [
      babel(),
       uglify(),
      browsersync(sync)],

}