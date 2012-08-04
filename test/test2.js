(function() {
  var nm = module.Module('a');
  (function(require, exports, moduleId) {
    var {x:y} = require('b').{x:y};
    (function() {
      var nm = module.Module('b');
      (function(require, exports, moduleId) {
        let y=x;
        exports.y = y;
      })(require, nm.getExports(), nm.getId());
    })();
  })(require, nm.getExports(), nm.getId());
})();

