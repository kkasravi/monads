module monads {
  module log from 'log';
  module controller from 'controller';
  module events from 'events';
  module utilities from 'utilities';
  export class Selectable {
    constructor(selections) {
      private set;
      @set = [];
    }
    elements() {
      return @set;
    }
    select(selectors) {
      if (selectors) {
        for (var i = 0; i < selectors.length; ++i) {
          var selector = selectors[i];
          var found = this.getElementById(selector) || this.getElementsBySelector(selector);
          if (found && found.length > 0) {
            for (var j = 0; j < found.length; ++j) {
              var element = found[j];
              @set.push(element);
            }
          }
        }
      }
    }
    forEach(fn, obj) {
      for (var i = 0; i < this.set.length; ++i) {
        fn.apply(obj || this, [@set[i], i]);
      }
    }
    every(fn) {
      for (var i = 0; i < @set.length; ++i) {
        if (!fn.apply(this, [@set[i], i])) {
          return false;
        }
      }
      return true;
    }
    some(fn) {
      for (var i = 0, j = @set.length; i < j; ++i) {
        if (fn.call(scope, @set[i], i, this)) {
          return true;
        }
      }
      return false;
    }
    map(fn, thisObj) {
      var scope = thisObj || window;
      var a = [];
      for (var i = 0, j = @set.length; i < j; ++i) {
        a.push(fn.call(scope, @set[i], i, this));
      }
      return a;
    }
    filter(fn, thisObj) {
      var scope = thisObj || window;
      var a = [];
      for (var i = 0, j = @set.length; i < j; ++i) {
        if (!fn.call(scope, @set[i], i, this)) {
          continue;
        }
        a.push(this[i]);
      }
      return a;
    }
    indexOf(el, st) {
      var start = start || 0;
      for (var i = start, j = @set.length; i < j; ++i) {
        if (@set[i] === el) {
          return i;
        }
      }
      return -1;
    }
    lastIndexOf(el, st) {
      var start = start || @set.length;
      if (start >= @set.length) {
        start = @set.length;
      }
      if (start < 0) {
        start = @set.length + start;
      }
      for (var i = start; i >= 0; --i) {
        if (@set[i] === el) {
          return i;
        }
      }
      return -1;
    }
    getElementById(selector) {
      var ele = document.getElementById(selector);
      return ele ? [ele] : [];
    }
    getElementsByClassName(className, tag, elm) {
      if (document.getElementsByClassName) {
        this.getElementsByClassName = function(className, tag, elm) {
          elm = elm || document;
          var elements = elm.getElementsByClassName(className), nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null, returnElements = [], current;
          for (var i = 0, il = elements.length; i < il; i += 1) {
            current = elements[i];
            if (!nodeName || nodeName.test(current.nodeName)) {
              returnElements.push(current);
            }
          }
          return returnElements;
        };
      } else if (document.evaluate) {
        this.getElementsByClassName = function(className, tag, elm) {
          tag = tag || "*";
          elm = elm || document;
          var classes = className.split(" "), classesToCheck = "", xhtmlNamespace = "http://www.w3.org/1999/xhtml", namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null, returnElements = [], elements, node;
          for (var j = 0, jl = classes.length; j < jl; j += 1) {
            classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
          }
          try {
            elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
          } catch (e) {
            elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
          }
          while ((node = elements.iterateNext())) {
            returnElements.push(node);
          }
          return returnElements;
        };
      } else {
        this.getElementsByClassName = function(className, tag, elm) {
          tag = tag || "*";
          elm = elm || document;
          var classes = className.split(" "), classesToCheck = [], elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag), current, returnElements = [], match;
          for (var k = 0, kl = classes.length; k < kl; k += 1) {
            classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
          }
          for (var l = 0, ll = elements.length; l < ll; l += 1) {
            current = elements[l];
            match = false;
            for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
              match = classesToCheck[m].test(current.className);
              if (!match) {
                break;
              }
            }
            if (match) {
              returnElements.push(current);
            }
          }
          return returnElements;
        };
      }
      return this.getElementsByClassName(className, tag, elm);
    }
    getElementsBySelector(selector) {
      /* Regular expression 
       /^(\w+)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/
       \---/  \---/\-------------/    \-------/
       |      |         |               |
       |      |         |           The value
       |      |    ~,|,^,$,* or =
       |   Attribute
       Tag
       */
      // Attempt to fail gracefully in lesser browsers
      if (!document.getElementsByTagName) {
        return [];
      }
      // Split selector in to tokens
      var tokens = selector.split(' ');
      var currentContext = [];
      var element, bits, currentContextIndex, tagName, found, foundCount, elements;
      var h, j, k;
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i].trim();
        if (token.indexOf('#') > -1) {
          // Token is an ID selector
          bits = token.split('#');
          tagName = bits[0];
          var id = bits[1];
          element = document.getElementById(id);
          if (tagName && element && element.nodeName.toLowerCase() != tagName) {
            // tag with that ID not found, return false
            return [];
          }
          // Set currentContext to contain just this element
          currentContext = [element];
          continue;
        } else if (token.indexOf('.') > -1) {
          // Token contains a class selector
          bits = token.split('.');
          tagName = bits[0];
          var className = bits[1];
          if (!tagName) {
            tagName = '*';
          }
          // Get elements matching tag, filter them for class selector
          found = [];
          foundCount = 0;
          for (h = 0; h < currentContext.length; h++) {
            if (tagName == '*') {
              elements = this.getAllChildren(currentContext[h]);
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (j = 0; j < elements.length; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          currentContextIndex = 0;
          var regex = new RegExp('\\b' + className + '\\b');
          for (k = 0; k < found.length; k++) {
            if (found[k].className && found[k].className.match(regex)) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        } else if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) { // Code to deal with attribute selectors
          tagName = RegExp.$1;
          var attrName = RegExp.$2;
          var attrOperator = RegExp.$3;
          var attrValue = RegExp.$4;
          if (!tagName) {
            tagName = '*';
          }
          // Grab all of the tagName elements within current context
          found = [];
          foundCount = 0;
          for (h = 0; h < currentContext.length; h++) {
            if (tagName == '*') {
              elements = this.getAllChildren(currentContext[h]);
            } else {
              elements = currentContext[h].getElementsByTagName(tagName);
            }
            for (j = 0; j < elements.length; j++) {
              found[foundCount++] = elements[j];
            }
          }
          currentContext = [];
          currentContextIndex = 0;
          var checkFunction; // This function will be used to filter the elements
          switch (attrOperator) {
            case '=': // Equality
              checkFunction = function(e) {
                return (e.getAttribute(attrName) == attrValue);
              };
              break;
            case '~': // Match one of space seperated words 
              checkFunction = function(e) {
                return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
              };
              break;
            case '|': // Match start with value followed by optional hyphen
              checkFunction = function(e) {
                return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
              };
              break;
            case '^': // Match starts with value
              checkFunction = function(e) {
                return (e.getAttribute(attrName).indexOf(attrValue) === 0);
              };
              break;
            case '$': // Match ends with value - fails with "Warning" in Opera 7
              checkFunction = function(e) {
                return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
              };
              break;
            case '*': // Match ends with value
              checkFunction = function(e) {
                return (e.getAttribute(attrName).indexOf(attrValue) > -1);
              };
              break;
            default:
              // Just test for existence of attribute
              checkFunction = function(e) {
                return e.getAttribute(attrName);
              };
          }
          currentContext = [];
          currentContextIndex = 0;
          for (k = 0; k < found.length; k++) {
            if (checkFunction(found[k])) {
              currentContext[currentContextIndex++] = found[k];
            }
          }
          continue;
        } 
        if (!currentContext[0]) {
          return [];
        }
        // If we get here, token is JUST an element (not a class or ID selector)
        tagName = token;
        found = [];
        foundCount = 0;
        for (h = 0; h < currentContext.length; h++) {
          elements = currentContext[h].getElementsByTagName(tagName);
          for (j = 0; j < elements.length; j++) {
            found[foundCount++] = elements[j];
          }
        }
        currentContext = found;
      }
      return currentContext;
    }
    getAllChildren(e) {
      return e.all ? e.all : e.getElementsByTagName('*');
    }
  }
  export class Continuation {
    constructor(properties={}) {
      private monad, event;
      @monad = properties.monad;
      @event = properties.event;
    }
    action(fn) {
      var binder = function(c, f) {
        var cont = c;
        var func = f;
        var closure = function(event){
          func.call(null, event);
        };
        return closure;
      };
      var closure = binder(this, fn);
      controller.Controller.subscribe(@event, closure, false, @monad.element);
      return this;
    }
    bind(fn, ele, ucap) {
      try {
        var binder = function(c, f, e, u){
          var cont = c;
          var func = f;
          var ele = e;
          var useCapture = u || (ele ? true : false);
          var closure = function(element) {
            controller.Controller.subscribe(cont.event, func, useCapture, ele || element);
          };
          return closure;
        };
        @monad.selector.forEach(binder(this, fn, ele, ucap));
      } catch(e) {
        log.Logger.error(this,e);
      }
      return @monad;
    }
    delay(cps,args,ms) {
      var self = this;
      var vargs = (args && args.length) ? args : [];
      setTimeout(function(){cps.apply(self,vargs);},ms);
      return this;
    }
    on(evt){
      return @monad && @monad.on && @monad.on(evt);
    }
    unbind(fn, ele, ucap) {
      var unbinder = function(c, f, e, u) {
        var cont = c;
        var func = f;
        var ele = e;
        var useCapture = u || (ele ? true : false);
        var closure = function(element){
          controller.Controller.unsubscribe(cont.event, func, useCapture, ele || element);
        };
        return closure;
      };
      @monad.selector.forEach(unbinder(this, fn, ele, ucap));
      return @monad;
    }
  }
  export class Monad {
    constructor(properties={}) {
      private continuation, continuationConstructor, selector, selectors, stateTable;
      @continuation = properties.continuation;
      @continuationConstructor = properties.continuationConstructor || Continuation;
      @selector = null;      
      @selectors = properties.selectors;      
      @stateTable = {};
    }
    on(events) {
      try {
        events = events instanceof Array ? events : [events];
        if (!@selector && @selectors) {
          @selector = Selectable(@selectors);
        }            
        for(var i = 0; i < events.length; ++i) {
          var event = events[i];
          if (@stateTable[event]) {
            @continuation = @stateTable[event];
          } else {
            @continuation = @continuationConstructor({monad:this,event:event});
            @stateTable[event] = @continuation;
          }                   
        }
      } catch(e) {
        log.Logger.error(this,e);
      }        
      return @continuation;
    }    
  }  
  export class Styleable extends Monad {
    constructor(styles=[]) {
      private styles;
      Monad.call(this);
      @styles = styles;
      @continuationConstructor = StyleContinuation;   
    }
  }
  export class StyleContinuation extends Continuation {
    constructor(properties={}) {
      Continuation.call(this, properties); 
    }
    initialize() {
      try {       
        if (StyleContinuation.styleSheets && StyleContinuation.styleSheets.length === 0) {
          for (var j = 0; j < document.styleSheets.length; ++j) {
            var rules;
            try {
              rules = document.styleSheets[j].rules || document.styleSheets[j].cssRules;
            } catch(e) {
              log.Logger.error(this,e);
              continue;
            } 
            if (rules && rules.length) {
              for (var i = 0; i < rules.length; ++i) {
                var item = rules.item(i);
                var selectorText = item.selectorText;
                var selectors = /,/.test(selectorText) ? selectorText.split(',') : [selectorText];
                var cssText = utilities.Environment.ie ? item.style.cssText : item.cssText.match(/\{(.*)\}/)[1];
                for (var h = 0; h < selectors.length; ++h) {
                  var selector = selectors[h] && selectors[h].trim();
                  if(!selector) {
                    continue;
                  }
                  if (!StyleContinuation.styleSheetsMap[selector]) {
                    StyleContinuation.styleSheets.push(selector);
                    StyleContinuation.styleSheetsMap[selector] = [cssText.trim()];
                  } else {
                    StyleContinuation.styleSheetsMap[selector].push(cssText.trim());
                  }
                }
              }
            }
          }
          StyleContinuation.styleSheets.sort();
        }
      } catch(e) {
        log.Logger.error(this,e);
      }          
    }       
    addStyle(selector, style) {
      try {
        var cssStr;
        if (typeof(document) !== 'undefined' && !StyleContinuation.styleMap[selector]) {
          cssStr = selector + " {" + style + "}";
          var styleElement = document.createElement("style");
          styleElement.setAttribute("type", "text/css");
          if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = cssStr;
          } else {
            var cssText = document.createTextNode(cssStr);
            styleElement.appendChild(cssText);
          }
          var head = document.getElementsByTagName("head")[0];
          head.appendChild(styleElement);
          StyleContinuation.styleMap[selector] = styleElement;
        } else {
          cssStr = selector + " {" + style + "}"; 
          if (StyleContinuation.styleMap[selector].styleSheet) {
            StyleContinuation.styleMap[selector].styleSheet.cssText += ' ' + cssStr;
          } else {
            var cssText = document.createTextNode(cssStr);
            StyleContinuation.styleMap[selector].appendChild(cssText);
          }
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    bind(fn) {
      try {
        var binder = function(c, f){
          var cont = c;
          var func = f;
          var closure = function(){
            if (DOMContinuation.loaded) {
              func && func();
            } else if (cont.event && cont.event[0] === "/") {
              event.Event.addSubscriber(cont.event, func);
            } else {
              window.addEventListener(cont.event, func, false);
            }
          };
          return closure;
        };
        binder(this, fn)();
      } catch(e) {
        log.Logger.error(this,e);
      }
      return @monad;
    }
    getRules(selector) { 
      this.initialize();
      return StyleContinuation.styleSheetsMap[selector.trim()];         
    }
    getStyleSheets() {
      this.initialize();
      return StyleContinuation.styleSheets;      
    }
    style() {
      return this.bind(this.onstyle);
    }
    unbind(fn) {
        var unbinder = function(c, f){
          var cont = c;
          var func = f;
          var closure = function(){
            event.Event.removeSubscriber(cont.event, func);
          };
          return closure;
        };
        unbinder(this, fn)();
        return @monad;
    }
    onstyle(event){
      @monad.styles.forEach(function(style){
        this.addStyle(style.selector, style.style);
      }, this);
      return true;
    }      
    static styleMap = {};
    static styleSheets = [];
    static styleSheetsMap = {};       
  }
  export class DOMContinuation extends Continuation {
    constructor(properties={}) {
      private transitions;
      Continuation.call(this, properties);
      @transitions = {};
    }
    add(eid) {
      try {
        var ele;
        switch(typeof(eid)) {
          case 'string':
            ele = DOMable({id:eid}).on('load').element();
            break;
          default:
            if(eid.element) {
              if(typeof(eid.element) === 'function') {
                ele = eid.element();
              } else {
                ele = eid.element;
              }
            } else {
              ele = eid;
            }
            break;
        }
        if(!!ele.parentNode) {
          ele.parentNode.removeChild(ele);  
        } 
        @monad.element.appendChild(ele);
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    addClass(className) {
      try {
        var current = typeof @monad.element.className === 'string'? @monad.element.className.split(' ') : [];
        current.push(className);
        this.attributes({'class':(current.length === 1 ? current.join('') : current.join(' '))});
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    animation(props) {
      try {
        var properties = props || {};
        var property = properties.property;
        var time = properties.time || '0.4s';
        var count = properties.count || '1';
        if(utilities.Environment.webkit) {
          this.style({'-webkit-animation': property+' '+time+' '+count});
        } else if(utilities.Environment.firefox) {
          this.style({'MozAnimation': property+' '+time+' '+count});
        } else {
          this.style({'animation': property+' '+time+' '+count});
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    attribute(name) {
      return this.element()[name];
    }
    attributes(attrs) {
      var attr;
      if(!attrs) {
        var attrobj = {}, element = this.element();
        for(var i = 0; i < element.attributes.length; ++i) {
          attr = element.attributes[i];
          var name = attr.name;
          var value = attr.value;
          attrobj[name] = value;
        }
        return attrobj;
      }
      for (attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          try {
            if (@monad && @monad.element) {
              @monad.element.setAttribute(attr,attrs[attr]);
            }
          } catch (e) {
            log.Logger.error(this,e);
          }
        }
      }
      return this;
    }
    bind(fn, ele, ucap) {
      try {
        var binder = function(c, f, e, u){
          var cont = c;
          var func = f;
          var ele = e;
          var useCapture = u || (ele ? true : false);
          var closure = function(event){
            func.call(cont, event, ele || cont.monad.element);
          };
          return closure;
        };
        if (/^load/.test(this.event)) {
          if (DOMContinuation.loaded) {
            fn.call(this, ele);
          }
        } else {
          (ele || this.element()).addEventListener(this.event, fn, ucap || false);
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return @monad;
    }
    child(index) {
      try {
        return @monad.element.childNodes.item(index);
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    children(name) {
      var items = [];
      try {       
        var eChildren = @monad.element.childNodes;
        if(eChildren && eChildren.length) {
          for (var i = 0; i < eChildren.length; ++i) {
            var item = eChildren.item(i);
            if ((item.nodeType === 1) && new RegExp(name).test(item.localName)) {
              items.push(item);
            }
          }
        }
      } catch(e) {
        log.Logger.error(this,e);
      }            
      return items;          
    }
    computed(prop) {
      try {
        var computedValue;
        if (this.element().currentStyle) {
          computedValue = this.element().currentStyle[prop];
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
          computedValue = document.defaultView.getComputedStyle(this.element(), "")[prop];
        } else {
          computedValue = this.element().style[prop];
        }
        return computedValue;
      } catch (e) {
        log.Logger.error(this,e);
      }
    }        
    context() {
      return @monad;
    }
    correctHtmlAttrQuotation(html) {
      html = html.replace(/(\w+)=['"]([^'"]+)['"]/mg,function (str, name, value) {return name + '=' + '"' + value + '"';});
      html = html.replace(/(\w+)=([^ '"]+)/mg,function (str, name, value) {return name + '=' + '"' + value + '"';});
      html = html.replace(/'/mg, '"');	
      return html;
    }
    cumulativeOffset(e) {
      var element = e || @monad.element;
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
      var result = [valueL, valueT];
      result.left = valueL;
      result.top = valueT;
      return result;
    }
    cursor(cursorName) {
      @monad.element.style.cursor = cursorName;
      return this;     
    }
    element() {
      return @monad.element;
    }
    exists() {
      return !!@monad.element;
    }
    fadein(props) {
      try {
        var properties = props || {};
        var opacity = properties.opacity || '1';
        var duration = properties.duration || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in-out';
        this.transition({property:'opacity',duration:duration,timingfunc:timingfunc});
        this.style({opacity:opacity});
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    fadeout(props) {
      try {
        var properties = props || {};
        var opacity = properties.opacity || '0';
        var duration = properties.duration || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in-out';
        this.transition({property:'opacity',duration:duration,timingfunc:timingfunc});
        this.style({opacity:opacity});
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    find(selectItem) {
      try {
        var ele;             
        if (selectItem) {
          switch(typeof selectItem) {
            case 'string':
              ele = document.getElementById(selectItem);
              if (!ele) {
                var elements = Selectable([selectItem]).elements();
                if (elements && elements.length > 0) {
                  ele = elements[0];
                }
              }
              break;
            case 'object':
              ele = selectItem; 
              break;               
            case 'function':               
              ele = selectItem;                  
              break; 
            default:
              ele = selectItem;
              break;                
          }
        }
        return ele;
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    findAncestorByTagName(tagName) {
      try {
        var ele = this.element().parentNode;
        while(ele.tagName.toLowerCase() !== tagName.toLowerCase()) {
          ele = ele.parentNode;
          if(!ele) {
            break;
          }
        }
        return ele;
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    gradient(properties) { 
      //{color1:c,color2:c,repeatY}
      function canvasGradient(element, canvas, repeatY, color1, color2){
        var nW = element.offsetWidth;
        var nH = element.offsetHeight;
        canvas.width = nW;
        canvas.height = nH;
        canvas.style.width = nW+'px';
        canvas.style.height = nH+'px';
        var nT = element.offsetTop;
        var nL = element.offsetLeft;
        canvas.top = nT;
        canvas.left = nL;
        canvas.style.top = nT+'px';
        canvas.style.left = nL+'px';
        var ctx = canvas.getContext('2d');
        var dGradient = repeatY ? ctx.createLinearGradient(0, 0, nW, 0):ctx.createLinearGradient(0, 0, 0, nH);
        dGradient.addColorStop(0, color1);
        dGradient.addColorStop(1, color2);
        ctx.fillStyle = dGradient;
        if (!utilities.Environment.firefox) {
          var radiusBL = 8.0, radiusBR = 8.0, radiusTR = 8.0, radiusTL = 8.0;
          var kappaRradiusBL = radiusBL*0.333, kappaRradiusBR = radiusBR*0.333, kappaRradiusTR = radiusTR*0.333, kappaRradiusTL = radiusTL*0.333;
          var x = 0, y = 0, height = nH, width = nW;
          ctx.beginPath();
          ctx.moveTo(x,y+radiusTL);
          ctx.lineTo(x,y+height-radiusBL);
          ctx.bezierCurveTo(x,y+height-kappaRradiusBL, x+kappaRradiusBL,y+height, x+radiusBL,y+height);
          ctx.lineTo(x+width-radiusBR,y+height);
          ctx.bezierCurveTo(x+width-kappaRradiusBR,y+height,x+width,y+height-kappaRradiusBR,x+width,y+height-radiusBR);
          ctx.lineTo(x+width,y+radiusTR);
          ctx.bezierCurveTo(x+width,y+kappaRradiusTR,x+width-kappaRradiusTR,y,x+width-radiusTR,y);
          ctx.lineTo(x+radiusTL,y);
          ctx.bezierCurveTo(x+kappaRradiusTL,y,x,y+kappaRradiusTL,x,y+radiusTL);    
          ctx.fill();
        } else {
          ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        return ctx;
      }
      if (properties) {
        var p_dCanvas, color1, color2;
        if (utilities.Environment.ie) {
          @monad.element.style.zoom = 1;
          var filter = @monad.element.currentStyle.filter;
          @monad.element.style.filter += ' ' +['progid:DXImageTransform.Microsoft.gradient(GradientType=',+(!!properties.repeatY),',enabled=true,startColorstr=',properties.color1,', endColorstr=',properties.color2,')'] .join('');
        } else if (utilities.Environment.firefox) {
          p_dCanvas = document.createElement('canvas');
          color1 = properties.opacity ? utilities.Color.hex2rgb(properties.color1,properties.opacity) : properties.color1;
          color2 = properties.opacity ? utilities.Color.hex2rgb(properties.color2,properties.opacity) : properties.color2;
          var context = canvasGradient(@monad.element, p_dCanvas, properties.repeatY, color1, color2);
          var sDataUrl = context.canvas.toDataURL('image/png');
          var sImage = new Image();
          sImage.src = sDataUrl;
          var sRepeat = properties.repeatY ? 'repeat-y' : 'repeat-x';
          this.style({backgroundRepeat:sRepeat,backgroundImage:'url(' + sImage.src + ')',backgroundColor: properties.color2});
        } else if (utilities.Environment.webkit) {
          this.style({backgroundImage: '-webkit-gradient(linear,left top,left bottom,from('+properties.color1.toLowerCase()+'),color-stop(0.4,'+utilities.Color.blend(properties.color1,properties.color2,1.0).toLowerCase()+'),to('+properties.color2.toLowerCase()+'))'});
        } else {
          try {               
            var width = this.styleProperty('width');
            var height = this.styleProperty('height');     
            this.style({overflow:'hidden',backgroundColor:'transparent',borderColor:'transparent',backgroundImage:'none'});
            var borderTop = this.styleProperty("borderTopWidth");
            if (this.styleProperty("borderTopStyle") == "none") {
              borderTop = "0px";
            }
            borderTop = '-'+borderTop;
            var borderLeft = this.styleProperty("borderBottomWidth");
            if (this.styleProperty("border-left-style") == "none") {
              borderLeft = "0px";
            }
            borderLeft = '-'+borderLeft;  
            var paddingTop = this.styleProperty("paddingTop");
            var paddingBottom = this.styleProperty("paddingBottom");
            var paddingLeft = this.styleProperty("paddingLeft");
            var paddingRight = this.styleProperty("paddingRight");
            this.style({paddingTop:'0px',paddingBottom:'0px',paddingLeft:'0px',paddingRight:'0px'});
            var children = [];
            for(var i = 0; i < @monad.element.childNodes.length; ++i) {
              var achild = @monad.element.childNodes.item(i);
              children.push(achild);
            }
            var contentDiv = DOMable({tagName:'div'}).on('load').attributes({id:@monad.element.id+'-ContentDiv'}).style({width:'auto',height:'auto',border:'0px transparent solid',display:'block',position:'relative',zIndex:'2',paddingTop:paddingTop,paddingBottom:paddingBottom,paddingLeft:paddingLeft,paddingRight:paddingRight}).insert(@monad.element.id).element();
            children.forEach(function(child) {
              child.parentNode.removeChild(child);
              this.appendChild(child);
            }, contentDiv);
            var canvasDiv = DOMable({tagName:'div'}).on('load').attributes({id:@monad.element.id+'-CanvasDiv'}).style({display:'block',position:'relative',top:borderTop,left:borderLeft,width:'0px',height:'0px',zIndex:'0'}).element();
            DOMable({id:@monad.element.id}).on('load').insertBeforeFirst(canvasDiv);                                 
            p_dCanvas = DOMable({tagName:'canvas'}).on('load').attributes({id:@monad.element.id+'-Canvas'}).style({width:'auto',height:'auto',zIndex:'-1'}).insert(@monad.element.id+'-CanvasDiv').element();
            color1 = properties.opacity ? utilities.Color.hex2rgb(properties.color1,properties.opacity) : properties.color1;
            color2 = properties.opacity ? utilities.Color.hex2rgb(properties.color2,properties.opacity) : properties.color2;             
            canvasGradient(contentDiv, p_dCanvas, properties.repeatY, color1, color2);
          } catch(e) {
            log.Logger.error(this,e);
          }
          //this.style({backgroundColor: properties.color2});
        }
      }
      return this;
    }
    hasClass(className) {
      var hasValue = false;        
      try {
        var current = (typeof this.attribute('className') === 'string'? this.attribute('className').split(' ') : []);
        current.forEach(function(value){
          if(className === value.trim()) {
            hasValue = true;
          }
        }, this);
      } catch(e) {
        log.Logger.error(this,e);
      }
      return hasValue;
    }
    hide(target, event) {
      var element = this.find(target || @monad.element);
      if (!this.closure) {
        this.bind(this.hide, element, false);
        return this;
      } else {
        element.style.display = 'none';
        if(!!event) {
          event.stopPropagation();  
        } 
      }
      return false;
    }
    highlightText() {
      var r1;
      if (document.selection) {
        r1 = document.body.createTextRange();
        r1.moveToElementText(@monad.element);
        r1.setEndPoint("EndToEnd", r1);
        r1.moveStart('character', 4);
        r1.moveEnd('character', 8);
        r1.select();
      } else {
        var s = window.getSelection();
        r1 = document.createRange();
        r1.setStartBefore(@monad.element);
        r1.setEndAfter(@monad.element);
        s.addRange(r1);
      }
      return this;
    }
    html(htmlValue) {
      try {
        if (htmlValue) {
          @monad.element.innerHTML = htmlValue;
          return this;          
        } else {
          return @monad.element.innerHTML;
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    id() {
      return @monad.id;
    }
    inject(attributes) {
      for (var attrName in attributes) {
        var target = attributes[attrName];
        if (typeof target[attrName] == 'function') {
          target[attrName].call(target, @monad.element);
        } else {
          target[attrName] = @monad.element;
        }
      }
      return this;
    }
    insert(selectItem, where) {
      try {
        if (selectItem) {
          var ele = this.find(selectItem);
          if (ele) {
            if (ele != @monad.element) {
              if (where) {
                ele.insertBefore(@monad.element, where);
              } else {
                if (@monad.element.parentNode && @monad.element.parentNode != ele) {
                  @monad.element.parentNode.removeChild(@monad.element);
                }
                ele.appendChild(@monad.element);
              }
            }
          } else {
            log.Logger.warning(this,'Invalid selector '+selectItem);
          }
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    insertBeforeFirst(element) {
      var target = this.find(element);
      target.insertBefore(@monad.element, target.firstChild);
    }
    makePositioned() {
      var pos = @monad.element.style.position;
      if (pos == 'static' || !pos) {
        @monad.element.style.position = 'relative';
        // Opera returns the offset relative to the positioning context, when an
        // element is position relative but top and left have not been defined
        if (window.opera) {
          @monad.element.style.top = 0;
          @monad.element.style.left = 0;
        }
      }
      return this;
    }
    mix(color1, color2) {
      var r = [];
      var step1 = color1.length == 4 ? 1 : 2;
      var step2 = color2.length == 4 ? 1 : 2;
      for (var i = 0; i < 3; i++) {
        var x = parseInt(color1.substr(1 + step1 * i, step1), 16);
        if (step1 == 1) {
          x = 16 * x + x;
        }
        var y = parseInt(color2.substr(1 + step2 * i, step2), 16);
        if (step2 == 1) {
          y = 16 * y + y;
        }
        r[i] = Math.floor((x * 50 + y * 50) / 100);
        r[i] = r[i].toString(16);
        if (r[i].length == 1) {
          r[i] = "0" + r[i];
        }
      }
      return ("#" + r[0] + r[1] + r[2]);
    }
    move(x, y) {
      if (@monad.element && @monad.element.style) {
        if (utilities.Environment.ie) {
          @monad.element.style.pixelLeft = x;
          @monad.element.style.pixelTop = y;
        } else {
          @monad.element.style.left = x + "px";
          @monad.element.style.top = y + "px";
        }
        return this;
      }
    }
    normalizeHtml() {
      // Uniformize quotation, turn tag names and attribute names into lower case
      return this.replace(/<(\/?)(\w+)([^>]*?)>/img, function(str, closingMark, tagName, attrs){
        var sortedAttrs = this.sortHtmlAttrs(JSSpec.utilities.correctHtmlAttrQuotation(attrs).toLowerCase());
        return "<" + closingMark + tagName.toLowerCase() + sortedAttrs + ">";
      }).    
      replace(/<(br|hr|img)([^>]*?)>/mg, function(str, tag, attrs){ // validation self-closing tags
        return "<" + tag + attrs + " />";
      }).
      replace(/style="(.*?)"/mg, function(str, styleStr){ // append semi-colon at the end of style value
        styleStr = this.sortStyleEntries(styleStr.strip()); // for Safari
        if (styleStr.charAt(styleStr.length - 1) != ';') {
          styleStr += ";";
        }   
        return 'style="' + styleStr + '"';
      }).
      replace(/ style=";"/mg, ""). // sort style entries, remove empty style attributes
      replace(/\r/mg, ''). // remove new-lines
      replace(/\n/mg, '');
    }
    opacity(value) {
      if (value) {
        var object = @monad.element.style;
        object.opacity = (value / 100);
        object.MozOpacity = (value / 100);
        object.KhtmlOpacity = (value / 100);
        object.filter = "alpha(opacity=" + value + ")";
      } 
      return this;
    }
    place(placement) {
      try {
        var x = 0, y = 0, clientWindowWidth, localWindowWidth;
        switch(placement) {
          case "random":
            x = Math.round(Math.random() * (document.documentElement.clientWidth / 2));
            y = Math.round(Math.random() * (document.documentElement.clientHeight / 3));
            break;
         case "top":
            clientWindowWidth = document.documentElement.clientWidth/2;
            localWindowWidth = parseInt(this.styleProperty('width'),10)/2;
            x = clientWindowWidth - localWindowWidth;
            y = 10;
            break;
          default:                        
          case "center":
            clientWindowWidth = document.documentElement.clientWidth/2;
            var clientWindowHeight = document.documentElement.clientHeight/2;
            localWindowWidth = parseInt(this.styleProperty('width'),10)/2; 
            var localWindowHeight = parseInt(this.styleProperty('height'),10)/2;
            x = Math.abs(clientWindowWidth - localWindowWidth);
            y = Math.abs(clientWindowHeight - localWindowHeight);
            break;
        }
        this.move(x,y);
      } catch(e) {
        log.Logger.error(this,e);
      }
    }        
    pointer(event) {
      return {x: document.all ? event.clientX: event.pageX,y: document.all ? event.clientY: event.pageY};
    }
    pointerX(event) {
      return this.pointer(event).x;
    }
    pointerY(event) { 
      return this.pointer(event).y;
    }
    position() {
      var pos = {};
      var element = @monad.element;
      var x = element.offsetLeft || 0;
      var y = element.offsetTop || 0;
      element = element.offsetParent;
      while (element) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      }
      pos.x = x;
      pos.y = y;
      return pos;
    }
    push(attributes) {
      for (var attrName in attributes) {
        if (attributes.hasOwnProperty(attrName)) {
          var target = attributes[attrName];
          target[attrName] = target[attrName] || [];
          target[attrName].push(@monad.element);
        }
      }
      return this;
    }
    randomColor() {
      @monad.element.style.backgroundColor = "#" +
      Math.floor(Math.random() * 16).toString(16) +
      Math.floor(Math.random() * 16).toString(16) +
      Math.floor(Math.random() * 16).toString(16);
      @monad.element.style.backgroundImage = "";
      return this;
    }
    reflect(image, width, height, rheight) {
      try {
        this.element().width = width;
        this.element().height = rheight;
        var ctx = this.element().getContext('2d');
        ctx.save();       
        ctx.translate(0, height - 1);
        ctx.scale(1, -1);
        ctx.drawImage(image, 0, 0, width, height);       
        ctx.restore();        
        ctx.globalCompositeOperation = "destination-out";        
        var gradient = ctx.createLinearGradient(0, 0, 0, rheight);
        gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, rheight);
      } catch(e) {
        log.Logger.error(this,e);
      }  
      return this;
    }        
    remove() {
      if(this.element() && this.element().parentNode) {
        this.element().parentNode.removeChild(this.element());  
      }
      @monad.element = null;
      return this;
    }
    removeChildren(s,r) {
      if (@monad.element.childNodes && @monad.element.childNodes.length > 0) {
        var i, child, eChildren = [], start = (s||0), range = (r||this.element().childNodes.length);
        if(start < 0) {
          start = this.element().childNodes.length + start;
        }
        for (i = start; i < range; i++) {
          child = this.element().childNodes.item(i);
          eChildren.push(child);
        }
        eChildren.forEach(function(eChild){
          this.element().removeChild(eChild);
        },this);
      }
      return this;
    }
    removeAttribute(attributeName) {
      try {
        this.element() && this.element().removeAttribute(attributeName);
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    removeClass(className) {
      var current = typeof this.element().className === 'string'? this.element().className.split(' ') : [];
      var classes = [];
      current.forEach(function(value){
        if (className !== value.trim()) {
          classes.push(value);
        }
      }, this);
      var classList = classes.join(' ').trim();
      classList.length ? this.attributes({className: classList}) : this.element().removeAttribute('class');
      return this;
    }
    rotate(props) {
      var style = [], properties = props || {};
      properties.x && style.push('rotateX('+properties.x+'deg)');
      properties.y && style.push(' rotateY('+properties.y+'deg)');
      properties.z && style.push(' rotateZ('+properties.z+'deg)');
      style = style.join(' ');
      if(utilities.Environment.webkit) {
        this.style({'-webkit-transform':style});
      } else if(utilities.Environment.firefox) {
        this.style({'MozTransform':style});
      }
      return this;
    }
    round(radius) {
      if (utilities.Environment.firefox) {                
        switch (arguments.length) {
          case 1:
            this.style({
              MozBorderRadius: parseInt(arguments[0],10) + 'px'
            });
            break;
          case 2:
            this.style({
              MozBorderRadius: arguments[0] + 'px ' + arguments[1] + 'px'
            });
            break;
          case 3:
            this.style({
              MozBorderRadius: arguments[0] + 'px ' + arguments[1] + 'px ' + arguments[2] + 'px'
            });
            break;
          case 4:
            this.style({
              MozBorderRadius: arguments[0] + 'px ' + arguments[1] + 'px ' + arguments[2] + 'px ' + arguments[3] + 'px'
            });
            break;
        }
      } else if (utilities.Environment.webkit) {
        switch (arguments.length) {
          case 1:
            this.style({
              '-webkit-border-radius': arguments[0] + 'px'
            });
            break;
          case 2:
            this.style({
              WebkitBorderTopLeftRadius: arguments[0] + 'px',
              WebkitBorderTopRightRadius: arguments[1] + 'px'
            });
            break;
          case 3:
            this.style({
              WebkitBorderTopLeftRadius: arguments[0] + 'px',
              WebkitBorderTopRightRadius: arguments[1] + 'px',
              WebkitBorderBottomRightRadius: arguments[2] + 'px'
            });
            break;
          case 4:
            this.style({
              WebkitBorderTopLeftRadius: arguments[0] + 'px',
              WebkitBorderTopRightRadius: arguments[1] + 'px',
              WebkitBorderBottomRightRadius: arguments[2] + 'px',
              WebkitBorderBottomLeftRadius: arguments[3] + 'px'
            });
            break;
        }
      } else {
        this.style({borderRadius: radius + "px"});
      }
      return this;
    }
    scroll(xory) {
      try {
        if (utilities.Environment.webkit) {
          if(xory) {
            document.body.scrollLeft = xory.x || document.body.scrollLeft;
            document.body.scrollTop = xory.y || document.body.scrollTop;
          } else {
            return {x:document.body.scrollLeft,y:document.body.scrollTop};
          }
        } else if (utilities.Environment.ie || utilities.Environment.firefox) {
          if(xory) {
            document.documentElement.scrollLeft = xory.x || document.documentElement.scrollLeft;
            document.documentElement.scrollTop = xory.y || document.documentElement.scrollTop;
          } else {
            return {x:document.documentElement.scrollLeft,y:document.documentElement.scrollTop};
          }
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    shadow(props) {
      try {
        var properties = props || {};
        Object.adapt(properties,{horizontal:5,vertical:5,blurRadius:5,color:'#888',inset:false});
        var style = properties.horizontal+'px '+properties.vertical+'px '+properties.blurRadius+'px '+properties.color;
        style += properties.inset ? ' inset' : '';
        this.style({'MozBoxShadow':style,'-webkit-box-shadow':style});
      } catch(e) {
        log.Logger.error(this,e);
      } 
      return this;
    }
    shadowlower(event) {
      try {
        this.transition({property:'box-shadow',duration:'0.3s',timingfunc:'ease-in-out'});
        this.shadow();
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    shadowraise(event) {
      try {
        this.transition({property:'box-shadow',duration:'0.3s',timingfunc:'ease-in-out'});
        this.shadow({horizontal:8,vertical:8,color:'#999'});
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    show() {
      @monad.element.style.display = 'block';
      return this;
    }
    size() {
      var out = {};
      if (@monad.element.pageXOffset) {
        out.scrollX = @monad.element.pageXOffset;
        out.scrollY = @monad.element.pageYOffset;
      } else if (document.documentElement) {
        out.scrollX = @monad.element == window ? document.body.scrollLeft + document.documentElement.scrollLeft : @monad.element.scrollLeft;
        out.scrollY = @monad.element == window ? document.body.scrollTop + document.documentElement.scrollTop : @monad.element.scrollTop;
      } else if (@monad.element == window ? document.body.scrollLeft >= 0 : @monad.element.scrollLeft >= 0) {
        out.scrollX = @monad.element == window ? document.body.scrollLeft : @monad.element.scrollLeft;
        out.scrollY = @monad.element == window ? document.body.scrollTop : @monad.element.scrollTop;
      }
      if (document.compatMode == "BackCompat") {
        out.width = @monad.element == window ? document.body.clientWidth : @monad.element.clientWidth;
        out.height = @monad.element == window ? document.body.clientHeight : @monad.element.clientHeight;
      } else {
        out.width = @monad.element == window ? document.documentElement.clientWidth : @monad.element.clientWidth;
        out.height = @monad.element == window ? document.documentElement.clientHeight : @monad.element.clientHeight;
      }
      return out;
    }
    slide(props) {
      try {
        var properties = props || {};
        var left = properties.left;
        var top = properties.top;
        var width = properties.width;
        var height = properties.height;
        var duration = properties.duration || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in-out';
        if(left) {
          this.transition({property:'left',duration:duration,timingfunc:timingfunc,noprefix:true});
          this.style({left:left});
        }
        if(top) {
          this.transition({property:'top',duration:duration,timingfunc:timingfunc,noprefix:true});
          this.style({top:top});
        }
        if(width) {
          this.transition({property:'width',duration:duration,timingfunc:timingfunc,noprefix:true});
          this.style({width:width});
        } 
        if(height) {
          this.transition({property:'height',duration:duration,timingfunc:timingfunc,noprefix:true});
          this.style({height:height});
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    style(styles) {
      if (!!styles) {
        for (var styleName in styles) {
          if (styles.hasOwnProperty(styleName)) {
            if (styleName === 'float') { 
              if(utilities.Environment.ie) {
                @monad.element.style.styleFloat = styles[styleName];
              } else if(utilities.Environment.firefox) {
                @monad.element.style.cssFloat = styles[styleName];
              } else {
                @monad.element.style['float'] = styles[styleName];
              }
            } else {
              @monad.element.style[styleName] = styles[styleName];
            }
          }
        }
      }
      return this;
    }
    styleBackgroundColor(value) {
      var bgColor = this.styleProperty("backgroundColor", value);
      bgColor = bgColor || this.styleProperty("background");
      if (bgColor) {
        var bgParts = bgColor.split('#');
        if (bgParts && bgParts.length > 1) {
          var bgColorPart = bgParts[1].split(' ');
          bgColor = '#' + bgColorPart[0];
        }
      }
      if (bgColor == 'transparent') {
        bgColor = @monad.element.parentNode ? DOMable({element: @monad.element.parentNode}).on('load').styleBackgroundColor() : bgColor;
      }
      return bgColor;
    }
    styleColor(value) {
      return this.styleProperty("color", value) || "transparent";
    }
    styleDisplay(value) {
      return this.styleProperty(@monad.element.currentStyle.display.toLowerCase() == 'block' ? 'block' : 'inline-block', value);
    }
    stylePadding(side, value) {
      return this.styleProperty("padding" + side, value);
    }
    styleProperty(prop, value) {
      try {
        var computedValue;
        if (@monad.element.currentStyle && @monad.element.currentStyle[prop]) {
          computedValue = @monad.element.currentStyle[prop];
        } else if (window.getComputedStyle) {
          computedValue = window.getComputedStyle(@monad.element, '')[prop];
        }
        return (computedValue);
      } catch (e) {
        log.Logger.error(this,e);
      }
    }
    text(textValue) {
      try {
        if (textValue) {
          @monad.element.appendChild(document.createTextNode(textValue));
          return this;          
        } else {
          return @monad.element.textContent || (@monad.element.firstChild ? @monad.element.firstChild.nodeValue : @monad.element.innerText);
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    textShadow(v) {
      var value = v || '1px 1px 1px #FFF';
      if(value.length) {
        value = value.join(',');
      }
      @monad.element.style.textShadow = value;
      return this;
    }      
    translate(props) {
      try {
        var style = [], properties = props || {};
        properties.x && style.push('translateX('+properties.x+')');
        properties.y && style.push(' translateY('+properties.y+')');
        properties.z && style.push(' translateZ('+properties.z+')');
        style = style.join(' ');
        if(utilities.Environment.webkit) {
          this.style({'-webkit-transform':style});
        } else if(utilities.Environment.firefox) {
          this.style({'MozTransform':style});
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    transition(props) {
      try {
        var properties = props || {};
        var property = properties.property;
        var time = properties.time || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in';
        if(!@transitions[property]) {
          @transitions[property] = true;
          if(utilities.Environment.webkit) {
            var webkitStyle = (properties.noprefix ? '' : '-webkit-')+property+' '+time+' '+(timingfunc||'ease');
            this.style({'-webkit-transition':webkitStyle});
          } else if(utilities.Environment.firefox) {
            var mozStyle = (properties.noprefix ? '' : 'Moz')+property+' '+time+' '+(timingfunc||'ease');
            this.style({'MozTransition':mozStyle});
          } else {
            var noVendorStyle = property+' '+time+' '+(timingfunc||'ease');
            this.style({'transition':noVendorStyle});
          }
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    updateText(textValue) {
      var target = @monad.element instanceof Array ? @monad.element[0] : @monad.element;
      var found = false;
      for(var i = 0, length = @monad.element.childNodes.length; i < length; ++i) {
        var child = @monad.element.childNodes.item(i);
        if(child.nodeType === 3) {
          child.nodeValue = textValue;
          found = true;
          break;
        }
      }
      if(!found) {
        this.text(textValue);
      }
      return this;
    }
    unbind(func, ele, ucap) {
      var useCapture = ucap || false;
      var target = ele || @monad.element;
      if (!!target) {
        target.removeEventListener(this.event, func, useCapture);
      }
      return @monad;
    }
    zoomin(props) {
      try {
        var properties = props || {};
        var zoom = properties.zoom || '1';
        var duration = properties.duration || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in-out';
        this.transition({property:'scale('+zoom+')',duration:duration,timingfunc:timingfunc});
        this.style({scale:zoom});
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    zoomout(props) {
      try {
        var properties = props || {};
        var zoom = properties.zoom || '0';
        var duration = properties.duration || '0.4s';
        var timingfunc = properties.timingfunc || 'ease-in-out';
        this.transition({property:'scale('+zoom+')',duration:duration,timingfunc:timingfunc});
        this.style({scale:zoom});
      } catch(e) {
        log.Logger.error(this,e);
      }
      return this;
    }
    static loaded = true;
  }
  export class DOMable extends Monad {
    constructor(properties={}) {
      private className, element, id;
      try {       
        if (properties.tagName) {
          Monad.call(this);            
          @element = (typeof(document) !== 'undefined') && document.createElement(properties.tagName);
          @id = properties.id || Math.uuid(8);        
          @element.id = id;
          @className = properties.className;
          if(@className) {
            @element.className = @className;
          }
        } else if(properties.id) {
          Monad.call(this, {selectors:[properties.id]});  
          this.selector = Selectable(this.selectors); 
          @element = this.selector.elements().length && this.selector.elements()[0];                 
          @id = @element.id;
          @className = @element.className;
        } else if(properties.object && properties.object.element) {           
          Monad.call(this);                            
          @element = properties.object.element;                                  
          @id = (@element.id || Math.uuid(8));
          @className = (@element.className || properties.className);
        } else if(properties.element) {           
          Monad.call(this);                            
          @element = properties.element;                                  
          @id = (@element.id || Math.uuid(8));
          @className = (@element.className || properties.className);
        }
        @continuationConstructor = properties.continuationConstructor || DOMContinuation;        
      } catch (e) {
        log.Logger.error(this,e);
      }
    }
  }
  export class Moveable extends DOMable {
    constructor(properties={}) {
      private source;
      try {
        if (properties) {
          DOMable.call(this, {id:properties.target});
          source = Selectable([properties.source || properties.target]).elements()[0];
          @continuationConstructor = MoveContinuation;
        }
      } catch(e) {
        log.Logger.error(this,e);
      }     
    }
  }
  export class MoveContinuation extends DOMContinuation {
    constructor(properties={}) {
      private active, allowX, allowY, offsetX, offsetY, lastX, lastY;
      DOMContinuation.call(this, properties);
      @active = false;
      @allowX = true;
      @allowY = true;
      @offsetX = 0;
      @offsetY = 0;
      @lastX = -1;
      @lastY = -1;
    }
    bind(fn, ele, ucap) {
      var binder = function(c, f, e, u){
        var cont = c;
        var func = f;
        var ele = e;
        var useCapture = u || (ele ? true : false);
        var closure = function(event){
          func.call(cont, event, ele || cont.monad.source);
        };
        return closure;
      };
      if (/^load/.test(this.event)) {
        if (DOMContinuation.loaded) {
          fn.call(this, ele);
        }
      } else {
        (ele || @monad.source).addEventListener(this.event, fn, ucap || false);
      }
      return @monad;
    }
    move(c,styles) {
      var constraints = c || {};
      this.allowX = typeof constraints.allowX == 'boolean' ? constraints.allowX : this.allowX;
      this.allowY = typeof constraints.allowY == 'boolean' ? constraints.allowY : this.allowY;
      this.style(styles);          
      return this.bind(this.onMoveBegin,null,false);
    }
    unbind(func, ele, ucap) {
      this.active = false;
      DOMContinuation.constructor.prototype.unbind.call(this,func,ele,ucap);
      return this;
    }
    onMoveBegin(event) {
      if (this.lastX === -1) {
        @lastX = parseInt(this.styleProperty('left'),10);
        @lastX = isNaN(@lastX) ? 0 : @lastX;
      }
      if (this.lastY === -1) {
        this.lastY = parseInt(this.styleProperty('top'),10);
        this.lastY = isNaN(this.lastY) ? 0 : this.lastY;
      }
      this.offsetX = this.pointerX(event) - this.lastX;
      this.offsetY = this.pointerY(event) - this.lastY;
      this.active = true;      
      @monad.on('mousemove').bind(this.onMoveDuring, document, true);
      @monad.on('mouseup').bind(this.onMoveEnd, document, true);
      @monad.element.style.position = 'absolute';
      controller.Controller.publish(events.CustomEvent({type:'movebegin',canBubble:false,isCanceleable:true,detail:{id:@monad.source,point:this.pointer(event)}}));
      event.preventDefault();  
      return false;
    }
    onMoveDuring(event) {
      try {
        if (this.active) {
          this.lastX = this.pointerX(event) - this.offsetX;
          this.lastY = this.pointerY(event) - this.offsetY;
          if (this.allowX) {
            @monad.element.style.left = this.lastX + 'px';
          }
          if (this.allowY) {
            @monad.element.style.top = this.lastY + 'px';
          }
          event.preventDefault();
          return false;
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return true;
    }
    onMoveEnd(event) {
      if (this.active) {
        try {
          this.active = false;
          @monad.on('mousemove').unbind(this.onMoveDuring, document, true);
          @monad.on('mouseup').unbind(this.onMoveEnd, document, true);
          controller.Controller.publish(eventEvents.CustomEvent({type:'moveend',canBubble:false,isCanceleable:true,detail:{id:@monad.source,point:this.pointer(event),allowX:this.allowX,allowY:this.allowY}}));
          this.lastX = -1;
          this.lastY = -1;
        } catch (e) {
          log.Logger.error(this,e);
        }
      }
      return false;
    }
  }
  export class Resizeable extends DOMable {
    constructor(properties={}) {
      private source;
      if (properties) {
        DOMable.call(this, {id:properties.target});
        source = Selectable([properties.source || properties.target]).elements()[0];
        @continuationConstructor = ResizeContinuation;
      }
      return this;      
    }
  }
  export class ResizeContinuation extends DOMContinuation {
    constructor(properties={}) {
      private active, allowWidth, allowHeight, offsetX, offsetY, lastX, lastY, width, height, x, y;
      DOMContinuation.call(this, properties);
      @active = false;
      @allowWidth = true;
      @allowHeight = true;
      @offsetX = 0;
      @offsetY = 0;
      @lastX = -1;
      @lastY = -1;
      @width = -1;
      @height = -1;
      @x = -1;
      @y = -1;
      return this;
    }
    bind(fn, ele, ucap) {
      var binder = function(c, f, e, u){
        var cont = c;
        var func = f;
        var ele = e;
        var useCapture = u || (ele ? true : false);
        var closure = function(event){
          func.call(cont, event, ele || cont.monad.source);
        };
        return closure;
      };
      if (/^load/.test(this.event)) {
        if (DOMContinuation.loaded) {
          fn.call(this, ele);
        }
      } else {
        (ele || @monad.source).addEventListener(this.event, fn, ucap || false);
      }
      return @monad;
    }       
    resize(c) {
      var constraints = c || {};
      @monad.source.style.cursor = 'resize';
      this.allowWidth = typeof constraints.allowWidth == 'boolean' ? constraints.allowWidth : this.allowWidth;
      this.allowHeight = typeof constraints.allowHeight == 'boolean' ? constraints.allowHeight : this.allowHeight;
      return this.bind(this.onresizebegin,null,false);
    }
    unbind(func, ele, ucap) {
      this.active = false;
      DOMContinuation.constructor.prototype.unbind.call(this,func,ele,ucap);
      return this;
    }
    onresizebegin(event) {
      var target = event.target || event.srcElement;
      if (this.x === -1) {
        this.x = this.lastX = parseInt(this.styleProperty('left'),10);
        this.x = this.lastX = isNaN(this.lastX) ? 0 : this.lastX;
      }
      if (this.y === -1) {
        this.y = this.lastY = parseInt(this.styleProperty('top'),10);
        this.y = this.lastY = isNaN(this.lastY) ? 0 : this.lastY;
      }
      if(this.width === -1) {
        this.width = parseInt(this.styleProperty('width'),10);
      }
      if(this.height === -1) {
        this.height = parseInt(this.styleProperty('height'),10);
      }        
      this.offsetX = this.pointerX(event) - this.lastX;
      this.offsetY = this.pointerY(event) - this.lastY;        
      @monad.on('mousemove').bind(this.onresizeduring, document, true);
      @monad.on('mouseup').bind(this.onresizeend, document, true);
      controller.Controller.publish(eventEvents.CustomEvent({type:'resizebegin',canBubble:false,isCanceleable:true,detail:{id:this.id(),width:this.width,height:this.height}}));
      event.preventDefault();
      this.active = true;        
      return false;
    }
    onresizeduring(event) {
      var target = event.target || event.srcElement;
      if (this.active) {
        this.lastX = this.pointerX(event) - this.offsetX;
        this.lastY = this.pointerY(event) - this.offsetY;
        var newWidth = this.width + (this.lastX - this.x);
        var newHeight = this.height + (this.lastY - this.y);
        if (this.allowWidth) {
          this.style({width:newWidth + 'px'});
        }
        if (this.allowHeight) {
          this.style({height:newHeight + 'px'});
        }
        event.preventDefault();
        return false;
      }
      return true;
    }
    onresizeend(event) {
      var target = event.target || event.srcElement;
      if (this.active) {
        try {
          this.active = false;
          @monad.on('mousemove').unbind(this.onresizeduring, document, true);
          @monad.on('mouseup').unbind(this.onresizeend, document, true);
          controller.Controller.publish(eventEvents.CustomEvent({type:'resizeend',canBubble:false,isCanceleable:true,detail:{id:@monad.id,point:this.pointer(event)}}));
          this.lastX = -1;
          this.lastY = -1;
          this.width = -1;
          this.height = -1;
          this.x = -1;
          this.y = -1;
        } catch (e) {
          log.Logger.error(this,e);
        }
      }
      return false;
    }
  }
  export class Highlightable extends Monad {
    constructor(selector={}) {
      private target, targets, targetMap;
      try {
        Monad.call(this);
        @target = null;
        @targets = null;
        @targetMap = {};
        if(selector) {
          this.selectors = [selector.source];
          this.selector = Selectable(this.selectors);
          this.targets = [selector.target];
          this.target = Selectable(this.targets);
          this.target.forEach(function(highlightable){
            this.targetMap[highlightable.id] = highlightable;
          }, this);
        }
        @continuationConstructor = HighlightContinuation;
      } catch (e) {
        log.Logger.error(this,e);
      }
    }
  }
  export class HighlightContinuation extends Continuation {
    constructor(properties={}) {
      private minOpacity, maxOpacity, autoUp, autoDown, savedOver, savedOut;
      Continuation.call(this, properties); 
      @minOpacity = 0;
      @maxOpacity = 30;
      @autoUp = 4;
      @autoDown = 2;
      @savedOver = null;
      @savedOut = null;     
    }    
    highlight() {
      try {
        var source = @monad.selector.set[0];
        this.bind(this.onHighlight, @monad.selector.set[0], true);
        @monad.on('mouseout').bind(this.onHighlight, @monad.selector.set[0], true);
      } catch(e) {
        log.Logger.error(this,e);
      }
    }
    fade(event) {
      for (var id in @monad.targetMap) {
        if (@monad.targetMap.hasOwnProperty(id)) {
          var highlightable = @monad.targetMap[id];
          if (highlightable.highlightState !== OFF) {
            highlightable.highlightState = {
              state: FADE_DOWN,
              index: this.minOpacity,
              step: this.autoDown
            };
            this.run(highlightable);
          }
        }
      }
    }
    run(highlightable) {
      var highlightElemRunning = false;
      highlightable.highlightState = highlightable.highlightState || {state: OFF,index: this.minOpacity};
      if (highlightable.highlightState.state === ON) {
        highlightable.highlightState.index = this.maxOpacity;
        highlightable.highlightState.state = FADE_DOWN;
        highlightElemRunning = true;
        if (highlightable.filters) {
          highlightable.style.filter = "alpha(opacity = " + highlightable.highlightState.index + ")";
        } else {
          highlightable.style.MozOpacity = highlightable.highlightState.index / 100;
        }
      } else if (highlightable.highlightState.state == HIGHLIGHT_UP) {
        highlightable.highlightState.index += highlightable.highlightState.step;
        if (highlightable.highlightState.index > this.maxOpacity) {
          highlightable.highlightState.index = this.maxOpacity;
        }
        if (highlightable.filters) {
          highlightable.style.filter = "alpha(opacity = " + highlightable.highlightState.index + ")";
        } else {
          highlightable.style.MozOpacity = highlightable.highlightState.index / 100;
        }
        if (highlightable.highlightState.index >= this.maxOpacity) {
          highlightable.highlightState.state = ON;
        } else {
          highlightElemRunning = true;
        }
      } else if (highlightable.highlightState.state == HIGHLIGHT_UP_FADE_DOWN) {
        highlightable.highlightState.index += highlightable.highlightState.step;
        if (highlightable.highlightState.index > this.maxOpacity) {
          highlightable.highlightState.index = this.maxOpacity;
        }
        if (highlightable.filters) {
          highlightable.style.filter = "alpha(opacity = " + highlightable.highlightState.index + ")";
        } else {
          highlightable.style.MozOpacity = highlightable.highlightState.index / 100;
        }
        if (highlightable.highlightState.index == this.maxOpacity) {
          highlightable.highlightState.state = FADE_DOWN;
          highlightable.highlightState.step = this.autoDown;
        }
        highlightElemRunning = true;
      } else if (highlightable.highlightState.state == FADE_DOWN) {
        highlightable.highlightState.index -= highlightable.highlightState.step;
        if (highlightable.filters) {
          highlightable.style.filter = "alpha(opacity = " + highlightable.highlightState.index + ")";
        } else {
          highlightable.style.MozOpacity = highlightable.highlightState.index / 100;
        }
        if (highlightable.highlightState.index <= this.minOpacity) {
          highlightable.highlightState.state = OFF;
          highlightable.highlightState.index = this.minOpacity;
        } else {
          highlightElemRunning = true;
        }
      } else if (highlightable.highlightState.state === OFF) {
        highlightable.highlightState.index = this.minOpacity;
        if (highlightable.filters) {
          highlightable.style.filter = "alpha(opacity = " + highlightable.highlightState.index + ")";
        } else {
          highlightable.style.MozOpacity = highlightable.highlightState.index / 100;
        }
      } else {
        log.Logger.error(this,highlightable.id + ' state ' + highlightable.highlightState.state + ' not handled');
      }
      if (highlightElemRunning) {
        var closure = function(obj, elem){
          return function(){
            obj.run.call(obj, elem);
          };
        };
        setTimeout(closure(this, highlightable), 40);
      }
    }
    onHighlight(event) {
      var highlightable = event ? event.target : event.srcElement;
      if (@monad.targetMap[highlightable.id]) {
        highlightable.highlightState = highlightable.highlightState || {state: OFF,index: this.minOpacity};
      } else {
       if (@monad.selector.set[0] == highlightable && event.type == 'mousedown') {
          this.fade(event);
        } else {
          return true;
        }
      }
      if (event.type == 'mouseout') {
        if (highlightable.highlightState && highlightable.highlightState.state === HIGHLIGHT_UP) {
          highlightable.highlightState.state = HIGHLIGHT_UP_FADE_DOWN;
          highlightable.highlightState.step = this.autoDown;
        }
      }
      if (!highlightable.highlightState) {
        log.Logger.error(this,highlightable.id + ' has no fadeState!!!!');
      }
      if (highlightable.highlightState.state === OFF) {
        highlightable.highlightState.state = HIGHLIGHT_UP;
        highlightable.highlightState.step = this.autoUp;
      } else if (highlightable.highlightState.state === ON) {
        highlightable.highlightState.state = FADE_DOWN;
        highlightable.highlightState.step = this.autoDown;
      }
      this.run(highlightable);
    }      
    static OFF = 0;
    static ON = 1;
    static FADE_DOWN = 2;
    static HIGHLIGHT_UP = 3;
    static HIGHLIGHT_UP_FADE_DOWN = 4;
  }
  export class Slideable extends DOMable {
    constructor(properties={}) {
      private target;
      if(properties.source) {
        if(typeof(properties.source) === 'string') {
          DOMable.call(this, {id:properties.source});
        } else {
          DOMable.call(this, {element:properties.source});
        }
      } 
      @target = Selectable([properties.target]);
      @continuationConstructor = (properties.direction && properties.direction === "horizontal") ? SlideHorizontalContinuation: SlideVerticalContinuation;
    }
  }
  export class SlideVerticalContinuation extends DOMContinuation {
    constructor(properties={}) {
      private maxh, speed, timer, maxOpacity;
      DOMContinuation.call(this, properties);
      @maxh = 200;
      @speed = 10;
      @timer = 15;
      @maxOpacity = 1.0;
    }      
    slide(properties) {
      if(properties) {
        this.maxh = properties.maxh || this.maxh;
        this.speed = properties.speed || this.speed;
        this.timer = properties.timer || this.timer;
        this.maxOpacity = properties.maxOpacity || this.maxOpacity;
      }
      this.bind(this.onSlideStart, null, true);
      return this;
    }
    slideStart(slideable) {
      var slideClosure = function(c, e){
        var continuation = c;
        var element = e;
        return function(){
          continuation.run.call(continuation, element);
        };
      };
      slideable.timer = setInterval(slideClosure(this, slideable), this.timer);
    }
    run(slideable) {
      var maxh = this.maxh;
      var currHeight = slideable.offsetHeight;
      var step = Math.max(2, (slideable.direction == 1) ? Math.round((Math.abs(maxh - currHeight) / this.speed)) : Math.round(currHeight / this.speed));
      if (slideable.direction == -1) {
        step = -step;
      }
      var newHeight = parseInt(slideable.style.height.replace("px", ""),10) + step;
      slideable.style.height = newHeight + "px";
      slideable.style.opacity = Math.min(currHeight / maxh,this.maxOpacity);
      slideable.style.filter = "alpha(opacity=" + (slideable.style.opacity * 100) + ")";
      if (newHeight < 2 && slideable.direction == -1) {
        clearInterval(slideable.timer);
        slideable.style.display = "none";
        slideable.direction = 1;
        slideable.style.height = "0px";
      } else if (newHeight > (maxh - 2) && slideable.direction == 1) {
          clearInterval(slideable.timer);
          slideable.direction = -1;
          slideable.style.display = "block";
          slideable.style.height = maxh + "px";
      }
    }      
    onSlideStart() {
      var event = arguments.length == 1 ? arguments[0] : arguments[1];
      var slideStartClosure = function(c, e){
        var continuation = c;
        var currentTarget = e.currentTarget;
        return function(slideable, i){
          if(slideable.timer) {
            clearInterval(slideable.timer);  
          } 
          var check = continuation.monad.selector.elements()[i];
          if (currentTarget == check) {
            if (slideable.style.display == "block") {
              slideable.style.height = this.maxh + "px";
              slideable.direction = -1;
            } else {
              slideable.style.height = "0px";
              slideable.style.display = "block";
              slideable.direction = 1;
            }
            continuation.slideStart(slideable);
          }
        };
      };
      @monad.target.forEach(slideStartClosure(this, event));
      return true;
    }      
  }
  export class SlideHorizontalContinuation extends DOMContinuation {
    constructor(properties={}) {
      private speed, timer, maxOpacity;
      DOMContinuation.call(this, properties);
      @speed = 10;
      @timer = 15;
      @maxOpacity = 1.0;
    }
    slide(properties) {
      if(properties) {
        this.speed = properties.speed || this.speed;
        this.timer = properties.timer || this.timer;
        this.maxOpacity = properties.maxOpacity || this.maxOpacity;
      }
      this.bind(this.onSlideStart, null, true);
      return this;
    }
    slideStart(slideable) {
      var slideClosure = function(c, e){
        var continuation = c;
        var element = e;
        return function(){
          continuation.run.call(continuation, element);
        };
      };
      slideable.timer = setInterval(slideClosure(this, slideable), this.timer);
    }
    run(slideable) {
      var maxw = slideable.maxw;
      var currWidth = slideable.offsetWidth;
      var step = Math.max(2, (slideable.direction == 1) ? Math.round((Math.abs(maxw - currWidth) / this.speed)) : Math.round(currWidth / this.speed));
      if (slideable.direction == -1) {
        step = -step;
      }
      var newWidth = parseInt(slideable.style.width.replace("px", ""),10) + step;
      slideable.style.width = newWidth + "px";
      slideable.style.opacity = Math.min(currWidth / maxw,this.maxOpacity);
      slideable.style.filter = "alpha(opacity=" + (slideable.style.opacity * 100) + ")";
      if (newWidth < 2 && slideable.direction == -1) {
        clearInterval(slideable.timer);
        slideable.style.display = "none";
        slideable.direction = 1;
        slideable.style.width = "0px";
      } else if (newWidth > (maxw - 2) && slideable.direction == 1) {
          clearInterval(slideable.timer);
          slideable.direction = -1;
          slideable.style.display = "block";
          slideable.style.width = maxw + "px";
        }
    }      
    onSlideStart() {
      var event = arguments.length == 1 ? arguments[0] : arguments[1];
      var slideStartClosure = function(c, e){
        var continuation = c;
        var currentTarget = e.currentTarget;
        return function(slideable, i){
          if(slideable.timer) {
            clearInterval(slideable.timer);  
          } 
          var check = continuation.monad.selector.elements()[i];
          if (currentTarget == check) {
            if (slideable.style.display == "block") {
              slideable.style.width = slideable.maxw + "px";
              slideable.direction = -1;
            } else {
              slideable.style.width = "0px";
              slideable.style.display = "block";
              slideable.direction = 1;
            }
            continuation.slideStart(slideable);
          }
        };
      };          
      @monad.target.forEach(slideStartClosure(this, event));
      return false;
    }      
  }
  export class Swipeable extends DOMable {
    constructor(properties={}) {
      private source;
      DOMable.call(this, {id:properties.target});
      @source = Selectable([properties.source || properties.target]).elements()[0];
      @continuationConstructor = SwipeContinuation;
    }
    static init = (function() {
      try {
        if (utilities.Environment.webkit) {
          var styles = [
            {selector:"Swipeable-left",style:"-webkit-animation-name:swipe-left;-webkit-animation-duration:2s;"},
            {selector:"@-webkit-keyframes swipe-left",style:'from {left:0px;} to {left:-300px;}'},
            {selector:"Swipeable-right",style:"-webkit-animation-name:swipe-right;-webkit-animation-duration:2s;"},
            {selector:"@-webkit-keyframes swipe-right",style:'from {left:0px;} to {left:300px;}'}
          ];
          Styleable(styles).on("load").onstyle();
        }
      } catch(e) {
        log.Logger.error(this,e);
      }             
    })()      
  }
  export class SwipeContinuation extends DOMContinuation {
    constructor(properties={}) {
      private allowX, allowY, goingLeft, lastX, lastY, offsetX, offsetY;
      DOMContinuation.call(this, properties); 
      allowX = true;
      allowY = true;
      goingLeft = undefined;
      lastX = undefined;
      lastY = undefined;
      offsetX = 0;
      offsetY = 0;
    }
    swipe(c,styles) {
      try {
        var constraints = c || {};
        allowX = typeof constraints.allowX == 'boolean' ? constraints.allowX : allowX;
        allowY = typeof constraints.allowY == 'boolean' ? constraints.allowY : allowY;
        if(styles) {
          this.style(styles);  
        } 
        document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        if (this.element().parentNode) {
          this.element().parentNode.style.webkitPerspective = '600';
          this.element().parentNode.style.webkitTransformStyle = 'preserve-3d';
        } else {
          document.documentElement.style.webkitPerspective = '600';
          document.documentElement.style.webkitTransformStyle = 'preserve-3d';              
        }
        this.element().style.webkitTransitionTimingFunction='ease-out';
        this.element().style.webkitTransitionDuration='0s';
        this.element().addEventListener("touchstart", this.ontouchstart, false);
        this.element().addEventListener("touchmove", this.ontouchmove, false);
        this.element().addEventListener("touchend", this.ontouchend, false);
        this.element().addEventListener("touchcancel", this.ontouchcancel, false);                          
      } catch(e) {
        log.Logger.error(this,e);
      }        
      return this;
    }        
    pointer(event) {
      try {
        if (event.touches.length == 1) {
          var x = event.targetTouches[0].pageX;
          var y = event.targetTouches[0].pageY;
          return {x: x,y: y};
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
    }       
    ontouchstart(event) {
      try { 
        var left = @monad.element.style.left;
        var top = @monad.element.style.top;
        lastX = parseInt(left,10);
        lastY = parseInt(top,10);
        lastX = Math.isNumber(lastX) ? lastX : 0;
        lastY = Math.isNumber(lastY) ? lastY : 0;        
        offsetX = this.pointerX(event) - lastX;
        goingLeft = offsetX < 0;  
        offsetY = this.pointerY(event) - lastY;            
      } catch(e) {
        log.Logger.error(this,e);
      }       
      return false;
    }
    ontouchmove(event) {
      try {
        event.preventDefault();    
        lastX = this.pointerX(event) - offsetX;
        lastY = this.pointerY(event) - offsetY;       
        if(allowX && allowY) {
          this.style({webkitTransform:'translate3d('+lastX+'px,'+lastY+'px,0)'}); 
          @monad.element.style.left = lastX + 'px';
          @monad.element.style.top = lastY + 'px';              
        } else if (allowX) {               
          @monad.element.style.webkitTransform = 'translate3d('+lastX+'px,0,0)';
          @monad.element.style.left = lastX + 'px';            
        } else if (allowY) {
          this.style({webkitTransform:'translate3d(0,'+lastY+'px,0)'});
          @monad.element.style.top = lastY + 'px';              
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }
    ontouchcancel(event) {
      try {
        event.preventDefault();
        goingLeft = undefined;
        lastX = undefined;
        lastY = undefined;
      } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }        
    ontouchend(event) {
      try {
        event.preventDefault(); 
        var left;
        if(goingLeft) {
          @monad.element.style.webkitTransitionDuration='0.5s';
          @monad.element.style.webkitTransform = 'translate3d(150px,0,0)';
          left = parseInt(@monad.element.style.left,10);
          left -= 150;
          @monad.element.style.left = left+'px';
        } else {
          @monad.element.style.webkitTransitionDuration='0.5s';
          @monad.element.style.webkitTransform = 'translate3d(-150px,0,0)';
          left = parseInt(@monad.element.style.left,10);
          left += 150;
          @monad.element.style.left = left+'px';
        }  
        goingLeft = undefined;          
        lastX = undefined;
        lastY = undefined;
       } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }
  }
  export class Touchable extends DOMable {
    constructor(properties={}) {
      private source;
      DOMable.call(this, {id:properties.target});
      @source = Selectable([properties.source || properties.target]).elements()[0];
      @continuationConstructor = TouchContinuation;
    }
    static init = (function() {
      try { 
        if (utilities.Environment.webkit) {
          var styles = [
            {selector:'Touchable',style:'-webkit-animation-name:"slide-me-to-the-right";-webkit-animation-duration:1s;'},
            {selector:'@-webkit-keyframes "slide-me-to-the-right"',style:'from { left: 0px; } to { left: 100px; }'}
          ];
          Styleable(styles).on("load").onstyle();
        }
      } catch(e) {
        log.Logger.error(this,e);
      }             
    })()      
  }
  export class TouchContinuation extends DOMContinuation {
    constructor(properties={}) {
      private allowX, allowY, lastX, lastY, offsetX, offsetY;
      DOMContinuation.call(this, properties); 
      @allowX = true;
      @allowY = true;
      @lastX = undefined;
      @lastY = undefined;
      @offsetX = 0;
      @offsetY = 0;
    }
    touch(c,styles) {
      try {
        var constraints = c || {};
        @allowX = typeof constraints.allowX == 'boolean' ? constraints.allowX : @allowX;
        @allowY = typeof constraints.allowY == 'boolean' ? constraints.allowY : @allowY;
        this.style(styles);
        document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        this.element().parentNode.style.webkitPerspective='600'; 
        this.style({webkitTransformStyle:'preserve-3d',webkitTransitionProperty:'-webkit-transform',webkitTransitionDuration:'0',webkitTransitionTimingFunction:'linear'});
        this.element().addEventListener("touchstart", this.ontouchstart, false);
        this.element().addEventListener("touchmove", this.ontouchmove, false);
        this.element().addEventListener("touchend", this.ontouchend, false);
        this.element().addEventListener("touchcancel", this.ontouchcancel, false);                          
      } catch(e) {
        log.Logger.error(this,e);
      }        
      return this;
    }        
    pointer(event) {
      var x = event.targetTouches[0].pageX;
      var y = event.targetTouches[0].pageY;
      return {x:x,y:y};
    }       
    ontouchstart(event) {
      try {
        event.preventDefault(); 
        var left = @monad.element.style.left;
        var top = @monad.element.style.top;
        @lastX = parseInt(left,10);
        @lastY = parseInt(top,10);
        @lastX = Math.isNumber(lastX) ? @lastX : 0;
        @lastY = Math.isNumber(lastY) ? @lastY : 0;
        @offsetX = this.pointerX(event) - @lastX;
        @offsetY = this.pointerY(event) - @lastY;
      } catch(e) {
        log.Logger.error(this,e);
      }       
      return false;
    }
    ontouchmove(event) {
      try {
        event.preventDefault();    
        @lastX = this.pointerX(event) - @offsetX;
        @lastY = this.pointerY(event) - @offsetY;       
        if(@allowX && @allowY) {
          this.style({webkitTransform:'translate3d('+@lastX+'px,'+@lastY+'px,0)'}); 
          @monad.element.style.left = @lastX + 'px';
          @monad.element.style.top = @lastY + 'px';              
        } else if (allowX) {
          this.style({webkitTransform:'translate3d('+@lastX+'px,0,0)'});
          @monad.element.style.left = @lastX + 'px';              
        } else if (allowY) {
          this.style({webkitTransform:'translate3d(0,'+@lastY+'px,0)'});
          @monad.element.style.top = @lastY + 'px';              
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }
    ontouchcancel(event) {
      try {
        event.preventDefault();
        @lastX = undefined;
        @lastY = undefined;
      } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }        
    ontouchend(event) {
      try {
        event.preventDefault(); 
        @lastX = undefined;
        @lastY = undefined;
       } catch(e) {
        log.Logger.error(this,e);
      }
      return false;
    }
  }
  export class Flippable extends DOMable {
    constructor(properties={}) {
      private front, back;
      DOMable.call(this, properties);
      @front = null;
      @back = null;
      @continuationConstructor = FlippableContinuation;
    }
    static init = (function() {
      try {
        if (utilities.Environment.webkit) {
          var styles = [
            {selector:'body',style:'-webkit-user-select:none;'},
            {selector:'.monads-Flippable',style:'height:356px;width:320px;background-color:transparent;-webkit-tap-highlight-color:#000000;-webkit-perspective:600;'},
            {selector:'.monads-Flippable-Flippable',style:'height:300px;width:320px;left:0;top:0;-webkit-transform-style:preserve-3d;-webkit-transition-property:-webkit-transform;-webkit-transition-duration:0.5s;'},
            {selector:'.monads-Flippable-Face',style:'position:absolute;height:300px;width:320px;left:0;top:0;-webkit-backface-visibility:hidden;'},
            {selector:'.monads-Flippable-Flipped',style:'-webkit-transform:rotateY(179deg);'}
          ];
          Styleable(styles).on("load").onstyle();
        }
      } catch(e) {
        log.Logger.error(this,e);
      }
    })()            
  }
  export class FlippableContinuation extends DOMContinuation {
    constructor(properties={}) {
      private horizontal, vertical;
      DOMContinuation.call(this, properties);
      @horizontal = false;
      @vertical = false;
    }      
    flip(c,styles) {
      try {
        var constraints = c || {};
        this.setHorizontal(typeof constraints.horizontal === 'boolean' ? constraints.horizontal : this.isHorizontal());
        this.setVertical(typeof constraints.vertical === 'boolean' ? constraints.vertical : this.isVertical());
        if(styles) {
          this.style(styles); 
        }
        this.bind(this.onflip, null, true);
      } catch(e) {
        log.Logger.error(this,e);
      }        
      return this;
    }
    onflip(event) {
      try {
        if (event.currentTarget.id === @monad.id) {
          var flippableClassName = @monad.getClassName() + '-Flippable';
          var flippedClassName = @monad.getClassName() + '-Flipped';
          if(this.element().className === flippableClassName) {
            this.addClass(flippedClassName);
          } else {
            this.removeClass(flippedClassName);
          }
          return false;
        }
      } catch (e) {
        log.Logger.error(this,e);
      }              
      return true;
    }             
  }
  export class Composer {
    constructor(c=[]) {
      private composables, composablesMap;
      @composables = [];
      @composablesMap = {};
      if(c && c.length > 0) {
        @composables = @composables.concat(c);
      }
    }
    addComposable(name, composable) {
      var map = @composablesMap;
      if(!map[name]) {
        map[name] = @composable;
      }
      return this;
    }
    getComposable(name) {
      var map = @composablesMap;
      return map[name];
    }        
    lift(monoid) {
      var name = monoid.constructor.name.camelCase();
      this[name] = monoid;
      var methods = monoid.constructor.prototype;
      for(var method in methods) {
        if(methods.hasOwnProperty(method) && typeof methods[method] === 'function' && !this[method]) {
          this[method] = (function(name, func, monoid, target) {
            return function() {
              var rt = func.apply(monoid, arguments);
              return (rt === monoid) ? target : rt;
            };
          })(name,methods[method],monoid,this);              
        }
      }
    }    
  }
  export class Tweenable {
    constructor(properties={}) {
      private begin, duration, pos, startTime, time, obj, prop, change, finish, prevTime, prevPos, looping;
      @begin = properties.begin || 0;
      @duration = properties.duration || 0;
      @pos = parseInt(@begin,16);
      @startTime = 0;
      @time = 0
      @obj = properties.object;      
      @prop = properties.property;
      @change = 0;
      @finish = properties.finish || 0;        
      @prevTime = 0;
      @prevPos = 0;
      @looping = false;
      this.func = properties.behavior || this.func;
    }
    fforward() {
      @time = @duration;
      this.fixTime();
      this.update();
    }        
    fixTime() {
      this.setStartTime(this.getTimer() - @time * 1000);
    }
    func(t, b, c, d) {
      return c * t / d + b;
    }
    getPosition(t) {
      var lt = t || @time;
      var newPosition = this.func(lt, @begin, @change, @duration);
      return newPosition;
    }
    getTimer() {
      return new Date().getTime() - @time;
    }
    rewind(t) {
      this.stop();
      @time = t || 0;
      this.fixTime();
      this.update();
    }
    setDuration(d) {
      @duration = (d === null || d <= 0) ? 100000 : d;
    }
    setFinish(f) {
      this.change = f - @begin;
    }
    setPosition(p) {
      @prevPos = @pos;
      @obj[@prop] = Math.round(p) + "";
      @pos = p;
      controller.Controller.publish(eventEvents.CustomEvent({type:'motionchanged',canBubble:false,isCanceleable:true,detail:{target:this}}));          
    }
    setTime(t) {
      this.prevTime = time;
      if (t > this.getDuration()) {
        if (this.looping) {
          this.rewind(t - duration);
          this.update();
          controller.Controller.publish(eventEvents.CustomEvent({type:'motionlooped',canBubble:false,isCanceleable:true,detail:{target:this}}));
        } else {
          time = duration;
          this.update();
          this.stop();
          controller.Controller.publish(eventEvents.CustomEvent({type:'motionfinished',canBubble:false,isCanceleable:true,detail:{target:this}}));              
        }
      } else if (t < 0) {
        this.rewind();
        this.update();
      } else {
        time = t;
        this.update();
      }
    }
    update() {
      this.setPosition(this.getPosition(this.getTime()));
    }             
    start() {
      this.rewind();
      this.startEnterFrame();
      controller.Controller.publish(eventEvents.CustomEvent({type:'motionstarted',canBubble:false,isCanceleable:true,detail:{target:this.getPos()}}));
    }
    startEnterFrame() {
      this.stopEnterFrame();
      this.isPlaying = true;
      this.onEnterFrame();
    }
    nextFrame() {
      this.setTime((this.getTimer() - this.getStartTime()) / 1000);
    }
    stop() {
      this.stopEnterFrame();
      controller.Controller.publish(eventEvents.CustomEvent({type:'motionstopped',canBubble:false,isCanceleable:true,detail:{target:this}}));
    }
    stopEnterFrame() {
      this.isPlaying = false;
    }
    continueTo(f, d) {
      this.setBegin(this.getPos());
      this.setFinish(f);
      this.setDuration(d);
      this.start();
    }
    resume() {
      this.fixTime();
      this.startEnterFrame();
      controller.Controller.publish(eventEvents.CustomEvent({type:'motionresumed',canBubble:false,isCanceleable:true,detail:{target:this}}));          
    }
    yoyo() {
      this.continueTo(this.getBegin(), this.getTime());
    }
    onEnterFrame() {
      if (this.isPlaying) {
        this.nextFrame();
        setTimeout(this.onEnterFrame, 0);
      }
    }         
    static backEaseIn = function(t, b, c, d, a, p) {
      var s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }
    static backEaseOut = function(t, b, c, d, a, p) {
      var s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }
    static backEaseInOut = function(t, b, c, d, a, p) {
      var s = 1.70158;
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
      }
      return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }
    static elasticEaseIn = function(t, b, c, d, a, p) {
      var s;
      if (t === 0) {
        return b;
      }
      if ((t /= d) == 1) {
        return b + c;
      }
      if (!p) {
        p = d * 0.3;
      } 
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      
    }
    static elasticEaseOut = function(t, b, c, d, a, p) {
      var s;
      if (t === 0) {
        return b;
      }
      if ((t /= d) == 1) {
        return b + c;
      }
      if (!p) {
        p = d * 0.3;
      }
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    }
    static elasticEaseInOut = function(t, b, c, d, a, p) {
      var s;
      if (t === 0) {
        return b;
      }
      if ((t /= d / 2) == 2) {
        return b + c;
      }
      if (!p) {
        p = d * (0.3 * 1.5);
      }
      if (!a || a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      if (t < 1) {
        return - 0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      }
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
    static bounceEaseOut = function(t, b, c, d) {
      if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
      } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
      } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
      } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
      }
    }
    static bounceEaseIn = function(t, b, c, d) {
      return c - Tweenable.bounceEaseOut(d - t, 0, c, d) + b;
    }
    static bounceEaseInOut = function(t, b, c, d) {
      if (t < d / 2) {
        return Tweenable.bounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
      } else {
        return Tweenable.bounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
      }
    }
    static strongEaseInOut = function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    }
    static regularEaseIn = function(t, b, c, d) {
      return c * (t /= d) * t + b;
    }
    static regularEaseOut = function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    }
    static regularEaseInOut = function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      }
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
    static strongEaseIn = function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    }
    static strongEaseOut = function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
    static strongEaseInOut = function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
      }
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }
  }
  export class ColorTweenable extends Tweenable {
    constructor(properties={}) {
      private fromColor, toColor;
      @fromColor = properties.begin;
      @toColor = properties.finish; 
      properties.begin = 0;
      properties.finish = 100;  
      Tweenable.call(this, properties);               
      controller.Controller.subscribe('motionchanged', this.oncolorchanged); 
    }
    getColor() {
      var b = fromColor;
      var f = toColor;
      var r1 = ColorTweenable.hex2dec(b.slice(0, 2));
      var g1 = ColorTweenable.hex2dec(b.slice(2, 4));
      var b1 = ColorTweenable.hex2dec(b.slice(4, 6));
      var r2 = ColorTweenable.hex2dec(f.slice(0, 2));
      var g2 = ColorTweenable.hex2dec(f.slice(2, 4));
      var b2 = ColorTweenable.hex2dec(f.slice(4, 6));
      var pc = this.getPos() / 100;
      var red = Math.floor(r1 + (pc * (r2 - r1)) + 0.5);
      var green = Math.floor(g1 + (pc * (g2 - g1)) + 0.5);
      var blue = Math.floor(b1 + (pc * (b2 - b1)) + 0.5);
      return (ColorTweenable.dec2hex(red) + ColorTweenable.dec2hex(green) + ColorTweenable.dec2hex(blue));
    }
    oncolorchanged(ev) {
      this.getObj()[this.prop] = '#' + this.getColor();
    }
    static dec2hex = function(dec) {
      return (ColorTweenable.hexDigit[dec >> 4] + ColorTweenable.hexDigit[dec & 15]);
    }
    static hexDigit = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    static hex2dec = function(hex) {
       return (parseInt(hex, 16));
    }
  }
  export class OpacityTweenable extends Tweenable {
    constructor(properties={}) {
      Tweenable.call(this, properties); 
      var subscribed = controller.Controller && controller.Controller.subscribe('motionchanged', this.onOpacityChanged); 
    }
    onOpacityChanged(ev){
      this.obj.opacity = this.getPos() / 100;
      this.obj['MozOpacity'] = this.getPos() / 100;
      if (this.obj.filters) {
        this.obj.filters.alpha.opacity = this.getPos();
      }
    }      
  }
  export class TextTweenable extends Tweenable {
    constructor(properties={}) {
      private txt;
      Tweenable.call(this, properties);              
      @txt = properties.txt; 
      controller.Controller.subscribe('motionchanged', this.onMotionChanged);
    }
    onMotionChanged(ev){
      this.obj[this.prop] = this.txt.substr(0,this.getPos());  
    }
  }
}
