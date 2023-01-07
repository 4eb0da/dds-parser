import * as fs from 'fs';
import { RollupOptions, Plugin } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const banner = `/*!
    dds-parser v${pkg.version}
	https://github.com/4eb0da/dds-parser
	Released under the MIT License.
*/`;

function emitModulePackageFile(): Plugin {
    return {
        generateBundle() {
            this.emitFile({ fileName: 'package.json', source: `{"type":"module"}`, type: 'asset' });
        },
        name: 'emit-module-package-file'
    };
}

export default (_command: Record<string, unknown>): RollupOptions | RollupOptions[] => {
    const cjs: RollupOptions = {
        input: {
            'dds-parser': 'src/index.ts'
        },
        output: {
            banner,
            dir: 'dist',
            format: 'cjs',
            sourcemap: true,
            chunkFileNames: '[name]'
        },
        plugins: [
            typescript()
        ]
    };

    const esm: RollupOptions = {
        ...cjs,
        output: {
            ...cjs.output,
            dir: 'dist/es',
            format: 'es'
        },
        plugins: [
            typescript(),
            emitModulePackageFile()
        ]
    };

    const browserGlobals: RollupOptions = {
        input: 'src/browser.ts',
        output: [{
            banner,
            name: 'dds-parser',
            format: 'umd',
            file: 'dist/dds-parser.browser.js',
            sourcemap: true
        }],
        plugins: [
            typescript(),
            resolve({ browser: true }),
            terser({ module: true, output: { comments: 'some' } })
        ]
    };

    const browserES: RollupOptions = {
        input: 'src/index.ts',
        output: [{
            banner,
            format: 'es',
            file: 'dist/es/dds-parser.browser.js',
            sourcemap: true
        }],
        plugins: [
            typescript(),
            resolve({ browser: true }),
            terser({ module: true, output: { comments: 'some' } })
        ]
    };

    const nodeTypings: RollupOptions = {
        input: 'src/index.ts',
        output: {
            file: 'dist/dds-parser.d.ts'
        },
        plugins: [
            dts()
        ]
    };

    const browserTypings: RollupOptions = {
        input: 'src/browser.ts',
        output: {
            file: 'dist/dds-parser.browser.d.ts'
        },
        plugins: [
            dts()
        ]
    };

    return [
        cjs,
        esm,
        browserGlobals,
        browserES,
        nodeTypings,
        browserTypings
    ];
};
