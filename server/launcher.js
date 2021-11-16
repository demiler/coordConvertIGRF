const { spawn } = require('child_process');
const { promisify } = require('util');
const { once } = require('events');
const utils = require('./utils.js');
const getters = require('./getters.js');
const config = require('./config.js');
const path = require('path');

const execFile = promisify(require('child_process').execFile);
const progsDir = path.join(__dirname, config.PROG_DIR);

class Launcher {
  async geolla (norad, startDT = undefined, endDT = undefined, resolution = 1) {
    const progPath = path.join(progsDir, config.PROGS['geolla']);
    const { stdout } = await execFile(progPath, [startDT, endDT, resolution]);
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
      //lla.push(out.slice(4).map(Number))
    }
    return { date, time, geo, /*lla*/ };
  }


  *__commonGenerator (date, time, geo, ut = false) {
    if (!Array.isArray(date)) {
      date = [date];
      time = [time];
      geo = [geo];
    }

    for (let i = 0; i < date.length; i++) {
      yield {
        date: (ut)
          ? time[i].split(':').map(Number).reduce((r, t, pow) => r+t/Math.pow(60, pow))
          : date[i].split('-').join(' '),
        time: (ut)
          ? date[i].split('-').join(' ')
          : time[i].split(':').join(' '),
        geo: geo[i].join(' '),
      }
    }
  }


  async __feedProgram(proc, dtgGenerator, progname) {
    let errors;
    const ac = new AbortController();
    const to = setTimeout(() => {
      proc.kill('SIGKILL');
      errors = `calculation timeout for one of [${getters[progname].join(', ')}]`;
      ac.abort();
    }, 2000);
    proc.stderr.on('data', (err) => {
      clearTimeout(to);
      errors = err.toString();
      ac.abort();
    });

    try {
      let raw = '';
      let gened = dtgGenerator.next();
      while (!gened.done) {
        const { date, time, geo } = gened.value;
        proc.stdin.write(`${date} ${time} ${geo}\n`);
        raw += await once(proc.stdout, 'data', { signal: ac.signal });
        gened = dtgGenerator.next();
      }
      proc.stdin.end();
      clearTimeout(to);

      return raw
        .toString()
        .split('\n')
        .map(line => line.trim().split(/ +/))
        .filter(String)
        .map(vals => vals.map(Number));
    }
    catch (abort) {
      throw errors;
    }
  }


  async geo2LB_Lat_Lon_Alt(date, time, geo) {
    const progPath = path.join(progsDir, config.PROGS['geo2LB_Lat_Lon_Alt']);
    const proc = spawn(progPath, [], { cwd: progsDir });
    const generator = this.__commonGenerator(date, time, geo);
    const values = await this.__feedProgram(proc, generator, 'geo2LB_Lat_Lon_Alt');

    const l = [], b = [], geod = []
    for (const vals of values) {
      l.push(vals[0]);
      b.push(vals[1]);
      geod.push(vals.slice(2, 5))
    }

    return { l, b, ...utils.explode(geod, 'geod', ['Lat', 'Lon', 'Alt']) };
  }


  async geo2RDMLLGsmMltShadOnly(date, time, geo) {
    const progPath = path.join(progsDir, config.PROGS['geo2RDMLLGsmMltShadOnly']);
    const proc = spawn(progPath, [], { cwd: progsDir });
    const generator = this.__commonGenerator(date, time, geo, true);
    const values = await this.__feedProgram(proc, generator, 'geo2RDMLLGsmMltShadOnly');

    const dm = [], gsm = [], mlt = [], shad = [];
    for (const vals of values) {
      dm.push(vals.slice(0, 3));
      gsm.push(vals.slice(3, 6));
      mlt.push(vals[6]);
      shad.push(vals[7]);
    }

    return {
      ...utils.explode(dm, 'dm', ['R', 'Lat', 'Lon']),
      ...utils.explode(gsm, 'gsm', ['X', 'Y', 'Z']),
      mlt, shad
    };
  }


  async geo2BigrfOnly(date, time, geo) {
    const progPath = path.join(progsDir, config.PROGS['geo2BigrfOnly']);
    const proc = spawn(progPath, [], { cwd: progsDir });
    const generator = this.__commonGenerator(date, time, geo);
    const values = await this.__feedProgram(proc, generator, 'geo2BigrfOnly');
    return { ...utils.explode(values, 'magn', ['X', 'Y', 'Z', 'F']) };
  }


  async fromGeo(prog, date, time, geo) {
    if (prog in this) return await this[prog](date, time, geo);
    else throw 'Wrong program name - ' + prog;
  }
};
const launcher = new Launcher();

module.exports = launcher;
