import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import analyzer from "rollup-plugin-analyzer";
import dts from "rollup-plugin-dts";

const terserOptions = {
  compress: {
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_math: true,
    drop_console: true,
    dead_code: true,
  },
  mangle: {
    properties: {
      regex: /^_/, // Only mangle properties starting with underscore
    },
  },
  format: {
    comments: false,
  },
};

export default [
  {
    input: "src/app.ts",
    output: [
      {
        file: "dist/grains.js",
        format: "umd",
        name: "Grains",
        sourcemap: true,
      },
      {
        file: "dist/grains.min.js",
        format: "umd",
        name: "Grains",
        plugins: [
          terser({
            compress: {
              pure_getters: true,
              unsafe: true,
              unsafe_comps: true,
              warnings: false,
            },
          }),
        ],
        sourcemap: true,
      },
      {
        file: "dist/grains.mjs",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "./dist",
      }),
      analyzer({
        summaryOnly: true,
        limit: 10,
      }),
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    onwarn(warning, warn) {
      // Skip circular dependency warnings
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
  {
    input: "dist/app.d.ts",
    output: [{ file: "dist/grains.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
