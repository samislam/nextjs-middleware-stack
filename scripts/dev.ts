import { TsNode } from '@clscripts/ts-node'
import { Nodemon } from '@clscripts/nodemon'
import { TsPatch } from '@clscripts/ts-patch'
import { CrossEnv } from '@clscripts/cross-env'
import { Barrelsby } from '@clscripts/barrelsby'
import { Concurrently } from '@clscripts/concurrently'
import { runCommandsSequentially } from '@clscripts/cl-common'

const barrelCommand = new Barrelsby({ directory: './src', delete: true }).command

runCommandsSequentially(
  [
    barrelCommand,
    new CrossEnv({
      variables: { FORCE_COLOR: 1 },
      execute: new Nodemon({
        clear: true,
        watchPaths: ['./src'],
        ignorePaths: ['./src/index.ts'],
        ext: 'ts',
        exec: new Concurrently({
          raw: true,
          names: ['ts-patch', 'ts-node-dev', 'barrelsby'],
          args: [
            new TsPatch({
              noEmit: true,
              tsconfigPath: './tsconfig.json',
              watch: true,
              preserveWatchOutput: true,
            }).command,
            new TsNode({
              entryFile: './src/main.ts',
              projectPath: './tsconfig.json',
              transpileOnly: true,
            }).command,
            barrelCommand,
          ],
          killOthers: false,
          prefixColors: ['green', 'blue'],
        }).command,
      }).command,
    }).command,
  ],
  true
)
