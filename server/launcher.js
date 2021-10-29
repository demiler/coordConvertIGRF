const { spawn } = require('child_process');
const { promisify } = require('util');
const { once } = require('events');
const utils = require('./utils.js');

const execFile = promisify(require('child_process').execFile);

const launcher = {
  geolla: async (norad, startDT = undefined, endDT = undefined, resolution = 1) => {
    const { stdout } = await execFile('./progs/geolla.py');
    const lines = stdout.trim().split('\n');

    const date = [];
    const time = [];
    const geo = [];
    const lla = [];

    for (let i = 1; i < lines.length; i++) {
      const out = JSON.parse(`[${lines[i]}]`)
      date.push(out[0].split(' ')[0])
      time.push(out[0].split(' ')[1])
      geo.push(out.slice(1, 4).map(Number))
      lla.push(out.slice(4).map(Number))
    }
    return { date, time, geo, lla };
  },

  geos: async (prog, date, time, geo) => {
    const proc = spawn(`./progs/${prog}`);
    if (!Array.isArray(date)) {
      date = [date];
      time = [time];
      geo = [geo];
    }

    for (let i = 0; i < geo.length; i++) {
      const curDate = date[i].split('-').join(' ')
      if (prog === 'geo2RDMLLGsmMltShadOnly') {
        const ut = time[i]
          .split(':')
          .map(Number)
          .reduce((res, t, pow) => res + t / Math.pow(60, pow));
        proc.stdin.write(`${ut} ${curDate} ${geo[i].join(' ')}\n`)
      }
      else {
        const tm = time[i].split(':').join(' ');
        proc.stdin.write(`${curDate} ${tm} ${geo[i].join(' ')}\n`)
      }
    }
    proc.stdin.end();

    const rawOut = await once(proc.stdout, 'data');
    const values = rawOut
      .toString()
      .split('\n')
      .map(line => line.trim())
      .filter(String)
      .map(vals => vals.map(Number))

    switch (prog) {
      case 'geo2RDMLLGsmMltShadOnly':
        const dm = [], gsm = [], mlt = [], shad = [];

        for (const vals of values) {
          dm.push(vals.slice(0, 3));
          gsm.push(vals.slice(3, 6));
          mlt.push(vals[6]);
          shad.push(vals[7]);
        }

        return { dm, gsm, mlt, shad };

      case 'geo2BigrfOnly':
        const magnField = []
        for (const vals of values) {
          magnField.push(vals)
        }
        return { magnField };

      case 'geo2LBOnly2':
        const l = [], b = [];
        for (const vals of values) {
          l.push(vals[0]);
          b.push(vals[1]);
        }
        return { l, b };
    }
  }
};

module.exports = launcher;
