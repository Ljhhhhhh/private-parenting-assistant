import type { Plugin } from 'vite';
import gradient from 'gradient-string';
import dayjs, { type Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import boxen, { type Options as BoxenOptions } from 'boxen';
dayjs.extend(duration);

const boxenOptions: BoxenOptions = {
  padding: 0.5,
  borderColor: 'cyan',
  borderStyle: 'round',
};

export function viteBuildInfo(): Plugin {
  let config: { command: string };
  let startTime: Dayjs;
  let endTime: Dayjs;
  return {
    name: 'vite:buildInfo',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    buildStart() {
      if (config.command === 'build') {
        startTime = dayjs(new Date());
      }
    },
    closeBundle() {
      if (config.command === 'build') {
        endTime = dayjs(new Date());
        console.log(
          boxen(
            gradient(['cyan', 'magenta']).multiline(
              `🎉 恭喜打包完成（总用时${dayjs
                .duration(endTime.diff(startTime))
                .format('mm分ss秒')}）`,
            ),
            boxenOptions,
          ),
        );
      }
    },
  };
}
