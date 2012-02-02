module utilities {
  module log from 'log';
  export class Base64 {
    constructor() {
      private keyStr;
      keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    }
    encodeUTF8(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }
    decodeUTF8(utftext) {
      var string = "";
      var i = 0;
      var c, c1, c2 = 0;
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
    encode(input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = this.encodeUTF8(input);
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output + this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
      }
      return output;
    }
    decode(input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this.keyStr.indexOf(input.charAt(i++));
        enc2 = this.keyStr.indexOf(input.charAt(i++));
        enc3 = this.keyStr.indexOf(input.charAt(i++));
        enc4 = this.keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = this.decodeUTF8(output);
      return output;
    }
  }
  class ColorType {
    constructor() {}
    blend(a, b, alpha) {
      var ca = Array(parseInt('0x'+a.substring(1,3),16),parseInt('0x'+a.substring(3,5),16),parseInt('0x'+a.substring(5,7),16));
      var cb = Array(parseInt('0x'+b.substring(1,3),16),parseInt('0x'+b.substring(3,5),16),parseInt('0x'+b.substring(5,7),16));
      var r = '0' + Math.round(ca[0] + (cb[0] - ca[0]) * alpha).toString(16);
      var g = '0' + Math.round(ca[1] + (cb[1] - ca[1]) * alpha).toString(16);
      var b = '0' + Math.round(ca[2] + (cb[2] - ca[2]) * alpha).toString(16);
      return '#' +
      r.substring(r.length - 2) +
      g.substring(g.length - 2) +
      b.substring(b.length - 2);
    }
    hex2rgb(hex,opacity) {
      var hexValue = hex.split('#')[1];
      var hexValueLength = hexValue.length/3;
      var redHex = hexValue.substring(0,hexValueLength);
      var greenHex = hexValue.substring(hexValueLength,hexValueLength*2);
      var blueHex = hexValue.substring(hexValueLength*2,hexValueLength*3);
      var red = parseInt(redHex.toUpperCase(),16);
      var green = parseInt(greenHex.toUpperCase(),16);
      var blue = parseInt(blueHex.toUpperCase(),16);
      var rgb = opacity? 'rgba('+red+','+green+','+blue+','+opacity+')': 'rgb('+red+','+green+','+blue+')';
      return rgb;
    }
    rgb2hex(value) {
      var hex = "", v, i;
      var regexp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/;
      var h = regexp.exec(value);
      for (i = 1; i < 4; i++) {
        v = parseInt(h[i],10).toString(16);
        if (v.length == 1) {
          hex += "0" + v;
        } else {
          hex += v;
        }
      }
      return ("#" + hex);
    }
  }
  class Deque {
    constructor() {
      private stack;
      @stack = [];
    }
    popback() {
      return @stack.pop();
    }
    pushback(item) {
      @stack.push(item);
      return this;
    }
    popfront() {
      return @stack.shift();
    }
    pushfront(item) {
      @stack.unshift(item);
      return this;
    }
  }
  export const Color = ColorType();
  class EnvironmentType {
    constructor() {
      private ie, ie6, ie7, ie8, iPad, iPhone, firefox, opera, webkit, rhino;
      var userAgent;
      if (typeof(navigator) != 'undefined') {
        userAgent = navigator.userAgent;
        @ie = /MSIE/i.test(userAgent);
        @ie6 = /MSIE 6/i.test(userAgent);
        @ie7 = /MSIE 7/i.test(userAgent);
        @ie8 = /MSIE 8/i.test(userAgent);
        @iPad = /iPad/i.test(userAgent);
        @iPhone = /iPhone/i.test(userAgent);
        @firefox = /Firefox/i.test(userAgent) || /Minefield/i.test(userAgent);
        @opera = /Opera/i.test(userAgent);
        @webkit = /Webkit/i.test(userAgent);
        @rhino = /Rhino/i.test(userAgent);
      } else if (typeof(Titanium) != 'undefined') {
        userAgent = Titanium.userAgent;
        @ie = false;
        @ie6 = false;
        @ie7 = false;
        @ie8 = false;
        @iPad = false;
        @iPhone = false;
        @firefox = false;
        @opera = false;
        @webkit = true;
        @rhino = false;
      }
    }
  }
  export const Environment = EnvironmentType();
  class Iterator {
    constructor(arr=[]) {
      private a, element, position; 
      @a = arr;
      @position = 0;
      @element = (@a && @a.length && @a[@position]) || null;
    }
    atEnd() {
      return (@position >= @a.length);
    }
    get() {
      if (this.atEnd()) {
        return null;
      }
      @element = @a[@position++];
      return @element;
    }
    map(fn, scope) {
      var s = scope;
      if (Array.map) {
        return Array.map(@a, fn, s);
      } else {
        var arr = [];
        for (var i = 0; i < @a.length; i++) {
          arr.push(fn.call(s, @a[i]));
        }
        return arr;
      }
    }
    reset() {
      @position = 0;
      @element = @a[@position];
    }
  }
}
