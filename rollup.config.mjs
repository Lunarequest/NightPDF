import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'app/main/app.ts',
        output: [
            {
                file: './out/main/app.js',
                format: 'cjs',
            },
        ],
        plugins: [
            nodeResolve(),
            typescript(),
            commonjs({
                include: './node_modules/**',
            }),
        ],
    },
    {
        input: 'app/preload/preload.ts',
        output: [
            {
                file: './out/preload/preload.js',
                format: 'cjs',
            },
        ],
        plugins: [
            nodeResolve(),
            typescript({
                tsconfig: './tsconfig.preload.json',
            }),
        ],
    },
    {
        input: './app/render/index.ts',
        output: {
            file: './out/index/index.js',
            format: 'iife',
        },
        external: ['nouislider'],
        plugins: [
            typescript({
                tsconfig: './tsconfig.app.json',
                target: 'ES6',
            }),

        ],
    },
];
