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

class Geolla extends Program {
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
      date,
      time,
      geo: {
        X: Number(data[1]),
        Y: Number(data[2]),
        Z: Number(data[3])
      },
      geod: {
        Lat: Number(data[4]),
        Lon: Number(data[5]),
        Alt: Number(data[6])
      }
    }
  }

  writeline(){} //not used
  close(){} //not used, program exists automatically
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

class Geo2LBnLLA extends ConvProg {
  constructor() {
    super('geo2LB_Lat_Lon_Alt', 'geo2LBnLLA');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      l: data[0],
      b: data[1],
      Lat: data[2],
      Lon: data[3],
      Alt: data[4]
    };
  }
}

class Geo2Bigrf extends ConvProg {
  constructor() {
    super('geo2BigrfOnly', 'geo2bigrf');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      magn: {
        X: data[0],
        Y: data[1],
        Z: data[2],
        F: data[3]
      }
    }
  }
}

class Geo2RDMLLGsmMltShad extends ConvProg {
  constructor() {
    super('geo2RDMLLGsmMltShadOnly', 'geo2RDM_GSM_mlt_shad');
  }

  async readline() {
    const data = await super.readline();
    return data === undefined ? undefined : {
      dm:   { R: data[0], Lat: data[1], Lon: data[2] },
      gsm:  { X: data[3], Y: data[4], Z: data[5] },
      mlt:  data[6],
      shad: data[7],
    };
  }

  writeline(date, time, geo) {
    const hms = time.split(':').map(Number);
    const ut = hms[0] + hms[1] / 60.0 + hms[2] / 3600.0;
    date = date.replaceAll('-', ' ');
    this.__handle.stdin.write(`${ut} ${date} ${geo.X} ${geo.Y} ${geo.Z}\n`);
  }
}

module.exports = { Program, Geolla, Geo2LBnLLA, Geo2Bigrf, Geo2RDMLLGsmMltShad };

//class Spawner {
  //constructor(closeTimeout, maxInsts) {
    //this.paths = {};
    //for (const name in config.PROGS) {
      //this.paths[name] = path.join(progsDir, config.PROGS[name]);
    //}

    //this.closeTimeout = closeTimeout;
    //this.maxInsts = maxInsts;
    //this.alive = {};
    //for (const name in this.paths) this.alive[name] = [];
  //}

  //allocProgs(names) {
    //ses = Session(this);

    //for (const name in names) {
      //if (this.alive[name].length > 0) {
        //timer = this.alive[name].pop();
        //clearTimeout(timer.timeout);
        //ses.add(timer.prog);
      //}
      //else {
        //prog = Program(this.paths[name], name);
        //prog.spawn();
        //ses.add(prog);
      //}
    //}

    //return ses;
  //}

  //_free(ses) {
    //for (const prog in ses.progs) {
      //if (prog.name == 'geolla' || this.alive[prog.name].length >= this.maxInsts) {
        //prog.close();
      //}
      //else {//BUG timeout wont pop dead item automatically!!!
        //this.alive[prog.name].append({
          //prog,
          //timeout: setTimeout(prog.close, this.closeTimeout),
        //})
      //}
    //}
  //}
//}