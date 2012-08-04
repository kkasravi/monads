(function() {
  var nm = module.Module('utilities');
  (function(require, exports, moduleId) {
    var log = require('log');
    var Base64 = (function() {
      function Base64() {
        function privateData() {
          this.keyStr = null;
        }
        var p_vars = new privateData();
        var keyStr = p_vars.keyStr;
        Object.getOwnPropertyDescriptor(this,'keyStr') || Object.defineProperty(this,'keyStr', {get: function(){return keyStr;},set: function(e){keyStr=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function () {
          keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        }
        return ctor.apply(this,args) || this;
      }
      Base64.prototype['encodeUTF8'] = function(string) {
        string=string.replace(/\r\n/g,"\n");
        var utftext="";
        for(var n=0;n < string.length;n++) {
          var c=string.charCodeAt(n);
          if(c < 128) {
            utftext+=String.fromCharCode(c);
          } else if((c > 127) && (c < 2048)) {
            utftext+=String.fromCharCode((c >> 6) | 192);
            utftext+=String.fromCharCode((c & 63) | 128);
          } else {
            utftext+=String.fromCharCode((c >> 12) | 224);
            utftext+=String.fromCharCode(((c >> 6) & 63) | 128);
            utftext+=String.fromCharCode((c & 63) | 128);
          }
        }
        return utftext;
      };
      Base64.prototype['decodeUTF8'] = function(utftext) {
        var string="";
        var i=0;
        var c,c1,c2=0;
        while(i < utftext.length) {
          c=utftext.charCodeAt(i);
          if(c < 128) {
            string+=String.fromCharCode(c);
            i++;
          } else if((c > 191) && (c < 224)) {
            c2=utftext.charCodeAt(i + 1);
            string+=String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i+=2;
          } else {
            c2=utftext.charCodeAt(i + 1);
            c3=utftext.charCodeAt(i + 2);
            string+=String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i+=3;
          }
        }
        return string;
      };
      Base64.prototype['encode'] = function(input) {
        var output="";
        var chr1,chr2,chr3,enc1,enc2,enc3,enc4;
        var i=0;
        input=this.encodeUTF8(input);
        while(i < input.length) {
          chr1=input.charCodeAt(i++);
          chr2=input.charCodeAt(i++);
          chr3=input.charCodeAt(i++);
          enc1=chr1 >> 2;
          enc2=((chr1 & 3) << 4) | (chr2 >> 4);
          enc3=((chr2 & 15) << 2) | (chr3 >> 6);
          enc4=chr3 & 63;
          if(isNaN(chr2)) {
            enc3=enc4=64;
          } else if(isNaN(chr3)) {
            enc4=64;
          }
          output=output + this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
        }
        return output;
      };
      Base64.prototype['decode'] = function(input) {
        var output="";
        var chr1,chr2,chr3;
        var enc1,enc2,enc3,enc4;
        var i=0;
        input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");
        while(i < input.length) {
          enc1=this.keyStr.indexOf(input.charAt(i++));
          enc2=this.keyStr.indexOf(input.charAt(i++));
          enc3=this.keyStr.indexOf(input.charAt(i++));
          enc4=this.keyStr.indexOf(input.charAt(i++));
          chr1=(enc1 << 2) | (enc2 >> 4);
          chr2=((enc2 & 15) << 4) | (enc3 >> 2);
          chr3=((enc3 & 3) << 6) | enc4;
          output=output + String.fromCharCode(chr1);
          if(enc3 != 64) {
            output=output + String.fromCharCode(chr2);
          }
          if(enc4 != 64) {
            output=output + String.fromCharCode(chr3);
          }
        }
        output=this.decodeUTF8(output);
        return output;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Base64;
        return new Base64(args && args.length && args[0]);
      };
    })();
    exports.Base64 = Base64;
    var ColorType = (function() {
      function ColorType() {
        var args = Array.prototype.slice.call(arguments);
        var ctor = function () {
        }
        return ctor.apply(this,args) || this;
      }
      ColorType.prototype['blend'] = function(a,b,alpha) {
        var ca=Array(parseInt('0x' + a.substring(1,3),16),parseInt('0x' + a.substring(3,5),16),parseInt('0x' + a.substring(5,7),16));
        var cb=Array(parseInt('0x' + b.substring(1,3),16),parseInt('0x' + b.substring(3,5),16),parseInt('0x' + b.substring(5,7),16));
        var r='0' + Math.round(ca[0] + (cb[0] - ca[0]) * alpha).toString(16);
        var g='0' + Math.round(ca[1] + (cb[1] - ca[1]) * alpha).toString(16);
        var b='0' + Math.round(ca[2] + (cb[2] - ca[2]) * alpha).toString(16);
        return '#' + r.substring(r.length - 2) + g.substring(g.length - 2) + b.substring(b.length - 2);
      };
      ColorType.prototype['hex2rgb'] = function(hex,opacity) {
        var hexValue=hex.split('#')[1];
        var hexValueLength=hexValue.length / 3;
        var redHex=hexValue.substring(0,hexValueLength);
        var greenHex=hexValue.substring(hexValueLength,hexValueLength * 2);
        var blueHex=hexValue.substring(hexValueLength * 2,hexValueLength * 3);
        var red=parseInt(redHex.toUpperCase(),16);
        var green=parseInt(greenHex.toUpperCase(),16);
        var blue=parseInt(blueHex.toUpperCase(),16);
        var rgb=opacity?'rgba(' + red + ',' + green + ',' + blue + ',' + opacity + ')':'rgb(' + red + ',' + green + ',' + blue + ')';
        return rgb;
      };
      ColorType.prototype['rgb2hex'] = function(value) {
        var hex="",v,i;
        var regexp=/([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/;
        var h=regexp.exec(value);
        for(i=1;i < 4;i++) {
          v=parseInt(h[i],10).toString(16);
          if(v.length == 1) {
            hex+="0" + v;
          } else {
            hex+=v;
          }
        }
        return ("#" + hex);
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = ColorType;
        return new ColorType(args && args.length && args[0]);
      };
    })();
    const Color=ColorType();
    exports.Color = Color;
    var Stack = (function() {
      function Stack() {
        function privateData() {
          this.queue = null;
          this.count = null;
        }
        var p_vars = new privateData();
        var queue = p_vars.queue;
        Object.getOwnPropertyDescriptor(this,'queue') || Object.defineProperty(this,'queue', {get: function(){return queue;},set: function(e){queue=e;}});
        var count = p_vars.count;
        Object.getOwnPropertyDescriptor(this,'count') || Object.defineProperty(this,'count', {get: function(){return count;},set: function(e){count=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (obj) {
          try {
            this.clear();
            if(obj) {
              this.push(obj);
            }
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return ctor.apply(this,args) || this;
      }
      Stack.prototype['clear'] = function() {
        this.queue=[];
        this.count=this.queue.length;
        return this;
      };
      Stack.prototype['contains'] = function(obj) {
        for(var i=0;i < this.queue.length;i++) {
          if(this.queue[i] == obj) {
            return true;
          }
        }
        return false;
      };
      Stack.prototype['copyTo'] = function(arr,i) {
        arr.splice(i,0,this.queue);
      };
      Stack.prototype['forEach'] = function(fn,scope) {
        var s=scope;
        if(Array.forEach) {
          Array.forEach(this.queue,fn,s);
        } else {
          for(var i=0;i < this.queue.length;i++) {
            fn.call(s,this.queue[i],i,this.queue);
          }
        }
      };
      Stack.prototype['peek'] = function(index) {
        return this.queue[index];
      };
      Stack.prototype['depth'] = function() {
        return this.count;
      };
      Stack.prototype['pop'] = function() {
        var r=this.queue.pop();
        this.count=this.queue.length;
        return r;
      };
      Stack.prototype['isEmpty'] = function() {
        return this.count === 0;
      };
      Stack.prototype['push'] = function(o) {
        this.queue.push(o);
        this.count=this.queue.length;
        return this;
      };
      Stack.prototype['top'] = function() {
        return this.queue[(this.queue.length - 1)];
      };
      Stack.prototype['bottom'] = function() {
        return this.queue[0];
      };
      Stack.prototype['toArray'] = function() {
        return [].concat(this.queue);
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Stack;
        return new Stack(args && args.length && args[0]);
      };
    })();
    exports.Stack = Stack;
    var Deque = (function() {
      function Deque() {
        function privateData() {
          this.stack = null;
        }
        var p_vars = new privateData();
        var stack = p_vars.stack;
        Object.getOwnPropertyDescriptor(this,'stack') || Object.defineProperty(this,'stack', {get: function(){return stack;},set: function(e){stack=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function () {
          this.stack=[];
        }
        return ctor.apply(this,args) || this;
      }
      Deque.prototype['popback'] = function() {
        return this.stack.pop();
      };
      Deque.prototype['pushback'] = function(item) {
        this.stack.push(item);
        return this;
      };
      Deque.prototype['popfront'] = function() {
        return this.stack.shift();
      };
      Deque.prototype['pushfront'] = function(item) {
        this.stack.unshift(item);
        return this;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Deque;
        return new Deque(args && args.length && args[0]);
      };
    })();
    var EnvironmentType = (function() {
      function EnvironmentType() {
        function privateData() {
          this.ie = null;
          this.ie6 = null;
          this.ie7 = null;
          this.ie8 = null;
          this.iPad = null;
          this.iPhone = null;
          this.firefox = null;
          this.opera = null;
          this.webkit = null;
          this.rhino = null;
        }
        var p_vars = new privateData();
        var ie = p_vars.ie;
        Object.getOwnPropertyDescriptor(this,'ie') || Object.defineProperty(this,'ie', {get: function(){return ie;},set: function(e){ie=e;}});
        var ie6 = p_vars.ie6;
        Object.getOwnPropertyDescriptor(this,'ie6') || Object.defineProperty(this,'ie6', {get: function(){return ie6;},set: function(e){ie6=e;}});
        var ie7 = p_vars.ie7;
        Object.getOwnPropertyDescriptor(this,'ie7') || Object.defineProperty(this,'ie7', {get: function(){return ie7;},set: function(e){ie7=e;}});
        var ie8 = p_vars.ie8;
        Object.getOwnPropertyDescriptor(this,'ie8') || Object.defineProperty(this,'ie8', {get: function(){return ie8;},set: function(e){ie8=e;}});
        var iPad = p_vars.iPad;
        Object.getOwnPropertyDescriptor(this,'iPad') || Object.defineProperty(this,'iPad', {get: function(){return iPad;},set: function(e){iPad=e;}});
        var iPhone = p_vars.iPhone;
        Object.getOwnPropertyDescriptor(this,'iPhone') || Object.defineProperty(this,'iPhone', {get: function(){return iPhone;},set: function(e){iPhone=e;}});
        var firefox = p_vars.firefox;
        Object.getOwnPropertyDescriptor(this,'firefox') || Object.defineProperty(this,'firefox', {get: function(){return firefox;},set: function(e){firefox=e;}});
        var opera = p_vars.opera;
        Object.getOwnPropertyDescriptor(this,'opera') || Object.defineProperty(this,'opera', {get: function(){return opera;},set: function(e){opera=e;}});
        var webkit = p_vars.webkit;
        Object.getOwnPropertyDescriptor(this,'webkit') || Object.defineProperty(this,'webkit', {get: function(){return webkit;},set: function(e){webkit=e;}});
        var rhino = p_vars.rhino;
        Object.getOwnPropertyDescriptor(this,'rhino') || Object.defineProperty(this,'rhino', {get: function(){return rhino;},set: function(e){rhino=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function () {
          var userAgent;
          if(typeof((navigator)) != 'undefined') {
            userAgent=navigator.userAgent;
            this.ie=/MSIE/i.test(userAgent);
            this.ie6=/MSIE 6/i.test(userAgent);
            this.ie7=/MSIE 7/i.test(userAgent);
            this.ie8=/MSIE 8/i.test(userAgent);
            this.iPad=/iPad/i.test(userAgent);
            this.iPhone=/iPhone/i.test(userAgent);
            this.firefox=/Firefox/i.test(userAgent) || /Minefield/i.test(userAgent);
            this.opera=/Opera/i.test(userAgent);
            this.webkit=/Webkit/i.test(userAgent);
            this.rhino=/Rhino/i.test(userAgent);
          } else if(typeof((Titanium)) != 'undefined') {
            userAgent=Titanium.userAgent;
            this.ie=false;
            this.ie6=false;
            this.ie7=false;
            this.ie8=false;
            this.iPad=false;
            this.iPhone=false;
            this.firefox=false;
            this.opera=false;
            this.webkit=true;
            this.rhino=false;
          }
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = EnvironmentType;
        return new EnvironmentType(args && args.length && args[0]);
      };
    })();
    const Environment=EnvironmentType();
    exports.Environment = Environment;
    var Iterator = (function() {
      function Iterator() {
        function privateData() {
          this.a = null;
          this.element = null;
          this.position = null;
        }
        var p_vars = new privateData();
        var a = p_vars.a;
        Object.getOwnPropertyDescriptor(this,'a') || Object.defineProperty(this,'a', {get: function(){return a;},set: function(e){a=e;}});
        var element = p_vars.element;
        Object.getOwnPropertyDescriptor(this,'element') || Object.defineProperty(this,'element', {get: function(){return element;},set: function(e){element=e;}});
        var position = p_vars.position;
        Object.getOwnPropertyDescriptor(this,'position') || Object.defineProperty(this,'position', {get: function(){return position;},set: function(e){position=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_arr) {
          var arr = _arr || [];
          this.a=arr;
          this.position=0;
          this.element=(this.a && this.a.length && this.a[this.position]) || null;
        }
        return ctor.apply(this,args) || this;
      }
      Iterator.prototype['atEnd'] = function() {
        return (this.position >= this.a.length);
      };
      Iterator.prototype['get'] = function() {
        if(this.atEnd()) {
          return null;
        }
        this.element=this.a[this.position++];
        return this.element;
      };
      Iterator.prototype['map'] = function(fn,scope) {
        var s=scope;
        if(Array.map) {
          return Array.map(this.a,fn,s);
        } else {
          var arr=[];
          for(var i=0;i < this.a.length;i++) {
            arr.push(fn.call(s,this.a[i]));
          }
          return arr;
        }
      };
      Iterator.prototype['reset'] = function() {
        this.position=0;
        this.element=this.a[this.position];
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Iterator;
        return new Iterator(args && args.length && args[0]);
      };
    })();
  })(require, nm.getExports(), nm.getId());
})();

