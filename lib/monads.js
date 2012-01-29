(function() {
  var nm = module.Module('monads');
  (function(require, exports, moduleId) {
    var log = require('log');
    var controller = require('controller');
    var events = require('events');
    var utilities = require('utilities');
    var Selectable = (function() {
      function Selectable() {
        function privateData() {
          this.set = null;
        }
        var p_vars = new privateData();
        var set = p_vars.set;
        Object.getOwnPropertyDescriptor(this,'set') || Object.defineProperty(this,'set', {get: function(){return set;},set: function(e){set=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (selections) {
          this.set=[];
        }
        return ctor.apply(this,args) || this;
      }
      Selectable.prototype['elements'] = function() {
        return this.set;
      };
      Selectable.prototype['select'] = function(selectors) {
        if(selectors) {
          for(var i=0;i < selectors.length;++i) {
            var selector=selectors[i];
            var found=this.getElementById(selector) || this.getElementsBySelector(selector);
            if(found && found.length > 0) {
              for(var j=0;j < found.length;++j) {
                var element=found[j];
                this.set.push(element);
              }
            }
          }
        }
      };
      Selectable.prototype['forEach'] = function(fn,obj) {
        for(var i=0;i < this.set.length;++i) {
          fn.apply(obj || this,[this.set[i],i]);
        }
      };
      Selectable.prototype['every'] = function(fn) {
        for(var i=0;i < this.set.length;++i) {
          if(!fn.apply(this,[this.set[i],i])) {
            return false;
          }
        }
        return true;
      };
      Selectable.prototype['some'] = function(fn) {
        for(var i=0,j=this.set.length;i < j;++i) {
          if(fn.call(scope,this.set[i],i,this)) {
            return true;
          }
        }
        return false;
      };
      Selectable.prototype['map'] = function(fn,thisObj) {
        var scope=thisObj || window;
        var a=[];
        for(var i=0,j=this.set.length;i < j;++i) {
          a.push(fn.call(scope,this.set[i],i,this));
        }
        return a;
      };
      Selectable.prototype['filter'] = function(fn,thisObj) {
        var scope=thisObj || window;
        var a=[];
        for(var i=0,j=this.set.length;i < j;++i) {
          if(!fn.call(scope,this.set[i],i,this)) {
            continue;
          }
          a.push(this[i]);
        }
        return a;
      };
      Selectable.prototype['indexOf'] = function(el,st) {
        var start=start || 0;
        for(var i=start,j=this.set.length;i < j;++i) {
          if(this.set[i] === el) {
            return i;
          }
        }
        return -1;
      };
      Selectable.prototype['lastIndexOf'] = function(el,st) {
        var start=start || this.set.length;
        if(start >= this.set.length) {
          start=this.set.length;
        }
        if(start < 0) {
          start=this.set.length + start;
        }
        for(var i=start;i >= 0;--i) {
          if(this.set[i] === el) {
            return i;
          }
        }
        return -1;
      };
      Selectable.prototype['getElementById'] = function(selector) {
        var ele=document.getElementById(selector);
        return ele?[ele]:[];
      };
      Selectable.prototype['getElementsByClassName'] = function(className,tag,elm) {
        if(document.getElementsByClassName) {
          this.getElementsByClassName=function (className,tag,elm) {
            elm=elm || document;
            var elements=elm.getElementsByClassName(className),nodeName=(tag)?new RegExp("\b" + tag + "\b","i"):null,returnElements=[],current;
            for(var i=0,il=elements.length;i < il;i+=1) {
              current=elements[i];
              if(!nodeName || nodeName.test(current.nodeName)) {
                returnElements.push(current);
              }
            }
            return returnElements;
          };
        } else {
          if(document.evaluate) {
            this.getElementsByClassName=function (className,tag,elm) {
              tag=tag || "*";
              elm=elm || document;
              var classes=className.split(" "),classesToCheck="",xhtmlNamespace="http://www.w3.org/1999/xhtml",namespaceResolver=(document.documentElement.namespaceURI === xhtmlNamespace)?xhtmlNamespace:null,returnElements=[],elements,node;
              for(var j=0,jl=classes.length;j < jl;j+=1) {
                classesToCheck+="[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
              }
              try {
                elements=document.evaluate(".//" + tag + classesToCheck,elm,namespaceResolver,0,null);
              } catch(e) {
                elements=document.evaluate(".//" + tag + classesToCheck,elm,null,0,null);
              }
              while((node=elements.iterateNext())) {
                returnElements.push(node);
              }
              return returnElements;
            };
          } else {
            this.getElementsByClassName=function (className,tag,elm) {
              tag=tag || "*";
              elm=elm || document;
              var classes=className.split(" "),classesToCheck=[],elements=(tag === "*" && elm.all)?elm.all:elm.getElementsByTagName(tag),current,returnElements=[],match;
              for(var k=0,kl=classes.length;k < kl;k+=1) {
                classesToCheck.push(new RegExp("(^|\s)" + classes[k] + "(\s|$)"));
              }
              for(var l=0,ll=elements.length;l < ll;l+=1) {
                current=elements[l];
                match=false;
                for(var m=0,ml=classesToCheck.length;m < ml;m+=1) {
                  match=classesToCheck[m].test(current.className);
                  if(!match) {
                    break;
                  }
                }
                if(match) {
                  returnElements.push(current);
                }
              }
              return returnElements;
            };
          }
        }
        return this.getElementsByClassName(className,tag,elm);
      };
      Selectable.prototype['getElementsBySelector'] = function(selector) {
        if(!document.getElementsByTagName) {
          return [];
        }
        var tokens=selector.split(' ');
        var currentContext=[];
        var element,bits,currentContextIndex,tagName,found,foundCount,elements;
        var h,j,k;
        for(var i=0;i < tokens.length;++i) {
          var token=tokens[i].trim();
          if(token.indexOf('#') > -1) {
            bits=token.split('#');
            tagName=bits[0];
            var id=bits[1];
            element=document.getElementById(id);
            if(tagName && element && element.nodeName.toLowerCase() != tagName) {
              return [];
            }
            currentContext=[element];
            continue;
          } else {
            if(token.indexOf('.') > -1) {
              bits=token.split('.');
              tagName=bits[0];
              var className=bits[1];
              if(!tagName) {
                tagName='*';
              }
              found=[];
              foundCount=0;
              for(h=0;h < currentContext.length;++h) {
                if(tagName == '*') {
                  elements=this.getAllChildren(currentContext[h]);
                } else {
                  elements=currentContext[h].getElementsByTagName(tagName);
                }
                for(j=0;j < elements.length;++j) {
                  found[++foundCount]=elements[j];
                }
              }
              currentContext=[];
              currentContextIndex=0;
              var regex=new RegExp('\b' + className + '\b');
              for(k=0;k < found.length;++k) {
                if(found[k].className && found[k].className.match(regex)) {
                  currentContext[++currentContextIndex]=found[k];
                }
              }
              continue;
            } else {
              if(token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/)) {
                tagName=RegExp.$1;
                var attrName=RegExp.$2;
                var attrOperator=RegExp.$3;
                var attrValue=RegExp.$4;
                if(!tagName) {
                  tagName='*';
                }
                found=[];
                foundCount=0;
                for(h=0;h < currentContext.length;++h) {
                  if(tagName == '*') {
                    elements=this.getAllChildren(currentContext[h]);
                  } else {
                    elements=currentContext[h].getElementsByTagName(tagName);
                  }
                  for(j=0;j < elements.length;++j) {
                    found[++foundCount]=elements[j];
                  }
                }
                currentContext=[];
                currentContextIndex=0;
                var checkFunction;
                switch(attrOperator) {
                  case '=':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName) == attrValue);
                    };
                    break;
                  case '~':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName).match(new RegExp('\b' + attrValue + '\b')));
                    };
                    break;
                  case '|':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
                    };
                    break;
                  case '^':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName).indexOf(attrValue) === 0);
                    };
                    break;
                  case '$':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length);
                    };
                    break;
                  case '*':
                    checkFunction=function (e) {
                      return (e.getAttribute(attrName).indexOf(attrValue) > -1);
                    };
                    break;
                  default:
                    checkFunction=function (e) {
                      return e.getAttribute(attrName);
                    };
                }
                currentContext=[];
                currentContextIndex=0;
                for(k=0;k < found.length;++k) {
                  if(checkFunction(found[k])) {
                    currentContext[++currentContextIndex]=found[k];
                  }
                }
                continue;
              }
            }
          }
          if(!currentContext[0]) {
            return [];
          }
          tagName=token;
          found=[];
          foundCount=0;
          for(h=0;h < currentContext.length;++h) {
            elements=currentContext[h].getElementsByTagName(tagName);
            for(j=0;j < elements.length;++j) {
              found[++foundCount]=elements[j];
            }
          }
          currentContext=found;
        }
        return currentContext;
      };
      Selectable.prototype['getAllChildren'] = function(e) {
        return e.all?e.all:e.getElementsByTagName('*');
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Selectable;
        return new Selectable(args && args.length && args[0]);
      };
    })();
    exports.Selectable = Selectable;
    var Continuation = (function() {
      function Continuation() {
        function privateData() {
          this.monad = null;
          this.event = null;
        }
        var p_vars = new privateData();
        var monad = p_vars.monad;
        Object.getOwnPropertyDescriptor(this,'monad') || Object.defineProperty(this,'monad', {get: function(){return monad;},set: function(e){monad=e;}});
        var event = p_vars.event;
        Object.getOwnPropertyDescriptor(this,'event') || Object.defineProperty(this,'event', {get: function(){return event;},set: function(e){event=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          this.monad=properties.monad;
          this.event=properties.event;
        }
        return ctor.apply(this,args) || this;
      }
      Continuation.prototype['action'] = function(fn) {
        var binder=function (c,f) {
          var cont=c;
          var func=f;
          var closure=function (event) {
            func.call(null,event);
          };
          return closure;
        };
        var closure=binder(this,fn);
        controller.Controller.subscribe(this.event,closure,false,this.monad.element);
        return this;
      };
      Continuation.prototype['bind'] = function(fn,ele,ucap) {
        try {
          var binder=function (c,f,e,u) {
            var cont=c;
            var func=f;
            var ele=e;
            var useCapture=u || (ele?true:false);
            var closure=function (element) {
              controller.Controller.subscribe(cont.event,func,useCapture,ele || element);
            };
            return closure;
          };
          this.monad.selector.forEach(binder(this,fn,ele,ucap));
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this.monad;
      };
      Continuation.prototype['delay'] = function(cps,args,ms) {
        try {
          var self=this;
          args=args.length?args:[args];
          setTimeout(function () {
            cps.apply(self,args);
          },ms);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      Continuation.prototype['on'] = function(evt) {
        return this.monad && this.monad.on && this.monad.on(evt);
      };
      Continuation.prototype['unbind'] = function(fn,ele,ucap) {
        var unbinder=function (c,f,e,u) {
          var cont=c;
          var func=f;
          var ele=e;
          var useCapture=u || (ele?true:false);
          var closure=function (element) {
            controller.Controller.unsubscribe(cont.event,func,useCapture,ele || element);
          };
          return closure;
        };
        this.monad.selector.forEach(unbinder(this,fn,ele,ucap));
        return this.monad;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Continuation;
        return new Continuation(args && args.length && args[0]);
      };
    })();
    exports.Continuation = Continuation;
    var Monad = (function() {
      function Monad() {
        function privateData() {
          this.continuation = null;
          this.continuationConstructor = null;
          this.selector = null;
          this.selectors = null;
          this.stateTable = null;
        }
        var p_vars = new privateData();
        var continuation = p_vars.continuation;
        Object.getOwnPropertyDescriptor(this,'continuation') || Object.defineProperty(this,'continuation', {get: function(){return continuation;},set: function(e){continuation=e;}});
        var continuationConstructor = p_vars.continuationConstructor;
        Object.getOwnPropertyDescriptor(this,'continuationConstructor') || Object.defineProperty(this,'continuationConstructor', {get: function(){return continuationConstructor;},set: function(e){continuationConstructor=e;}});
        var selector = p_vars.selector;
        Object.getOwnPropertyDescriptor(this,'selector') || Object.defineProperty(this,'selector', {get: function(){return selector;},set: function(e){selector=e;}});
        var selectors = p_vars.selectors;
        Object.getOwnPropertyDescriptor(this,'selectors') || Object.defineProperty(this,'selectors', {get: function(){return selectors;},set: function(e){selectors=e;}});
        var stateTable = p_vars.stateTable;
        Object.getOwnPropertyDescriptor(this,'stateTable') || Object.defineProperty(this,'stateTable', {get: function(){return stateTable;},set: function(e){stateTable=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          this.continuation=properties.continuation;
          this.continuationConstructor=properties.continuationConstructor || Continuation;
          this.selector=null;
          this.selectors=properties.selectors;
          this.stateTable={};
        }
        return ctor.apply(this,args) || this;
      }
      Monad.prototype['on'] = function(events) {
        try {
          events=events instanceof Array?events:[events];
          if(!this.selector && this.selectors) {
            this.selector=Selectable(this.selectors);
          }
          for(var i=0;i < events.length;++i) {
            var event=events[i];
            if(this.stateTable[event]) {
              this.continuation=this.stateTable[event];
            } else {
              this.continuation=this.continuationConstructor({
                monad:this,
                event:event
              });
              this.stateTable[event]=this.continuation;
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this.continuation;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Monad;
        return new Monad(args && args.length && args[0]);
      };
    })();
    exports.Monad = Monad;
    var Styleable = (function() {
      Styleable.prototype = exports.Monad();
      Styleable.prototype.constructor = Styleable;
      var Monad = exports.Monad.constructor;
      function Styleable() {
        function privateData() {
          this.styles = null;
        }
        var p_vars = new privateData();
        var styles = p_vars.styles;
        Object.getOwnPropertyDescriptor(this,'styles') || Object.defineProperty(this,'styles', {get: function(){return styles;},set: function(e){styles=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Monad.call(this);
          this.styles=properties.styles || [];
          this.continuationConstructor=StyleContinuation;
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Styleable;
        return new Styleable(args && args.length && args[0]);
      };
    })();
    exports.Styleable = Styleable;
    var StyleContinuation = (function() {
      StyleContinuation.prototype = exports.Continuation();
      StyleContinuation.prototype.constructor = StyleContinuation;
      var Continuation = exports.Continuation.constructor;
      function StyleContinuation() {
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Continuation.call(this,properties);
        }
        return ctor.apply(this,args) || this;
      }
      StyleContinuation.prototype['initialize'] = function() {
        try {
          if(StyleContinuation.styleSheets && StyleContinuation.styleSheets.length === 0) {
            for(var j=0;j < document.styleSheets.length;++j) {
              var rules;
              try {
                rules=document.styleSheets[j].rules || document.styleSheets[j].cssRules;
              } catch(e) {
                log.Logger.error(this,e);
                continue;
              }
              if(rules && rules.length) {
                for(var i=0;i < rules.length;++i) {
                  var item=rules.item(i);
                  var selectorText=item.selectorText;
                  var selectors=/,/.test(selectorText)?selectorText.split(','):[selectorText];
                  var cssText=utilities.Environment.ie?item.style.cssText:item.cssText.match(/\{(.*)\}/)[1];
                  for(var h=0;h < selectors.length;++h) {
                    var selector=selectors[h] && selectors[h].trim();
                    if(!selector) {
                      continue;
                    }
                    if(!StyleContinuation.styleSheetsMap[selector]) {
                      StyleContinuation.styleSheets.push(selector);
                      StyleContinuation.styleSheetsMap[selector]=[cssText.trim()];
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
      };
      StyleContinuation.prototype['addStyle'] = function(selector,style) {
        try {
          if(typeof((document)) !== 'undefined' && !StyleContinuation.styleMap[selector]) {
            var cssStr=selector + " {" + style + "}";
            var styleElement=document.createElement("style");
            styleElement.setAttribute("type","text/css");
            if(styleElement.styleSheet) {
              styleElement.styleSheet.cssText=cssStr;
            } else {
              var cssText=document.createTextNode(cssStr);
              styleElement.appendChild(cssText);
            }
            var head=document.getElementsByTagName("head")[0];
            head.appendChild(styleElement);
            StyleContinuation.styleMap[selector]=styleElement;
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      StyleContinuation.prototype['bind'] = function(fn) {
        try {
          var binder=function (c,f) {
            var cont=c;
            var func=f;
            var closure=function () {
              if(DOMContinuation.loaded) {
                func && func();
              } else {
                if(cont.event && cont.event[0] === "/") {
                  event.Event.addSubscriber(cont.event,func);
                } else {
                  window.addEventListener(cont.event,func,false);
                }
              }
            };
            return closure;
          };
          binder(this,fn)();
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this.monad;
      };
      StyleContinuation.prototype['getRules'] = function(selector) {
        this.initialize();
        return StyleContinuation.styleSheetsMap[selector.trim()];
      };
      StyleContinuation.prototype['getStyleSheets'] = function() {
        this.initialize();
        return StyleContinuation.styleSheets;
      };
      StyleContinuation.prototype['style'] = function() {
        return this.bind(this.onstyle);
      };
      StyleContinuation.prototype['unbind'] = function(fn) {
        var unbinder=function (c,f) {
          var cont=c;
          var func=f;
          var closure=function () {
            event.Event.removeSubscriber(cont.event,func);
          };
          return closure;
        };
        unbinder(this,fn)();
        return this.monad;
      };
      StyleContinuation.prototype['onstyle'] = function(event) {
        this.monad.styles.forEach(function (style) {
          this.addStyle(style.selector,style.style);
        },this);
        return true;
      };
      StyleContinuation.styleMap = {};
      StyleContinuation.styleSheets = [];
      StyleContinuation.styleSheetsMap = {};
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.styleMap = StyleContinuation.styleMap;
        __.styleSheets = StyleContinuation.styleSheets;
        __.styleSheetsMap = StyleContinuation.styleSheetsMap;
        __.constructor = StyleContinuation;
        return new StyleContinuation(args && args.length && args[0]);
      };
    })();
    exports.StyleContinuation = StyleContinuation;
    var DOMContinuation = (function() {
      DOMContinuation.prototype = exports.Continuation();
      DOMContinuation.prototype.constructor = DOMContinuation;
      var Continuation = exports.Continuation.constructor;
      function DOMContinuation() {
        function privateData() {
          this.transitions = null;
        }
        var p_vars = new privateData();
        var transitions = p_vars.transitions;
        Object.getOwnPropertyDescriptor(this,'transitions') || Object.defineProperty(this,'transitions', {get: function(){return transitions;},set: function(e){transitions=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Continuation.call(this,properties);
          this.transitions={};
        }
        return ctor.apply(this,args) || this;
      }
      DOMContinuation.prototype['add'] = function(eid) {
        try {
          var ele=(typeof((eid)) === 'string')?DOMable({
            id:eid
          }).on('load').element():eid;
          if(!!ele.parentNode) {
            ele.parentNode.removeChild(ele);
          }
          this.monad.element.appendChild(ele);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['addClass'] = function(className) {
        try {
          var current=typeof(this.monad.element.className) === 'string'?this.monad.element.className.split(' '):[];
          current.push(className);
          this.attributes({
            className:(current.length === 1?current.join(''):current.join(' '))
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['animation'] = function(props) {
        try {
          var properties=props || {};
          var property=properties.property;
          var time=properties.time || '0.4s';
          var count=properties.count || '1';
          if(utilities.Environment.webkit) {
            this.style({
              undefined:property + ' ' + time + ' ' + count
            });
          } else {
            if(utilities.Environment.firefox) {
              this.style({
                undefined:property + ' ' + time + ' ' + count
              });
            } else {
              this.style({
                undefined:property + ' ' + time + ' ' + count
              });
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['attribute'] = function(name) {
        return this.element()[name];
      };
      DOMContinuation.prototype['attributes'] = function(attrs) {
        var attr;
        if(!attrs) {
          var attrobj={},element=this.element();
          for(var i=0;i < element.attributes.length;++i) {
            attr=element.attributes[i];
            var name=attr.name;
            var value=attr.value;
            attrobj[name]=value;
          }
          return attrobj;
        }
        for(attr in attrs) {
          if(attrs.hasOwnProperty(attr)) {
            try {
              if(this.monad && this.monad.element) {
                switch(attr) {
                  case 'className':
                    this.monad.element[attr]=attrs[attr];
                    if(typeof((this.monad['set' + attr.typeCase()])) === 'function') {
                      this.monad['set' + attr.typeCase()](attrs[attr]);
                    }
                    break;
                  default:
                    this.element()[attr]=attrs[attr];
                    if(typeof((this.monad['set' + attr.typeCase()])) === 'function') {
                      this.monad['set' + attr.typeCase()](attrs[attr]);
                    }
                    break;
                }
              }
            } catch(e) {
              log.Logger.error(this,e);
            }
          }
        }
        return this;
      };
      DOMContinuation.prototype['bind'] = function(fn,ele,ucap) {
        try {
          var binder=function (c,f,e,u) {
            var cont=c;
            var func=f;
            var ele=e;
            var useCapture=u || (ele?true:false);
            var closure=function (event) {
              func.call(cont,event,ele || cont.monad.element);
            };
            return closure;
          };
          if(/^load/.test(this.event)) {
            if(DOMContinuation.loaded) {
              fn.call(this,ele);
            }
          } else {
            (ele || this.element()).addEventListener(this.event,fn,ucap || false);
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this.monad;
      };
      DOMContinuation.prototype['child'] = function(index) {
        try {
          return this.monad.element.childNodes.item(index);
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['children'] = function(name) {
        var items=[];
        try {
          var eChildren=this.monad.element.childNodes;
          if(eChildren && eChildren.length) {
            for(var i=0;i < eChildren.length;++i) {
              var item=eChildren.item(i);
              if((item.nodeType === 1) && new RegExp(name).test(item.localName)) {
                items.push(item);
              }
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return items;
      };
      DOMContinuation.prototype['context'] = function() {
        return this.monad;
      };
      DOMContinuation.prototype['correctHtmlAttrQuotation'] = function(html) {
        html=html.replace(/(\w+)=['"]([^'"]+)['"]/mg,function (str,name,value) {
          return name + '=' + '"' + value + '"';
        });
        html=html.replace(/(\w+)=([^ '"]+)/mg,function (str,name,value) {
          return name + '=' + '"' + value + '"';
        });
        html=html.replace(/'/mg,'"');
        return html;
      };
      DOMContinuation.prototype['cumulativeOffset'] = function(e) {
        var element=e || this.monad.element;
        var valueT=0,valueL=0;
        do {
          valueT+=element.offsetTop || 0;
          valueL+=element.offsetLeft || 0;
          element=element.offsetParent;
        } while(element);
        var result=[valueL,valueT];
        result.left=valueL;
        result.top=valueT;
        return result;
      };
      DOMContinuation.prototype['cursor'] = function(cursorName) {
        this.monad.element.style.cursor=cursorName;
        return this;
      };
      DOMContinuation.prototype['element'] = function() {
        return this.monad.element;
      };
      DOMContinuation.prototype['exists'] = function() {
        return !!this.monad.element;
      };
      DOMContinuation.prototype['find'] = function(selectItem) {
        try {
          var ele;
          if(selectItem) {
            switch(typeof(selectItem)) {
              case 'string':
                ele=document.getElementById(selectItem);
                if(!ele) {
                  var elements=require('monads').Selectable([selectItem]).elements();
                  if(elements && elements.length > 0) {
                    ele=elements[0];
                  }
                }
                break;
              case 'object':
                ele=selectItem;
                break;
              case 'function':
                ele=selectItem;
                break;
              default:
                ele=selectItem;
                break;
            }
          }
          return ele;
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['findAncestorByTagName'] = function(tagName) {
        try {
          var ele=this.element().parentNode;
          while(ele.tagName.toLowerCase() !== tagName.toLowerCase()) {
            ele=ele.parentNode;
            if(!ele) {
              break;
            }
          }
          return ele;
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['gradient'] = function(properties) {
        function canvasGradient(element,canvas,repeatY,color1,color2) {
          var nW=element.offsetWidth;
          var nH=element.offsetHeight;
          canvas.width=nW;
          canvas.height=nH;
          canvas.style.width=nW + 'px';
          canvas.style.height=nH + 'px';
          var nT=element.offsetTop;
          var nL=element.offsetLeft;
          canvas.top=nT;
          canvas.left=nL;
          canvas.style.top=nT + 'px';
          canvas.style.left=nL + 'px';
          var ctx=canvas.getContext('2d');
          var dGradient=repeatY?ctx.createLinearGradient(0,0,nW,0):ctx.createLinearGradient(0,0,0,nH);
          dGradient.addColorStop(0,color1);
          dGradient.addColorStop(1,color2);
          ctx.fillStyle=dGradient;
          if(!utilities.Environment.firefox) {
            var radiusBL=8,radiusBR=8,radiusTR=8,radiusTL=8;
            var kappaRradiusBL=radiusBL * 0.333,kappaRradiusBR=radiusBR * 0.333,kappaRradiusTR=radiusTR * 0.333,kappaRradiusTL=radiusTL * 0.333;
            var x=0,y=0,height=nH,width=nW;
            ctx.beginPath();
            ctx.moveTo(x,y + radiusTL);
            ctx.lineTo(x,y + height - radiusBL);
            ctx.bezierCurveTo(x,y + height - kappaRradiusBL,x + kappaRradiusBL,y + height,x + radiusBL,y + height);
            ctx.lineTo(x + width - radiusBR,y + height);
            ctx.bezierCurveTo(x + width - kappaRradiusBR,y + height,x + width,y + height - kappaRradiusBR,x + width,y + height - radiusBR);
            ctx.lineTo(x + width,y + radiusTR);
            ctx.bezierCurveTo(x + width,y + kappaRradiusTR,x + width - kappaRradiusTR,y,x + width - radiusTR,y);
            ctx.lineTo(x + radiusTL,y);
            ctx.bezierCurveTo(x + kappaRradiusTL,y,x,y + kappaRradiusTL,x,y + radiusTL);
            ctx.fill();
          } else {
            ctx.fillRect(0,0,canvas.width,canvas.height);
          }
          return ctx;
        }
        if(properties) {
          var p_dCanvas,color1,color2;
          if(utilities.Environment.ie) {
            this.monad.element.style.zoom=1;
            var filter=this.monad.element.currentStyle.filter;
            this.monad.element.style.filter+=' ' + ['progid:DXImageTransform.Microsoft.gradient(GradientType=',+(!!properties.repeatY),',enabled=true,startColorstr=',properties.color1,', endColorstr=',properties.color2,')'].join('');
          } else {
            if(utilities.Environment.firefox) {
              p_dCanvas=document.createElement('canvas');
              color1=properties.opacity?utilities.Color.hex2rgb(properties.color1,properties.opacity):properties.color1;
              color2=properties.opacity?utilities.Color.hex2rgb(properties.color2,properties.opacity):properties.color2;
              var context=canvasGradient(this.monad.element,p_dCanvas,properties.repeatY,color1,color2);
              var sDataUrl=context.canvas.toDataURL('image/png');
              var sImage=new Image();
              sImage.src=sDataUrl;
              var sRepeat=properties.repeatY?'repeat-y':'repeat-x';
              this.style({
                backgroundRepeat:sRepeat,
                backgroundImage:'url(' + sImage.src + ')',
                backgroundColor:properties.color2
              });
            } else {
              if(utilities.Environment.webkit) {
                this.style({
                  backgroundImage:'-webkit-gradient(linear,left top,left bottom,from(' + properties.color1.toLowerCase() + '),color-stop(0.4,' + utilities.Color.blend(properties.color1,properties.color2,1).toLowerCase() + '),to(' + properties.color2.toLowerCase() + '))'
                });
              } else {
                try {
                  var width=this.styleProperty('width');
                  var height=this.styleProperty('height');
                  this.style({
                    overflow:'hidden',
                    backgroundColor:'transparent',
                    borderColor:'transparent',
                    backgroundImage:'none'
                  });
                  var borderTop=this.styleProperty("borderTopWidth");
                  if(this.styleProperty("borderTopStyle") == "none") {
                    borderTop="0px";
                  }
                  borderTop='-' + borderTop;
                  var borderLeft=this.styleProperty("borderBottomWidth");
                  if(this.styleProperty("border-left-style") == "none") {
                    borderLeft="0px";
                  }
                  borderLeft='-' + borderLeft;
                  var paddingTop=this.styleProperty("paddingTop");
                  var paddingBottom=this.styleProperty("paddingBottom");
                  var paddingLeft=this.styleProperty("paddingLeft");
                  var paddingRight=this.styleProperty("paddingRight");
                  this.style({
                    paddingTop:'0px',
                    paddingBottom:'0px',
                    paddingLeft:'0px',
                    paddingRight:'0px'
                  });
                  var children=[];
                  for(var i=0;i < this.monad.element.childNodes.length;++i) {
                    var achild=this.monad.element.childNodes.item(i);
                    children.push(achild);
                  }
                  var contentDiv=DOMable({
                    tagName:'div'
                  }).on('load').attributes({
                    id:this.monad.element.id + '-ContentDiv'
                  }).style({
                    width:'auto',
                    height:'auto',
                    border:'0px transparent solid',
                    display:'block',
                    position:'relative',
                    zIndex:'2',
                    paddingTop:paddingTop,
                    paddingBottom:paddingBottom,
                    paddingLeft:paddingLeft,
                    paddingRight:paddingRight
                  }).insert(this.monad.element.id).element();
                  children.forEach(function (child) {
                    child.parentNode.removeChild(child);
                    this.appendChild(child);
                  },contentDiv);
                  var canvasDiv=DOMable({
                    tagName:'div'
                  }).on('load').attributes({
                    id:this.monad.element.id + '-CanvasDiv'
                  }).style({
                    display:'block',
                    position:'relative',
                    top:borderTop,
                    left:borderLeft,
                    width:'0px',
                    height:'0px',
                    zIndex:'0'
                  }).element();
                  DOMable({
                    id:this.monad.element.id
                  }).on('load').insertBeforeFirst(canvasDiv);
                  p_dCanvas=DOMable({
                    tagName:'canvas'
                  }).on('load').attributes({
                    id:this.monad.element.id + '-Canvas'
                  }).style({
                    width:'auto',
                    height:'auto',
                    zIndex:'-1'
                  }).insert(this.monad.element.id + '-CanvasDiv').element();
                  color1=properties.opacity?utilities.Color.hex2rgb(properties.color1,properties.opacity):properties.color1;
                  color2=properties.opacity?utilities.Color.hex2rgb(properties.color2,properties.opacity):properties.color2;
                  canvasGradient(contentDiv,p_dCanvas,properties.repeatY,color1,color2);
                } catch(e) {
                  log.Logger.error(this,e);
                }
              }
            }
          }
        }
        return this;
      };
      DOMContinuation.prototype['hasClass'] = function(className) {
        var hasValue=false;
        try {
          var current=(typeof(this.attribute('className')) === 'string'?this.attribute('className').split(' '):[]);
          current.forEach(function (value) {
            if(className === value.trim()) {
              hasValue=true;
            }
          },this);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return hasValue;
      };
      DOMContinuation.prototype['hide'] = function(target,event) {
        var element=this.find(target || this.monad.element);
        if(!this.closure) {
          this.bind(this.hide,element,false);
          return this;
        } else {
          element.style.display='none';
          if(!!event) {
            event.stopPropagation();
          }
        }
        return false;
      };
      DOMContinuation.prototype['highlightText'] = function() {
        var r1;
        if(document.selection) {
          r1=document.body.createTextRange();
          r1.moveToElementText(this.monad.element);
          r1.setEndPoint("EndToEnd",r1);
          r1.moveStart('character',4);
          r1.moveEnd('character',8);
          r1.select();
        } else {
          var s=window.getSelection();
          r1=document.createRange();
          r1.setStartBefore(this.monad.element);
          r1.setEndAfter(this.monad.element);
          s.addRange(r1);
        }
        return this;
      };
      DOMContinuation.prototype['html'] = function(htmlValue) {
        try {
          if(htmlValue) {
            this.monad.element.innerHTML=htmlValue;
            return this;
          } else {
            return this.monad.element.innerHTML;
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['id'] = function() {
        return this.monad.id;
      };
      DOMContinuation.prototype['inject'] = function(attributes) {
        for(attrName in attributes) {
          var target=attributes[attrName];
          if(typeof(target[attrName]) == 'function') {
            target[attrName].call(target,this.monad.element);
          } else {
            target[attrName]=this.monad.element;
          }
        }
        return this;
      };
      DOMContinuation.prototype['insert'] = function(selectItem,where) {
        try {
          if(selectItem) {
            var ele=this.find(selectItem);
            if(ele) {
              if(ele != this.monad.element) {
                if(where) {
                  ele.insertBefore(this.monad.element,where);
                } else {
                  if(this.monad.element.parentNode && this.monad.element.parentNode != ele) {
                    this.monad.element.parentNode.removeChild(this.monad.element);
                  }
                  ele.appendChild(this.monad.element);
                }
              }
            } else {
              log.Logger.warning(this,'Invalid selector ' + selectItem);
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['insertBeforeFirst'] = function(element) {
        var target=this.find(element);
        target.insertBefore(this.monad.element,target.firstChild);
      };
      DOMContinuation.prototype['makePositioned'] = function() {
        var pos=this.monad.element.style.position;
        if(pos == 'static' || !pos) {
          this.monad.element.style.position='relative';
          if(window.opera) {
            this.monad.element.style.top=0;
            this.monad.element.style.left=0;
          }
        }
        return this;
      };
      DOMContinuation.prototype['mix'] = function(color1,color2) {
        var r=[];
        var step1=color1.length == 4?1:2;
        var step2=color2.length == 4?1:2;
        for(var i=0;i < 3;++i) {
          var x=parseInt(color1.substr(1 + step1 * i,step1),16);
          if(step1 == 1) {
            x=16 * x + x;
          }
          var y=parseInt(color2.substr(1 + step2 * i,step2),16);
          if(step2 == 1) {
            y=16 * y + y;
          }
          r[i]=Math.floor((x * 50 + y * 50) / 100);
          r[i]=r[i].toString(16);
          if(r[i].length == 1) {
            r[i]="0" + r[i];
          }
        }
        return ("#" + r[0] + r[1] + r[2]);
      };
      DOMContinuation.prototype['move'] = function(x,y) {
        if(this.monad.element && this.monad.element.style) {
          if(utilities.Environment.ie) {
            this.monad.element.style.pixelLeft=x;
            this.monad.element.style.pixelTop=y;
          } else {
            this.monad.element.style.left=x + "px";
            this.monad.element.style.top=y + "px";
          }
          return this;
        }
      };
      DOMContinuation.prototype['normalizeHtml'] = function() {
        return this.replace(/<(\/?)(\w+)([^>]*?)>/img,function (str,closingMark,tagName,attrs) {
          var sortedAttrs=this.sortHtmlAttrs(JSSpec.utilities.correctHtmlAttrQuotation(attrs).toLowerCase());
          return "<" + closingMark + tagName.toLowerCase() + sortedAttrs + ">";
        }).replace(/<(br|hr|img)([^>]*?)>/mg,function (str,tag,attrs) {
          return "<" + tag + attrs + " />";
        }).replace(/style="(.*?)"/mg,function (str,styleStr) {
          styleStr=this.sortStyleEntries(styleStr.strip());
          if(styleStr.charAt(styleStr.length - 1) != ';') {
            styleStr+=";";
          }
          return 'style="' + styleStr + '"';
        }).replace(/ style=";"/mg,"").replace(/\r/mg,'').replace(/\n/mg,'');
      };
      DOMContinuation.prototype['opacity'] = function(value) {
        if(value) {
          var object=this.monad.element.style;
          object.opacity=(value / 100);
          object.MozOpacity=(value / 100);
          object.KhtmlOpacity=(value / 100);
          object.filter="alpha(opacity=" + value + ")";
        }
        return this;
      };
      DOMContinuation.prototype['place'] = function(placement) {
        try {
          var x=0,y=0,clientWindowWidth,localWindowWidth;
          switch(placement) {
            case "random":
              x=Math.round(Math.random() * (document.documentElement.clientWidth / 2));
              y=Math.round(Math.random() * (document.documentElement.clientHeight / 3));
              break;
            case "top":
              clientWindowWidth=document.documentElement.clientWidth / 2;
              localWindowWidth=parseInt(this.styleProperty('width'),10) / 2;
              x=clientWindowWidth - localWindowWidth;
              y=10;
              break;
            default:
            case "center":
              clientWindowWidth=document.documentElement.clientWidth / 2;
              var clientWindowHeight=document.documentElement.clientHeight / 2;
              localWindowWidth=parseInt(this.styleProperty('width'),10) / 2;
              var localWindowHeight=parseInt(this.styleProperty('height'),10) / 2;
              x=Math.abs(clientWindowWidth - localWindowWidth);
              y=Math.abs(clientWindowHeight - localWindowHeight);
              break;
          }
          this.move(x,y);
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['pointer'] = function(event) {
        return {
          x:document.all?event.clientX:event.pageX,
          y:document.all?event.clientY:event.pageY
        };
      };
      DOMContinuation.prototype['pointerX'] = function(event) {
        return this.pointer(event).x;
      };
      DOMContinuation.prototype['pointerY'] = function(event) {
        return this.pointer(event).y;
      };
      DOMContinuation.prototype['position'] = function() {
        var pos={};
        var element=this.monad.element;
        var x=element.offsetLeft || 0;
        var y=element.offsetTop || 0;
        element=element.offsetParent;
        while(element) {
          x+=element.offsetLeft;
          y+=element.offsetTop;
          element=element.offsetParent;
        }
        pos.x=x;
        pos.y=y;
        return pos;
      };
      DOMContinuation.prototype['push'] = function(attributes) {
        for(attrName in attributes) {
          if(attributes.hasOwnProperty(attrName)) {
            var target=attributes[attrName];
            target[attrName]=target[attrName] || [];
            target[attrName].push(this.monad.element);
          }
        }
        return this;
      };
      DOMContinuation.prototype['randomColor'] = function() {
        this.monad.element.style.backgroundColor="#" + Math.floor(Math.random() * 16).toString(16) + Math.floor(Math.random() * 16).toString(16) + Math.floor(Math.random() * 16).toString(16);
        this.monad.element.style.backgroundImage="";
        return this;
      };
      DOMContinuation.prototype['reflect'] = function(image,width,height,rheight) {
        try {
          this.element().width=width;
          this.element().height=rheight;
          var ctx=this.element().getContext('2d');
          ctx.save();
          ctx.translate(0,height - 1);
          ctx.scale(1,-1);
          ctx.drawImage(image,0,0,width,height);
          ctx.restore();
          ctx.globalCompositeOperation="destination-out";
          var gradient=ctx.createLinearGradient(0,0,0,rheight);
          gradient.addColorStop(1,"rgba(255, 255, 255, 1.0)");
          gradient.addColorStop(0,"rgba(255, 255, 255, 0.5)");
          ctx.fillStyle=gradient;
          ctx.fillRect(0,0,width,rheight);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['remove'] = function() {
        if(this.element() && this.element().parentNode) {
          this.element().parentNode.removeChild(this.element());
        }
        this.monad.element=null;
        return this;
      };
      DOMContinuation.prototype['removeChildren'] = function(s,r) {
        if(this.monad.element.childNodes && this.monad.element.childNodes.length > 0) {
          var i,child,eChildren=[],start=(s || 0),range=(r || this.element().childNodes.length);
          if(start < 0) {
            start=this.element().childNodes.length + start;
          }
          for(i=start;i < range;++i) {
            child=this.element().childNodes.item(i);
            eChildren.push(child);
          }
          eChildren.forEach(function (eChild) {
            this.element().removeChild(eChild);
          },this);
        }
        return this;
      };
      DOMContinuation.prototype['removeAttribute'] = function(attributeName) {
        try {
          this.element() && this.element().removeAttribute(attributeName);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['removeClass'] = function(className) {
        var current=typeof(this.element().className) === 'string'?this.element().className.split(' '):[];
        var classes=[];
        current.forEach(function (value) {
          if(className !== value.trim()) {
            classes.push(value);
          }
        },this);
        var classList=classes.join(' ').trim();
        classList.length?this.attributes({
          className:classList
        }):this.element().removeAttribute('class');
        return this;
      };
      DOMContinuation.prototype['round'] = function(radius) {
        if(utilities.Environment.firefox) {
          switch(arguments.length) {
            case 1:
              this.style({
                MozBorderRadius:parseInt(arguments[0],10) + 'px'
              });
              break;
            case 2:
              this.style({
                MozBorderRadius:arguments[0] + 'px ' + arguments[1] + 'px'
              });
              break;
            case 3:
              this.style({
                MozBorderRadius:arguments[0] + 'px ' + arguments[1] + 'px ' + arguments[2] + 'px'
              });
              break;
            case 4:
              this.style({
                MozBorderRadius:arguments[0] + 'px ' + arguments[1] + 'px ' + arguments[2] + 'px ' + arguments[3] + 'px'
              });
              break;
          }
        } else {
          if(utilities.Environment.webkit) {
            switch(arguments.length) {
              case 1:
                this.style({
                  undefined:arguments[0] + 'px'
                });
                break;
              case 2:
                this.style({
                  WebkitBorderTopLeftRadius:arguments[0] + 'px',
                  WebkitBorderTopRightRadius:arguments[1] + 'px'
                });
                break;
              case 3:
                this.style({
                  WebkitBorderTopLeftRadius:arguments[0] + 'px',
                  WebkitBorderTopRightRadius:arguments[1] + 'px',
                  WebkitBorderBottomRightRadius:arguments[2] + 'px'
                });
                break;
              case 4:
                this.style({
                  WebkitBorderTopLeftRadius:arguments[0] + 'px',
                  WebkitBorderTopRightRadius:arguments[1] + 'px',
                  WebkitBorderBottomRightRadius:arguments[2] + 'px',
                  WebkitBorderBottomLeftRadius:arguments[3] + 'px'
                });
                break;
            }
          } else {
            this.style({
              borderRadius:radius + "px"
            });
          }
        }
        return this;
      };
      DOMContinuation.prototype['scroll'] = function(xory) {
        try {
          if(utilities.Environment.webkit) {
            if(xory) {
              document.body.scrollLeft=xory.x || document.body.scrollLeft;
              document.body.scrollTop=xory.y || document.body.scrollTop;
            } else {
              return {
                x:document.body.scrollLeft,
                y:document.body.scrollTop
              };
            }
          } else {
            if(utilities.Environment.ie || utilities.Environment.firefox) {
              if(xory) {
                document.documentElement.scrollLeft=xory.x || document.documentElement.scrollLeft;
                document.documentElement.scrollTop=xory.y || document.documentElement.scrollTop;
              } else {
                return {
                  x:document.documentElement.scrollLeft,
                  y:document.documentElement.scrollTop
                };
              }
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['shadow'] = function(props) {
        try {
          var properties=props || {};
          Object.adapt(properties,{
            horizontal:5,
            vertical:5,
            blurRadius:5,
            color:'#888',
            inset:false
          });
          var style=properties.horizontal + 'px ' + properties.vertical + 'px ' + properties.blurRadius + 'px ' + properties.color;
          style+=properties.inset?' inset':'';
          this.style({
            undefined:style,
            undefined:style
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['show'] = function() {
        this.monad.element.style.display='block';
        return this;
      };
      DOMContinuation.prototype['size'] = function() {
        var out={};
        if(this.monad.element.pageXOffset) {
          out.scrollX=this.monad.element.pageXOffset;
          out.scrollY=this.monad.element.pageYOffset;
        } else {
          if(document.documentElement) {
            out.scrollX=this.monad.element == window?document.body.scrollLeft + document.documentElement.scrollLeft:this.monad.element.scrollLeft;
            out.scrollY=this.monad.element == window?document.body.scrollTop + document.documentElement.scrollTop:this.monad.element.scrollTop;
          } else {
            if(this.monad.element == window?document.body.scrollLeft >= 0:this.monad.element.scrollLeft >= 0) {
              out.scrollX=this.monad.element == window?document.body.scrollLeft:this.monad.element.scrollLeft;
              out.scrollY=this.monad.element == window?document.body.scrollTop:this.monad.element.scrollTop;
            }
          }
        }
        if(document.compatMode == "BackCompat") {
          out.width=this.monad.element == window?document.body.clientWidth:this.monad.element.clientWidth;
          out.height=this.monad.element == window?document.body.clientHeight:this.monad.element.clientHeight;
        } else {
          out.width=this.monad.element == window?document.documentElement.clientWidth:this.monad.element.clientWidth;
          out.height=this.monad.element == window?document.documentElement.clientHeight:this.monad.element.clientHeight;
        }
        return out;
      };
      DOMContinuation.prototype['style'] = function(styles) {
        if(!!styles) {
          for(styleName in styles) {
            if(styles.hasOwnProperty(styleName)) {
              if(styleName === 'float') {
                if(utilities.Environment.ie) {
                  this.monad.element.style.styleFloat=styles[styleName];
                } else {
                  if(utilities.Environment.firefox) {
                    this.monad.element.style.cssFloat=styles[styleName];
                  } else {
                    this.monad.element.style['float']=styles[styleName];
                  }
                }
              } else {
                this.monad.element.style[styleName]=styles[styleName];
              }
            }
          }
        }
        return this;
      };
      DOMContinuation.prototype['styleBackgroundColor'] = function(value) {
        var bgColor=this.styleProperty("backgroundColor",value);
        bgColor=bgColor || this.styleProperty("background");
        if(bgColor) {
          var bgParts=bgColor.split('#');
          if(bgParts && bgParts.length > 1) {
            var bgColorPart=bgParts[1].split(' ');
            bgColor='#' + bgColorPart[0];
          }
        }
        if(bgColor == 'transparent') {
          bgColor=this.monad.element.parentNode?DOMable({
            element:this.monad.element.parentNode
          }).on('load').styleBackgroundColor():bgColor;
        }
        return bgColor;
      };
      DOMContinuation.prototype['styleColor'] = function(value) {
        return this.styleProperty("color",value) || "transparent";
      };
      DOMContinuation.prototype['styleComputedProperty'] = function(prop) {
        try {
          var computedValue;
          if(this.element().currentStyle) {
            computedValue=this.element().currentStyle[prop];
          } else {
            if(document.defaultView && document.defaultView.getComputedStyle) {
              computedValue=document.defaultView.getComputedStyle(this.element(),"")[prop];
            } else {
              computedValue=this.element().style[prop];
            }
          }
          return computedValue;
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['styleDisplay'] = function(value) {
        return this.styleProperty(this.monad.element.currentStyle.display.toLowerCase() == 'block'?'block':'inline-block',value);
      };
      DOMContinuation.prototype['stylePadding'] = function(side,value) {
        return this.styleProperty("padding" + side,value);
      };
      DOMContinuation.prototype['styleProperty'] = function(prop,value) {
        try {
          var computedValue;
          if(this.monad.element.currentStyle && this.monad.element.currentStyle[prop]) {
            computedValue=this.monad.element.currentStyle[prop];
          } else {
            if(window.getComputedStyle) {
              computedValue=window.getComputedStyle(this.monad.element,'')[prop];
            }
          }
          return (computedValue);
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['text'] = function(textValue) {
        try {
          if(textValue) {
            this.monad.element.appendChild(document.createTextNode(textValue));
            return this;
          } else {
            return this.monad.element.textContent || (this.monad.element.firstChild?this.monad.element.firstChild.nodeValue:this.monad.element.innerText);
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['textShadow'] = function(v) {
        var value=v || '1px 1px 1px #FFF';
        this.monad.element.style.textShadow=value;
        return this;
      };
      DOMContinuation.prototype['translate'] = function(props) {
        try {
          var style=[],properties=props || {};
          properties.x && style.push('translateX(' + properties.x + ')');
          properties.y && style.push(' translateY(' + properties.y + ')');
          style=style.join(' ');
          if(utilities.Environment.webkit) {
            this.style({
              undefined:style
            });
          } else {
            if(utilities.Environment.firefox) {
              this.style({
                undefined:style
              });
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['transition'] = function(props) {
        try {
          var properties=props || {};
          var property=properties.property;
          var time=properties.time || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in';
          if(!this.getTransitions()[property]) {
            this.getTransitions()[property]=true;
            if(utilities.Environment.webkit) {
              var webkitStyle=(properties.noprefix?'':'-webkit-') + property + ' ' + time + ' ' + (timingfunc || 'ease');
              this.style({
                undefined:webkitStyle
              });
            } else {
              if(utilities.Environment.firefox) {
                var mozStyle=(properties.noprefix?'':'Moz') + property + ' ' + time + ' ' + (timingfunc || 'ease');
                this.style({
                  undefined:mozStyle
                });
              } else {
                var noVendorStyle=property + ' ' + time + ' ' + (timingfunc || 'ease');
                this.style({
                  undefined:noVendorStyle
                });
              }
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['updateText'] = function(textValue) {
        var target=this.monad.element instanceof Array?this.monad.element[0]:this.monad.element;
        var found=false;
        for(var i=0,length=this.monad.element.childNodes.length;i < length;++i) {
          var child=this.monad.element.childNodes.item(i);
          if(child.nodeType === 3) {
            child.nodeValue=textValue;
            found=true;
            break;
          }
        }
        if(!found) {
          this.text(textValue);
        }
        return this;
      };
      DOMContinuation.prototype['unbind'] = function(func,ele,ucap) {
        var useCapture=ucap || false;
        var target=ele || this.monad.element;
        if(!!target) {
          target.removeEventListener(this.event,func,useCapture);
        }
        return this.monad;
      };
      DOMContinuation.prototype['onfadein'] = function(props) {
        try {
          var properties=props || {};
          var opacity=properties.opacity || '1';
          var duration=properties.duration || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in-out';
          this.transition({
            property:'opacity',
            duration:duration,
            timingfunc:timingfunc
          });
          this.style({
            opacity:opacity
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['onfadeout'] = function(props) {
        try {
          var properties=props || {};
          var opacity=properties.opacity || '0';
          var duration=properties.duration || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in-out';
          this.transition({
            property:'opacity',
            duration:duration,
            timingfunc:timingfunc
          });
          this.style({
            opacity:opacity
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['onlower'] = function(event) {
        try {
          this.transition({
            property:'box-shadow',
            duration:'0.3s',
            timingfunc:'ease-in-out'
          });
          this.shadow();
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['onraise'] = function(event) {
        try {
          this.transition({
            property:'box-shadow',
            duration:'0.3s',
            timingfunc:'ease-in-out'
          });
          this.shadow({
            horizontal:8,
            vertical:8,
            color:'#999'
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      DOMContinuation.prototype['onslide'] = function(props) {
        try {
          var properties=props || {};
          var left=properties.left;
          var top=properties.top;
          var width=properties.width;
          var height=properties.height;
          var duration=properties.duration || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in-out';
          if(left) {
            this.transition({
              property:'left',
              duration:duration,
              timingfunc:timingfunc,
              noprefix:true
            });
            this.style({
              left:left
            });
          }
          if(top) {
            this.transition({
              property:'top',
              duration:duration,
              timingfunc:timingfunc,
              noprefix:true
            });
            this.style({
              top:top
            });
          }
          if(width) {
            this.transition({
              property:'width',
              duration:duration,
              timingfunc:timingfunc,
              noprefix:true
            });
            this.style({
              width:width
            });
          }
          if(height) {
            this.transition({
              property:'height',
              duration:duration,
              timingfunc:timingfunc,
              noprefix:true
            });
            this.style({
              height:height
            });
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['onzoomin'] = function(props) {
        try {
          var properties=props || {};
          var zoom=properties.zoom || '1';
          var duration=properties.duration || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in-out';
          this.transition({
            property:'scale(' + zoom + ')',
            duration:duration,
            timingfunc:timingfunc
          });
          this.style({
            scale:zoom
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.prototype['onzoomout'] = function(props) {
        try {
          var properties=props || {};
          var zoom=properties.zoom || '0';
          var duration=properties.duration || '0.4s';
          var timingfunc=properties.timingfunc || 'ease-in-out';
          this.transition({
            property:'scale(' + zoom + ')',
            duration:duration,
            timingfunc:timingfunc
          });
          this.style({
            scale:zoom
          });
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      DOMContinuation.loaded = true;
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.loaded = DOMContinuation.loaded;
        __.constructor = DOMContinuation;
        return new DOMContinuation(args && args.length && args[0]);
      };
    })();
    exports.DOMContinuation = DOMContinuation;
    var DOMable = (function() {
      DOMable.prototype = exports.Monad();
      DOMable.prototype.constructor = DOMable;
      var Monad = exports.Monad.constructor;
      function DOMable() {
        function privateData() {
          this.className = null;
          this.element = null;
          this.id = null;
        }
        var p_vars = new privateData();
        var className = p_vars.className;
        Object.getOwnPropertyDescriptor(this,'className') || Object.defineProperty(this,'className', {get: function(){return className;},set: function(e){className=e;}});
        var element = p_vars.element;
        Object.getOwnPropertyDescriptor(this,'element') || Object.defineProperty(this,'element', {get: function(){return element;},set: function(e){element=e;}});
        var id = p_vars.id;
        Object.getOwnPropertyDescriptor(this,'id') || Object.defineProperty(this,'id', {get: function(){return id;},set: function(e){id=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          try {
            if(properties.tagName) {
              Monad.call(this);
              this.element=(typeof((document)) !== 'undefined') && document.createElement(properties.tagName);
              this.id=properties.id || Math.uuid(8);
              this.element.id=id;
              this.className=properties.className;
              if(this.className) {
                this.element.className=this.className;
              }
            } else {
              if(properties.id) {
                Monad.call(this,{
                  selectors:[properties.id]
                });
                this.selector=Selectable(this.selectors);
                this.element=this.selector.elements().length && this.selector.elements()[0];
                this.id=this.element.id;
                this.className=this.element.className;
              } else {
                if(properties.element) {
                  Monad.call(this);
                  this.element=properties.element;
                  this.id=(this.element.id || Math.uuid(8));
                  this.className=(this.element.className || properties.className);
                }
              }
            }
            this.continuationConstructor=properties.continuationConstructor || DOMContinuation;
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return ctor.apply(this,args) || this;
      }
      DOMable.prototype['init'] = function() {
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = DOMable;
        return new DOMable(args && args.length && args[0]);
      };
    })();
    exports.DOMable = DOMable;
    var Moveable = (function() {
      Moveable.prototype = exports.DOMable();
      Moveable.prototype.constructor = Moveable;
      var DOMable = exports.DOMable.constructor;
      function Moveable() {
        function privateData() {
          this.source = null;
        }
        var p_vars = new privateData();
        var source = p_vars.source;
        Object.getOwnPropertyDescriptor(this,'source') || Object.defineProperty(this,'source', {get: function(){return source;},set: function(e){source=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          try {
            if(properties) {
              DOMable.call(this,{
                id:properties.target
              });
              source=require('monads').Selectable([properties.source || properties.target]).elements()[0];
              this.continuationConstructor=require('monads').MoveContinuation;
            }
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Moveable;
        return new Moveable(args && args.length && args[0]);
      };
    })();
    exports.Moveable = Moveable;
    var MoveContinuation = (function() {
      MoveContinuation.prototype = exports.DOMContinuation();
      MoveContinuation.prototype.constructor = MoveContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function MoveContinuation() {
        function privateData() {
          this.active = null;
          this.allowX = null;
          this.allowY = null;
          this.offsetX = null;
          this.offsetY = null;
          this.lastX = null;
          this.lastY = null;
        }
        var p_vars = new privateData();
        var active = p_vars.active;
        Object.getOwnPropertyDescriptor(this,'active') || Object.defineProperty(this,'active', {get: function(){return active;},set: function(e){active=e;}});
        var allowX = p_vars.allowX;
        Object.getOwnPropertyDescriptor(this,'allowX') || Object.defineProperty(this,'allowX', {get: function(){return allowX;},set: function(e){allowX=e;}});
        var allowY = p_vars.allowY;
        Object.getOwnPropertyDescriptor(this,'allowY') || Object.defineProperty(this,'allowY', {get: function(){return allowY;},set: function(e){allowY=e;}});
        var offsetX = p_vars.offsetX;
        Object.getOwnPropertyDescriptor(this,'offsetX') || Object.defineProperty(this,'offsetX', {get: function(){return offsetX;},set: function(e){offsetX=e;}});
        var offsetY = p_vars.offsetY;
        Object.getOwnPropertyDescriptor(this,'offsetY') || Object.defineProperty(this,'offsetY', {get: function(){return offsetY;},set: function(e){offsetY=e;}});
        var lastX = p_vars.lastX;
        Object.getOwnPropertyDescriptor(this,'lastX') || Object.defineProperty(this,'lastX', {get: function(){return lastX;},set: function(e){lastX=e;}});
        var lastY = p_vars.lastY;
        Object.getOwnPropertyDescriptor(this,'lastY') || Object.defineProperty(this,'lastY', {get: function(){return lastY;},set: function(e){lastY=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.active=false;
          this.allowX=true;
          this.allowY=true;
          this.offsetX=0;
          this.offsetY=0;
          this.lastX=-1;
          this.lastY=-1;
        }
        return ctor.apply(this,args) || this;
      }
      MoveContinuation.prototype['bind'] = function(fn,ele,ucap) {
        var binder=function (c,f,e,u) {
          var cont=c;
          var func=f;
          var ele=e;
          var useCapture=u || (ele?true:false);
          var closure=function (event) {
            func.call(cont,event,ele || cont.monad.source);
          };
          return closure;
        };
        if(/^load/.test(this.event)) {
          if(DOMContinuation.loaded) {
            fn.call(this,ele);
          }
        } else {
          (ele || this.monad.source).addEventListener(this.event,fn,ucap || false);
        }
        return this.monad;
      };
      MoveContinuation.prototype['move'] = function(c,styles) {
        var constraints=c || {};
        this.allowX=typeof(constraints.allowX) == 'boolean'?constraints.allowX:this.allowX;
        this.allowY=typeof(constraints.allowY) == 'boolean'?constraints.allowY:this.allowY;
        this.style(styles);
        return this.bind(this.onMoveBegin,null,false);
      };
      MoveContinuation.prototype['unbind'] = function(func,ele,ucap) {
        this.active=false;
        DOMContinuation.constructor.prototype.unbind.call(this,func,ele,ucap);
        return this;
      };
      MoveContinuation.prototype['onMoveBegin'] = function(event) {
        if(this.lastX === -1) {
          this.lastX=parseInt(this.styleProperty('left'),10);
          this.lastX=isNaN(this.lastX)?0:this.lastX;
        }
        if(this.lastY === -1) {
          this.lastY=parseInt(this.styleProperty('top'),10);
          this.lastY=isNaN(this.lastY)?0:this.lastY;
        }
        this.offsetX=this.pointerX(event) - this.lastX;
        this.offsetY=this.pointerY(event) - this.lastY;
        this.active=true;
        this.monad.on('mousemove').bind(this.onMoveDuring,document,true);
        this.monad.on('mouseup').bind(this.onMoveEnd,document,true);
        this.monad.element.style.position='absolute';
        controller.Controller.publish(events.CustomEvent({
          type:'movebegin',
          canBubble:false,
          isCanceleable:true,
          detail:{
            id:this.monad.source,
            point:this.pointer(event)
          }
        }));
        event.preventDefault();
        return false;
      };
      MoveContinuation.prototype['onMoveDuring'] = function(event) {
        try {
          if(this.active) {
            this.lastX=this.pointerX(event) - this.offsetX;
            this.lastY=this.pointerY(event) - this.offsetY;
            if(this.allowX) {
              this.monad.element.style.left=this.lastX + 'px';
            }
            if(this.allowY) {
              this.monad.element.style.top=this.lastY + 'px';
            }
            event.preventDefault();
            return false;
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return true;
      };
      MoveContinuation.prototype['onMoveEnd'] = function(event) {
        if(this.active) {
          try {
            this.active=false;
            this.monad.on('mousemove').unbind(this.onMoveDuring,document,true);
            this.monad.on('mouseup').unbind(this.onMoveEnd,document,true);
            controller.Controller.publish(eventEvents.CustomEvent({
              type:'moveend',
              canBubble:false,
              isCanceleable:true,
              detail:{
                id:this.monad.source,
                point:this.pointer(event),
                allowX:this.allowX,
                allowY:this.allowY
              }
            }));
            this.lastX=-1;
            this.lastY=-1;
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return false;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = MoveContinuation;
        return new MoveContinuation(args && args.length && args[0]);
      };
    })();
    exports.MoveContinuation = MoveContinuation;
    var Resizeable = (function() {
      Resizeable.prototype = exports.DOMable();
      Resizeable.prototype.constructor = Resizeable;
      var DOMable = exports.DOMable.constructor;
      function Resizeable() {
        function privateData() {
          this.source = null;
        }
        var p_vars = new privateData();
        var source = p_vars.source;
        Object.getOwnPropertyDescriptor(this,'source') || Object.defineProperty(this,'source', {get: function(){return source;},set: function(e){source=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          if(properties) {
            DOMable.call(this,{
              id:properties.target
            });
            source=require('monads').Selectable([properties.source || properties.target]).elements()[0];
            this.continuationConstructor=require('monads').ResizeContinuation;
          }
          return this;
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Resizeable;
        return new Resizeable(args && args.length && args[0]);
      };
    })();
    exports.Resizeable = Resizeable;
    var ResizeContinuation = (function() {
      ResizeContinuation.prototype = exports.DOMContinuation();
      ResizeContinuation.prototype.constructor = ResizeContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function ResizeContinuation() {
        function privateData() {
          this.active = null;
          this.allowWidth = null;
          this.allowHeight = null;
          this.offsetX = null;
          this.offsetY = null;
          this.lastX = null;
          this.lastY = null;
          this.width = null;
          this.height = null;
          this.x = null;
          this.y = null;
        }
        var p_vars = new privateData();
        var active = p_vars.active;
        Object.getOwnPropertyDescriptor(this,'active') || Object.defineProperty(this,'active', {get: function(){return active;},set: function(e){active=e;}});
        var allowWidth = p_vars.allowWidth;
        Object.getOwnPropertyDescriptor(this,'allowWidth') || Object.defineProperty(this,'allowWidth', {get: function(){return allowWidth;},set: function(e){allowWidth=e;}});
        var allowHeight = p_vars.allowHeight;
        Object.getOwnPropertyDescriptor(this,'allowHeight') || Object.defineProperty(this,'allowHeight', {get: function(){return allowHeight;},set: function(e){allowHeight=e;}});
        var offsetX = p_vars.offsetX;
        Object.getOwnPropertyDescriptor(this,'offsetX') || Object.defineProperty(this,'offsetX', {get: function(){return offsetX;},set: function(e){offsetX=e;}});
        var offsetY = p_vars.offsetY;
        Object.getOwnPropertyDescriptor(this,'offsetY') || Object.defineProperty(this,'offsetY', {get: function(){return offsetY;},set: function(e){offsetY=e;}});
        var lastX = p_vars.lastX;
        Object.getOwnPropertyDescriptor(this,'lastX') || Object.defineProperty(this,'lastX', {get: function(){return lastX;},set: function(e){lastX=e;}});
        var lastY = p_vars.lastY;
        Object.getOwnPropertyDescriptor(this,'lastY') || Object.defineProperty(this,'lastY', {get: function(){return lastY;},set: function(e){lastY=e;}});
        var width = p_vars.width;
        Object.getOwnPropertyDescriptor(this,'width') || Object.defineProperty(this,'width', {get: function(){return width;},set: function(e){width=e;}});
        var height = p_vars.height;
        Object.getOwnPropertyDescriptor(this,'height') || Object.defineProperty(this,'height', {get: function(){return height;},set: function(e){height=e;}});
        var x = p_vars.x;
        Object.getOwnPropertyDescriptor(this,'x') || Object.defineProperty(this,'x', {get: function(){return x;},set: function(e){x=e;}});
        var y = p_vars.y;
        Object.getOwnPropertyDescriptor(this,'y') || Object.defineProperty(this,'y', {get: function(){return y;},set: function(e){y=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.active=false;
          this.allowWidth=true;
          this.allowHeight=true;
          this.offsetX=0;
          this.offsetY=0;
          this.lastX=-1;
          this.lastY=-1;
          this.width=-1;
          this.height=-1;
          this.x=-1;
          this.y=-1;
          return this;
        }
        return ctor.apply(this,args) || this;
      }
      ResizeContinuation.prototype['bind'] = function(fn,ele,ucap) {
        var binder=function (c,f,e,u) {
          var cont=c;
          var func=f;
          var ele=e;
          var useCapture=u || (ele?true:false);
          var closure=function (event) {
            func.call(cont,event,ele || cont.monad.source);
          };
          return closure;
        };
        if(/^load/.test(this.event)) {
          if(DOMContinuation.loaded) {
            fn.call(this,ele);
          }
        } else {
          (ele || this.monad.source).addEventListener(this.event,fn,ucap || false);
        }
        return this.monad;
      };
      ResizeContinuation.prototype['resize'] = function(c) {
        var constraints=c || {};
        this.monad.source.style.cursor='resize';
        this.allowWidth=typeof(constraints.allowWidth) == 'boolean'?constraints.allowWidth:this.allowWidth;
        this.allowHeight=typeof(constraints.allowHeight) == 'boolean'?constraints.allowHeight:this.allowHeight;
        return this.bind(this.onresizebegin,null,false);
      };
      ResizeContinuation.prototype['unbind'] = function(func,ele,ucap) {
        this.active=false;
        DOMContinuation.constructor.prototype.unbind.call(this,func,ele,ucap);
        return this;
      };
      ResizeContinuation.prototype['onresizebegin'] = function(event) {
        var target=event.target || event.srcElement;
        if(this.x === -1) {
          this.x=this.lastX=parseInt(this.styleProperty('left'),10);
          this.x=this.lastX=isNaN(this.lastX)?0:this.lastX;
        }
        if(this.y === -1) {
          this.y=this.lastY=parseInt(this.styleProperty('top'),10);
          this.y=this.lastY=isNaN(this.lastY)?0:this.lastY;
        }
        if(this.width === -1) {
          this.width=parseInt(this.styleProperty('width'),10);
        }
        if(this.height === -1) {
          this.height=parseInt(this.styleProperty('height'),10);
        }
        this.offsetX=this.pointerX(event) - this.lastX;
        this.offsetY=this.pointerY(event) - this.lastY;
        this.monad.on('mousemove').bind(this.onresizeduring,document,true);
        this.monad.on('mouseup').bind(this.onresizeend,document,true);
        controller.Controller.publish(eventEvents.CustomEvent({
          type:'resizebegin',
          canBubble:false,
          isCanceleable:true,
          detail:{
            id:this.id(),
            width:this.width,
            height:this.height
          }
        }));
        event.preventDefault();
        this.active=true;
        return false;
      };
      ResizeContinuation.prototype['onresizeduring'] = function(event) {
        var target=event.target || event.srcElement;
        if(this.active) {
          this.lastX=this.pointerX(event) - this.offsetX;
          this.lastY=this.pointerY(event) - this.offsetY;
          var newWidth=this.width + (this.lastX - this.x);
          var newHeight=this.height + (this.lastY - this.y);
          if(this.allowWidth) {
            this.style({
              width:newWidth + 'px'
            });
          }
          if(this.allowHeight) {
            this.style({
              height:newHeight + 'px'
            });
          }
          event.preventDefault();
          return false;
        }
        return true;
      };
      ResizeContinuation.prototype['onresizeend'] = function(event) {
        var target=event.target || event.srcElement;
        if(this.active) {
          try {
            this.active=false;
            this.monad.on('mousemove').unbind(this.onresizeduring,document,true);
            this.monad.on('mouseup').unbind(this.onresizeend,document,true);
            controller.Controller.publish(eventEvents.CustomEvent({
              type:'resizeend',
              canBubble:false,
              isCanceleable:true,
              detail:{
                id:this.monad.id,
                point:this.pointer(event)
              }
            }));
            this.lastX=-1;
            this.lastY=-1;
            this.width=-1;
            this.height=-1;
            this.x=-1;
            this.y=-1;
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return false;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = ResizeContinuation;
        return new ResizeContinuation(args && args.length && args[0]);
      };
    })();
    exports.ResizeContinuation = ResizeContinuation;
    var Highlightable = (function() {
      Highlightable.prototype = exports.Monad();
      Highlightable.prototype.constructor = Highlightable;
      var Monad = exports.Monad.constructor;
      function Highlightable() {
        function privateData() {
          this.target = null;
          this.targets = null;
          this.targetMap = null;
        }
        var p_vars = new privateData();
        var target = p_vars.target;
        Object.getOwnPropertyDescriptor(this,'target') || Object.defineProperty(this,'target', {get: function(){return target;},set: function(e){target=e;}});
        var targets = p_vars.targets;
        Object.getOwnPropertyDescriptor(this,'targets') || Object.defineProperty(this,'targets', {get: function(){return targets;},set: function(e){targets=e;}});
        var targetMap = p_vars.targetMap;
        Object.getOwnPropertyDescriptor(this,'targetMap') || Object.defineProperty(this,'targetMap', {get: function(){return targetMap;},set: function(e){targetMap=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_selector) {
          var selector = _selector || {};
          try {
            Monad.call(this);
            this.target=null;
            this.targets=null;
            this.targetMap={};
            if(selector) {
              this.selectors=[selector.source];
              this.selector=require('monads').Selectable(this.selectors);
              this.targets=[selector.target];
              this.target=require('monads').Selectable(this.targets);
              this.target.forEach(function (highlightable) {
                this.targetMap[highlightable.id]=highlightable;
              },this);
            }
            this.continuationConstructor=HighlightContinuation;
          } catch(e) {
            log.Logger.error(this,e);
          }
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Highlightable;
        return new Highlightable(args && args.length && args[0]);
      };
    })();
    exports.Highlightable = Highlightable;
    var HighlightContinuation = (function() {
      HighlightContinuation.prototype = exports.Continuation();
      HighlightContinuation.prototype.constructor = HighlightContinuation;
      var Continuation = exports.Continuation.constructor;
      function HighlightContinuation() {
        function privateData() {
          this.minOpacity = null;
          this.maxOpacity = null;
          this.autoUp = null;
          this.autoDown = null;
          this.savedOver = null;
          this.savedOut = null;
        }
        var p_vars = new privateData();
        var minOpacity = p_vars.minOpacity;
        Object.getOwnPropertyDescriptor(this,'minOpacity') || Object.defineProperty(this,'minOpacity', {get: function(){return minOpacity;},set: function(e){minOpacity=e;}});
        var maxOpacity = p_vars.maxOpacity;
        Object.getOwnPropertyDescriptor(this,'maxOpacity') || Object.defineProperty(this,'maxOpacity', {get: function(){return maxOpacity;},set: function(e){maxOpacity=e;}});
        var autoUp = p_vars.autoUp;
        Object.getOwnPropertyDescriptor(this,'autoUp') || Object.defineProperty(this,'autoUp', {get: function(){return autoUp;},set: function(e){autoUp=e;}});
        var autoDown = p_vars.autoDown;
        Object.getOwnPropertyDescriptor(this,'autoDown') || Object.defineProperty(this,'autoDown', {get: function(){return autoDown;},set: function(e){autoDown=e;}});
        var savedOver = p_vars.savedOver;
        Object.getOwnPropertyDescriptor(this,'savedOver') || Object.defineProperty(this,'savedOver', {get: function(){return savedOver;},set: function(e){savedOver=e;}});
        var savedOut = p_vars.savedOut;
        Object.getOwnPropertyDescriptor(this,'savedOut') || Object.defineProperty(this,'savedOut', {get: function(){return savedOut;},set: function(e){savedOut=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Continuation.call(this,properties);
          this.minOpacity=0;
          this.maxOpacity=30;
          this.autoUp=4;
          this.autoDown=2;
          this.savedOver=null;
          this.savedOut=null;
        }
        return ctor.apply(this,args) || this;
      }
      HighlightContinuation.prototype['highlight'] = function() {
        try {
          var source=this.monad.selector.set[0];
          this.bind(this.onHighlight,this.monad.selector.set[0],true);
          this.monad.on('mouseout').bind(this.onHighlight,this.monad.selector.set[0],true);
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      HighlightContinuation.prototype['fade'] = function(event) {
        for(id in this.monad.targetMap) {
          if(this.monad.targetMap.hasOwnProperty(id)) {
            var highlightable=this.monad.targetMap[id];
            if(highlightable.highlightState !== OFF) {
              highlightable.highlightState={
                state:FADE_DOWN,
                index:this.minOpacity,
                step:this.autoDown
              };
              this.run(highlightable);
            }
          }
        }
      };
      HighlightContinuation.prototype['run'] = function(highlightable) {
        var highlightElemRunning=false;
        highlightable.highlightState=highlightable.highlightState || {
          state:OFF,
          index:this.minOpacity
        };
        if(highlightable.highlightState.state === ON) {
          highlightable.highlightState.index=this.maxOpacity;
          highlightable.highlightState.state=FADE_DOWN;
          highlightElemRunning=true;
          if(highlightable.filters) {
            highlightable.style.filter="alpha(opacity = " + highlightable.highlightState.index + ")";
          } else {
            highlightable.style.MozOpacity=highlightable.highlightState.index / 100;
          }
        } else {
          if(highlightable.highlightState.state == HIGHLIGHT_UP) {
            highlightable.highlightState.index+=highlightable.highlightState.step;
            if(highlightable.highlightState.index > this.maxOpacity) {
              highlightable.highlightState.index=this.maxOpacity;
            }
            if(highlightable.filters) {
              highlightable.style.filter="alpha(opacity = " + highlightable.highlightState.index + ")";
            } else {
              highlightable.style.MozOpacity=highlightable.highlightState.index / 100;
            }
            if(highlightable.highlightState.index >= this.maxOpacity) {
              highlightable.highlightState.state=ON;
            } else {
              highlightElemRunning=true;
            }
          } else {
            if(highlightable.highlightState.state == HIGHLIGHT_UP_FADE_DOWN) {
              highlightable.highlightState.index+=highlightable.highlightState.step;
              if(highlightable.highlightState.index > this.maxOpacity) {
                highlightable.highlightState.index=this.maxOpacity;
              }
              if(highlightable.filters) {
                highlightable.style.filter="alpha(opacity = " + highlightable.highlightState.index + ")";
              } else {
                highlightable.style.MozOpacity=highlightable.highlightState.index / 100;
              }
              if(highlightable.highlightState.index == this.maxOpacity) {
                highlightable.highlightState.state=FADE_DOWN;
                highlightable.highlightState.step=this.autoDown;
              }
              highlightElemRunning=true;
            } else {
              if(highlightable.highlightState.state == FADE_DOWN) {
                highlightable.highlightState.index-=highlightable.highlightState.step;
                if(highlightable.filters) {
                  highlightable.style.filter="alpha(opacity = " + highlightable.highlightState.index + ")";
                } else {
                  highlightable.style.MozOpacity=highlightable.highlightState.index / 100;
                }
                if(highlightable.highlightState.index <= this.minOpacity) {
                  highlightable.highlightState.state=OFF;
                  highlightable.highlightState.index=this.minOpacity;
                } else {
                  highlightElemRunning=true;
                }
              } else {
                if(highlightable.highlightState.state === OFF) {
                  highlightable.highlightState.index=this.minOpacity;
                  if(highlightable.filters) {
                    highlightable.style.filter="alpha(opacity = " + highlightable.highlightState.index + ")";
                  } else {
                    highlightable.style.MozOpacity=highlightable.highlightState.index / 100;
                  }
                } else {
                  log.Logger.error(this,highlightable.id + ' state ' + highlightable.highlightState.state + ' not handled');
                }
              }
            }
          }
        }
        if(highlightElemRunning) {
          var closure=function (obj,elem) {
            return function () {
              obj.run.call(obj,elem);
            };
          };
          setTimeout(closure(this,highlightable),40);
        }
      };
      HighlightContinuation.prototype['onHighlight'] = function(event) {
        var highlightable=event?event.target:event.srcElement;
        if(this.monad.targetMap[highlightable.id]) {
          highlightable.highlightState=highlightable.highlightState || {
            state:OFF,
            index:this.minOpacity
          };
        } else {
          if(this.monad.selector.set[0] == highlightable && event.type == 'mousedown') {
            this.fade(event);
          } else {
            return true;
          }
        }
        if(event.type == 'mouseout') {
          if(highlightable.highlightState && highlightable.highlightState.state === HIGHLIGHT_UP) {
            highlightable.highlightState.state=HIGHLIGHT_UP_FADE_DOWN;
            highlightable.highlightState.step=this.autoDown;
          }
        }
        if(!highlightable.highlightState) {
          log.Logger.error(this,highlightable.id + ' has no fadeState!!!!');
        }
        if(highlightable.highlightState.state === OFF) {
          highlightable.highlightState.state=HIGHLIGHT_UP;
          highlightable.highlightState.step=this.autoUp;
        } else {
          if(highlightable.highlightState.state === ON) {
            highlightable.highlightState.state=FADE_DOWN;
            highlightable.highlightState.step=this.autoDown;
          }
        }
        this.run(highlightable);
      };
      HighlightContinuation.OFF = 0;
      HighlightContinuation.ON = 1;
      HighlightContinuation.FADE_DOWN = 2;
      HighlightContinuation.HIGHLIGHT_UP = 3;
      HighlightContinuation.HIGHLIGHT_UP_FADE_DOWN = 4;
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.OFF = HighlightContinuation.OFF;
        __.ON = HighlightContinuation.ON;
        __.FADE_DOWN = HighlightContinuation.FADE_DOWN;
        __.HIGHLIGHT_UP = HighlightContinuation.HIGHLIGHT_UP;
        __.HIGHLIGHT_UP_FADE_DOWN = HighlightContinuation.HIGHLIGHT_UP_FADE_DOWN;
        __.constructor = HighlightContinuation;
        return new HighlightContinuation(args && args.length && args[0]);
      };
    })();
    exports.HighlightContinuation = HighlightContinuation;
    var Slideable = (function() {
      Slideable.prototype = exports.DOMable();
      Slideable.prototype.constructor = Slideable;
      var DOMable = exports.DOMable.constructor;
      function Slideable() {
        function privateData() {
          this.target = null;
        }
        var p_vars = new privateData();
        var target = p_vars.target;
        Object.getOwnPropertyDescriptor(this,'target') || Object.defineProperty(this,'target', {get: function(){return target;},set: function(e){target=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          if(properties.source) {
            if(typeof((properties.source)) === 'string') {
              DOMable.call(this,{
                id:properties.source
              });
            } else {
              DOMable.call(this,{
                element:properties.source
              });
            }
          }
          this.target=require('monads').Selectable([properties.target]);
          this.continuationConstructor=(properties.direction && properties.direction === "horizontal")?require('monads').SlideHorizontalContinuation:require('monads').SlideVerticalContinuation;
        }
        return ctor.apply(this,args) || this;
      }
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Slideable;
        return new Slideable(args && args.length && args[0]);
      };
    })();
    exports.Slideable = Slideable;
    var SlideVerticalContinuation = (function() {
      SlideVerticalContinuation.prototype = exports.DOMContinuation();
      SlideVerticalContinuation.prototype.constructor = SlideVerticalContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function SlideVerticalContinuation() {
        function privateData() {
          this.maxh = null;
          this.speed = null;
          this.timer = null;
          this.maxOpacity = null;
        }
        var p_vars = new privateData();
        var maxh = p_vars.maxh;
        Object.getOwnPropertyDescriptor(this,'maxh') || Object.defineProperty(this,'maxh', {get: function(){return maxh;},set: function(e){maxh=e;}});
        var speed = p_vars.speed;
        Object.getOwnPropertyDescriptor(this,'speed') || Object.defineProperty(this,'speed', {get: function(){return speed;},set: function(e){speed=e;}});
        var timer = p_vars.timer;
        Object.getOwnPropertyDescriptor(this,'timer') || Object.defineProperty(this,'timer', {get: function(){return timer;},set: function(e){timer=e;}});
        var maxOpacity = p_vars.maxOpacity;
        Object.getOwnPropertyDescriptor(this,'maxOpacity') || Object.defineProperty(this,'maxOpacity', {get: function(){return maxOpacity;},set: function(e){maxOpacity=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.maxh=200;
          this.speed=10;
          this.timer=15;
          this.maxOpacity=1;
        }
        return ctor.apply(this,args) || this;
      }
      SlideVerticalContinuation.prototype['slide'] = function(properties) {
        if(properties) {
          this.maxh=properties.maxh || this.maxh;
          this.speed=properties.speed || this.speed;
          this.timer=properties.timer || this.timer;
          this.maxOpacity=properties.maxOpacity || this.maxOpacity;
        }
        this.bind(this.onSlideStart,null,true);
        return this;
      };
      SlideVerticalContinuation.prototype['slideStart'] = function(slideable) {
        var slideClosure=function (c,e) {
          var continuation=c;
          var element=e;
          return function () {
            continuation.run.call(continuation,element);
          };
        };
        slideable.timer=setInterval(slideClosure(this,slideable),this.timer);
      };
      SlideVerticalContinuation.prototype['run'] = function(slideable) {
        var maxh=this.maxh;
        var currHeight=slideable.offsetHeight;
        var step=Math.max(2,(slideable.direction == 1)?Math.round((Math.abs(maxh - currHeight) / this.speed)):Math.round(currHeight / this.speed));
        if(slideable.direction == -1) {
          step=-step;
        }
        var newHeight=parseInt(slideable.style.height.replace("px",""),10) + step;
        slideable.style.height=newHeight + "px";
        slideable.style.opacity=Math.min(currHeight / maxh,this.maxOpacity);
        slideable.style.filter="alpha(opacity=" + (slideable.style.opacity * 100) + ")";
        if(newHeight < 2 && slideable.direction == -1) {
          clearInterval(slideable.timer);
          slideable.style.display="none";
          slideable.direction=1;
          slideable.style.height="0px";
        } else {
          if(newHeight > (maxh - 2) && slideable.direction == 1) {
            clearInterval(slideable.timer);
            slideable.direction=-1;
            slideable.style.display="block";
            slideable.style.height=maxh + "px";
          }
        }
      };
      SlideVerticalContinuation.prototype['onSlideStart'] = function() {
        var event=arguments.length == 1?arguments[0]:arguments[1];
        var slideStartClosure=function (c,e) {
          var continuation=c;
          var currentTarget=e.currentTarget;
          return function (slideable,i) {
            if(slideable.timer) {
              clearInterval(slideable.timer);
            }
            var check=continuation.monad.selector.elements()[i];
            if(currentTarget == check) {
              if(slideable.style.display == "block") {
                slideable.style.height=this.maxh + "px";
                slideable.direction=-1;
              } else {
                slideable.style.height="0px";
                slideable.style.display="block";
                slideable.direction=1;
              }
              continuation.slideStart(slideable);
            }
          };
        };
        this.monad.target.forEach(slideStartClosure(this,event));
        return true;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = SlideVerticalContinuation;
        return new SlideVerticalContinuation(args && args.length && args[0]);
      };
    })();
    exports.SlideVerticalContinuation = SlideVerticalContinuation;
    var SlideHorizontalContinuation = (function() {
      SlideHorizontalContinuation.prototype = exports.DOMContinuation();
      SlideHorizontalContinuation.prototype.constructor = SlideHorizontalContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function SlideHorizontalContinuation() {
        function privateData() {
          this.speed = null;
          this.timer = null;
          this.maxOpacity = null;
        }
        var p_vars = new privateData();
        var speed = p_vars.speed;
        Object.getOwnPropertyDescriptor(this,'speed') || Object.defineProperty(this,'speed', {get: function(){return speed;},set: function(e){speed=e;}});
        var timer = p_vars.timer;
        Object.getOwnPropertyDescriptor(this,'timer') || Object.defineProperty(this,'timer', {get: function(){return timer;},set: function(e){timer=e;}});
        var maxOpacity = p_vars.maxOpacity;
        Object.getOwnPropertyDescriptor(this,'maxOpacity') || Object.defineProperty(this,'maxOpacity', {get: function(){return maxOpacity;},set: function(e){maxOpacity=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.speed=10;
          this.timer=15;
          this.maxOpacity=1;
        }
        return ctor.apply(this,args) || this;
      }
      SlideHorizontalContinuation.prototype['slide'] = function(properties) {
        if(properties) {
          this.speed=properties.speed || this.speed;
          this.timer=properties.timer || this.timer;
          this.maxOpacity=properties.maxOpacity || this.maxOpacity;
        }
        this.bind(this.onSlideStart,null,true);
        return this;
      };
      SlideHorizontalContinuation.prototype['slideStart'] = function(slideable) {
        var slideClosure=function (c,e) {
          var continuation=c;
          var element=e;
          return function () {
            continuation.run.call(continuation,element);
          };
        };
        slideable.timer=setInterval(slideClosure(this,slideable),this.timer);
      };
      SlideHorizontalContinuation.prototype['run'] = function(slideable) {
        var maxw=slideable.maxw;
        var currWidth=slideable.offsetWidth;
        var step=Math.max(2,(slideable.direction == 1)?Math.round((Math.abs(maxw - currWidth) / this.speed)):Math.round(currWidth / this.speed));
        if(slideable.direction == -1) {
          step=-step;
        }
        var newWidth=parseInt(slideable.style.width.replace("px",""),10) + step;
        slideable.style.width=newWidth + "px";
        slideable.style.opacity=Math.min(currWidth / maxw,this.maxOpacity);
        slideable.style.filter="alpha(opacity=" + (slideable.style.opacity * 100) + ")";
        if(newWidth < 2 && slideable.direction == -1) {
          clearInterval(slideable.timer);
          slideable.style.display="none";
          slideable.direction=1;
          slideable.style.width="0px";
        } else {
          if(newWidth > (maxw - 2) && slideable.direction == 1) {
            clearInterval(slideable.timer);
            slideable.direction=-1;
            slideable.style.display="block";
            slideable.style.width=maxw + "px";
          }
        }
      };
      SlideHorizontalContinuation.prototype['onSlideStart'] = function() {
        var event=arguments.length == 1?arguments[0]:arguments[1];
        var slideStartClosure=function (c,e) {
          var continuation=c;
          var currentTarget=e.currentTarget;
          return function (slideable,i) {
            if(slideable.timer) {
              clearInterval(slideable.timer);
            }
            var check=continuation.monad.selector.elements()[i];
            if(currentTarget == check) {
              if(slideable.style.display == "block") {
                slideable.style.width=slideable.maxw + "px";
                slideable.direction=-1;
              } else {
                slideable.style.width="0px";
                slideable.style.display="block";
                slideable.direction=1;
              }
              continuation.slideStart(slideable);
            }
          };
        };
        this.monad.target.forEach(slideStartClosure(this,event));
        return false;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = SlideHorizontalContinuation;
        return new SlideHorizontalContinuation(args && args.length && args[0]);
      };
    })();
    exports.SlideHorizontalContinuation = SlideHorizontalContinuation;
    var Swipeable = (function() {
      Swipeable.prototype = exports.DOMable();
      Swipeable.prototype.constructor = Swipeable;
      var DOMable = exports.DOMable.constructor;
      function Swipeable() {
        function privateData() {
          this.source = null;
        }
        var p_vars = new privateData();
        var source = p_vars.source;
        Object.getOwnPropertyDescriptor(this,'source') || Object.defineProperty(this,'source', {get: function(){return source;},set: function(e){source=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMable.call(this,{
            id:properties.target
          });
          source=Selectable([properties.source || properties.target]).elements()[0];
          this.continuationConstructor=require('monads').SwipeContinuation;
        }
        return ctor.apply(this,args) || this;
      }
      Swipeable.prototype['init'] = function() {
        try {
          if(utilities.Environment.webkit) {
            var styles=[{
              selector:"Swipeable-left",
              style:"-webkit-animation-name:swipe-left;-webkit-animation-duration:2s;"
            },{
              selector:"@-webkit-keyframes swipe-left",
              style:'from {left:0px;} to {left:-300px;}'
            },{
              selector:"Swipeable-right",
              style:"-webkit-animation-name:swipe-right;-webkit-animation-duration:2s;"
            },{
              selector:"@-webkit-keyframes swipe-right",
              style:'from {left:0px;} to {left:300px;}'
            }];
            require('monads').Styleable(styles).on("load").style();
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Swipeable;
        return new Swipeable(args && args.length && args[0]);
      };
    })();
    exports.Swipeable = Swipeable;
    var SwipeContinuation = (function() {
      SwipeContinuation.prototype = exports.DOMContinuation();
      SwipeContinuation.prototype.constructor = SwipeContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function SwipeContinuation() {
        function privateData() {
          this.allowX = null;
          this.allowY = null;
          this.goingLeft = null;
          this.lastX = null;
          this.lastY = null;
          this.offsetX = null;
          this.offsetY = null;
        }
        var p_vars = new privateData();
        var allowX = p_vars.allowX;
        Object.getOwnPropertyDescriptor(this,'allowX') || Object.defineProperty(this,'allowX', {get: function(){return allowX;},set: function(e){allowX=e;}});
        var allowY = p_vars.allowY;
        Object.getOwnPropertyDescriptor(this,'allowY') || Object.defineProperty(this,'allowY', {get: function(){return allowY;},set: function(e){allowY=e;}});
        var goingLeft = p_vars.goingLeft;
        Object.getOwnPropertyDescriptor(this,'goingLeft') || Object.defineProperty(this,'goingLeft', {get: function(){return goingLeft;},set: function(e){goingLeft=e;}});
        var lastX = p_vars.lastX;
        Object.getOwnPropertyDescriptor(this,'lastX') || Object.defineProperty(this,'lastX', {get: function(){return lastX;},set: function(e){lastX=e;}});
        var lastY = p_vars.lastY;
        Object.getOwnPropertyDescriptor(this,'lastY') || Object.defineProperty(this,'lastY', {get: function(){return lastY;},set: function(e){lastY=e;}});
        var offsetX = p_vars.offsetX;
        Object.getOwnPropertyDescriptor(this,'offsetX') || Object.defineProperty(this,'offsetX', {get: function(){return offsetX;},set: function(e){offsetX=e;}});
        var offsetY = p_vars.offsetY;
        Object.getOwnPropertyDescriptor(this,'offsetY') || Object.defineProperty(this,'offsetY', {get: function(){return offsetY;},set: function(e){offsetY=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          allowX=true;
          allowY=true;
          goingLeft=undefined;
          lastX=undefined;
          lastY=undefined;
          offsetX=0;
          offsetY=0;
        }
        return ctor.apply(this,args) || this;
      }
      SwipeContinuation.prototype['swipe'] = function(c,styles) {
        try {
          var constraints=c || {};
          allowX=typeof(constraints.allowX) == 'boolean'?constraints.allowX:allowX;
          allowY=typeof(constraints.allowY) == 'boolean'?constraints.allowY:allowY;
          if(styles) {
            this.style(styles);
          }
          document.documentElement.style.webkitTapHighlightColor="rgba(0,0,0,0)";
          if(this.element().parentNode) {
            this.element().parentNode.style.webkitPerspective='600';
            this.element().parentNode.style.webkitTransformStyle='preserve-3d';
          } else {
            document.documentElement.style.webkitPerspective='600';
            document.documentElement.style.webkitTransformStyle='preserve-3d';
          }
          this.element().style.webkitTransitionTimingFunction='ease-out';
          this.element().style.webkitTransitionDuration='0s';
          this.element().addEventListener("touchstart",this.ontouchstart,false);
          this.element().addEventListener("touchmove",this.ontouchmove,false);
          this.element().addEventListener("touchend",this.ontouchend,false);
          this.element().addEventListener("touchcancel",this.ontouchcancel,false);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      SwipeContinuation.prototype['pointer'] = function(event) {
        try {
          if(event.touches.length == 1) {
            var x=event.targetTouches[0].pageX;
            var y=event.targetTouches[0].pageY;
            return {
              x:x,
              y:y
            };
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      SwipeContinuation.prototype['ontouchstart'] = function(event) {
        try {
          var left=this.monad.element.style.left;
          var top=this.monad.element.style.top;
          lastX=parseInt(left,10);
          lastY=parseInt(top,10);
          lastX=Math.isNumber(lastX)?lastX:0;
          lastY=Math.isNumber(lastY)?lastY:0;
          offsetX=this.pointerX(event) - lastX;
          goingLeft=offsetX < 0;
          offsetY=this.pointerY(event) - lastY;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      SwipeContinuation.prototype['ontouchmove'] = function(event) {
        try {
          event.preventDefault();
          lastX=this.pointerX(event) - offsetX;
          lastY=this.pointerY(event) - offsetY;
          if(allowX && allowY) {
            this.style({
              webkitTransform:'translate3d(' + lastX + 'px,' + lastY + 'px,0)'
            });
            this.monad.element.style.left=lastX + 'px';
            this.monad.element.style.top=lastY + 'px';
          } else {
            if(allowX) {
              this.monad.element.style.webkitTransform='translate3d(' + lastX + 'px,0,0)';
              this.monad.element.style.left=lastX + 'px';
            } else {
              if(allowY) {
                this.style({
                  webkitTransform:'translate3d(0,' + lastY + 'px,0)'
                });
                this.monad.element.style.top=lastY + 'px';
              }
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      SwipeContinuation.prototype['ontouchcancel'] = function(event) {
        try {
          event.preventDefault();
          goingLeft=undefined;
          lastX=undefined;
          lastY=undefined;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      SwipeContinuation.prototype['ontouchend'] = function(event) {
        try {
          event.preventDefault();
          var left;
          if(goingLeft) {
            this.monad.element.style.webkitTransitionDuration='0.5s';
            this.monad.element.style.webkitTransform='translate3d(150px,0,0)';
            left=parseInt(this.monad.element.style.left,10);
            left-=150;
            this.monad.element.style.left=left + 'px';
          } else {
            this.monad.element.style.webkitTransitionDuration='0.5s';
            this.monad.element.style.webkitTransform='translate3d(-150px,0,0)';
            left=parseInt(this.monad.element.style.left,10);
            left+=150;
            this.monad.element.style.left=left + 'px';
          }
          goingLeft=undefined;
          lastX=undefined;
          lastY=undefined;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = SwipeContinuation;
        return new SwipeContinuation(args && args.length && args[0]);
      };
    })();
    exports.SwipeContinuation = SwipeContinuation;
    var Touchable = (function() {
      Touchable.prototype = exports.DOMable();
      Touchable.prototype.constructor = Touchable;
      var DOMable = exports.DOMable.constructor;
      function Touchable() {
        function privateData() {
          this.source = null;
        }
        var p_vars = new privateData();
        var source = p_vars.source;
        Object.getOwnPropertyDescriptor(this,'source') || Object.defineProperty(this,'source', {get: function(){return source;},set: function(e){source=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMable.call(this,{
            id:properties.target
          });
          source=require('monads').Selectable([properties.source || properties.target]).elements()[0];
          this.continuationConstructor=require('monads').TouchContinuation;
        }
        return ctor.apply(this,args) || this;
      }
      Touchable.prototype['init'] = function() {
        try {
          if(utilities.Environment.webkit) {
            var styles=[{
              selector:'Touchable',
              style:'-webkit-animation-name:"slide-me-to-the-right";-webkit-animation-duration:1s;'
            },{
              selector:'@-webkit-keyframes "slide-me-to-the-right"',
              style:'from { left: 0px; } to { left: 100px; }'
            }];
            require('monads').Styleable(styles).on("load").style();
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Touchable;
        return new Touchable(args && args.length && args[0]);
      };
    })();
    exports.Touchable = Touchable;
    var TouchContinuation = (function() {
      TouchContinuation.prototype = exports.DOMContinuation();
      TouchContinuation.prototype.constructor = TouchContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function TouchContinuation() {
        function privateData() {
          this.allowX = null;
          this.allowY = null;
          this.lastX = null;
          this.lastY = null;
          this.offsetX = null;
          this.offsetY = null;
        }
        var p_vars = new privateData();
        var allowX = p_vars.allowX;
        Object.getOwnPropertyDescriptor(this,'allowX') || Object.defineProperty(this,'allowX', {get: function(){return allowX;},set: function(e){allowX=e;}});
        var allowY = p_vars.allowY;
        Object.getOwnPropertyDescriptor(this,'allowY') || Object.defineProperty(this,'allowY', {get: function(){return allowY;},set: function(e){allowY=e;}});
        var lastX = p_vars.lastX;
        Object.getOwnPropertyDescriptor(this,'lastX') || Object.defineProperty(this,'lastX', {get: function(){return lastX;},set: function(e){lastX=e;}});
        var lastY = p_vars.lastY;
        Object.getOwnPropertyDescriptor(this,'lastY') || Object.defineProperty(this,'lastY', {get: function(){return lastY;},set: function(e){lastY=e;}});
        var offsetX = p_vars.offsetX;
        Object.getOwnPropertyDescriptor(this,'offsetX') || Object.defineProperty(this,'offsetX', {get: function(){return offsetX;},set: function(e){offsetX=e;}});
        var offsetY = p_vars.offsetY;
        Object.getOwnPropertyDescriptor(this,'offsetY') || Object.defineProperty(this,'offsetY', {get: function(){return offsetY;},set: function(e){offsetY=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.allowX=true;
          this.allowY=true;
          this.lastX=undefined;
          this.lastY=undefined;
          this.offsetX=0;
          this.offsetY=0;
        }
        return ctor.apply(this,args) || this;
      }
      TouchContinuation.prototype['touch'] = function(c,styles) {
        try {
          var constraints=c || {};
          this.allowX=typeof(constraints.allowX) == 'boolean'?constraints.allowX:this.allowX;
          this.allowY=typeof(constraints.allowY) == 'boolean'?constraints.allowY:this.allowY;
          this.style(styles);
          document.documentElement.style.webkitTapHighlightColor="rgba(0,0,0,0)";
          this.element().parentNode.style.webkitPerspective='600';
          this.style({
            webkitTransformStyle:'preserve-3d',
            webkitTransitionProperty:'-webkit-transform',
            webkitTransitionDuration:'0',
            webkitTransitionTimingFunction:'linear'
          });
          this.element().addEventListener("touchstart",this.ontouchstart,false);
          this.element().addEventListener("touchmove",this.ontouchmove,false);
          this.element().addEventListener("touchend",this.ontouchend,false);
          this.element().addEventListener("touchcancel",this.ontouchcancel,false);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      TouchContinuation.prototype['pointer'] = function(event) {
        var x=event.targetTouches[0].pageX;
        var y=event.targetTouches[0].pageY;
        return {
          x:x,
          y:y
        };
      };
      TouchContinuation.prototype['ontouchstart'] = function(event) {
        try {
          event.preventDefault();
          var left=this.monad.element.style.left;
          var top=this.monad.element.style.top;
          this.lastX=parseInt(left,10);
          this.lastY=parseInt(top,10);
          this.lastX=Math.isNumber(lastX)?this.lastX:0;
          this.lastY=Math.isNumber(lastY)?this.lastY:0;
          this.offsetX=this.pointerX(event) - this.lastX;
          this.offsetY=this.pointerY(event) - this.lastY;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      TouchContinuation.prototype['ontouchmove'] = function(event) {
        try {
          event.preventDefault();
          this.lastX=this.pointerX(event) - this.offsetX;
          this.lastY=this.pointerY(event) - this.offsetY;
          if(this.allowX && this.allowY) {
            this.style({
              webkitTransform:'translate3d(' + this.lastX + 'px,' + this.lastY + 'px,0)'
            });
            this.monad.element.style.left=this.lastX + 'px';
            this.monad.element.style.top=this.lastY + 'px';
          } else {
            if(allowX) {
              this.style({
                webkitTransform:'translate3d(' + this.lastX + 'px,0,0)'
              });
              this.monad.element.style.left=this.lastX + 'px';
            } else {
              if(allowY) {
                this.style({
                  webkitTransform:'translate3d(0,' + this.lastY + 'px,0)'
                });
                this.monad.element.style.top=this.lastY + 'px';
              }
            }
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      TouchContinuation.prototype['ontouchcancel'] = function(event) {
        try {
          event.preventDefault();
          this.lastX=undefined;
          this.lastY=undefined;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      TouchContinuation.prototype['ontouchend'] = function(event) {
        try {
          event.preventDefault();
          this.lastX=undefined;
          this.lastY=undefined;
        } catch(e) {
          log.Logger.error(this,e);
        }
        return false;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = TouchContinuation;
        return new TouchContinuation(args && args.length && args[0]);
      };
    })();
    exports.TouchContinuation = TouchContinuation;
    var Flippable = (function() {
      Flippable.prototype = exports.DOMable();
      Flippable.prototype.constructor = Flippable;
      var DOMable = exports.DOMable.constructor;
      function Flippable() {
        function privateData() {
          this.front = null;
          this.back = null;
        }
        var p_vars = new privateData();
        var front = p_vars.front;
        Object.getOwnPropertyDescriptor(this,'front') || Object.defineProperty(this,'front', {get: function(){return front;},set: function(e){front=e;}});
        var back = p_vars.back;
        Object.getOwnPropertyDescriptor(this,'back') || Object.defineProperty(this,'back', {get: function(){return back;},set: function(e){back=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMable.call(this,properties);
          this.front=null;
          this.back=null;
          this.continuationConstructor=FlippableContinuation;
        }
        return ctor.apply(this,args) || this;
      }
      Flippable.prototype['init'] = function() {
        try {
          if(utilities.Environment.webkit) {
            var styles=[{
              selector:'body',
              style:'-webkit-user-select:none;'
            },{
              selector:'.monads-Flippable',
              style:'height:356px;width:320px;background-color:transparent;-webkit-tap-highlight-color:#000000;-webkit-perspective:600;'
            },{
              selector:'.monads-Flippable-Flippable',
              style:'height:300px;width:320px;left:0;top:0;-webkit-transform-style:preserve-3d;-webkit-transition-property:-webkit-transform;-webkit-transition-duration:0.5s;'
            },{
              selector:'.monads-Flippable-Face',
              style:'position:absolute;height:300px;width:320px;left:0;top:0;-webkit-backface-visibility:hidden;'
            },{
              selector:'.monads-Flippable-Flipped',
              style:'-webkit-transform:rotateY(179deg);'
            }];
            Styleable(styles).on("load").style();
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Flippable;
        return new Flippable(args && args.length && args[0]);
      };
    })();
    exports.Flippable = Flippable;
    var FlippableContinuation = (function() {
      FlippableContinuation.prototype = exports.DOMContinuation();
      FlippableContinuation.prototype.constructor = FlippableContinuation;
      var DOMContinuation = exports.DOMContinuation.constructor;
      function FlippableContinuation() {
        function privateData() {
          this.horizontal = null;
          this.vertical = null;
        }
        var p_vars = new privateData();
        var horizontal = p_vars.horizontal;
        Object.getOwnPropertyDescriptor(this,'horizontal') || Object.defineProperty(this,'horizontal', {get: function(){return horizontal;},set: function(e){horizontal=e;}});
        var vertical = p_vars.vertical;
        Object.getOwnPropertyDescriptor(this,'vertical') || Object.defineProperty(this,'vertical', {get: function(){return vertical;},set: function(e){vertical=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          DOMContinuation.call(this,properties);
          this.horizontal=false;
          this.vertical=false;
        }
        return ctor.apply(this,args) || this;
      }
      FlippableContinuation.prototype['flip'] = function(c,styles) {
        try {
          var constraints=c || {};
          this.setHorizontal(typeof(constraints.horizontal) === 'boolean'?constraints.horizontal:this.isHorizontal());
          this.setVertical(typeof(constraints.vertical) === 'boolean'?constraints.vertical:this.isVertical());
          if(styles) {
            this.style(styles);
          }
          this.bind(this.onflip,null,true);
        } catch(e) {
          log.Logger.error(this,e);
        }
        return this;
      };
      FlippableContinuation.prototype['onflip'] = function(event) {
        try {
          if(event.currentTarget.id === this.monad.id) {
            var flippableClassName=this.monad.getClassName() + '-Flippable';
            var flippedClassName=this.monad.getClassName() + '-Flipped';
            if(this.element().className === flippableClassName) {
              this.addClass(flippedClassName);
            } else {
              this.removeClass(flippedClassName);
            }
            return false;
          }
        } catch(e) {
          log.Logger.error(this,e);
        }
        return true;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = FlippableContinuation;
        return new FlippableContinuation(args && args.length && args[0]);
      };
    })();
    exports.FlippableContinuation = FlippableContinuation;
    var Composer = (function() {
      function Composer() {
        function privateData() {
          this.composables = null;
          this.composablesMap = null;
        }
        var p_vars = new privateData();
        var composables = p_vars.composables;
        Object.getOwnPropertyDescriptor(this,'composables') || Object.defineProperty(this,'composables', {get: function(){return composables;},set: function(e){composables=e;}});
        var composablesMap = p_vars.composablesMap;
        Object.getOwnPropertyDescriptor(this,'composablesMap') || Object.defineProperty(this,'composablesMap', {get: function(){return composablesMap;},set: function(e){composablesMap=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_c) {
          var c = _c || [];
          this.composables=[];
          this.composablesMap={};
          if(c && c.length > 0) {
            this.composables=this.composables.concat(c);
          }
        }
        return ctor.apply(this,args) || this;
      }
      Composer.prototype['addComposable'] = function(name,composable) {
        var map=this.getComposablesMap();
        if(!map[name]) {
          map[name]=this.composable;
        }
        return this;
      };
      Composer.prototype['getComposable'] = function(name) {
        var map=this.getComposablesMap();
        return map[name];
      };
      Composer.prototype['lift'] = function(monoid) {
        var name=monoid.constructor.name.camelCase();
        this[name]=monoid;
        var methods=monoid.constructor.prototype;
        for(method in methods) {
          if(methods.hasOwnProperty(method) && typeof(methods[method]) === 'function' && !this[method]) {
            this[method]=(function (name,func,monoid,target) {
              return function () {
                var rt=func.apply(monoid,arguments);
                return (rt === monoid)?target:rt;
              };
            })(name,methods[method],monoid,this);
          }
        }
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = Composer;
        return new Composer(args && args.length && args[0]);
      };
    })();
    exports.Composer = Composer;
    var Tweenable = (function() {
      function Tweenable() {
        function privateData() {
          this.begin = null;
          this.duration = null;
          this.pos = null;
          this.startTime = null;
          this.time = null;
          this.obj = null;
          this.prop = null;
          this.change = null;
          this.finish = null;
          this.prevTime = null;
          this.prevPos = null;
          this.looping = null;
        }
        var p_vars = new privateData();
        var begin = p_vars.begin;
        Object.getOwnPropertyDescriptor(this,'begin') || Object.defineProperty(this,'begin', {get: function(){return begin;},set: function(e){begin=e;}});
        var duration = p_vars.duration;
        Object.getOwnPropertyDescriptor(this,'duration') || Object.defineProperty(this,'duration', {get: function(){return duration;},set: function(e){duration=e;}});
        var pos = p_vars.pos;
        Object.getOwnPropertyDescriptor(this,'pos') || Object.defineProperty(this,'pos', {get: function(){return pos;},set: function(e){pos=e;}});
        var startTime = p_vars.startTime;
        Object.getOwnPropertyDescriptor(this,'startTime') || Object.defineProperty(this,'startTime', {get: function(){return startTime;},set: function(e){startTime=e;}});
        var time = p_vars.time;
        Object.getOwnPropertyDescriptor(this,'time') || Object.defineProperty(this,'time', {get: function(){return time;},set: function(e){time=e;}});
        var obj = p_vars.obj;
        Object.getOwnPropertyDescriptor(this,'obj') || Object.defineProperty(this,'obj', {get: function(){return obj;},set: function(e){obj=e;}});
        var prop = p_vars.prop;
        Object.getOwnPropertyDescriptor(this,'prop') || Object.defineProperty(this,'prop', {get: function(){return prop;},set: function(e){prop=e;}});
        var change = p_vars.change;
        Object.getOwnPropertyDescriptor(this,'change') || Object.defineProperty(this,'change', {get: function(){return change;},set: function(e){change=e;}});
        var finish = p_vars.finish;
        Object.getOwnPropertyDescriptor(this,'finish') || Object.defineProperty(this,'finish', {get: function(){return finish;},set: function(e){finish=e;}});
        var prevTime = p_vars.prevTime;
        Object.getOwnPropertyDescriptor(this,'prevTime') || Object.defineProperty(this,'prevTime', {get: function(){return prevTime;},set: function(e){prevTime=e;}});
        var prevPos = p_vars.prevPos;
        Object.getOwnPropertyDescriptor(this,'prevPos') || Object.defineProperty(this,'prevPos', {get: function(){return prevPos;},set: function(e){prevPos=e;}});
        var looping = p_vars.looping;
        Object.getOwnPropertyDescriptor(this,'looping') || Object.defineProperty(this,'looping', {get: function(){return looping;},set: function(e){looping=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          this.begin=properties.begin || 0;
          this.duration=properties.duration || 0;
          this.pos=parseInt(this.begin,16);
          this.startTime=0;
          this.time=0;
          this.obj=properties.object;
          this.prop=properties.property;
          this.change=0;
          this.finish=properties.finish || 0;
          this.prevTime=0;
          this.prevPos=0;
          this.looping=false;
          this.func=properties.behavior || this.func;
        }
        return ctor.apply(this,args) || this;
      }
      Tweenable.prototype['fforward'] = function() {
        this.time=this.duration;
        this.fixTime();
        this.update();
      };
      Tweenable.prototype['fixTime'] = function() {
        this.setStartTime(this.getTimer() - this.time * 1000);
      };
      Tweenable.prototype['func'] = function(t,b,c,d) {
        return c * t / d + b;
      };
      Tweenable.prototype['getPosition'] = function(t) {
        var lt=t || this.time;
        var newPosition=this.func(lt,this.begin,this.change,this.duration);
        return newPosition;
      };
      Tweenable.prototype['getTimer'] = function() {
        return new Date().getTime() - this.time;
      };
      Tweenable.prototype['rewind'] = function(t) {
        this.stop();
        this.time=t || 0;
        this.fixTime();
        this.update();
      };
      Tweenable.prototype['setDuration'] = function(d) {
        this.duration=(d === null || d <= 0)?100000:d;
      };
      Tweenable.prototype['setFinish'] = function(f) {
        this.change=f - this.begin;
      };
      Tweenable.prototype['setPosition'] = function(p) {
        this.prevPos=this.pos;
        this.obj[this.prop]=Math.round(p) + "";
        this.pos=p;
        controller.Controller.publish(eventEvents.CustomEvent({
          type:'motionchanged',
          canBubble:false,
          isCanceleable:true,
          detail:{
            target:this
          }
        }));
      };
      Tweenable.prototype['setTime'] = function(t) {
        this.prevTime=time;
        if(t > this.getDuration()) {
          if(this.looping) {
            this.rewind(t - duration);
            this.update();
            controller.Controller.publish(eventEvents.CustomEvent({
              type:'motionlooped',
              canBubble:false,
              isCanceleable:true,
              detail:{
                target:this
              }
            }));
          } else {
            time=duration;
            this.update();
            this.stop();
            controller.Controller.publish(eventEvents.CustomEvent({
              type:'motionfinished',
              canBubble:false,
              isCanceleable:true,
              detail:{
                target:this
              }
            }));
          }
        } else {
          if(t < 0) {
            this.rewind();
            this.update();
          } else {
            time=t;
            this.update();
          }
        }
      };
      Tweenable.prototype['update'] = function() {
        this.setPosition(this.getPosition(this.getTime()));
      };
      Tweenable.prototype['start'] = function() {
        this.rewind();
        this.startEnterFrame();
        controller.Controller.publish(eventEvents.CustomEvent({
          type:'motionstarted',
          canBubble:false,
          isCanceleable:true,
          detail:{
            target:this.getPos()
          }
        }));
      };
      Tweenable.prototype['startEnterFrame'] = function() {
        this.stopEnterFrame();
        this.isPlaying=true;
        this.onEnterFrame();
      };
      Tweenable.prototype['nextFrame'] = function() {
        this.setTime((this.getTimer() - this.getStartTime()) / 1000);
      };
      Tweenable.prototype['stop'] = function() {
        this.stopEnterFrame();
        controller.Controller.publish(eventEvents.CustomEvent({
          type:'motionstopped',
          canBubble:false,
          isCanceleable:true,
          detail:{
            target:this
          }
        }));
      };
      Tweenable.prototype['stopEnterFrame'] = function() {
        this.isPlaying=false;
      };
      Tweenable.prototype['continueTo'] = function(f,d) {
        this.setBegin(this.getPos());
        this.setFinish(f);
        this.setDuration(d);
        this.start();
      };
      Tweenable.prototype['resume'] = function() {
        this.fixTime();
        this.startEnterFrame();
        controller.Controller.publish(eventEvents.CustomEvent({
          type:'motionresumed',
          canBubble:false,
          isCanceleable:true,
          detail:{
            target:this
          }
        }));
      };
      Tweenable.prototype['yoyo'] = function() {
        this.continueTo(this.getBegin(),this.getTime());
      };
      Tweenable.prototype['onEnterFrame'] = function() {
        if(this.isPlaying) {
          this.nextFrame();
          setTimeout(this.onEnterFrame,0);
        }
      };
      Tweenable.backEaseIn = function (t,b,c,d,a,p) {
        var s=1.70158;
        return c * (t/=d) * t * ((s + 1) * t - s) + b;
      };
      Tweenable.backEaseOut = function (t,b,c,d,a,p) {
        var s=1.70158;
        return c * ((t=t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
      };
      Tweenable.backEaseInOut = function (t,b,c,d,a,p) {
        var s=1.70158;
        if((t/=d / 2) < 1) {
          return c / 2 * (t * t * (((s*=(1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t-=2) * t * (((s*=(1.525)) + 1) * t + s) + 2) + b;
      };
      Tweenable.elasticEaseIn = function (t,b,c,d,a,p) {
        var s;
        if(t === 0) {
          return b;
        }
        if((t/=d) == 1) {
          return b + c;
        }
        if(!p) {
          p=d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
          a=c;
          s=p / 4;
        } else {
          s=p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2,10 * (t-=1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      };
      Tweenable.elasticEaseOut = function (t,b,c,d,a,p) {
        var s;
        if(t === 0) {
          return b;
        }
        if((t/=d) == 1) {
          return b + c;
        }
        if(!p) {
          p=d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
          a=c;
          s=p / 4;
        } else {
          s=p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2,-10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
      };
      Tweenable.elasticEaseInOut = function (t,b,c,d,a,p) {
        var s;
        if(t === 0) {
          return b;
        }
        if((t/=d / 2) == 2) {
          return b + c;
        }
        if(!p) {
          p=d * (0.3 * 1.5);
        }
        if(!a || a < Math.abs(c)) {
          a=c;
          s=p / 4;
        } else {
          s=p / (2 * Math.PI) * Math.asin(c / a);
        }
        if(t < 1) {
          return -0.5 * (a * Math.pow(2,10 * (t-=1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2,-10 * (t-=1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
      };
      Tweenable.bounceEaseOut = function (t,b,c,d) {
        if((t/=d) < (1 / 2.75)) {
          return c * (7.5625 * t * t) + b;
        } else {
          if(t < (2 / 2.75)) {
            return c * (7.5625 * (t-=(1.5 / 2.75)) * t + 0.75) + b;
          } else {
            if(t < (2.5 / 2.75)) {
              return c * (7.5625 * (t-=(2.25 / 2.75)) * t + 0.9375) + b;
            } else {
              return c * (7.5625 * (t-=(2.625 / 2.75)) * t + 0.984375) + b;
            }
          }
        }
      };
      Tweenable.bounceEaseIn = function (t,b,c,d) {
        return c - Tweenable.bounceEaseOut(d - t,0,c,d) + b;
      };
      Tweenable.bounceEaseInOut = function (t,b,c,d) {
        if(t < d / 2) {
          return Tweenable.bounceEaseIn(t * 2,0,c,d) * 0.5 + b;
        } else {
          return Tweenable.bounceEaseOut(t * 2 - d,0,c,d) * 0.5 + c * 0.5 + b;
        }
      };
      Tweenable.strongEaseInOut = function (t,b,c,d) {
        return c * (t/=d) * t * t * t * t + b;
      };
      Tweenable.regularEaseIn = function (t,b,c,d) {
        return c * (t/=d) * t + b;
      };
      Tweenable.regularEaseOut = function (t,b,c,d) {
        return -c * (t/=d) * (t - 2) + b;
      };
      Tweenable.regularEaseInOut = function (t,b,c,d) {
        if((t/=d / 2) < 1) {
          return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      };
      Tweenable.strongEaseIn = function (t,b,c,d) {
        return c * (t/=d) * t * t * t * t + b;
      };
      Tweenable.strongEaseOut = function (t,b,c,d) {
        return c * ((t=t / d - 1) * t * t * t * t + 1) + b;
      };
      Tweenable.strongEaseInOut = function (t,b,c,d) {
        if((t/=d / 2) < 1) {
          return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t-=2) * t * t * t * t + 2) + b;
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.backEaseIn = Tweenable.backEaseIn;
        __.backEaseOut = Tweenable.backEaseOut;
        __.backEaseInOut = Tweenable.backEaseInOut;
        __.elasticEaseIn = Tweenable.elasticEaseIn;
        __.elasticEaseOut = Tweenable.elasticEaseOut;
        __.elasticEaseInOut = Tweenable.elasticEaseInOut;
        __.bounceEaseOut = Tweenable.bounceEaseOut;
        __.bounceEaseIn = Tweenable.bounceEaseIn;
        __.bounceEaseInOut = Tweenable.bounceEaseInOut;
        __.strongEaseInOut = Tweenable.strongEaseInOut;
        __.regularEaseIn = Tweenable.regularEaseIn;
        __.regularEaseOut = Tweenable.regularEaseOut;
        __.regularEaseInOut = Tweenable.regularEaseInOut;
        __.strongEaseIn = Tweenable.strongEaseIn;
        __.strongEaseOut = Tweenable.strongEaseOut;
        __.strongEaseInOut = Tweenable.strongEaseInOut;
        __.constructor = Tweenable;
        return new Tweenable(args && args.length && args[0]);
      };
    })();
    exports.Tweenable = Tweenable;
    var ColorTweenable = (function() {
      ColorTweenable.prototype = exports.Tweenable();
      ColorTweenable.prototype.constructor = ColorTweenable;
      var Tweenable = exports.Tweenable.constructor;
      function ColorTweenable() {
        function privateData() {
          this.fromColor = null;
          this.toColor = null;
        }
        var p_vars = new privateData();
        var fromColor = p_vars.fromColor;
        Object.getOwnPropertyDescriptor(this,'fromColor') || Object.defineProperty(this,'fromColor', {get: function(){return fromColor;},set: function(e){fromColor=e;}});
        var toColor = p_vars.toColor;
        Object.getOwnPropertyDescriptor(this,'toColor') || Object.defineProperty(this,'toColor', {get: function(){return toColor;},set: function(e){toColor=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          this.fromColor=properties.begin;
          this.toColor=properties.finish;
          properties.begin=0;
          properties.finish=100;
          Tweenable.call(this,properties);
          controller.Controller.subscribe('motionchanged',this.oncolorchanged);
        }
        return ctor.apply(this,args) || this;
      }
      ColorTweenable.prototype['getColor'] = function() {
        var b=fromColor;
        var f=toColor;
        var r1=ColorTweenable.hex2dec(b.slice(0,2));
        var g1=ColorTweenable.hex2dec(b.slice(2,4));
        var b1=ColorTweenable.hex2dec(b.slice(4,6));
        var r2=ColorTweenable.hex2dec(f.slice(0,2));
        var g2=ColorTweenable.hex2dec(f.slice(2,4));
        var b2=ColorTweenable.hex2dec(f.slice(4,6));
        var pc=this.getPos() / 100;
        var red=Math.floor(r1 + (pc * (r2 - r1)) + 0.5);
        var green=Math.floor(g1 + (pc * (g2 - g1)) + 0.5);
        var blue=Math.floor(b1 + (pc * (b2 - b1)) + 0.5);
        return (ColorTweenable.dec2hex(red) + ColorTweenable.dec2hex(green) + ColorTweenable.dec2hex(blue));
      };
      ColorTweenable.prototype['oncolorchanged'] = function(ev) {
        this.getObj()[this.prop]='#' + this.getColor();
      };
      ColorTweenable.dec2hex = function (dec) {
        return (ColorTweenable.hexDigit[dec >> 4] + ColorTweenable.hexDigit[dec & 15]);
      };
      ColorTweenable.hexDigit = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
      ColorTweenable.hex2dec = function (hex) {
        return (parseInt(hex,16));
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.dec2hex = ColorTweenable.dec2hex;
        __.hexDigit = ColorTweenable.hexDigit;
        __.hex2dec = ColorTweenable.hex2dec;
        __.constructor = ColorTweenable;
        return new ColorTweenable(args && args.length && args[0]);
      };
    })();
    exports.ColorTweenable = ColorTweenable;
    var OpacityTweenable = (function() {
      OpacityTweenable.prototype = exports.Tweenable();
      OpacityTweenable.prototype.constructor = OpacityTweenable;
      var Tweenable = exports.Tweenable.constructor;
      function OpacityTweenable() {
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Tweenable.call(this,properties);
          var subscribed=controller.Controller && controller.Controller.subscribe('motionchanged',this.onOpacityChanged);
        }
        return ctor.apply(this,args) || this;
      }
      OpacityTweenable.prototype['onOpacityChanged'] = function(ev) {
        this.obj.opacity=this.getPos() / 100;
        this.obj['MozOpacity']=this.getPos() / 100;
        if(this.obj.filters) {
          this.obj.filters.alpha.opacity=this.getPos();
        }
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = OpacityTweenable;
        return new OpacityTweenable(args && args.length && args[0]);
      };
    })();
    exports.OpacityTweenable = OpacityTweenable;
    var TextTweenable = (function() {
      TextTweenable.prototype = exports.Tweenable();
      TextTweenable.prototype.constructor = TextTweenable;
      var Tweenable = exports.Tweenable.constructor;
      function TextTweenable() {
        function privateData() {
          this.txt = null;
        }
        var p_vars = new privateData();
        var txt = p_vars.txt;
        Object.getOwnPropertyDescriptor(this,'txt') || Object.defineProperty(this,'txt', {get: function(){return txt;},set: function(e){txt=e;}});
        var args = Array.prototype.slice.call(arguments);
        var ctor = function (_properties) {
          var properties = _properties || {};
          Tweenable.call(this,properties);
          this.txt=properties.txt;
          controller.Controller.subscribe('motionchanged',this.onMotionChanged);
        }
        return ctor.apply(this,args) || this;
      }
      TextTweenable.prototype['onMotionChanged'] = function(ev) {
        this.obj[this.prop]=this.txt.substr(0,this.getPos());
      };
      return function __() {
        var args = Array.prototype.slice.call(arguments);
        __.constructor = TextTweenable;
        return new TextTweenable(args && args.length && args[0]);
      };
    })();
    exports.TextTweenable = TextTweenable;
  })(require, nm.getExports(), nm.getId());
})();

