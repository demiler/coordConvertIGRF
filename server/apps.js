const { spawn } = require('child_process');
const { promisify } = require('util');
const { once } = require('events');
const { createInterface } = require('readline');
const utils = require('./utils.js');
const getters = require('./getters.js');
const config = require('./config.js');
const path = require('path');

const execFile = promisify(require('child_process').execFile);
const progsDir = path.join(__dirname, config.PROG_DIR);

class Program {
  static get outputs() {}

  constructor(path, name, progTimeout = 2000) {
    this.__handle = undefined;
    this.path = path;
    this.name = name;
    this.progTimeout = progTimeout;
  }

  spawn(args, opts) {
    if (this.__handle !== undefined) throw 'Program already spawned';

    this.__handle = spawn(this.path, args, opts);
    this.__rlIntf = createInterface({ input: this.__handle.stdout });
    this.__rlIter = this.__rlIntf[Symbol.asyncIterator]();
  }

  async readline() {
    let timedout = false;
    const killer = setTimeout(() => {
      this.kill();
      timedout = true;
    }, this.progTimeout);

    const data = (await this.__rlIter.next()).value;
    clearTimeout(killer);

    if (timedout) throw `program ${this.name} timed out`;
    return data;
  }

  writeline(line) {
    this.__handle.stdin.write(`${line}\n`);
  }

  close() {
    this.__handle.stdin.end();
  }

  kill() {
    this.__handle.kill('SIGKILL');
  }
}

class ConvProg extends Program {
  constructor(configName, shortName) {
    super('./' + config.PROGS[configName], shortName);
  }

  spawn() {
    super.spawn([], { cwd: progsDir });
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : data.trim().split(/ +/).map(Number);
  }

  writeline(date, time, geo, replace = true) {
    date = date.replaceAll('-', ' ');
    time = time.replaceAll(':', ' ');

    super.writeline(`${date} ${time} ${geo.X} ${geo.Y} ${geo.Z}`);
    //super.writeline(`${date} ${time} ${geo[0]} ${geo[1]} ${geo[2]}`);
  }
}

class Geolla extends Program {
  static get outputs() {
    return ['date', 'time', 'geo.X', 'geo.Y', 'geo.Z'];//, 'geod.Lat', 'geod.Lon', 'geod.Alt'];
  };

  constructor() {
    super('./' + config.PROGS['geolla'], 'geolla');
    this.removeFirst = true;
  }

  spawn(noradID, dateStart, dateEnd, stepSec = 1) {
    super.spawn([noradID, dateStart, dateEnd, stepSec], { cwd: progsDir });
    this.removeFirst = true;
  }

  async readline() {
    if (this.removeFirst) {
      await super.readline();
      this.removeFirst = false;
    }

    let data = await super.readline();
    if (data === undefined) return undefined;
    data = JSON.parse(`[${data}]`);

    const dtSplit = data[0].split(' ');
    const date = dtSplit[0];
    const time = dtSplit[1];

    return {
      date, //yyyy-mm-dd
      time, //hh:mm:ss
      'geo.X': Number(data[1]),
      'geo.Y': Number(data[2]),
      'geo.Z': Number(data[3]),
      'geod.Lat': Number(data[4]),
      'geod.Lon': Number(data[5]),
      'geod.Alt': Number(data[6])
    }
  }

  writeline(){} //not used
  close(){} //not used, program exists automatically
}

class Geo2LBnLLA extends ConvProg {
  static get outputs() {
    return ['l', 'b', 'geod.Lat', 'geod.Lon', 'geod.Alt'];
  }

  constructor() {
    super('geo2LB_Lat_Lon_Alt', 'geo2LBnLLA');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      'l': data[0],
      'b': data[1],
      'geod.Lat': data[2],
      'geod.Lon': data[3],
      'geod.Alt': data[4]
    };
  }
}

class Geo2Bigrf extends ConvProg {
  static get outputs() {
    return ['magn.X', 'magn.Y', 'magn.Z', 'magn.F']
  }

  constructor() {
    super('geo2BigrfOnly', 'geo2bigrf');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      'magn.X': data[0],
      'magn.Y': data[1],
      'magn.Z': data[2],
      'magn.F': data[3]
    }
  }
}

class Geo2RDMLLGsmMltShad extends ConvProg {
  static get outputs() {
    return ['dm.R', 'dm.Lat', 'dm.Lon', 'gsm.X', 'gsm.Y', 'gsm.Z', 'mlt', 'shad'];
  }

  constructor() {
    super('geo2RDMLLGsmMltShadOnly', 'geo2RDM_GSM_mlt_shad');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      'dm.R':  data[0], 'dm.Lat': data[1], 'dm.Lon': data[2],
      'gsm.X': data[3], 'gsm.Y':  data[4], 'gsm.Z':  data[5],
      'mlt':   data[6], 'shad':   data[7],
    };
  }

  writeline(date, time, geo) {
    const hms = time.split(':').map(Number);
    const ut = hms[0] + hms[1] / 60.0 + hms[2] / 3600.0;
    date = date.replaceAll('-', ' ');
    this.__handle.stdin.write(`${ut} ${date} ${geo.X} ${geo.Y} ${geo.Z}\n`);
  }
}

class Session {
  constructor(progs) {
    this.progs = progs;
  }

  spawn() {
    this.progs.forEach(prog => prog.prog.spawn());
  }

  writeline(...data) {
    this.progs.forEach(prog => prog.prog.writeline(...data));
  }

  async readline() {
    let out = {};


    for (const prog of this.progs) {
      const res = await prog.prog.readline();
      if (res === undefined) throw `program ${prog.prog.name} return undefined`;
      utils.filterObject(res, prog.filter, out);
    }

    return out;
  }

  close() {
    this.progs.forEach(prog => prog.prog.close());
  }
}

class Spawner {
  static get __progs() {
    return [Geo2LBnLLA, Geo2Bigrf, Geo2RDMLLGsmMltShad];
  }

  static alloc(filters) {
    const givenProgs = [];

    for (const progCls of Spawner.__progs) {
      const viableOuts = utils.differ(progCls.outputs, filters);
      if (viableOuts.length > 0) {
        givenProgs.push({ prog: new progCls(), filter: viableOuts });
      }
    }

    return new Session(givenProgs);
  }
};

module.exports = { Spawner, Geolla, Geo2LBnLLA, Geo2Bigrf, Geo2RDMLLGsmMltShad };
