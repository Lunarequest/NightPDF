import typescript from '@rollup/plugin-typescript';

export default [{
    input: './app/render/index.ts',
    output: {
        dir: './out',
        format: 'iife',
    },
    external: ['nouislider'],
    plugins: [
        typescript({
            tsconfig: './tsconfig.app.json',
            target: 'ES6',
        }),
    ],
}
];
