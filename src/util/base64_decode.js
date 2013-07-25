var lookup,
    fromCharCode = String.fromCharCode;

function buildLookup() {
  var i, z, k, v = [],
      n = [ [ 65, 91 ], [ 97, 123 ], [ 48, 58 ], [ 43, 44 ], [ 47, 48 ] ];

  lookup = {};

  for (z in n) {
    for(i = n[z][0]; i < n[z][1]; i++) {
      v.push(fromCharCode(i));
    }
  }
  for(i = 0; i < 64; i++) {
    lookup[v[i]] = i;
  }
}

function decode_base64(s) {
  if (!lookup) { buildLookup(); }

  var result = "",
      i, x, b, c, l, o;

  for (i = 0; i < s.length; i += 72) {
    b = 0;
    l = 0;
    o = s.substring(i, i + 72);

    for (x = 0; x < o.length; x++) {
      c = lookup[ o.charAt(x) ];
      b = (b << 6) + c;
      l += 6;
      while (l >= 8) {
        result += fromCharCode((b >>> (l -= 8)) & 0xff);
      }
    }
  }
  return result;
}

module.exports = decode_base64;
