let tdigest;
export let hasTdigest = false;

try {
  tdigest = require('tdigest');
  hasTdigest = true;
} catch (err) {}

interface ICentroid {
  mean: number;
  n: number;
}

interface ICentroids {
  each(fn: (c: ICentroid) => void): void;
}

interface ITDigest {
  centroids: ICentroids;

  push(x: number);
  compress();
}

interface ITDigestCentroids {
  mean: number[];
  count: number[];
}

export class TDigestStat {
  count = 0;
  sum = 0;
  sumsq = 0;
  _td = new tdigest.Digest();

  add(ms: number) {
    if (ms === 0) {
      ms = 0.00001;
    }
    this.count += 1;
    this.sum += ms;
    this.sumsq += ms * ms;
    if (this._td) {
      this._td.push(ms);
    }
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      sumsq: this.sumsq,
      tdigestCentroids: tdigestCentroids(this._td),
    };
  }
}

export class TDigestStatGroups extends TDigestStat {
  groups: { [key: string]: TDigestStat } = {};

  addGroups(totalMs: number, groups: { [key: string]: number }) {
    this.add(totalMs);
    for (const name in groups) {
      if (groups.hasOwnProperty(name)) {
        this.addGroup(name, groups[name]);
      }
    }
  }

  addGroup(name: string, ms: number) {
    let stat = this.groups[name];
    if (!stat) {
      stat = new TDigestStat();
      this.groups[name] = stat;
    }
    stat.add(ms);
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      sumsq: this.sumsq,
      tdigestCentroids: tdigestCentroids(this._td),
      groups: this.groups,
    };
  }
}

function tdigestCentroids(td: ITDigest): ITDigestCentroids {
  let means: number[] = [];
  let counts: number[] = [];
  td.centroids.each((c: ICentroid) => {
    means.push(c.mean);
    counts.push(c.n);
  });
  return {
    mean: means,
    count: counts,
  };
}
