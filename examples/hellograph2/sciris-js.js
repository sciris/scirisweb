/*!
 * sciris-js v0.1.0
 * (c) 2018-present Optima Consortium <info@ocds.co>
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['sciris-js'] = {})));
}(this, (function (exports) { 'use strict';

  /*!
   * Vue.js v2.5.17
   * (c) 2014-2018 Evan You
   * Released under the MIT License.
   */
  /*  */

  var emptyObject = Object.freeze({});

  // these helpers produces better vm code in JS engines due to their
  // explicitness and function inlining
  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * Check if value is primitive
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value e.g. [object Object]
   */
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString (val) {
    return val == null
      ? ''
      : typeof val === 'object'
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert a input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);

  /**
   * Check if a attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether the object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it... e.g.
   * PhantomJS 1.x. Technically we don't need this anymore since native bind is
   * now more performant in most browsers, but removing it would be breaking for
   * code that was able to run in PhantomJS 1.x, so this must be kept for
   * backwards compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
   */
  function noop (a, b, c) {}

  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };

  /**
   * Return same value
   */
  var identity = function (_) { return _; };

  /**
   * Generate a static keys string from compiler modules.
   */


  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered';

  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured'
  ];

  /*  */

  var config = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "development" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "development" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * Check if a string starts with $ or _
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = /[^\w.$]/;
  function parsePath (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch = ({}).watch;

  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
    if (_isServer === undefined) {
      /* istanbul ignore if */
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer = global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set when available.
    _Set = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set = (function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn = noop;
  var tip = noop;
  var generateComponentTrace = (noop); // work around flow check
  var formatComponentName = (noop);

  {
    var hasConsole = typeof console !== 'undefined';
    var classifyRE = /(?:^|[-_])(\w)/g;
    var classify = function (str) { return str
      .replace(classifyRE, function (c) { return c.toUpperCase(); })
      .replace(/[-_]/g, ''); };

    warn = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : '';

      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : ''
        ));
      }
    };

    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm || {};
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    var repeat = function (str, n) {
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; }
        if (n > 1) { str += str; }
        n >>= 1;
      }
      return res
    };

    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")")
      }
    };
  }

  /*  */


  var uid = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = [];
  };

  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // the current target watcher being evaluated.
  // this is globally unique because there could be only one
  // watcher being evaluated at any time.
  Dep.target = null;
  var targetStack = [];

  function pushTarget (_target) {
    if (Dep.target) { targetStack.push(Dep.target); }
    Dep.target = _target;
  }

  function popTarget () {
    Dep.target = targetStack.pop();
  }

  /*  */

  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors );

  var createEmptyVNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      vnode.children,
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;

  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      var augment = hasProto
        ? protoAugment
        : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  // helpers

  /**
   * Augment an target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src, keys) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment an target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    if (!getter && arguments.length === 2) {
      val = obj[key];
    }
    var setter = property && property.set;

    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if ("development" !== 'production' && customSetter) {
          customSetter();
        }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set (target, key, val) {
    if ("development" !== 'production' &&
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      "development" !== 'production' && warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del (target, key) {
    if ("development" !== 'production' &&
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
      "development" !== 'production' && warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat(parent, child)
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;
    var keys = Object.keys(from);
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
        "development" !== 'production' && warn(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    return childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
      "development" !== 'production' && assertObjectType(key, childVal, vm);
      return extend(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    if (childVal) { extend(ret, childVal); }
    return ret
  };
  strats.provide = mergeDataOrFn;

  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Validate component names
   */
  function checkComponents (options) {
    for (var key in options.components) {
      validateComponentName(key);
    }
  }

  function validateComponentName (name) {
    if (!/^[a-zA-Z][\w-]*$/.test(name)) {
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'can only contain alphanumeric characters and the hyphen, ' +
        'and must start with a letter.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          warn('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } else {
      warn(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    } else {
      warn(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".",
        vm
      );
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def = dirs[key];
        if (typeof def === 'function') {
          dirs[key] = { bind: def, update: def };
        }
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child);
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);
    var extendsFrom = child.extends;
    if (extendsFrom) {
      parent = mergeOptions(parent, extendsFrom, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if ("development" !== 'production' && warnMissing && !res) {
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /*  */

  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if ("development" !== 'production' && isObject(def)) {
      warn(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) {
      warn(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i]);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }
    if (!valid) {
      warn(
        "Invalid prop: type check failed for prop \"" + name + "\"." +
        " Expected " + (expectedTypes.map(capitalize).join(', ')) +
        ", got " + (toRawType(value)) + ".",
        vm
      );
      return
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

  function assertType (value, type) {
    var valid;
    var expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase();
      // for primitive wrapper objects
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      valid = value instanceof type;
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  /*  */

  function handleError (err, vm, info) {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        logError(e, null, 'config.errorHandler');
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */
  /* globals MessageChannel */

  var callbacks = [];
  var pending = false;

  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using both microtasks and (macro) tasks.
  // In < 2.4 we used microtasks everywhere, but there are some scenarios where
  // microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690) or even between bubbling of the same
  // event (#6566). However, using (macro) tasks everywhere also has subtle problems
  // when state is changed right before repaint (e.g. #6813, out-in transitions).
  // Here we use microtask by default, but expose a way to force (macro) task when
  // needed (e.g. in event handlers attached by v-on).
  var microTimerFunc;
  var macroTimerFunc;
  var useMacroTask = false;

  // Determine (macro) task defer implementation.
  // Technically setImmediate should be the ideal choice, but it's only available
  // in IE. The only polyfill that consistently queues the callback after all DOM
  // events triggered in the same loop is by using MessageChannel.
  /* istanbul ignore if */
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else if (typeof MessageChannel !== 'undefined' && (
    isNative(MessageChannel) ||
    // PhantomJS
    MessageChannel.toString() === '[object MessageChannelConstructor]'
  )) {
    var channel = new MessageChannel();
    var port = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = function () {
      port.postMessage(1);
    };
  } else {
    /* istanbul ignore next */
    macroTimerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  // Determine microtask defer implementation.
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    microTimerFunc = function () {
      p.then(flushCallbacks);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else {
    // fallback to macro
    microTimerFunc = macroTimerFunc;
  }

  /**
   * Wrap a function so that if any code inside triggers state change,
   * the changes are queued using a (macro) task instead of a microtask.
   */
  function withMacroTask (fn) {
    return fn._withTask || (fn._withTask = function () {
      useMacroTask = true;
      var res = fn.apply(null, arguments);
      useMacroTask = false;
      return res
    })
  }

  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      if (useMacroTask) {
        macroTimerFunc();
      } else {
        microTimerFunc();
      }
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  /* not type checking this file because flow doesn't play well with Proxy */

  var initProxy;

  {
    var allowedGlobals = makeMap(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent = function (target, key) {
      warn(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy);

    if (hasProxy) {
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config.keyCodes = new Proxy(config.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) {
            warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            target[key] = value;
            return true
          }
        }
      });
    }

    var hasHandler = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
        if (!has && !isAllowed) {
          warnNonPresent(target, key);
        }
        return has || !isAllowed
      }
    };

    var getHandler = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          warnNonPresent(target, key);
        }
        return target[key]
      }
    };

    initProxy = function initProxy (vm) {
      if (hasProxy) {
        // determine which proxy handler to use
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*  */

  var seenObjects = new _Set();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  var mark;
  var measure;

  {
    var perf = inBrowser && window.performance;
    /* istanbul ignore if */
    if (
      perf &&
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); };
      measure = function (name, startTag, endTag) {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
        perf.clearMeasures(name);
      };
    }
  }

  /*  */

  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker (fns) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          cloned[i].apply(null, arguments$1);
        }
      } else {
        // return handler return value for single handlers
        return fns.apply(null, arguments)
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    vm
  ) {
    var name, def, cur, old, event;
    for (name in on) {
      def = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      /* istanbul ignore if */
      if (isUndef(cur)) {
        "development" !== 'production' && warn(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur);
        }
        add(event.name, cur, event.once, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // no existing hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent (
    factory,
    baseCtor,
    context
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (isDef(factory.contexts)) {
      // already pending
      factory.contexts.push(context);
    } else {
      var contexts = factory.contexts = [context];
      var sync = true;

      var forceRender = function () {
        for (var i = 0, l = contexts.length; i < l; i++) {
          contexts[i].$forceUpdate();
        }
      };

      var resolve = once(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender();
        }
      });

      var reject = once(function (reason) {
        "development" !== 'production' && warn(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender();
        }
      });

      var res = factory(resolve, reject);

      if (isObject(res)) {
        if (typeof res.then === 'function') {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isDef(res.component) && typeof res.component.then === 'function') {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              setTimeout(function () {
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender();
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            setTimeout(function () {
              if (isUndef(factory.resolved)) {
                reject(
                  "timeout (" + (res.timeout) + "ms)"
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn, once) {
    if (once) {
      target.$once(event, fn);
    } else {
      target.$on(event, fn);
    }
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
    target = undefined;
  }

  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var this$1 = this;

      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          this$1.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var this$1 = this;

      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          this$1.$off(event[i], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      if (fn) {
        // specific handler
        var cb;
        var i$1 = cbs.length;
        while (i$1--) {
          cb = cbs[i$1];
          if (cb === fn || cb.fn === fn) {
            cbs.splice(i$1, 1);
            break
          }
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        for (var i = 0, l = cbs.length; i < l; i++) {
          try {
            cbs[i].apply(vm, args);
          } catch (e) {
            handleError(e, vm, ("event handler for \"" + event + "\""));
          }
        }
      }
      return vm
    };
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots (
    children,
    context
  ) {
    var slots = {};
    if (!children) {
      return slots
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  function resolveScopedSlots (
    fns, // see flow/vnode
    res
  ) {
    res = res || {};
    for (var i = 0; i < fns.length; i++) {
      if (Array.isArray(fns[i])) {
        resolveScopedSlots(fns[i], res);
      } else {
        res[fns[i].key] = fns[i].fn;
      }
    }
    return res
  }

  /*  */

  var activeInstance = null;
  var isUpdatingChildComponent = false;

  function initLifecycle (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate');
      }
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var prevActiveInstance = activeInstance;
      activeInstance = vm;
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(
          vm.$el, vnode, hydrating, false /* removeOnly */,
          vm.$options._parentElm,
          vm.$options._refElm
        );
        // no need for the ref nodes after initial patch
        // this prevents keeping a detached DOM tree in memory (#5851)
        vm.$options._parentElm = vm.$options._refElm = null;
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      activeInstance = prevActiveInstance;
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        /* istanbul ignore if */
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    if ("development" !== 'production' && config.performance && mark) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag);
        var vnode = vm._render();
        mark(endTag);
        measure(("vue " + name + " render"), startTag, endTag);

        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, null, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    {
      isUpdatingChildComponent = true;
    }

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren
    var hasChildren = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      parentVnode.data.scopedSlots || // has new scoped slots
      vm.$scopedSlots !== emptyObject // has old scoped slots
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent = false;
    }
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        try {
          handlers[i].call(vm);
        } catch (e) {
          handleError(e, vm, (hook + " hook"));
        }
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  /*  */


  var MAX_UPDATE_COUNT = 100;

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    flushing = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      id = watcher.id;
      has[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if ("development" !== 'production' && has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState();

    // call component updated and activated hooks
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
        waiting = true;
        nextTick(flushSchedulerQueue);
      }
    }
  }

  /*  */

  var uid$1 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$1; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression = expOrFn.toString();
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = function () {};
        "development" !== 'production' && warn(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function get () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
      var this$1 = this;

    var i = this.deps.length;
    while (i--) {
      var dep = this$1.deps[i];
      if (!this$1.newDepIds.has(dep.id)) {
        dep.removeSub(this$1);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function depend () {
      var this$1 = this;

    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function teardown () {
      var this$1 = this;

    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this$1.deps[i].removeSub(this$1);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) ||
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive(props, key, value, function () {
          if (vm.$parent && !isUpdatingChildComponent) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }

  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
      "development" !== 'production' && warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
        "development" !== 'production' && warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if ("development" !== 'production' && getter == null) {
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        }
      }
    }
  }

  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : userDef;
      sharedPropertyDefinition.set = noop;
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : userDef.get
        : noop;
      sharedPropertyDefinition.set = userDef.set
        ? userDef.set
        : noop;
    }
    if ("development" !== 'production' &&
        sharedPropertyDefinition.set === noop) {
      sharedPropertyDefinition.set = function () {
        warn(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (methods[key] == null) {
          warn(
            "Method \"" + key + "\" has an undefined value in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    }
  }

  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function (newData) {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        cb.call(vm, watcher.value);
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive(vm, key, result[key], function () {
            warn(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol
        ? Reflect.ownKeys(inject).filter(function (key) {
          /* istanbul ignore next */
          return Object.getOwnPropertyDescriptor(inject, key).enumerable
        })
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    if (isDef(ret)) {
      (ret)._isVList = true;
    }
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot (
    name,
    fallback,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        if ("development" !== 'production' && !isObject(bindObject)) {
          warn(
            'slot v-bind without argument expects an Object',
            this
          );
        }
        props = extend(extend({}, bindObject), props);
      }
      nodes = scopedSlotFn(props) || fallback;
    } else {
      var slotNodes = this.$slots[name];
      // warn duplicate slot usage
      if (slotNodes) {
        if ("development" !== 'production' && slotNodes._rendered) {
          warn(
            "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
            "- this will likely cause render errors.",
            this
          );
        }
        slotNodes._rendered = true;
      }
      nodes = slotNodes || fallback;
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /*  */

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) {
        "development" !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          if (!(key in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
        "development" !== 'production' && warn(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
  }

  /*  */

  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () { return resolveSlots(children, parent); };

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = data.scopedSlots || emptyObject;
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /*  */




  // Register the component hook to weex native render engine.
  // The hook will be triggered by native, not javascript.


  // Updates the state of the component to weex native render engine.

  /*  */

  // https://github.com/Hanks10100/weex-native-directive/tree/master/component

  // listening on native callback

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
    init: function init (
      vnode,
      hydrating,
      parentElm,
      refElm
    ) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance,
          parentElm,
          refElm
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      {
        warn(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // async component
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    // Weex specific: invoke recycle-list optimized @render function for
    // extracting cell-slot template.
    // https://github.com/Hanks10100/weex-native-directive/tree/master/component
    /* istanbul ignore if */
    return vnode
  }

  function createComponentInstanceForVnode (
    vnode, // we know it's MountedComponentVNode but flow doesn't
    parent, // activeInstance in lifecycle state
    parentElm,
    refElm
  ) {
    var options = {
      _isComponent: true,
      parent: parent,
      _parentVnode: vnode,
      _parentElm: parentElm || null,
      _refElm: refElm || null
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      hooks[key] = componentVNodeHooks[key];
    }
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    if (isDef(on[event])) {
      on[event] = [data.model.callback].concat(on[event]);
    } else {
      on[event] = data.model.callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
      "development" !== 'production' && warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // warn against non-primitive key
    if ("development" !== 'production' &&
      isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /*  */

  function initRender (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
      }, true);
      defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
      }, true);
    }
  }

  function renderMixin (Vue) {
    // install runtime convenience helpers
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      // reset _rendered flag on slots for duplicate slot check
      {
        for (var key in vm.$slots) {
          // $flow-disable-line
          vm.$slots[key]._rendered = false;
        }
      }

      if (_parentVnode) {
        vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject;
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        {
          if (vm.$options.renderError) {
            try {
              vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
            } catch (e) {
              handleError(e, vm, "renderError");
              vnode = vm._vnode;
            }
          } else {
            vnode = vm._vnode;
          }
        }
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        if ("development" !== 'production' && Array.isArray(vnode)) {
          warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  var uid$3 = 0;

  function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      var startTag, endTag;
      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        initProxy(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');

      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;
    opts._parentElm = options._parentElm;
    opts._refElm = options._refElm;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var extended = Ctor.extendOptions;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = dedupe(latest[key], extended[key], sealed[key]);
      }
    }
    return modified
  }

  function dedupe (latest, extended, sealed) {
    // compare latest and sealed to ensure lifecycle hooks won't be duplicated
    // between merges
    if (Array.isArray(latest)) {
      var res = [];
      sealed = Array.isArray(sealed) ? sealed : [sealed];
      extended = Array.isArray(extended) ? extended : [extended];
      for (var i = 0; i < latest.length; i++) {
        // push original options and not sealed options to exclude duplicated options
        if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
          res.push(latest[i]);
        }
      }
      return res
    } else {
      return latest
    }
  }

  function Vue (options) {
    if ("development" !== 'production' &&
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /*  */

  function initUse (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if ("development" !== 'production' && name) {
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          /* istanbul ignore if */
          if ("development" !== 'production' && type === 'component') {
            validateComponentName(id);
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */

  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var cachedNode = cache[key];
      if (cachedNode) {
        var name = getComponentName(cachedNode.componentOptions);
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var cached$$1 = cache[key];
    if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
      cached$$1.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      var this$1 = this;

      for (var key in this$1.cache) {
        pruneCacheEntry(this$1.cache, key, this$1.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          cache[key] = vnode;
          keys.push(key);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /*  */

  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    {
      configDef.set = function () {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn,
      extend: extend,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  Vue.version = '2.5.17';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');

  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,translate,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );



  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    /* istanbul ignore if */
    if (!inBrowser) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
        "development" !== 'production' && warn(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) {
    return document.createTextNode(text)
  }

  function createComment (text) {
    return document.createComment(text)
  }

  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) {
    node.removeChild(child);
  }

  function appendChild (node, child) {
    node.appendChild(child);
  }

  function parentNode (node) {
    return node.parentNode
  }

  function nextSibling (node) {
    return node.nextSibling
  }

  function tagName (node) {
    return node.tagName
  }

  function setTextContent (node, text) {
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }


  var nodeOps = Object.freeze({
  	createElement: createElement$1,
  	createElementNS: createElementNS,
  	createTextNode: createTextNode,
  	createComment: createComment,
  	insertBefore: insertBefore,
  	removeChild: removeChild,
  	appendChild: appendChild,
  	parentNode: parentNode,
  	nextSibling: nextSibling,
  	tagName: tagName,
  	setTextContent: setTextContent,
  	setStyleScope: setStyleScope
  });

  /*  */

  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode (a, b) {
    return (
      a.key === b.key && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          a.asyncFactory === b.asyncFactory &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove () {
        if (--remove.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove.listeners = listeners;
      return remove
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            warn(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }

        if ("development" !== 'production' && data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */, parentElm, refElm);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) {
          if (ref$$1.parentNode === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) { i.create(emptyNode, vnode); }
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh);
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
      if (oldVnode === vnode) {
        return
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if ("development" !== 'production' &&
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if ("development" !== 'production' &&
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue, parentElm, refElm);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm$1 = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm$1,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef(parentElm$1)) {
            removeVnodes(parentElm$1, [oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];

  /*  */

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value) {
    if (el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /*  */

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  /*  */

  /*  */









  // add a raw attr (use this in preTransforms)








  // note: this only removes the attr from the Array (attrsList) so that it
  // doesn't get processed by processAttrs.
  // By default it does NOT remove it from the map (attrsMap) because the map is
  // needed during codegen.

  /*  */

  /**
   * Cross-platform code generation for component v-model
   */


  /**
   * Cross-platform codegen helper for generating v-model value assignment code.
   */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents (on) {
    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
      // IE input[type=range] only supports `change` event
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler (handler, event, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  function add$1 (
    event,
    handler,
    once$$1,
    capture,
    passive
  ) {
    handler = withMacroTask(handler);
    if (once$$1) { handler = createOnceHandler(handler, event, capture); }
    target$1.addEventListener(
      event,
      handler,
      supportsPassive
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2 (
    event,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener(
      event,
      handler._withTask || handler,
      capture
    );
  }

  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  /*  */

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) {
      if (isUndef(props[key])) {
        elm[key] = '';
      }
    }
    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else {
        elm[key] = cur;
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.lazy) {
        // inputs with lazy should only be updated when not in focus
        return false
      }
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  /*  */

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(name, val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /*  */

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition (def) {
    if (!def) {
      return
    }
    /* istanbul ignore else */
    if (typeof def === 'object') {
      var res = {};
      if (def.css !== false) {
        extend(res, autoCssTransition(def.name || 'v'));
      }
      extend(res, def);
      return res
    } else if (typeof def === 'string') {
      return autoCssTransition(def)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
    var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = styles[animationProp + 'Delay'].split(', ');
    var animationDurations = styles[animationProp + 'Duration'].split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  function toMs (s) {
    return Number(s.slice(0, -1)) * 1000
  }

  /*  */

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      transitionNode = transitionNode.parent;
      context = transitionNode.context;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    if ("development" !== 'production' && explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  // only used in dev mode
  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') {
      warn(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var directive = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd);
          /* istanbul ignore if */
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    /* istanbul ignore if */
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
      "development" !== 'production' && warn(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives = {
    model: directive,
    show: show
  };

  /*  */

  // Provides transition support for a single element/component.
  // supports transition mode (out-in / in-out)

  var transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      // warn multiple elements
      if ("development" !== 'production' && children.length > 1) {
        warn(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // warn invalid mode
      if ("development" !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  // Provides transition support for list items.
  // supports move transitions using the FLIP technique.

  // Because the vdom's children update algorithm is "unstable" - i.e.
  // it doesn't guarantee the relative positioning of removed elements,
  // we force transition-group to update its children into two passes:
  // in the first pass, we remove all nodes that need to be removed,
  // triggering their leaving transition; in the second pass, we insert/move
  // into the final desired state. This way in the second pass removed
  // nodes will remain where they should be.

  var props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    beforeUpdate: function beforeUpdate () {
      // force removing pass
      this.__patch__(
        this._vnode,
        this.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this._vnode = this.kept;
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /*  */

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // install platform runtime directives & components
  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = inBrowser ? patch : noop;

  // public mount method
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else if (
          "development" !== 'production' &&
          "development" !== 'test' &&
          isChrome
        ) {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if ("development" !== 'production' &&
        "development" !== 'test' &&
        config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  const EVENT_STATUS_START = 'status:start';
  const EVENT_STATUS_UPDATE = 'status:update';
  const EVENT_STATUS_SUCCEED = 'status:success';
  const EVENT_STATUS_FAIL = 'status:fail';
  const events$1 = {
    EVENT_STATUS_START,
    EVENT_STATUS_UPDATE,
    EVENT_STATUS_SUCCEED,
    EVENT_STATUS_FAIL
  };
  const EventBus = new Vue();
  EventBus.$on(events$1.EVENT_STATUS_START, vm => {
    if (vm.$spinner) vm.$spinner.start();
  });
  EventBus.$on(events$1.EVENT_STATUS_UPDATE, (vm, progress) => {
    if (vm.$Progress) vm.$Progress.set(progress);
  });
  EventBus.$on(events$1.EVENT_STATUS_SUCCEED, (vm, notif) => {
    if (vm.$spinner) vm.$spinner.stop();
    if (vm.$Progress) vm.$Progress.finish();
    if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
  });
  EventBus.$on(events$1.EVENT_STATUS_FAIL, (vm, notif) => {
    if (vm.$spinner) vm.$spinner.stop();
    if (vm.$Progress) vm.$Progress.fail();
    if (notif && notif.message && vm.$notifications) vm.$notifications.notify(notif);
  });

  // progress-indicator-service.js -- functions for showing progress
  var complete = 0.0; // Put this here so it's global

  function start(vm, message) {
    if (!message) {
      message = 'Starting progress';
    }

    var delay = 100;
    var stepsize = 1.0;
    complete = 0.0; // Reset this

    console.log(message);
    setTimeout(function run() {
      // Run in a delay loop
      setFunc();

      if (complete < 99) {
        setTimeout(run, delay);
      }
    }, delay);

    function setFunc() {
      complete = complete + stepsize * (1 - complete / 100); // Increase asymptotically

      EventBus.$emit(events$1.EVENT_STATUS_UPDATE, vm, complete);
    }

    EventBus.$emit(events$1.EVENT_STATUS_START, vm);
  }

  function succeed(vm, successMessage) {
    console.log(successMessage);
    complete = 100; // End the counter

    var notif = {};

    if (successMessage !== '') {
      // Success popup.
      notif = {
        message: successMessage,
        icon: 'ti-check',
        type: 'success',
        verticalAlign: 'top',
        horizontalAlign: 'right',
        timeout: 2000
      };
    }

    EventBus.$emit(events$1.EVENT_STATUS_SUCCEED, vm, notif);
  }

  function fail(vm, failMessage, error) {
    console.log(failMessage);
    var error = error || {
      "message": "unknown message"
    };
    var msgsplit = error.message.split('Exception details:'); // WARNING, must match sc_app.py

    var usermsg = msgsplit[0].replace(/\n/g, '<br>');
    console.log(error.message);
    console.log(usermsg);
    complete = 100;
    var notif = {};

    if (failMessage !== '') {
      // Put up a failure notification.
      notif = {
        message: '<b>' + failMessage + '</b>' + '<br><br>' + usermsg,
        icon: 'ti-face-sad',
        type: 'warning',
        verticalAlign: 'top',
        horizontalAlign: 'right',
        timeout: 0
      };
    }

    EventBus.$emit(events$1.EVENT_STATUS_FAIL, vm, notif);
  }

  var status = {
    start,
    succeed,
    fail
  };

  /*
   * Small utilities that are shared across pages
   */
  function sleep(time) {
    // Return a promise that resolves after _time_ milliseconds.
    return new Promise(resolve => setTimeout(resolve, time));
  }

  function getUniqueName(fileName, otherNames) {
    let tryName = fileName;
    let numAdded = 0;

    while (otherNames.indexOf(tryName) > -1) {
      numAdded = numAdded + 1;
      tryName = fileName + ' (' + numAdded + ')';
    }

    return tryName;
  }

  function validateYears(vm) {
    if (vm.startYear > vm.simEnd) {
      vm.startYear = vm.simEnd;
    } else if (vm.startYear < vm.simStart) {
      vm.startYear = vm.simStart;
    }

    if (vm.endYear > vm.simEnd) {
      vm.endYear = vm.simEnd;
    } else if (vm.endYear < vm.simStart) {
      vm.endYear = vm.simStart;
    }
  }

  function projectID(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      let projectID = vm.$store.state.activeProject.project.id;
      return projectID;
    }
  }

  function hasData(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return false;
    } else {
      return vm.$store.state.activeProject.project.hasData;
    }
  }

  function hasPrograms(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return false;
    } else {
      return vm.$store.state.activeProject.project.hasPrograms;
    }
  }

  function simStart(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      return vm.$store.state.activeProject.project.sim_start;
    }
  }

  function simEnd(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      return vm.$store.state.activeProject.project.sim_end;
    }
  }

  function simYears(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return [];
    } else {
      var sim_start = vm.$store.state.activeProject.project.sim_start;
      var sim_end = vm.$store.state.activeProject.project.sim_end;
      var years = [];

      for (var i = sim_start; i <= sim_end; i++) {
        years.push(i);
      }

      console.log('Sim years: ' + years);
      return years;
    }
  }

  function dataStart(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      return vm.$store.state.activeProject.project.data_start;
    }
  }

  function dataEnd(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      console.log('dataEnd: ' + vm.$store.state.activeProject.project.data_end);
      return vm.$store.state.activeProject.project.data_end;
    }
  }

  function dataYears(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return [];
    } else {
      let data_start = vm.$store.state.activeProject.project.data_start;
      let data_end = vm.$store.state.activeProject.project.data_end;
      let years = [];

      for (let i = data_start; i <= data_end; i++) {
        years.push(i);
      }

      console.log('data years: ' + years);
      return years;
    }
  } // projection years are used for scenario and optimization plot year dropdowns


  function projectionYears(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return [];
    } else {
      let data_end = vm.$store.state.activeProject.project.data_end;
      let sim_end = vm.$store.state.activeProject.project.sim_end;
      let years = [];

      for (let i = data_end; i <= sim_end; i++) {
        years.push(i);
      }

      console.log('projection years: ' + years);
      return years;
    }
  }

  function activePops(vm) {
    if (vm.$store.state.activeProject.project === undefined) {
      return '';
    } else {
      let pop_pairs = vm.$store.state.activeProject.project.pops;
      let pop_list = ["All"];

      for (let i = 0; i < pop_pairs.length; ++i) {
        pop_list.push(pop_pairs[i][1]);
      }

      return pop_list;
    }
  }

  function updateSorting(vm, sortColumn) {
    console.log('updateSorting() called');

    if (vm.sortColumn === sortColumn) {
      // If the active sorting column is clicked...
      vm.sortReverse = !vm.sortReverse; // Reverse the sort.
    } else {
      // Otherwise.
      vm.sortColumn = sortColumn; // Select the new column for sorting.

      vm.sortReverse = false; // Set the sorting for non-reverse.
    }
  }

  var utils = {
    sleep,
    getUniqueName,
    validateYears,
    projectID,
    hasData,
    hasPrograms,
    simStart,
    simEnd,
    simYears,
    dataStart,
    dataEnd,
    dataYears,
    projectionYears,
    activePops,
    updateSorting
  };

  var bind$1 = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  /*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   */

  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  var isBuffer_1 = function (obj) {
    return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
  };

  function isBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
  }

  /*global toString:true*/

  // utils is a library of generic helper functions non-specific to axios

  var toString$1 = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return toString$1.call(val) === '[object Array]';
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString$1.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return (typeof FormData !== 'undefined') && (val instanceof FormData);
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject$1(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString$1.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString$1.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString$1.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString$1.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject$1(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (typeof result[key] === 'object' && typeof val === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend$1(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  var utils$1 = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer_1,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject$1,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend$1,
    trim: trim
  };

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils$1.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    return error;
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    // Note: status is not exposed by XDomainRequest
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils$1.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils$1.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils$1.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils$1.forEach(val, function parseValue(v) {
          if (utils$1.isDate(v)) {
            v = v.toISOString();
          } else if (utils$1.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils$1.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils$1.trim(line.substr(0, i)).toLowerCase();
      val = utils$1.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils$1.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
      function resolveURL(url) {
        var href = url;

        if (msie) {
          // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                    urlParsingNode.pathname :
                    '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils$1.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
      };
    })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
  );

  // btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function E() {
    this.message = 'String contains an invalid character';
  }
  E.prototype = new Error;
  E.prototype.code = 5;
  E.prototype.name = 'InvalidCharacterError';

  function btoa$1(input) {
    var str = String(input);
    var output = '';
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars;
      // if the next str index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      str.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = str.charCodeAt(idx += 3 / 4);
      if (charCode > 0xFF) {
        throw new E();
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  var btoa_1 = btoa$1;

  var cookies = (
    utils$1.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils$1.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils$1.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils$1.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

    // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
  );

  var btoa$2 = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;

      if (utils$1.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();
      var loadEvent = 'onreadystatechange';
      var xDomain = false;

      // For IE 8/9 CORS support
      // Only supports POST and GET calls and doesn't returns the response headers.
      // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
      if ("development" !== 'test' &&
          typeof window !== 'undefined' &&
          window.XDomainRequest && !('withCredentials' in request) &&
          !isURLSameOrigin(config.url)) {
        request = new window.XDomainRequest();
        loadEvent = 'onload';
        xDomain = true;
        request.onprogress = function handleProgress() {};
        request.ontimeout = function handleTimeout() {};
      }

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        requestHeaders.Authorization = 'Basic ' + btoa$2(username + ':' + password);
      }

      request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      // Listen for ready state
      request[loadEvent] = function handleLoad() {
        if (!request || (request.readyState !== 4 && !xDomain)) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }

        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        var response = {
          data: responseData,
          // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
          status: request.status === 1223 ? 204 : request.status,
          statusText: request.status === 1223 ? 'No Content' : request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(resolve, reject, response);

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils$1.isStandardBrowserEnv()) {
        var cookies$$1 = cookies;

        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
            cookies$$1.read(config.xsrfCookieName) :
            undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils$1.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (config.withCredentials) {
        request.withCredentials = true;
      }

      // Add responseType to request if needed
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
          // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken) {
        // Handle cancellation
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }

          request.abort();
          reject(cancel);
          // Clean up request
          request = null;
        });
      }

      if (requestData === undefined) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils$1.isUndefined(headers) && utils$1.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  var defaults = {
    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Content-Type');
      if (utils$1.isFormData(data) ||
        utils$1.isArrayBuffer(data) ||
        utils$1.isBuffer(data) ||
        utils$1.isStream(data) ||
        utils$1.isFile(data) ||
        utils$1.isBlob(data)
      ) {
        return data;
      }
      if (utils$1.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils$1.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils$1.isObject(data)) {
        setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
        return JSON.stringify(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      /*eslint no-param-reassign:0*/
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) { /* Ignore */ }
      }
      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };

  defaults.headers = {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  };

  utils$1.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils$1.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    /*eslint no-param-reassign:0*/
    utils$1.forEach(fns, function transform(fn) {
      data = fn(data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Support baseURL config
    if (config.baseURL && !isAbsoluteURL(config.url)) {
      config.url = combineURLs(config.baseURL, config.url);
    }

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData(
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils$1.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers || {}
    );

    utils$1.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData(
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData(
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof config === 'string') {
      config = utils$1.merge({
        url: arguments[0]
      }, arguments[1]);
    }

    config = utils$1.merge(defaults_1, {method: 'get'}, this.defaults, config);
    config.method = config.method.toLowerCase();

    // Hook up interceptors middleware
    var chain = [dispatchRequest, undefined];
    var promise = Promise.resolve(config);

    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  };

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(utils$1.merge(config || {}, {
        method: method,
        url: url
      }));
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(utils$1.merge(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind$1(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils$1.extend(instance, context);

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Factory for creating new instances
  axios.create = function create(instanceConfig) {
    return createInstance(utils$1.merge(defaults_1, instanceConfig));
  };

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var default_1 = axios;
  axios_1.default = default_1;

  var axios$1 = axios_1;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var FileSaver_min = createCommonjsModule(function (module, exports) {
  (function(a,b){if("function"==typeof undefined&&undefined.amd)undefined([],b);else b();})(commonjsGlobal,function(){function b(a,b){return"undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Depricated: Expected third argument to be a object"), b={autoBom:!b}), b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b), e.responseType="blob", e.onload=function(){a(e.response,c,d);}, e.onerror=function(){console.error("could not download file");}, e.send();}function d(a){var b=new XMLHttpRequest;return b.open("HEAD",a,!1), b.send(), 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null), a.dispatchEvent(b);}}var f=function(){try{return Function("return this")()||(eval)("this")}catch(a){return"object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:this}}(),a=f.saveAs||"object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download", j.download=g, j.rel="noopener", "string"==typeof b?(j.href=b, j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b), setTimeout(function(){i.revokeObjectURL(j.href);},4E4), setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download", "string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f, i.target="_blank", setTimeout(function(){e(i);});}}:function(a,b,d,e){if(e=e||open("","_blank"), e&&(e.document.title=e.document.body.innerText="downloading..."), "string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"), e?e.location.href=a:location=a, e=null;}, j.readAsDataURL(a);}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l, e=null, setTimeout(function(){k.revokeObjectURL(l);},4E4);}};f.saveAs=a.saveAs=a, "undefined"!='object'&&(module.exports=a);});


  });

  // rpc-service.js -- RPC functions for Vue to call

  function consoleLogCommand(type, funcname, args, kwargs) {
    if (!args) {
      // Don't show any arguments if none are passed in.
      args = '';
    }

    if (!kwargs) {
      // Don't show any kwargs if none are passed in.
      kwargs = '';
    }

    console.log("RPC service call (" + type + "): " + funcname, args, kwargs);
  } // readJsonFromBlob(theBlob) -- Attempt to convert a Blob passed in to a JSON. Passes back a Promise.


  function readJsonFromBlob(theBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); // Create a FileReader; reader.result contains the contents of blob as text when this is called

      reader.addEventListener("loadend", function () {
        // Create a callback for after the load attempt is finished
        try {
          // Call a resolve passing back a JSON version of this.
          var jsonresult = JSON.parse(reader.result); // Try the conversion.

          resolve(jsonresult); // (Assuming successful) make the Promise resolve with the JSON result.
        } catch (e) {
          reject(Error('Failed to convert blob to JSON')); // On failure to convert to JSON, reject the Promise.
        }
      });
      reader.readAsText(theBlob); // Start the load attempt, trying to read the blob in as text.
    });
  }

  var rpcs = {
    rpc(funcname, args, kwargs) {
      // rpc() -- normalRPC() /api/procedure calls in api.py.
      consoleLogCommand("normal", funcname, args, kwargs); // Log the RPC call.

      return new Promise((resolve, reject) => {
        // Do the RPC processing, returning results as a Promise.
        axios$1.post('/api/rpcs', {
          // Send the POST request for the RPC call.
          funcname: funcname,
          args: args,
          kwargs: kwargs
        }).then(response => {
          if (typeof response.data.error !== 'undefined') {
            // If there is an error in the POST response.
            console.log('RPC error: ' + response.data.error);
            reject(Error(response.data.error));
          } else {
            console.log('RPC succeeded');
            resolve(response); // Signal success with the response.
          }
        }).catch(error => {
          console.log('RPC error: ' + error);

          if (error.response) {
            // If there was an actual response returned from the server...
            if (typeof error.response.data.exception !== 'undefined') {
              // If we have exception information in the response (which indicates an exception on the server side)...
              reject(Error(error.response.data.exception)); // For now, reject with an error message matching the exception.
            }
          } else {
            reject(error); // Reject with the error axios got.
          }
        });
      });
    },

    download(funcname, args, kwargs) {
      // download() -- download() /api/download calls in api.py.
      consoleLogCommand("download", funcname, args, kwargs); // Log the download RPC call.

      return new Promise((resolve, reject) => {
        // Do the RPC processing, returning results as a Promise.
        axios$1.post('/api/rpcs', {
          // Send the POST request for the RPC call.
          funcname: funcname,
          args: args,
          kwargs: kwargs
        }, {
          responseType: 'blob'
        }).then(response => {
          readJsonFromBlob(response.data).then(responsedata => {
            if (typeof responsedata.error != 'undefined') {
              // If we have error information in the response (which indicates a logical error on the server side)...
              reject(Error(responsedata.error)); // For now, reject with an error message matching the error.
            }
          }).catch(error2 => {
            // An error here indicates we do in fact have a file to download.
            var blob = new Blob([response.data]); // Create a new blob object (containing the file data) from the response.data component.

            var filename = response.headers.filename; // Grab the file name from response.headers.

            FileSaver_min(blob, filename); // Bring up the browser dialog allowing the user to save the file or cancel doing so.

            resolve(response); // Signal success with the response.
          });
        }).catch(error => {
          if (error.response) {
            // If there was an actual response returned from the server...
            readJsonFromBlob(error.response.data).then(responsedata => {
              if (typeof responsedata.exception !== 'undefined') {
                // If we have exception information in the response (which indicates an exception on the server side)...
                reject(Error(responsedata.exception)); // For now, reject with an error message matching the exception.
              }
            }).catch(error2 => {
              reject(error); // Reject with the error axios got.
            });
          } else {
            reject(error); // Otherwise (no response was delivered), reject with the error axios got.
          }
        });
      });
    },

    // upload() -- upload() /api/upload calls in api.py.
    upload(funcname, args, kwargs, fileType) {
      consoleLogCommand("upload", funcname, args, kwargs); // Log the upload RPC call.

      return new Promise((resolve, reject) => {
        // Do the RPC processing, returning results as a Promise.
        var onFileChange = e => {
          // Function for trapping the change event that has the user-selected file.
          var files = e.target.files || e.dataTransfer.files; // Pull out the files (should only be 1) that were selected.

          if (!files.length) // If no files were selected, reject the promise.
            reject(Error('No file selected'));
          const formData = new FormData(); // Create a FormData object for holding the file.

          formData.append('uploadfile', files[0]); // Put the selected file in the formData object with 'uploadfile' key.

          formData.append('funcname', funcname); // Add the RPC function name to the form data.

          formData.append('args', JSON.stringify(args)); // Add args and kwargs to the form data.

          formData.append('kwargs', JSON.stringify(kwargs));
          axios$1.post('/api/rpcs', formData) // Use a POST request to pass along file to the server.
          .then(response => {
            // If there is an error in the POST response.
            if (typeof response.data.error != 'undefined') {
              reject(Error(response.data.error));
            }

            resolve(response); // Signal success with the response.
          }).catch(error => {
            if (error.response) {
              // If there was an actual response returned from the server...
              if (typeof error.response.data.exception != 'undefined') {
                // If we have exception information in the response (which indicates an exception on the server side)...
                reject(Error(error.response.data.exception)); // For now, reject with an error message matching the exception.
              }
            }

            reject(error); // Reject with the error axios got.
          });
        }; // Create an invisible file input element and set its change callback to our onFileChange function.


        var inElem = document.createElement('input');
        inElem.setAttribute('type', 'file');
        inElem.setAttribute('accept', fileType);
        inElem.addEventListener('change', onFileChange);
        inElem.click(); // Manually click the button to open the file dialog.
      });
    }

  };

  /*
   * Graphing functions (shared between calibration, scenarios, and optimization)
   */

  function getPlotOptions(vm, project_id) {
    return new Promise((resolve, reject) => {
      console.log('getPlotOptions() called');
      status.start(vm); // Start indicating progress.

      rpcs.rpc('get_supported_plots', [project_id, true]).then(response => {
        vm.plotOptions = response.data; // Get the parameter values

        status.succeed(vm, '');
        resolve(response);
      }).catch(error => {
        status.fail(vm, 'Could not get plot options', error);
        reject(error);
      });
    });
  }

  function togglePlotControls(vm) {
    vm.showPlotControls = !vm.showPlotControls;
  }

  function placeholders(vm, startVal) {
    let indices = [];

    if (!startVal) {
      startVal = 0;
    }

    for (let i = startVal; i <= 100; i++) {
      indices.push(i);
      vm.showGraphDivs.push(false);
      vm.showLegendDivs.push(false);
    }

    return indices;
  }

  function clearGraphs(vm) {
    for (let index = 0; index <= 100; index++) {
      let divlabel = 'fig' + index;
      let div = document.getElementById(divlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }

      vm.hasGraphs = false;
    }
  }

  function makeGraphs(vm, data, routepath) {
    console.log('makeGraphs() called');

    if (routepath !== vm.$route.path) {
      // Don't render graphs if we've changed page
      console.log('Not rendering graphs since route changed: ' + routepath + ' vs. ' + vm.$route.path);
    } else {
      // Proceed...
      let waitingtime = 0.5;
      var graphdata = data.graphs; // var legenddata = data.legends

      status.start(vm); // Start indicating progress.

      vm.hasGraphs = true;
      utils.sleep(waitingtime * 1000).then(response => {
        let n_plots = graphdata.length; // let n_legends = legenddata.length

        console.log('Rendering ' + n_plots + ' graphs'); // if (n_plots !== n_legends) {
        //   console.log('WARNING: different numbers of plots and legends: ' + n_plots + ' vs. ' + n_legends)
        // }

        for (var index = 0; index <= n_plots; index++) {
          console.log('Rendering plot ' + index);
          var figlabel = 'fig' + index;
          var figdiv = document.getElementById(figlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

          if (figdiv) {
            while (figdiv.firstChild) {
              figdiv.removeChild(figdiv.firstChild);
            }
          } else {
            console.log('WARNING: figdiv not found: ' + figlabel);
          } // Show figure containers


          if (index >= 1 && index < n_plots) {
            var figcontainerlabel = 'figcontainer' + index;
            var figcontainerdiv = document.getElementById(figcontainerlabel); // CK: Not sure if this is necessary? To ensure the div is clear first

            if (figcontainerdiv) {
              figcontainerdiv.style.display = 'flex';
            } else {
              console.log('WARNING: figcontainerdiv not found: ' + figcontainerlabel);
            } // var legendlabel = 'legend' + index
            // var legenddiv  = document.getElementById(legendlabel);
            // if (legenddiv) {
            //   while (legenddiv.firstChild) {
            //     legenddiv.removeChild(legenddiv.firstChild);
            //   }
            // } else {
            //   console.log('WARNING: legenddiv not found: ' + legendlabel)
            // }

          } // Draw figures


          try {
            mpld3.draw_figure(figlabel, graphdata[index], function (fig, element) {
              fig.setXTicks(6, function (d) {
                return d3.format('.0f')(d);
              }); // fig.setYTicks(null, function (d) { // Looks too weird with 500m for 0.5
              //   return d3.format('.2s')(d);
              // });
            });
          } catch (error) {
            console.log('Could not plot graph: ' + error.message);
          } // Draw legends
          // if (index>=1 && index<n_plots) {
          //   try {
          //     mpld3.draw_figure(legendlabel, legenddata[index], function (fig, element) {
          //     });
          //   } catch (error) {
          //     console.log(error)
          //   }
          //
          // }


          vm.showGraphDivs[index] = true;
        }

        status.succeed(vm, 'Graphs created'); // CK: This should be a promise, otherwise this appears before the graphs do
      });
    }
  }

  function reloadGraphs(vm, project_id, cache_id, showNoCacheError, iscalibration, plotbudget) {
    console.log('reloadGraphs() called');
    utils.validateYears(vm); // Make sure the start end years are in the right range.

    status.start(vm);
    rpcs.rpc('plot_results', [project_id, cache_id, vm.plotOptions], {
      tool: vm.$globaltool,
      'cascade': null,
      plotyear: vm.endYear,
      pops: vm.activePop,
      calibration: iscalibration,
      plotbudget: plotbudget
    }).then(response => {
      vm.table = response.data.table;
      vm.makeGraphs(response.data);
      status.succeed(vm, 'Data loaded, graphs now rendering...');
    }).catch(error => {
      if (showNoCacheError) {
        status.fail(vm, 'Could not make graphs', error);
      } else {
        status.succeed(vm, ''); // Silently stop progress bar and spinner.
      }
    });
  } //
  // Graphs DOM functions
  //


  function showBrowserWindowSize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let ow = window.outerWidth; //including toolbars and status bar etc.

    let oh = window.outerHeight;
    console.log('Browser window size:');
    console.log(w, h, ow, oh);
  }

  function scaleElem(svg, frac) {
    // It might ultimately be better to redraw the graph, but this works
    let width = svg.getAttribute("width");
    let height = svg.getAttribute("height");
    let viewBox = svg.getAttribute("viewBox");

    if (!viewBox) {
      svg.setAttribute("viewBox", '0 0 ' + width + ' ' + height);
    } // if this causes the image to look weird, you may want to look at "preserveAspectRatio" attribute


    svg.setAttribute("width", width * frac);
    svg.setAttribute("height", height * frac);
  }

  function scaleFigs(vm, frac) {
    vm.figscale = vm.figscale * frac;

    if (frac === 1.0) {
      frac = 1.0 / vm.figscale;
      vm.figscale = 1.0;
    }

    let graphs = window.top.document.querySelectorAll('svg.mpld3-figure');

    for (let g = 0; g < graphs.length; g++) {
      scaleElem(graphs[g], frac);
    }
  } //
  // Legend functions
  // 


  function addListener(vm) {
    document.addEventListener('mousemove', function (e) {
      onMouseUpdate(e, vm);
    }, false);
  }

  function onMouseUpdate(e, vm) {
    vm.mousex = e.pageX;
    vm.mousey = e.pageY; // console.log(vm.mousex, vm.mousey)
  }

  function createDialogs(vm) {
    let vals = placeholders(vm);

    for (let val in vals) {
      newDialog(vm, val, 'Dialog ' + val, 'Placeholder content ' + val);
    }
  } // Create a new dialog


  function newDialog(vm, id, name, content) {
    let options = {
      left: 123 + Number(id),
      top: 123
    };
    let style = {
      options: options
    };
    let properties = {
      id,
      name,
      content,
      style,
      options
    };
    return vm.openDialogs.push(properties);
  }

  function findDialog(vm, id, dialogs) {
    console.log('looking');
    let index = dialogs.findIndex(val => {
      return String(val.id) === String(id); // Force type conversion
    });
    return index > -1 ? index : null;
  } // "Show" the dialog


  function maximize(vm, id) {
    let index = Number(id);
    let DDlabel = 'DD' + id; // DD for dialog-drag

    let DDdiv = document.getElementById(DDlabel);

    if (DDdiv) {
      DDdiv.style.left = String(vm.mousex - 80) + 'px';
      DDdiv.style.top = String(vm.mousey - 300) + 'px';
    } else {
      console.log('WARNING: DDdiv not found: ' + DDlabel);
    }

    if (index !== null) {
      vm.openDialogs[index].options.left = vm.mousex - 80; // Before opening, move it to where the mouse currently is

      vm.openDialogs[index].options.top = vm.mousey - 300;
    }

    vm.showLegendDivs[index] = true; // Not really used, but here for completeness

    let containerlabel = 'legendcontainer' + id;
    let containerdiv = document.getElementById(containerlabel);

    if (containerdiv) {
      containerdiv.style.display = 'inline-block'; // Ensure they're invisible
    } else {
      console.log('WARNING: containerdiv not found: ' + containerlabel);
    }
  } // "Hide" the dialog


  function minimize(vm, id) {
    let index = Number(id);
    vm.showLegendDivs[index] = false;
    let containerlabel = 'legendcontainer' + id;
    let containerdiv = document.getElementById(containerlabel);

    if (containerdiv) {
      containerdiv.style.display = 'none'; // Ensure they're invisible
    } else {
      console.log('WARNING: containerdiv not found: ' + containerlabel);
    }
  }

  var graphs = {
    placeholders,
    clearGraphs,
    getPlotOptions,
    togglePlotControls,
    makeGraphs,
    reloadGraphs,
    scaleFigs,
    showBrowserWindowSize,
    addListener,
    onMouseUpdate,
    createDialogs,
    newDialog,
    findDialog,
    maximize,
    minimize
  };

  // task-service.js -- task queuing functions for Vue to call
  // sec.), and a remote task function name and its args, try to launch 
  // the task, then wait for the waiting time, then try to get the 
  // result.

  function getTaskResultWaiting(task_id, waitingtime, func_name, args, kwargs) {
    if (!args) {
      // Set the arguments to an empty list if none are passed in.
      args = [];
    }

    return new Promise((resolve, reject) => {
      rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]) // Launch the task.
      .then(response => {
        utils.sleep(waitingtime * 1000) // Sleep waitingtime seconds.
        .then(response2 => {
          rpcs.rpc('get_task_result', [task_id]) // Get the result of the task.
          .then(response3 => {
            rpcs.rpc('delete_task', [task_id]); // Clean up the task_id task.

            resolve(response3); // Signal success with the result response.
          }).catch(error => {
            // While we might want to clean up the task as below, the Celery
            // worker is likely to "resurrect" the task if it actually is
            // running the task to completion.
            // Clean up the task_id task.
            // rpcCall('delete_task', [task_id])
            reject(error); // Reject with the error the task result get attempt gave.
          });
        });
      }).catch(error => {
        reject(error); // Reject with the error the launch gave.
      });
    });
  } // getTaskResultPolling() -- given a task_id string, a timeout time (in 
  // sec.), a polling interval (also in sec.), and a remote task function name
  //  and its args, try to launch the task, then start the polling if this is 
  // successful, returning the ultimate results of the polling process. 


  function getTaskResultPolling(task_id, timeout, pollinterval, func_name, args, kwargs) {
    if (!args) {
      // Set the arguments to an empty list if none are passed in.
      args = [];
    }

    return new Promise((resolve, reject) => {
      rpcs.rpc('launch_task', [task_id, func_name, args, kwargs]) // Launch the task.
      .then(response => {
        pollStep(task_id, timeout, pollinterval, 0) // Do the whole sequence of polling steps, starting with the first (recursive) call.
        .then(response2 => {
          resolve(response2); // Resolve with the final polling result.
        }).catch(error => {
          reject(error); // Reject with the error the polling gave.
        });
      }).catch(error => {
        reject(error); // Reject with the error the launch gave.
      });
    });
  } // pollStep() -- A polling step for getTaskResultPolling().  Uses the task_id, 
  // a timeout value (in sec.) a poll interval (in sec.) and the time elapsed 
  // since the start of the entire polling process.  If timeout is zero or 
  // negative, no timeout check is applied.  Otherwise, an error will be 
  // returned if the polling has gone on beyond the timeout period.  Otherwise, 
  // this function does a sleep() and then a check_task().  If the task is 
  // completed, it will get the result.  Otherwise, it will recursively spawn 
  // another pollStep().


  function pollStep(task_id, timeout, pollinterval, elapsedtime) {
    return new Promise((resolve, reject) => {
      if (elapsedtime > timeout && timeout > 0) {
        // Check to see if the elapsed time is longer than the timeout (and we have a timeout we actually want to check against) and if so, fail.
        reject(Error('Task polling timed out'));
      } else {
        // Otherwise, we've not run out of time yet, so do a polling step.
        utils.sleep(pollinterval * 1000) // Sleep timeout seconds.
        .then(response => {
          rpcs.rpc('check_task', [task_id]) // Check the status of the task.
          .then(response2 => {
            if (response2.data.task.status == 'completed') {
              // If the task is completed...
              rpcs.rpc('get_task_result', [task_id]) // Get the result of the task.
              .then(response3 => {
                rpcs.rpc('delete_task', [task_id]); // Clean up the task_id task.

                resolve(response3); // Signal success with the response.
              }).catch(error => {
                reject(error); // Reject with the error the task result get attempt gave.
              });
            } else if (response2.data.task.status == 'error') {
              // Otherwise, if the task ended in an error...
              reject(Error(response2.data.task.errorText)); // Reject with an error for the exception.
            } else {
              // Otherwise, do another poll step, passing in an incremented elapsed time.
              pollStep(task_id, timeout, pollinterval, elapsedtime + pollinterval).then(response3 => {
                resolve(response3); // Resolve with the result of the next polling step (which may include subsequent (recursive) steps.
              });
            }
          });
        });
      }
    });
  }

  var tasks = {
    getTaskResultWaiting,
    getTaskResultPolling
  };

  var core = createCommonjsModule(function (module, exports) {
  (function (root, factory) {
  	{
  		// CommonJS
  		module.exports = exports = factory();
  	}
  }(commonjsGlobal, function () {

  	/**
  	 * CryptoJS core components.
  	 */
  	var CryptoJS = CryptoJS || (function (Math, undefined) {
  	    /*
  	     * Local polyfil of Object.create
  	     */
  	    var create = Object.create || (function () {
  	        function F() {}
  	        return function (obj) {
  	            var subtype;

  	            F.prototype = obj;

  	            subtype = new F();

  	            F.prototype = null;

  	            return subtype;
  	        };
  	    }());

  	    /**
  	     * CryptoJS namespace.
  	     */
  	    var C = {};

  	    /**
  	     * Library namespace.
  	     */
  	    var C_lib = C.lib = {};

  	    /**
  	     * Base object for prototypal inheritance.
  	     */
  	    var Base = C_lib.Base = (function () {


  	        return {
  	            /**
  	             * Creates a new object that inherits from this object.
  	             *
  	             * @param {Object} overrides Properties to copy into the new object.
  	             *
  	             * @return {Object} The new object.
  	             *
  	             * @static
  	             *
  	             * @example
  	             *
  	             *     var MyType = CryptoJS.lib.Base.extend({
  	             *         field: 'value',
  	             *
  	             *         method: function () {
  	             *         }
  	             *     });
  	             */
  	            extend: function (overrides) {
  	                // Spawn
  	                var subtype = create(this);

  	                // Augment
  	                if (overrides) {
  	                    subtype.mixIn(overrides);
  	                }

  	                // Create default initializer
  	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
  	                    subtype.init = function () {
  	                        subtype.$super.init.apply(this, arguments);
  	                    };
  	                }

  	                // Initializer's prototype is the subtype object
  	                subtype.init.prototype = subtype;

  	                // Reference supertype
  	                subtype.$super = this;

  	                return subtype;
  	            },

  	            /**
  	             * Extends this object and runs the init method.
  	             * Arguments to create() will be passed to init().
  	             *
  	             * @return {Object} The new object.
  	             *
  	             * @static
  	             *
  	             * @example
  	             *
  	             *     var instance = MyType.create();
  	             */
  	            create: function () {
  	                var instance = this.extend();
  	                instance.init.apply(instance, arguments);

  	                return instance;
  	            },

  	            /**
  	             * Initializes a newly created object.
  	             * Override this method to add some logic when your objects are created.
  	             *
  	             * @example
  	             *
  	             *     var MyType = CryptoJS.lib.Base.extend({
  	             *         init: function () {
  	             *             // ...
  	             *         }
  	             *     });
  	             */
  	            init: function () {
  	            },

  	            /**
  	             * Copies properties into this object.
  	             *
  	             * @param {Object} properties The properties to mix in.
  	             *
  	             * @example
  	             *
  	             *     MyType.mixIn({
  	             *         field: 'value'
  	             *     });
  	             */
  	            mixIn: function (properties) {
  	                for (var propertyName in properties) {
  	                    if (properties.hasOwnProperty(propertyName)) {
  	                        this[propertyName] = properties[propertyName];
  	                    }
  	                }

  	                // IE won't copy toString using the loop above
  	                if (properties.hasOwnProperty('toString')) {
  	                    this.toString = properties.toString;
  	                }
  	            },

  	            /**
  	             * Creates a copy of this object.
  	             *
  	             * @return {Object} The clone.
  	             *
  	             * @example
  	             *
  	             *     var clone = instance.clone();
  	             */
  	            clone: function () {
  	                return this.init.prototype.extend(this);
  	            }
  	        };
  	    }());

  	    /**
  	     * An array of 32-bit words.
  	     *
  	     * @property {Array} words The array of 32-bit words.
  	     * @property {number} sigBytes The number of significant bytes in this word array.
  	     */
  	    var WordArray = C_lib.WordArray = Base.extend({
  	        /**
  	         * Initializes a newly created word array.
  	         *
  	         * @param {Array} words (Optional) An array of 32-bit words.
  	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.lib.WordArray.create();
  	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
  	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
  	         */
  	        init: function (words, sigBytes) {
  	            words = this.words = words || [];

  	            if (sigBytes != undefined) {
  	                this.sigBytes = sigBytes;
  	            } else {
  	                this.sigBytes = words.length * 4;
  	            }
  	        },

  	        /**
  	         * Converts this word array to a string.
  	         *
  	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
  	         *
  	         * @return {string} The stringified word array.
  	         *
  	         * @example
  	         *
  	         *     var string = wordArray + '';
  	         *     var string = wordArray.toString();
  	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
  	         */
  	        toString: function (encoder) {
  	            return (encoder || Hex).stringify(this);
  	        },

  	        /**
  	         * Concatenates a word array to this word array.
  	         *
  	         * @param {WordArray} wordArray The word array to append.
  	         *
  	         * @return {WordArray} This word array.
  	         *
  	         * @example
  	         *
  	         *     wordArray1.concat(wordArray2);
  	         */
  	        concat: function (wordArray) {
  	            // Shortcuts
  	            var thisWords = this.words;
  	            var thatWords = wordArray.words;
  	            var thisSigBytes = this.sigBytes;
  	            var thatSigBytes = wordArray.sigBytes;

  	            // Clamp excess bits
  	            this.clamp();

  	            // Concat
  	            if (thisSigBytes % 4) {
  	                // Copy one byte at a time
  	                for (var i = 0; i < thatSigBytes; i++) {
  	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
  	                }
  	            } else {
  	                // Copy one word at a time
  	                for (var i = 0; i < thatSigBytes; i += 4) {
  	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
  	                }
  	            }
  	            this.sigBytes += thatSigBytes;

  	            // Chainable
  	            return this;
  	        },

  	        /**
  	         * Removes insignificant bits.
  	         *
  	         * @example
  	         *
  	         *     wordArray.clamp();
  	         */
  	        clamp: function () {
  	            // Shortcuts
  	            var words = this.words;
  	            var sigBytes = this.sigBytes;

  	            // Clamp
  	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
  	            words.length = Math.ceil(sigBytes / 4);
  	        },

  	        /**
  	         * Creates a copy of this word array.
  	         *
  	         * @return {WordArray} The clone.
  	         *
  	         * @example
  	         *
  	         *     var clone = wordArray.clone();
  	         */
  	        clone: function () {
  	            var clone = Base.clone.call(this);
  	            clone.words = this.words.slice(0);

  	            return clone;
  	        },

  	        /**
  	         * Creates a word array filled with random bytes.
  	         *
  	         * @param {number} nBytes The number of random bytes to generate.
  	         *
  	         * @return {WordArray} The random word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
  	         */
  	        random: function (nBytes) {
  	            var words = [];

  	            var r = (function (m_w) {
  	                var m_w = m_w;
  	                var m_z = 0x3ade68b1;
  	                var mask = 0xffffffff;

  	                return function () {
  	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
  	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
  	                    var result = ((m_z << 0x10) + m_w) & mask;
  	                    result /= 0x100000000;
  	                    result += 0.5;
  	                    return result * (Math.random() > .5 ? 1 : -1);
  	                }
  	            });

  	            for (var i = 0, rcache; i < nBytes; i += 4) {
  	                var _r = r((rcache || Math.random()) * 0x100000000);

  	                rcache = _r() * 0x3ade67b7;
  	                words.push((_r() * 0x100000000) | 0);
  	            }

  	            return new WordArray.init(words, nBytes);
  	        }
  	    });

  	    /**
  	     * Encoder namespace.
  	     */
  	    var C_enc = C.enc = {};

  	    /**
  	     * Hex encoding strategy.
  	     */
  	    var Hex = C_enc.Hex = {
  	        /**
  	         * Converts a word array to a hex string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The hex string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            // Shortcuts
  	            var words = wordArray.words;
  	            var sigBytes = wordArray.sigBytes;

  	            // Convert
  	            var hexChars = [];
  	            for (var i = 0; i < sigBytes; i++) {
  	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                hexChars.push((bite >>> 4).toString(16));
  	                hexChars.push((bite & 0x0f).toString(16));
  	            }

  	            return hexChars.join('');
  	        },

  	        /**
  	         * Converts a hex string to a word array.
  	         *
  	         * @param {string} hexStr The hex string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
  	         */
  	        parse: function (hexStr) {
  	            // Shortcut
  	            var hexStrLength = hexStr.length;

  	            // Convert
  	            var words = [];
  	            for (var i = 0; i < hexStrLength; i += 2) {
  	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
  	            }

  	            return new WordArray.init(words, hexStrLength / 2);
  	        }
  	    };

  	    /**
  	     * Latin1 encoding strategy.
  	     */
  	    var Latin1 = C_enc.Latin1 = {
  	        /**
  	         * Converts a word array to a Latin1 string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The Latin1 string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            // Shortcuts
  	            var words = wordArray.words;
  	            var sigBytes = wordArray.sigBytes;

  	            // Convert
  	            var latin1Chars = [];
  	            for (var i = 0; i < sigBytes; i++) {
  	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  	                latin1Chars.push(String.fromCharCode(bite));
  	            }

  	            return latin1Chars.join('');
  	        },

  	        /**
  	         * Converts a Latin1 string to a word array.
  	         *
  	         * @param {string} latin1Str The Latin1 string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
  	         */
  	        parse: function (latin1Str) {
  	            // Shortcut
  	            var latin1StrLength = latin1Str.length;

  	            // Convert
  	            var words = [];
  	            for (var i = 0; i < latin1StrLength; i++) {
  	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  	            }

  	            return new WordArray.init(words, latin1StrLength);
  	        }
  	    };

  	    /**
  	     * UTF-8 encoding strategy.
  	     */
  	    var Utf8 = C_enc.Utf8 = {
  	        /**
  	         * Converts a word array to a UTF-8 string.
  	         *
  	         * @param {WordArray} wordArray The word array.
  	         *
  	         * @return {string} The UTF-8 string.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
  	         */
  	        stringify: function (wordArray) {
  	            try {
  	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
  	            } catch (e) {
  	                throw new Error('Malformed UTF-8 data');
  	            }
  	        },

  	        /**
  	         * Converts a UTF-8 string to a word array.
  	         *
  	         * @param {string} utf8Str The UTF-8 string.
  	         *
  	         * @return {WordArray} The word array.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
  	         */
  	        parse: function (utf8Str) {
  	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  	        }
  	    };

  	    /**
  	     * Abstract buffered block algorithm template.
  	     *
  	     * The property blockSize must be implemented in a concrete subtype.
  	     *
  	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
  	     */
  	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
  	        /**
  	         * Resets this block algorithm's data buffer to its initial state.
  	         *
  	         * @example
  	         *
  	         *     bufferedBlockAlgorithm.reset();
  	         */
  	        reset: function () {
  	            // Initial values
  	            this._data = new WordArray.init();
  	            this._nDataBytes = 0;
  	        },

  	        /**
  	         * Adds new data to this block algorithm's buffer.
  	         *
  	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
  	         *
  	         * @example
  	         *
  	         *     bufferedBlockAlgorithm._append('data');
  	         *     bufferedBlockAlgorithm._append(wordArray);
  	         */
  	        _append: function (data) {
  	            // Convert string to WordArray, else assume WordArray already
  	            if (typeof data == 'string') {
  	                data = Utf8.parse(data);
  	            }

  	            // Append
  	            this._data.concat(data);
  	            this._nDataBytes += data.sigBytes;
  	        },

  	        /**
  	         * Processes available data blocks.
  	         *
  	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
  	         *
  	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
  	         *
  	         * @return {WordArray} The processed data.
  	         *
  	         * @example
  	         *
  	         *     var processedData = bufferedBlockAlgorithm._process();
  	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
  	         */
  	        _process: function (doFlush) {
  	            // Shortcuts
  	            var data = this._data;
  	            var dataWords = data.words;
  	            var dataSigBytes = data.sigBytes;
  	            var blockSize = this.blockSize;
  	            var blockSizeBytes = blockSize * 4;

  	            // Count blocks ready
  	            var nBlocksReady = dataSigBytes / blockSizeBytes;
  	            if (doFlush) {
  	                // Round up to include partial blocks
  	                nBlocksReady = Math.ceil(nBlocksReady);
  	            } else {
  	                // Round down to include only full blocks,
  	                // less the number of blocks that must remain in the buffer
  	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
  	            }

  	            // Count words ready
  	            var nWordsReady = nBlocksReady * blockSize;

  	            // Count bytes ready
  	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

  	            // Process blocks
  	            if (nWordsReady) {
  	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
  	                    // Perform concrete-algorithm logic
  	                    this._doProcessBlock(dataWords, offset);
  	                }

  	                // Remove processed words
  	                var processedWords = dataWords.splice(0, nWordsReady);
  	                data.sigBytes -= nBytesReady;
  	            }

  	            // Return processed words
  	            return new WordArray.init(processedWords, nBytesReady);
  	        },

  	        /**
  	         * Creates a copy of this object.
  	         *
  	         * @return {Object} The clone.
  	         *
  	         * @example
  	         *
  	         *     var clone = bufferedBlockAlgorithm.clone();
  	         */
  	        clone: function () {
  	            var clone = Base.clone.call(this);
  	            clone._data = this._data.clone();

  	            return clone;
  	        },

  	        _minBufferSize: 0
  	    });

  	    /**
  	     * Abstract hasher template.
  	     *
  	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
  	     */
  	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
  	        /**
  	         * Configuration options.
  	         */
  	        cfg: Base.extend(),

  	        /**
  	         * Initializes a newly created hasher.
  	         *
  	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
  	         *
  	         * @example
  	         *
  	         *     var hasher = CryptoJS.algo.SHA256.create();
  	         */
  	        init: function (cfg) {
  	            // Apply config defaults
  	            this.cfg = this.cfg.extend(cfg);

  	            // Set initial values
  	            this.reset();
  	        },

  	        /**
  	         * Resets this hasher to its initial state.
  	         *
  	         * @example
  	         *
  	         *     hasher.reset();
  	         */
  	        reset: function () {
  	            // Reset data buffer
  	            BufferedBlockAlgorithm.reset.call(this);

  	            // Perform concrete-hasher logic
  	            this._doReset();
  	        },

  	        /**
  	         * Updates this hasher with a message.
  	         *
  	         * @param {WordArray|string} messageUpdate The message to append.
  	         *
  	         * @return {Hasher} This hasher.
  	         *
  	         * @example
  	         *
  	         *     hasher.update('message');
  	         *     hasher.update(wordArray);
  	         */
  	        update: function (messageUpdate) {
  	            // Append
  	            this._append(messageUpdate);

  	            // Update the hash
  	            this._process();

  	            // Chainable
  	            return this;
  	        },

  	        /**
  	         * Finalizes the hash computation.
  	         * Note that the finalize operation is effectively a destructive, read-once operation.
  	         *
  	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
  	         *
  	         * @return {WordArray} The hash.
  	         *
  	         * @example
  	         *
  	         *     var hash = hasher.finalize();
  	         *     var hash = hasher.finalize('message');
  	         *     var hash = hasher.finalize(wordArray);
  	         */
  	        finalize: function (messageUpdate) {
  	            // Final message update
  	            if (messageUpdate) {
  	                this._append(messageUpdate);
  	            }

  	            // Perform concrete-hasher logic
  	            var hash = this._doFinalize();

  	            return hash;
  	        },

  	        blockSize: 512/32,

  	        /**
  	         * Creates a shortcut function to a hasher's object interface.
  	         *
  	         * @param {Hasher} hasher The hasher to create a helper for.
  	         *
  	         * @return {Function} The shortcut function.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
  	         */
  	        _createHelper: function (hasher) {
  	            return function (message, cfg) {
  	                return new hasher.init(cfg).finalize(message);
  	            };
  	        },

  	        /**
  	         * Creates a shortcut function to the HMAC's object interface.
  	         *
  	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
  	         *
  	         * @return {Function} The shortcut function.
  	         *
  	         * @static
  	         *
  	         * @example
  	         *
  	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
  	         */
  	        _createHmacHelper: function (hasher) {
  	            return function (message, key) {
  	                return new C_algo.HMAC.init(hasher, key).finalize(message);
  	            };
  	        }
  	    });

  	    /**
  	     * Algorithm namespace.
  	     */
  	    var C_algo = C.algo = {};

  	    return C;
  	}(Math));


  	return CryptoJS;

  }));
  });

  var sha256 = createCommonjsModule(function (module, exports) {
  (function (root, factory) {
  	{
  		// CommonJS
  		module.exports = exports = factory(core);
  	}
  }(commonjsGlobal, function (CryptoJS) {

  	(function (Math) {
  	    // Shortcuts
  	    var C = CryptoJS;
  	    var C_lib = C.lib;
  	    var WordArray = C_lib.WordArray;
  	    var Hasher = C_lib.Hasher;
  	    var C_algo = C.algo;

  	    // Initialization and round constants tables
  	    var H = [];
  	    var K = [];

  	    // Compute constants
  	    (function () {
  	        function isPrime(n) {
  	            var sqrtN = Math.sqrt(n);
  	            for (var factor = 2; factor <= sqrtN; factor++) {
  	                if (!(n % factor)) {
  	                    return false;
  	                }
  	            }

  	            return true;
  	        }

  	        function getFractionalBits(n) {
  	            return ((n - (n | 0)) * 0x100000000) | 0;
  	        }

  	        var n = 2;
  	        var nPrime = 0;
  	        while (nPrime < 64) {
  	            if (isPrime(n)) {
  	                if (nPrime < 8) {
  	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
  	                }
  	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

  	                nPrime++;
  	            }

  	            n++;
  	        }
  	    }());

  	    // Reusable object
  	    var W = [];

  	    /**
  	     * SHA-256 hash algorithm.
  	     */
  	    var SHA256 = C_algo.SHA256 = Hasher.extend({
  	        _doReset: function () {
  	            this._hash = new WordArray.init(H.slice(0));
  	        },

  	        _doProcessBlock: function (M, offset) {
  	            // Shortcut
  	            var H = this._hash.words;

  	            // Working variables
  	            var a = H[0];
  	            var b = H[1];
  	            var c = H[2];
  	            var d = H[3];
  	            var e = H[4];
  	            var f = H[5];
  	            var g = H[6];
  	            var h = H[7];

  	            // Computation
  	            for (var i = 0; i < 64; i++) {
  	                if (i < 16) {
  	                    W[i] = M[offset + i] | 0;
  	                } else {
  	                    var gamma0x = W[i - 15];
  	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
  	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
  	                                   (gamma0x >>> 3);

  	                    var gamma1x = W[i - 2];
  	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
  	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
  	                                   (gamma1x >>> 10);

  	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
  	                }

  	                var ch  = (e & f) ^ (~e & g);
  	                var maj = (a & b) ^ (a & c) ^ (b & c);

  	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
  	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

  	                var t1 = h + sigma1 + ch + K[i] + W[i];
  	                var t2 = sigma0 + maj;

  	                h = g;
  	                g = f;
  	                f = e;
  	                e = (d + t1) | 0;
  	                d = c;
  	                c = b;
  	                b = a;
  	                a = (t1 + t2) | 0;
  	            }

  	            // Intermediate hash value
  	            H[0] = (H[0] + a) | 0;
  	            H[1] = (H[1] + b) | 0;
  	            H[2] = (H[2] + c) | 0;
  	            H[3] = (H[3] + d) | 0;
  	            H[4] = (H[4] + e) | 0;
  	            H[5] = (H[5] + f) | 0;
  	            H[6] = (H[6] + g) | 0;
  	            H[7] = (H[7] + h) | 0;
  	        },

  	        _doFinalize: function () {
  	            // Shortcuts
  	            var data = this._data;
  	            var dataWords = data.words;

  	            var nBitsTotal = this._nDataBytes * 8;
  	            var nBitsLeft = data.sigBytes * 8;

  	            // Add padding
  	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
  	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
  	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
  	            data.sigBytes = dataWords.length * 4;

  	            // Hash final blocks
  	            this._process();

  	            // Return final computed hash
  	            return this._hash;
  	        },

  	        clone: function () {
  	            var clone = Hasher.clone.call(this);
  	            clone._hash = this._hash.clone();

  	            return clone;
  	        }
  	    });

  	    /**
  	     * Shortcut function to the hasher's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     *
  	     * @return {WordArray} The hash.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hash = CryptoJS.SHA256('message');
  	     *     var hash = CryptoJS.SHA256(wordArray);
  	     */
  	    C.SHA256 = Hasher._createHelper(SHA256);

  	    /**
  	     * Shortcut function to the HMAC's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     * @param {WordArray|string} key The secret key.
  	     *
  	     * @return {WordArray} The HMAC.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hmac = CryptoJS.HmacSHA256(message, key);
  	     */
  	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
  	}(Math));


  	return CryptoJS.SHA256;

  }));
  });

  var sha224 = createCommonjsModule(function (module, exports) {
  (function (root, factory, undef) {
  	{
  		// CommonJS
  		module.exports = exports = factory(core, sha256);
  	}
  }(commonjsGlobal, function (CryptoJS) {

  	(function () {
  	    // Shortcuts
  	    var C = CryptoJS;
  	    var C_lib = C.lib;
  	    var WordArray = C_lib.WordArray;
  	    var C_algo = C.algo;
  	    var SHA256 = C_algo.SHA256;

  	    /**
  	     * SHA-224 hash algorithm.
  	     */
  	    var SHA224 = C_algo.SHA224 = SHA256.extend({
  	        _doReset: function () {
  	            this._hash = new WordArray.init([
  	                0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
  	                0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
  	            ]);
  	        },

  	        _doFinalize: function () {
  	            var hash = SHA256._doFinalize.call(this);

  	            hash.sigBytes -= 4;

  	            return hash;
  	        }
  	    });

  	    /**
  	     * Shortcut function to the hasher's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     *
  	     * @return {WordArray} The hash.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hash = CryptoJS.SHA224('message');
  	     *     var hash = CryptoJS.SHA224(wordArray);
  	     */
  	    C.SHA224 = SHA256._createHelper(SHA224);

  	    /**
  	     * Shortcut function to the HMAC's object interface.
  	     *
  	     * @param {WordArray|string} message The message to hash.
  	     * @param {WordArray|string} key The secret key.
  	     *
  	     * @return {WordArray} The HMAC.
  	     *
  	     * @static
  	     *
  	     * @example
  	     *
  	     *     var hmac = CryptoJS.HmacSHA224(message, key);
  	     */
  	    C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
  	}());


  	return CryptoJS.SHA224;

  }));
  });

  // loginCall() -- Call rpc() for performing a login.

  function loginCall(username, password) {
    // Get a hex version of a hashed password using the SHA224 algorithm.
    var hashPassword = sha224(password).toString(); // Make the actual RPC call.

    return rpcs.rpc('user_login', [username, hashPassword]);
  } // logoutCall() -- Call rpc() for performing a logout.


  function logoutCall() {
    // Make the actual RPC call.
    return rpcs.rpc('user_logout');
  } // getCurrentUserInfo() -- Call rpc() for reading the currently
  // logged in user.


  function getCurrentUserInfo() {
    // Make the actual RPC call.
    return rpcs.rpc('get_current_user_info');
  } // registerUser() -- Call rpc() for registering a new user.


  function registerUser(username, password, displayname, email) {
    // Get a hex version of a hashed password using the SHA224 algorithm.
    var hashPassword = sha224(password).toString(); // Make the actual RPC call.

    return rpcs.rpc('user_register', [username, hashPassword, displayname, email]);
  } // changeUserInfo() -- Call rpc() for changing a user's info.


  function changeUserInfo(username, password, displayname, email) {
    // Get a hex version of a hashed password using the SHA224 algorithm.
    var hashPassword = sha224(password).toString(); // Make the actual RPC call.

    return rpcs.rpc('user_change_info', [username, hashPassword, displayname, email]);
  } // changeUserPassword() -- Call rpc() for changing a user's password.


  function changeUserPassword(oldpassword, newpassword) {
    // Get a hex version of the hashed passwords using the SHA224 algorithm.
    var hashOldPassword = sha224(oldpassword).toString();
    var hashNewPassword = sha224(newpassword).toString(); // Make the actual RPC call.

    return rpcs.rpc('user_change_password', [hashOldPassword, hashNewPassword]);
  } // adminGetUserInfo() -- Call rpc() for getting user information at the admin level.


  function adminGetUserInfo(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_get_user_info', [username]);
  } // deleteUser() -- Call rpc() for deleting a user.


  function deleteUser(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_delete_user', [username]);
  } // activateUserAccount() -- Call rpc() for activating a user account.


  function activateUserAccount(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_activate_account', [username]);
  } // deactivateUserAccount() -- Call rpc() for deactivating a user account.


  function deactivateUserAccount(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_deactivate_account', [username]);
  } // grantUserAdminRights() -- Call rpc() for granting a user admin rights.


  function grantUserAdminRights(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_grant_admin', [username]);
  } // revokeUserAdminRights() -- Call rpc() for revoking user admin rights.


  function revokeUserAdminRights(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_revoke_admin', [username]);
  } // resetUserPassword() -- Call rpc() for resetting a user's password.


  function resetUserPassword(username) {
    // Make the actual RPC call.
    return rpcs.rpc('admin_reset_password', [username]);
  } // Higher level user functions that call the lower level ones above


  function getUserInfo(store) {
    // Do the actual RPC call.
    getCurrentUserInfo().then(response => {
      // Set the username to what the server indicates.
      store.commit('newUser', response.data.user);
    }).catch(error => {
      // Set the username to {}.  An error probably means the
      // user is not logged in.
      store.commit('newUser', {});
    });
  }

  function checkLoggedIn() {
    if (this.currentUser.displayname === undefined) return false;else return true;
  }

  function checkAdminLoggedIn() {
    console.log(this);

    if (this.checkLoggedIn()) {
      return this.currentUser.admin;
    }
  }

  var user = {
    loginCall,
    logoutCall,
    getCurrentUserInfo,
    registerUser,
    changeUserInfo,
    changeUserPassword,
    adminGetUserInfo,
    deleteUser,
    activateUserAccount,
    deactivateUserAccount,
    grantUserAdminRights,
    revokeUserAdminRights,
    resetUserPassword,
    getUserInfo,
    checkLoggedIn,
    checkAdminLoggedIn
  };

  /*
   * Heftier functions that are shared across pages
   */

  function updateSets(vm) {
    return new Promise((resolve, reject) => {
      console.log('updateSets() called');
      rpcs.rpc('get_parset_info', [vm.projectID]) // Get the current user's parsets from the server.
      .then(response => {
        vm.parsetOptions = response.data; // Set the scenarios to what we received.

        if (vm.parsetOptions.indexOf(vm.activeParset) === -1) {
          console.log('Parameter set ' + vm.activeParset + ' no longer found');
          vm.activeParset = vm.parsetOptions[0]; // If the active parset no longer exists in the array, reset it
        } else {
          console.log('Parameter set ' + vm.activeParset + ' still found');
        }

        vm.newParsetName = vm.activeParset; // WARNING, KLUDGY

        console.log('Parset options: ' + vm.parsetOptions);
        console.log('Active parset: ' + vm.activeParset);
        rpcs.rpc('get_progset_info', [vm.projectID]) // Get the current user's progsets from the server.
        .then(response => {
          vm.progsetOptions = response.data; // Set the scenarios to what we received.

          if (vm.progsetOptions.indexOf(vm.activeProgset) === -1) {
            console.log('Program set ' + vm.activeProgset + ' no longer found');
            vm.activeProgset = vm.progsetOptions[0]; // If the active parset no longer exists in the array, reset it
          } else {
            console.log('Program set ' + vm.activeProgset + ' still found');
          }

          vm.newProgsetName = vm.activeProgset; // WARNING, KLUDGY

          console.log('Progset options: ' + vm.progsetOptions);
          console.log('Active progset: ' + vm.activeProgset);
          resolve(response);
        }).catch(error => {
          status.fail(this, 'Could not get progset info', error);
          reject(error);
        });
      }).catch(error => {
        status.fail(this, 'Could not get parset info', error);
        reject(error);
      });
    }).catch(error => {
      status.fail(this, 'Could not get parset info', error);
      reject(error);
    });
  }

  function exportGraphs(vm) {
    return new Promise((resolve, reject) => {
      console.log('exportGraphs() called');
      rpcs.download('download_graphs', [vm.$store.state.currentUser.username]).then(response => {
        resolve(response);
      }).catch(error => {
        status.fail(vm, 'Could not download graphs', error);
        reject(error);
      });
    });
  }

  function exportResults(vm, serverDatastoreId) {
    return new Promise((resolve, reject) => {
      console.log('exportResults()');
      rpcs.download('export_results', [serverDatastoreId, vm.$store.state.currentUser.username]).then(response => {
        resolve(response);
      }).catch(error => {
        status.fail(vm, 'Could not export results', error);
        reject(error);
      });
    });
  }

  var shared = {
    updateSets,
    exportGraphs,
    exportResults
  };

  var vueProgressbar = createCommonjsModule(function (module, exports) {
  !function(t,o){module.exports=o();}(commonjsGlobal,function(){!function(){if("undefined"!=typeof document){var t=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style"),i=" .__cov-progress { opacity: 1; z-index: 999999; } ";o.type="text/css", o.styleSheet?o.styleSheet.cssText=i:o.appendChild(document.createTextNode(i)), t.appendChild(o);}}();var t="undefined"!=typeof window,r={render:function(){var t=this,o=t.$createElement;return(t._self._c||o)("div",{staticClass:"__cov-progress",style:t.style})},staticRenderFns:[],name:"VueProgress",serverCacheKey:function(){return"Progress"},computed:{style:function(){var t=this.progress,o=t.options,i=!!o.show,e=o.location,s={"background-color":o.canSuccess?o.color:o.failedColor,opacity:o.show?1:0,position:o.position};return"top"===e||"bottom"===e?("top"===e?s.top="0px":s.bottom="0px", o.inverse?s.right="0px":s.left="0px", s.width=t.percent+"%", s.height=o.thickness, s.transition=(i?"width "+o.transition.speed+", ":"")+"opacity "+o.transition.opacity):"left"!==e&&"right"!==e||("left"===e?s.left="0px":s.right="0px", o.inverse?s.top="0px":s.bottom="0px", s.height=t.percent+"%", s.width=o.thickness, s.transition=(i?"height "+o.transition.speed+", ":"")+"opacity "+o.transition.opacity), s},progress:function(){return t?window.VueProgressBarEventBus.RADON_LOADING_BAR:{percent:0,options:{canSuccess:!0,show:!1,color:"rgb(19, 91, 55)",failedColor:"red",thickness:"2px",transition:{speed:"0.2s",opacity:"0.6s",termination:300},location:"top",autoRevert:!0,inverse:!1}}}}};return{install:function(o){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},i=(o.version.split(".")[0], "undefined"!=typeof window),e={$vm:null,state:{tFailColor:"",tColor:"",timer:null,cut:0},init:function(t){this.$vm=t;},start:function(t){var o=this;this.$vm&&(t||(t=3e3), this.$vm.RADON_LOADING_BAR.percent=0, this.$vm.RADON_LOADING_BAR.options.show=!0, this.$vm.RADON_LOADING_BAR.options.canSuccess=!0, this.state.cut=1e4/Math.floor(t), clearInterval(this.state.timer), this.state.timer=setInterval(function(){o.increase(o.state.cut*Math.random()), 95<o.$vm.RADON_LOADING_BAR.percent&&o.$vm.RADON_LOADING_BAR.options.autoFinish&&o.finish();},100));},set:function(t){this.$vm.RADON_LOADING_BAR.options.show=!0, this.$vm.RADON_LOADING_BAR.options.canSuccess=!0, this.$vm.RADON_LOADING_BAR.percent=Math.floor(t);},get:function(){return Math.floor(this.$vm.RADON_LOADING_BAR.percent)},increase:function(t){this.$vm.RADON_LOADING_BAR.percent=Math.min(99,this.$vm.RADON_LOADING_BAR.percent+Math.floor(t));},decrease:function(t){this.$vm.RADON_LOADING_BAR.percent=this.$vm.RADON_LOADING_BAR.percent-Math.floor(t);},hide:function(){var t=this;clearInterval(this.state.timer), this.state.timer=null, setTimeout(function(){t.$vm.RADON_LOADING_BAR.options.show=!1, o.nextTick(function(){setTimeout(function(){t.$vm.RADON_LOADING_BAR.percent=0;},100), t.$vm.RADON_LOADING_BAR.options.autoRevert&&setTimeout(function(){t.revert();},300);});},this.$vm.RADON_LOADING_BAR.options.transition.termination);},pause:function(){clearInterval(this.state.timer);},finish:function(){this.$vm&&(this.$vm.RADON_LOADING_BAR.percent=100, this.hide());},fail:function(){this.$vm.RADON_LOADING_BAR.options.canSuccess=!1, this.$vm.RADON_LOADING_BAR.percent=100, this.hide();},setFailColor:function(t){this.$vm.RADON_LOADING_BAR.options.failedColor=t;},setColor:function(t){this.$vm.RADON_LOADING_BAR.options.color=t;},setLocation:function(t){this.$vm.RADON_LOADING_BAR.options.location=t;},setTransition:function(t){this.$vm.RADON_LOADING_BAR.options.transition=t;},tempFailColor:function(t){this.state.tFailColor=this.$vm.RADON_LOADING_BAR.options.failedColor, this.$vm.RADON_LOADING_BAR.options.failedColor=t;},tempColor:function(t){this.state.tColor=this.$vm.RADON_LOADING_BAR.options.color, this.$vm.RADON_LOADING_BAR.options.color=t;},tempLocation:function(t){this.state.tLocation=this.$vm.RADON_LOADING_BAR.options.location, this.$vm.RADON_LOADING_BAR.options.location=t;},tempTransition:function(t){this.state.tTransition=this.$vm.RADON_LOADING_BAR.options.transition, this.$vm.RADON_LOADING_BAR.options.transition=t;},revertColor:function(){this.$vm.RADON_LOADING_BAR.options.color=this.state.tColor, this.state.tColor="";},revertFailColor:function(){this.$vm.RADON_LOADING_BAR.options.failedColor=this.state.tFailColor, this.state.tFailColor="";},revertLocation:function(){this.$vm.RADON_LOADING_BAR.options.location=this.state.tLocation, this.state.tLocation="";},revertTransition:function(){this.$vm.RADON_LOADING_BAR.options.transition=this.state.tTransition, this.state.tTransition={};},revert:function(){this.$vm.RADON_LOADING_BAR.options.autoRevert&&(this.state.tColor&&this.revertColor(), this.state.tFailColor&&this.revertFailColor(), this.state.tLocation&&this.revertLocation(), !this.state.tTransition||void 0===this.state.tTransition.speed&&void 0===this.state.tTransition.opacity||this.revertTransition());},parseMeta:function(t){for(var o in t.func){var i=t.func[o];switch(i.call){case"color":switch(i.modifier){case"set":this.setColor(i.argument);break;case"temp":this.tempColor(i.argument);}break;case"fail":switch(i.modifier){case"set":this.setFailColor(i.argument);break;case"temp":this.tempFailColor(i.argument);}break;case"location":switch(i.modifier){case"set":this.setLocation(i.argument);break;case"temp":this.tempLocation(i.argument);}break;case"transition":switch(i.modifier){case"set":this.setTransition(i.argument);break;case"temp":this.tempTransition(i.argument);}}}}},s=function(t,o){for(var i,e,s=1;s<arguments.length;++s)for(i in e=arguments[s])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t}({canSuccess:!0,show:!1,color:"#73ccec",position:"fixed",failedColor:"red",thickness:"2px",transition:{speed:"0.2s",opacity:"0.6s",termination:300},autoRevert:!0,location:"top",inverse:!1,autoFinish:!0},t),n=new o({data:{RADON_LOADING_BAR:{percent:0,options:s}}});i&&(window.VueProgressBarEventBus=n, e.init(n)), o.component("vue-progress-bar",r), o.prototype.$Progress=e;}}});
  });

  var dist = createCommonjsModule(function (module, exports) {
  !function(root, factory) {
      module.exports = factory();
  }(commonjsGlobal, function() {
      return function(modules) {
          function __webpack_require__(moduleId) {
              if (installedModules[moduleId]) return installedModules[moduleId].exports;
              var module = installedModules[moduleId] = {
                  i: moduleId,
                  l: !1,
                  exports: {}
              };
              return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), module.l = !0, module.exports;
          }
          var installedModules = {};
          return __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.i = function(value) {
              return value;
          }, __webpack_require__.d = function(exports, name, getter) {
              __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                  configurable: !1,
                  enumerable: !0,
                  get: getter
              });
          }, __webpack_require__.n = function(module) {
              var getter = module && module.__esModule ? function() {
                  return module.default;
              } : function() {
                  return module;
              };
              return __webpack_require__.d(getter, "a", getter), getter;
          }, __webpack_require__.o = function(object, property) {
              return Object.prototype.hasOwnProperty.call(object, property);
          }, __webpack_require__.p = "/dist/", __webpack_require__(__webpack_require__.s = 4);
      }([ function(module, exports) {
          module.exports = function(rawScriptExports, compiledTemplate, scopeId, cssModules) {
              var esModule, scriptExports = rawScriptExports = rawScriptExports || {}, type = typeof rawScriptExports.default;
              "object" !== type && "function" !== type || (esModule = rawScriptExports, scriptExports = rawScriptExports.default);
              var options = "function" == typeof scriptExports ? scriptExports.options : scriptExports;
              if (compiledTemplate && (options.render = compiledTemplate.render, options.staticRenderFns = compiledTemplate.staticRenderFns), scopeId && (options._scopeId = scopeId), cssModules) {
                  var computed = options.computed || (options.computed = {});
                  Object.keys(cssModules).forEach(function(key) {
                      var module = cssModules[key];
                      computed[key] = function() {
                          return module;
                      };
                  });
              }
              return {
                  esModule: esModule,
                  exports: scriptExports,
                  options: options
              };
          };
      }, function(module, exports, __webpack_require__) {
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _extends = Object.assign || function(target) {
              for (var i = 1; i < arguments.length; i++) {
                  var source = arguments[i];
                  for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
              }
              return target;
          }, generateId = exports.generateId = function() {
              var index = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
              return function() {
                  return (index++).toString();
              };
          }();
          exports.inRange = function(from, to, value) {
              return value < from ? from : value > to ? to : value;
          }, exports.createModalEvent = function() {
              var args = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
              return _extends({
                  id: generateId(),
                  timestamp: Date.now(),
                  canceled: !1
              }, args);
          }, exports.getMutationObserver = function() {
              if ("undefined" != typeof window) for (var prefixes = [ "", "WebKit", "Moz", "O", "Ms" ], i = 0; i < prefixes.length; i++) {
                  var name = prefixes[i] + "MutationObserver";
                  if (name in window) return window[name];
              }
              return !1;
          };
      }, function(module, exports) {
          module.exports = function() {
              var list = [];
              return list.toString = function() {
                  for (var result = [], i = 0; i < this.length; i++) {
                      var item = this[i];
                      item[2] ? result.push("@media " + item[2] + "{" + item[1] + "}") : result.push(item[1]);
                  }
                  return result.join("");
              }, list.i = function(modules, mediaQuery) {
                  "string" == typeof modules && (modules = [ [ null, modules, "" ] ]);
                  for (var alreadyImportedModules = {}, i = 0; i < this.length; i++) {
                      var id = this[i][0];
                      "number" == typeof id && (alreadyImportedModules[id] = !0);
                  }
                  for (i = 0; i < modules.length; i++) {
                      var item = modules[i];
                      "number" == typeof item[0] && alreadyImportedModules[item[0]] || (mediaQuery && !item[2] ? item[2] = mediaQuery : mediaQuery && (item[2] = "(" + item[2] + ") and (" + mediaQuery + ")"), list.push(item));
                  }
              }, list;
          };
      }, function(module, exports, __webpack_require__) {
          function addStylesToDom(styles) {
              for (var i = 0; i < styles.length; i++) {
                  var item = styles[i], domStyle = stylesInDom[item.id];
                  if (domStyle) {
                      domStyle.refs++;
                      for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j](item.parts[j]);
                      for (;j < item.parts.length; j++) domStyle.parts.push(addStyle(item.parts[j]));
                      domStyle.parts.length > item.parts.length && (domStyle.parts.length = item.parts.length);
                  } else {
                      for (var parts = [], j = 0; j < item.parts.length; j++) parts.push(addStyle(item.parts[j]));
                      stylesInDom[item.id] = {
                          id: item.id,
                          refs: 1,
                          parts: parts
                      };
                  }
              }
          }
          function createStyleElement() {
              var styleElement = document.createElement("style");
              return styleElement.type = "text/css", head.appendChild(styleElement), styleElement;
          }
          function addStyle(obj) {
              var update, remove, styleElement = document.querySelector('style[data-vue-ssr-id~="' + obj.id + '"]');
              if (styleElement) {
                  if (isProduction) return noop;
                  styleElement.parentNode.removeChild(styleElement);
              }
              if (isOldIE) {
                  var styleIndex = singletonCounter++;
                  styleElement = singletonElement || (singletonElement = createStyleElement()), update = applyToSingletonTag.bind(null, styleElement, styleIndex, !1), remove = applyToSingletonTag.bind(null, styleElement, styleIndex, !0);
              } else styleElement = createStyleElement(), update = applyToTag.bind(null, styleElement), remove = function() {
                  styleElement.parentNode.removeChild(styleElement);
              };
              return update(obj), function(newObj) {
                  if (newObj) {
                      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) return;
                      update(obj = newObj);
                  } else remove();
              };
          }
          function applyToSingletonTag(styleElement, index, remove, obj) {
              var css = remove ? "" : obj.css;
              if (styleElement.styleSheet) styleElement.styleSheet.cssText = replaceText(index, css); else {
                  var cssNode = document.createTextNode(css), childNodes = styleElement.childNodes;
                  childNodes[index] && styleElement.removeChild(childNodes[index]), childNodes.length ? styleElement.insertBefore(cssNode, childNodes[index]) : styleElement.appendChild(cssNode);
              }
          }
          function applyToTag(styleElement, obj) {
              var css = obj.css, media = obj.media, sourceMap = obj.sourceMap;
              if (media && styleElement.setAttribute("media", media), sourceMap && (css += "\n/*# sourceURL=" + sourceMap.sources[0] + " */", css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */"), styleElement.styleSheet) styleElement.styleSheet.cssText = css; else {
                  for (;styleElement.firstChild; ) styleElement.removeChild(styleElement.firstChild);
                  styleElement.appendChild(document.createTextNode(css));
              }
          }
          var hasDocument = "undefined" != typeof document;
          if ("undefined" != typeof DEBUG && DEBUG && !hasDocument) throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");
          var listToStyles = __webpack_require__(24), stylesInDom = {}, head = hasDocument && (document.head || document.getElementsByTagName("head")[0]), singletonElement = null, singletonCounter = 0, isProduction = !1, noop = function() {}, isOldIE = "undefined" != typeof navigator && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase());
          module.exports = function(parentId, list, _isProduction) {
              isProduction = _isProduction;
              var styles = listToStyles(parentId, list);
              return addStylesToDom(styles), function(newList) {
                  for (var mayRemove = [], i = 0; i < styles.length; i++) {
                      var item = styles[i], domStyle = stylesInDom[item.id];
                      domStyle.refs--, mayRemove.push(domStyle);
                  }
                  newList ? (styles = listToStyles(parentId, newList), addStylesToDom(styles)) : styles = [];
                  for (var i = 0; i < mayRemove.length; i++) {
                      var domStyle = mayRemove[i];
                      if (0 === domStyle.refs) {
                          for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();
                          delete stylesInDom[domStyle.id];
                      }
                  }
              };
          };
          var replaceText = function() {
              var textStore = [];
              return function(index, replacement) {
                  return textStore[index] = replacement, textStore.filter(Boolean).join("\n");
              };
          }();
      }, function(module, exports, __webpack_require__) {
          function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                  default: obj
              };
          }
          function getModalsContainer(Vue, options, root) {
              if (!root._dynamicContainer && options.injectModalsContainer) {
                  var modalsContainer = document.createElement("div");
                  document.body.appendChild(modalsContainer), new Vue({
                      parent: root,
                      render: function(h) {
                          return h(_ModalsContainer2.default);
                      }
                  }).$mount(modalsContainer);
              }
              return root._dynamicContainer;
          }
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _Modal = __webpack_require__(6), _Modal2 = _interopRequireDefault(_Modal), _Dialog = __webpack_require__(5), _Dialog2 = _interopRequireDefault(_Dialog), _ModalsContainer = __webpack_require__(7), _ModalsContainer2 = _interopRequireDefault(_ModalsContainer), Plugin = {
              install: function(Vue) {
                  var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                  this.installed || (this.installed = !0, this.event = new Vue(), this.rootInstance = null, this.componentName = options.componentName || "modal", Vue.prototype.$modal = {
                      show: function(modal, paramsOrProps, params) {
                          var events = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                          if ("string" == typeof modal) return void Plugin.event.$emit("toggle", modal, !0, paramsOrProps);
                          var root = params && params.root ? params.root : Plugin.rootInstance, container = getModalsContainer(Vue, options, root);
                          if (container) return void container.add(modal, paramsOrProps, params, events);
                          console.warn("[vue-js-modal] In order to render dynamic modals, a <modals-container> component must be present on the page");
                      },
                      hide: function(name, params) {
                          Plugin.event.$emit("toggle", name, !1, params);
                      },
                      toggle: function(name, params) {
                          Plugin.event.$emit("toggle", name, void 0, params);
                      }
                  }, Vue.component(this.componentName, _Modal2.default), options.dialog && Vue.component("v-dialog", _Dialog2.default), options.dynamic && (Vue.component("modals-container", _ModalsContainer2.default), Vue.mixin({
                      beforeMount: function() {
                          null === Plugin.rootInstance && (Plugin.rootInstance = this.$root);
                      }
                  })));
              }
          };
          exports.default = Plugin;
      }, function(module, exports, __webpack_require__) {
          __webpack_require__(21);
          var Component = __webpack_require__(0)(__webpack_require__(8), __webpack_require__(18), null, null);
          Component.options.__file = "/Users/yev.vlasenko2/Projects/vue/vue-js-modal/src/Dialog.vue", Component.esModule && Object.keys(Component.esModule).some(function(key) {
              return "default" !== key && "__esModule" !== key;
          }) && console.error("named exports are not supported in *.vue files."), Component.options.functional && console.error("[vue-loader] Dialog.vue: functional components are not supported with templates, they should use render functions."), module.exports = Component.exports;
      }, function(module, exports, __webpack_require__) {
          __webpack_require__(22);
          var Component = __webpack_require__(0)(__webpack_require__(9), __webpack_require__(19), null, null);
          Component.options.__file = "/Users/yev.vlasenko2/Projects/vue/vue-js-modal/src/Modal.vue", Component.esModule && Object.keys(Component.esModule).some(function(key) {
              return "default" !== key && "__esModule" !== key;
          }) && console.error("named exports are not supported in *.vue files."), Component.options.functional && console.error("[vue-loader] Modal.vue: functional components are not supported with templates, they should use render functions."), module.exports = Component.exports;
      }, function(module, exports, __webpack_require__) {
          var Component = __webpack_require__(0)(__webpack_require__(10), __webpack_require__(17), null, null);
          Component.options.__file = "/Users/yev.vlasenko2/Projects/vue/vue-js-modal/src/ModalsContainer.vue", Component.esModule && Object.keys(Component.esModule).some(function(key) {
              return "default" !== key && "__esModule" !== key;
          }) && console.error("named exports are not supported in *.vue files."), Component.options.functional && console.error("[vue-loader] ModalsContainer.vue: functional components are not supported with templates, they should use render functions."), module.exports = Component.exports;
      }, function(module, exports, __webpack_require__) {
          Object.defineProperty(exports, "__esModule", {
              value: !0
          }), exports.default = {
              name: "VueJsDialog",
              props: {
                  width: {
                      type: [ Number, String ],
                      default: 400
                  },
                  clickToClose: {
                      type: Boolean,
                      default: !0
                  },
                  transition: {
                      type: String,
                      default: "fade"
                  }
              },
              data: function() {
                  return {
                      params: {},
                      defaultButtons: [ {
                          title: "CLOSE"
                      } ]
                  };
              },
              computed: {
                  buttons: function() {
                      return this.params.buttons || this.defaultButtons;
                  },
                  buttonStyle: function() {
                      return {
                          flex: "1 1 " + 100 / this.buttons.length + "%"
                      };
                  }
              },
              methods: {
                  beforeOpened: function(event) {
                      window.addEventListener("keyup", this.onKeyUp), this.params = event.params || {}, this.$emit("before-opened", event);
                  },
                  beforeClosed: function(event) {
                      window.removeEventListener("keyup", this.onKeyUp), this.params = {}, this.$emit("before-closed", event);
                  },
                  click: function(i, event) {
                      var source = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "click", button = this.buttons[i];
                      button && "function" == typeof button.handler ? button.handler(i, event, {
                          source: source
                      }) : this.$modal.hide("dialog");
                  },
                  onKeyUp: function(event) {
                      if (13 === event.which && this.buttons.length > 0) {
                          var buttonIndex = 1 === this.buttons.length ? 0 : this.buttons.findIndex(function(button) {
                              return button.default;
                          });
                          -1 !== buttonIndex && this.click(buttonIndex, event, "keypress");
                      }
                  }
              }
          };
      }, function(module, exports, __webpack_require__) {
          function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                  default: obj
              };
          }
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _extends = Object.assign || function(target) {
              for (var i = 1; i < arguments.length; i++) {
                  var source = arguments[i];
                  for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
              }
              return target;
          }, _index = __webpack_require__(4), _index2 = _interopRequireDefault(_index), _Resizer = __webpack_require__(16), _Resizer2 = _interopRequireDefault(_Resizer), _util = __webpack_require__(1), _parser = __webpack_require__(12);
          exports.default = {
              name: "VueJsModal",
              props: {
                  name: {
                      required: !0,
                      type: String
                  },
                  delay: {
                      type: Number,
                      default: 0
                  },
                  resizable: {
                      type: Boolean,
                      default: !1
                  },
                  adaptive: {
                      type: Boolean,
                      default: !1
                  },
                  draggable: {
                      type: [ Boolean, String ],
                      default: !1
                  },
                  scrollable: {
                      type: Boolean,
                      default: !1
                  },
                  reset: {
                      type: Boolean,
                      default: !1
                  },
                  overlayTransition: {
                      type: String,
                      default: "overlay-fade"
                  },
                  transition: {
                      type: String
                  },
                  clickToClose: {
                      type: Boolean,
                      default: !0
                  },
                  classes: {
                      type: [ String, Array ],
                      default: "v--modal"
                  },
                  minWidth: {
                      type: Number,
                      default: 0,
                      validator: function(value) {
                          return value >= 0;
                      }
                  },
                  minHeight: {
                      type: Number,
                      default: 0,
                      validator: function(value) {
                          return value >= 0;
                      }
                  },
                  maxWidth: {
                      type: Number,
                      default: 1 / 0
                  },
                  maxHeight: {
                      type: Number,
                      default: 1 / 0
                  },
                  width: {
                      type: [ Number, String ],
                      default: 600,
                      validator: _parser.validateNumber
                  },
                  height: {
                      type: [ Number, String ],
                      default: 300,
                      validator: function(value) {
                          return "auto" === value || (0, _parser.validateNumber)(value);
                      }
                  },
                  pivotX: {
                      type: Number,
                      default: .5,
                      validator: function(value) {
                          return value >= 0 && value <= 1;
                      }
                  },
                  pivotY: {
                      type: Number,
                      default: .5,
                      validator: function(value) {
                          return value >= 0 && value <= 1;
                      }
                  }
              },
              components: {
                  Resizer: _Resizer2.default
              },
              data: function() {
                  return {
                      visible: !1,
                      visibility: {
                          modal: !1,
                          overlay: !1
                      },
                      shift: {
                          left: 0,
                          top: 0
                      },
                      modal: {
                          width: 0,
                          widthType: "px",
                          height: 0,
                          heightType: "px",
                          renderedHeight: 0
                      },
                      window: {
                          width: 0,
                          height: 0
                      },
                      mutationObserver: null
                  };
              },
              created: function() {
                  this.setInitialSize();
              },
              beforeMount: function() {
                  var _this = this;
                  if (_index2.default.event.$on("toggle", this.handleToggleEvent), window.addEventListener("resize", this.handleWindowResize), this.handleWindowResize(), this.scrollable && !this.isAutoHeight && console.warn('Modal "' + this.name + '" has scrollable flag set to true but height is not "auto" (' + this.height + ")"), this.isAutoHeight) {
                      var MutationObserver = (0, _util.getMutationObserver)();
                      MutationObserver && (this.mutationObserver = new MutationObserver(function(mutations) {
                          _this.updateRenderedHeight();
                      }));
                  }
                  this.clickToClose && window.addEventListener("keyup", this.handleEscapeKeyUp);
              },
              beforeDestroy: function() {
                  _index2.default.event.$off("toggle", this.handleToggleEvent), window.removeEventListener("resize", this.handleWindowResize), this.clickToClose && window.removeEventListener("keyup", this.handleEscapeKeyUp), this.scrollable && document.body.classList.remove("v--modal-block-scroll");
              },
              computed: {
                  isAutoHeight: function() {
                      return "auto" === this.modal.heightType;
                  },
                  position: function() {
                      var window = this.window, shift = this.shift, pivotX = this.pivotX, pivotY = this.pivotY, trueModalWidth = this.trueModalWidth, trueModalHeight = this.trueModalHeight, maxLeft = window.width - trueModalWidth, maxTop = window.height - trueModalHeight, left = shift.left + pivotX * maxLeft, top = shift.top + pivotY * maxTop;
                      return {
                          left: parseInt((0, _util.inRange)(0, maxLeft, left)),
                          top: parseInt((0, _util.inRange)(0, maxTop, top))
                      };
                  },
                  trueModalWidth: function() {
                      var window = this.window, modal = this.modal, adaptive = this.adaptive, minWidth = this.minWidth, maxWidth = this.maxWidth, value = "%" === modal.widthType ? window.width / 100 * modal.width : modal.width, max = Math.min(window.width, maxWidth);
                      return adaptive ? (0, _util.inRange)(minWidth, max, value) : value;
                  },
                  trueModalHeight: function() {
                      var window = this.window, modal = this.modal, isAutoHeight = this.isAutoHeight, adaptive = this.adaptive, maxHeight = this.maxHeight, value = "%" === modal.heightType ? window.height / 100 * modal.height : modal.height;
                      if (isAutoHeight) return this.modal.renderedHeight;
                      var max = Math.min(window.height, maxHeight);
                      return adaptive ? (0, _util.inRange)(this.minHeight, max, value) : value;
                  },
                  overlayClass: function() {
                      return {
                          "v--modal-overlay": !0,
                          scrollable: this.scrollable && this.isAutoHeight
                      };
                  },
                  modalClass: function() {
                      return [ "v--modal-box", this.classes ];
                  },
                  modalStyle: function() {
                      return {
                          top: this.position.top + "px",
                          left: this.position.left + "px",
                          width: this.trueModalWidth + "px",
                          height: this.isAutoHeight ? "auto" : this.trueModalHeight + "px"
                      };
                  }
              },
              methods: {
                  handleToggleEvent: function(name, state, params) {
                      if (this.name === name) {
                          var nextState = void 0 === state ? !this.visible : state;
                          this.toggle(nextState, params);
                      }
                  },
                  setInitialSize: function() {
                      var modal = this.modal, width = (0, _parser.parseNumber)(this.width), height = (0, _parser.parseNumber)(this.height);
                      modal.width = width.value, modal.widthType = width.type, modal.height = height.value, modal.heightType = height.type;
                  },
                  handleEscapeKeyUp: function(event) {
                      27 === event.which && this.visible && this.$modal.hide(this.name);
                  },
                  handleWindowResize: function() {
                      this.window.width = window.innerWidth, this.window.height = window.innerHeight;
                  },
                  createModalEvent: function() {
                      var args = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                      return (0, _util.createModalEvent)(_extends({
                          name: this.name,
                          ref: this.$refs.modal
                      }, args));
                  },
                  handleModalResize: function(event) {
                      this.modal.widthType = "px", this.modal.width = event.size.width, this.modal.heightType = "px", this.modal.height = event.size.height;
                      var size = this.modal.size;
                      this.$emit("resize", this.createModalEvent({
                          size: size
                      }));
                  },
                  toggle: function(nextState, params) {
                      var reset = this.reset, scrollable = this.scrollable, visible = this.visible;
                      if (visible !== nextState) {
                          var beforeEventName = visible ? "before-close" : "before-open";
                          "before-open" === beforeEventName ? (document.activeElement && "BODY" !== document.activeElement.tagName && document.activeElement.blur && document.activeElement.blur(), reset && (this.setInitialSize(), this.shift.left = 0, this.shift.top = 0), scrollable && document.body.classList.add("v--modal-block-scroll")) : scrollable && document.body.classList.remove("v--modal-block-scroll");
                          var stopEventExecution = !1, stop = function() {
                              stopEventExecution = !0;
                          }, beforeEvent = this.createModalEvent({
                              stop: stop,
                              state: nextState,
                              params: params
                          });
                          this.$emit(beforeEventName, beforeEvent), stopEventExecution || (this.visible = nextState, this.visible ? this.startOpeningModal() : this.startClosingModal());
                      }
                  },
                  getDraggableElement: function() {
                      var selector = "string" != typeof this.draggable ? ".v--modal-box" : this.draggable;
                      return selector ? this.$refs.overlay.querySelector(selector) : null;
                  },
                  handleBackgroundClick: function() {
                      this.clickToClose && this.toggle(!1);
                  },
                  startOpeningModal: function() {
                      var _this2 = this;
                      this.visibility.overlay = !0, setTimeout(function() {
                          _this2.visibility.modal = !0;
                      }, this.delay);
                  },
                  startClosingModal: function() {
                      var _this3 = this;
                      this.visibility.modal = !1, setTimeout(function() {
                          _this3.visibility.overlay = !1;
                      }, this.delay);
                  },
                  addDraggableListeners: function() {
                      var _this4 = this;
                      if (this.draggable) {
                          var dragger = this.getDraggableElement();
                          if (dragger) {
                              var startX = 0, startY = 0, cachedShiftX = 0, cachedShiftY = 0, getPosition = function(event) {
                                  return event.touches && event.touches.length > 0 ? event.touches[0] : event;
                              }, handleDraggableMousedown = function(event) {
                                  var target = event.target;
                                  if (!target || "INPUT" !== target.nodeName) {
                                      var _getPosition = getPosition(event), clientX = _getPosition.clientX, clientY = _getPosition.clientY;
                                      document.addEventListener("mousemove", _handleDraggableMousemove), document.addEventListener("touchmove", _handleDraggableMousemove), document.addEventListener("mouseup", _handleDraggableMouseup), document.addEventListener("touchend", _handleDraggableMouseup), startX = clientX, startY = clientY, cachedShiftX = _this4.shift.left, cachedShiftY = _this4.shift.top;
                                  }
                              }, _handleDraggableMousemove = function(event) {
                                  var _getPosition2 = getPosition(event), clientX = _getPosition2.clientX, clientY = _getPosition2.clientY;
                                  _this4.shift.left = cachedShiftX + clientX - startX, _this4.shift.top = cachedShiftY + clientY - startY, event.preventDefault();
                              }, _handleDraggableMouseup = function _handleDraggableMouseup(event) {
                                  document.removeEventListener("mousemove", _handleDraggableMousemove), document.removeEventListener("touchmove", _handleDraggableMousemove), document.removeEventListener("mouseup", _handleDraggableMouseup), document.removeEventListener("touchend", _handleDraggableMouseup), event.preventDefault();
                              };
                              dragger.addEventListener("mousedown", handleDraggableMousedown), dragger.addEventListener("touchstart", handleDraggableMousedown);
                          }
                      }
                  },
                  removeDraggableListeners: function() {},
                  updateRenderedHeight: function() {
                      this.$refs.modal && (this.modal.renderedHeight = this.$refs.modal.getBoundingClientRect().height);
                  },
                  connectObserver: function() {
                      this.mutationObserver && this.mutationObserver.observe(this.$refs.overlay, {
                          childList: !0,
                          attributes: !0,
                          subtree: !0
                      });
                  },
                  disconnectObserver: function() {
                      this.mutationObserver && this.mutationObserver.disconnect();
                  },
                  beforeTransitionEnter: function() {
                      this.connectObserver();
                  },
                  afterTransitionEnter: function() {
                      this.addDraggableListeners(), this.$emit("opened", this.createModalEvent({
                          state: !0
                      }));
                  },
                  afterTransitionLeave: function() {
                      this.removeDraggableListeners(), this.disconnectObserver(), this.$emit("closed", this.createModalEvent({
                          state: !1
                      }));
                  }
              }
          };
      }, function(module, exports, __webpack_require__) {
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _extends = Object.assign || function(target) {
              for (var i = 1; i < arguments.length; i++) {
                  var source = arguments[i];
                  for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
              }
              return target;
          }, _util = __webpack_require__(1);
          exports.default = {
              data: function() {
                  return {
                      modals: []
                  };
              },
              created: function() {
                  this.$root._dynamicContainer = this;
              },
              methods: {
                  add: function(component) {
                      var componentAttrs = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, _this = this, modalAttrs = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, modalListeners = arguments[3], id = (0, _util.generateId)(), name = modalAttrs.name || "_dynamic_modal_" + id;
                      this.modals.push({
                          id: id,
                          modalAttrs: _extends({}, modalAttrs, {
                              name: name
                          }),
                          modalListeners: modalListeners,
                          component: component,
                          componentAttrs: componentAttrs
                      }), this.$nextTick(function() {
                          _this.$modal.show(name);
                      });
                  },
                  remove: function(id) {
                      for (var i in this.modals) if (this.modals[i].id === id) return void this.modals.splice(i, 1);
                  }
              }
          };
      }, function(module, exports, __webpack_require__) {
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _util = __webpack_require__(1);
          exports.default = {
              name: "VueJsModalResizer",
              props: {
                  minHeight: {
                      type: Number,
                      default: 0
                  },
                  minWidth: {
                      type: Number,
                      default: 0
                  }
              },
              data: function() {
                  return {
                      clicked: !1,
                      size: {}
                  };
              },
              mounted: function() {
                  this.$el.addEventListener("mousedown", this.start, !1);
              },
              computed: {
                  className: function() {
                      return {
                          "vue-modal-resizer": !0,
                          clicked: this.clicked
                      };
                  }
              },
              methods: {
                  start: function(event) {
                      this.clicked = !0, window.addEventListener("mousemove", this.mousemove, !1), window.addEventListener("mouseup", this.stop, !1), event.stopPropagation(), event.preventDefault();
                  },
                  stop: function() {
                      this.clicked = !1, window.removeEventListener("mousemove", this.mousemove, !1), window.removeEventListener("mouseup", this.stop, !1), this.$emit("resize-stop", {
                          element: this.$el.parentElement,
                          size: this.size
                      });
                  },
                  mousemove: function(event) {
                      this.resize(event);
                  },
                  resize: function(event) {
                      var el = this.$el.parentElement;
                      if (el) {
                          var width = event.clientX - el.offsetLeft, height = event.clientY - el.offsetTop;
                          width = (0, _util.inRange)(this.minWidth, window.innerWidth, width), height = (0, _util.inRange)(this.minHeight, window.innerHeight, height), this.size = {
                              width: width,
                              height: height
                          }, el.style.width = width + "px", el.style.height = height + "px", this.$emit("resize", {
                              element: el,
                              size: this.size
                          });
                      }
                  }
              }
          };
      }, function(module, exports, __webpack_require__) {
          Object.defineProperty(exports, "__esModule", {
              value: !0
          });
          var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
              return typeof obj;
          } : function(obj) {
              return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          }, types = [ {
              name: "px",
              regexp: new RegExp("^[-+]?[0-9]*.?[0-9]+px$")
          }, {
              name: "%",
              regexp: new RegExp("^[-+]?[0-9]*.?[0-9]+%$")
          }, {
              name: "px",
              regexp: new RegExp("^[-+]?[0-9]*.?[0-9]+$")
          } ], getType = function(value) {
              if ("auto" === value) return {
                  type: value,
                  value: 0
              };
              for (var i = 0; i < types.length; i++) {
                  var type = types[i];
                  if (type.regexp.test(value)) return {
                      type: type.name,
                      value: parseFloat(value)
                  };
              }
              return {
                  type: "",
                  value: value
              };
          }, parseNumber = exports.parseNumber = function(value) {
              switch (void 0 === value ? "undefined" : _typeof(value)) {
                case "number":
                  return {
                      type: "px",
                      value: value
                  };

                case "string":
                  return getType(value);

                default:
                  return {
                      type: "",
                      value: value
                  };
              }
          };
          exports.validateNumber = function(value) {
              if ("string" == typeof value) {
                  var _value = parseNumber(value);
                  return ("%" === _value.type || "px" === _value.type) && _value.value > 0;
              }
              return value >= 0;
          };
      }, function(module, exports, __webpack_require__) {
          exports = module.exports = __webpack_require__(2)(), exports.push([ module.i, "\n.vue-dialog div {\n  box-sizing: border-box;\n}\n.vue-dialog .dialog-flex {\n  width: 100%;\n  height: 100%;\n}\n.vue-dialog .dialog-content {\n  flex: 1 0 auto;\n  width: 100%;\n  padding: 15px;\n  font-size: 14px;\n}\n.vue-dialog .dialog-c-title {\n  font-weight: 600;\n  padding-bottom: 15px;\n}\n.vue-dialog .dialog-c-text {\n}\n.vue-dialog .vue-dialog-buttons {\n  display: flex;\n  flex: 0 1 auto;\n  width: 100%;\n  border-top: 1px solid #eee;\n}\n.vue-dialog .vue-dialog-buttons-none {\n  width: 100%;\n  padding-bottom: 15px;\n}\n.vue-dialog-button {\n  font-size: 12px !important;\n  background: transparent;\n  padding: 0;\n  margin: 0;\n  border: 0;\n  cursor: pointer;\n  box-sizing: border-box;\n  line-height: 40px;\n  height: 40px;\n  color: inherit;\n  font: inherit;\n  outline: none;\n}\n.vue-dialog-button:hover {\n  background: rgba(0, 0, 0, 0.01);\n}\n.vue-dialog-button:active {\n  background: rgba(0, 0, 0, 0.025);\n}\n.vue-dialog-button:not(:first-of-type) {\n  border-left: 1px solid #eee;\n}\n", "" ]);
      }, function(module, exports, __webpack_require__) {
          exports = module.exports = __webpack_require__(2)(), exports.push([ module.i, "\n.v--modal-block-scroll {\n  overflow: hidden;\n  width: 100vw;\n}\n.v--modal-overlay {\n  position: fixed;\n  box-sizing: border-box;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100vh;\n  background: rgba(0, 0, 0, 0.2);\n  z-index: 999;\n  opacity: 1;\n}\n.v--modal-overlay.scrollable {\n  height: 100%;\n  min-height: 100vh;\n  overflow-y: auto;\n  -webkit-overflow-scrolling: touch;\n}\n.v--modal-overlay .v--modal-background-click {\n  min-height: 100%;\n  width: 100%;\n}\n.v--modal-overlay .v--modal-box {\n  position: relative;\n  overflow: hidden;\n  box-sizing: border-box;\n}\n.v--modal-overlay.scrollable .v--modal-box {\n  margin-bottom: 2px;\n}\n.v--modal {\n  background-color: white;\n  text-align: left;\n  border-radius: 3px;\n  box-shadow: 0 20px 60px -2px rgba(27, 33, 58, 0.4);\n  padding: 0;\n}\n.v--modal.v--modal-fullscreen {\n  width: 100vw;\n  height: 100vh;\n  margin: 0;\n  left: 0;\n  top: 0;\n}\n.v--modal-top-right {\n  display: block;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.overlay-fade-enter-active,\n.overlay-fade-leave-active {\n  transition: all 0.2s;\n}\n.overlay-fade-enter,\n.overlay-fade-leave-active {\n  opacity: 0;\n}\n.nice-modal-fade-enter-active,\n.nice-modal-fade-leave-active {\n  transition: all 0.4s;\n}\n.nice-modal-fade-enter,\n.nice-modal-fade-leave-active {\n  opacity: 0;\n  transform: translateY(-20px);\n}\n", "" ]);
      }, function(module, exports, __webpack_require__) {
          exports = module.exports = __webpack_require__(2)(), exports.push([ module.i, "\n.vue-modal-resizer {\n  display: block;\n  overflow: hidden;\n  position: absolute;\n  width: 12px;\n  height: 12px;\n  right: 0;\n  bottom: 0;\n  z-index: 9999999;\n  background: transparent;\n  cursor: se-resize;\n}\n.vue-modal-resizer::after {\n  display: block;\n  position: absolute;\n  content: '';\n  background: transparent;\n  left: 0;\n  top: 0;\n  width: 0;\n  height: 0;\n  border-bottom: 10px solid #ddd;\n  border-left: 10px solid transparent;\n}\n.vue-modal-resizer.clicked::after {\n  border-bottom: 10px solid #369be9;\n}\n", "" ]);
      }, function(module, exports, __webpack_require__) {
          __webpack_require__(23);
          var Component = __webpack_require__(0)(__webpack_require__(11), __webpack_require__(20), null, null);
          Component.options.__file = "/Users/yev.vlasenko2/Projects/vue/vue-js-modal/src/Resizer.vue", Component.esModule && Object.keys(Component.esModule).some(function(key) {
              return "default" !== key && "__esModule" !== key;
          }) && console.error("named exports are not supported in *.vue files."), Component.options.functional && console.error("[vue-loader] Resizer.vue: functional components are not supported with templates, they should use render functions."), module.exports = Component.exports;
      }, function(module, exports, __webpack_require__) {
          module.exports = {
              render: function() {
                  var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
                  return _c("div", {
                      attrs: {
                          id: "modals-container"
                      }
                  }, _vm._l(_vm.modals, function(modal) {
                      return _c("modal", _vm._g(_vm._b({
                          key: modal.id,
                          on: {
                              closed: function($event) {
                                  _vm.remove(modal.id);
                              }
                          }
                      }, "modal", modal.modalAttrs, !1), modal.modalListeners), [ _c(modal.component, _vm._g(_vm._b({
                          tag: "component",
                          on: {
                              close: function($event) {
                                  _vm.$modal.hide(modal.modalAttrs.name);
                              }
                          }
                      }, "component", modal.componentAttrs, !1), _vm.$listeners)) ], 1);
                  }));
              },
              staticRenderFns: []
          }, module.exports.render._withStripped = !0;
      }, function(module, exports, __webpack_require__) {
          module.exports = {
              render: function() {
                  var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
                  return _c("modal", {
                      attrs: {
                          name: "dialog",
                          height: "auto",
                          classes: [ "v--modal", "vue-dialog", this.params.class ],
                          width: _vm.width,
                          "pivot-y": .3,
                          adaptive: !0,
                          clickToClose: _vm.clickToClose,
                          transition: _vm.transition
                      },
                      on: {
                          "before-open": _vm.beforeOpened,
                          "before-close": _vm.beforeClosed,
                          opened: function($event) {
                              _vm.$emit("opened", $event);
                          },
                          closed: function($event) {
                              _vm.$emit("closed", $event);
                          }
                      }
                  }, [ _c("div", {
                      staticClass: "dialog-content"
                  }, [ _vm.params.title ? _c("div", {
                      staticClass: "dialog-c-title",
                      domProps: {
                          innerHTML: _vm._s(_vm.params.title || "")
                      }
                  }) : _vm._e(), _vm._v(" "), _c("div", {
                      staticClass: "dialog-c-text",
                      domProps: {
                          innerHTML: _vm._s(_vm.params.text || "")
                      }
                  }) ]), _vm._v(" "), _vm.buttons ? _c("div", {
                      staticClass: "vue-dialog-buttons"
                  }, _vm._l(_vm.buttons, function(button, i) {
                      return _c("button", {
                          key: i,
                          class: button.class || "vue-dialog-button",
                          style: _vm.buttonStyle,
                          attrs: {
                              type: "button"
                          },
                          domProps: {
                              innerHTML: _vm._s(button.title)
                          },
                          on: {
                              click: function($event) {
                                  $event.stopPropagation(), _vm.click(i, $event);
                              }
                          }
                      }, [ _vm._v("\n      " + _vm._s(button.title) + "\n    ") ]);
                  })) : _c("div", {
                      staticClass: "vue-dialog-buttons-none"
                  }) ]);
              },
              staticRenderFns: []
          }, module.exports.render._withStripped = !0;
      }, function(module, exports, __webpack_require__) {
          module.exports = {
              render: function() {
                  var _vm = this, _h = _vm.$createElement, _c = _vm._self._c || _h;
                  return _c("transition", {
                      attrs: {
                          name: _vm.overlayTransition
                      }
                  }, [ _vm.visibility.overlay ? _c("div", {
                      ref: "overlay",
                      class: _vm.overlayClass,
                      attrs: {
                          "aria-expanded": _vm.visibility.overlay.toString(),
                          "data-modal": _vm.name
                      }
                  }, [ _c("div", {
                      staticClass: "v--modal-background-click",
                      on: {
                          mousedown: function($event) {
                              if ($event.target !== $event.currentTarget) return null;
                              _vm.handleBackgroundClick($event);
                          },
                          touchstart: function($event) {
                              if ($event.target !== $event.currentTarget) return null;
                              _vm.handleBackgroundClick($event);
                          }
                      }
                  }, [ _c("div", {
                      staticClass: "v--modal-top-right"
                  }, [ _vm._t("top-right") ], 2), _vm._v(" "), _c("transition", {
                      attrs: {
                          name: _vm.transition
                      },
                      on: {
                          "before-enter": _vm.beforeTransitionEnter,
                          "after-enter": _vm.afterTransitionEnter,
                          "after-leave": _vm.afterTransitionLeave
                      }
                  }, [ _vm.visibility.modal ? _c("div", {
                      ref: "modal",
                      class: _vm.modalClass,
                      style: _vm.modalStyle
                  }, [ _vm._t("default"), _vm._v(" "), _vm.resizable && !_vm.isAutoHeight ? _c("resizer", {
                      attrs: {
                          "min-width": _vm.minWidth,
                          "min-height": _vm.minHeight
                      },
                      on: {
                          resize: _vm.handleModalResize
                      }
                  }) : _vm._e() ], 2) : _vm._e() ]) ], 1) ]) : _vm._e() ]);
              },
              staticRenderFns: []
          }, module.exports.render._withStripped = !0;
      }, function(module, exports, __webpack_require__) {
          module.exports = {
              render: function() {
                  var _vm = this, _h = _vm.$createElement;
                  return (_vm._self._c || _h)("div", {
                      class: _vm.className
                  });
              },
              staticRenderFns: []
          }, module.exports.render._withStripped = !0;
      }, function(module, exports, __webpack_require__) {
          var content = __webpack_require__(13);
          "string" == typeof content && (content = [ [ module.i, content, "" ] ]), content.locals && (module.exports = content.locals);
          __webpack_require__(3)("237a7ca4", content, !1);
      }, function(module, exports, __webpack_require__) {
          var content = __webpack_require__(14);
          "string" == typeof content && (content = [ [ module.i, content, "" ] ]), content.locals && (module.exports = content.locals);
          __webpack_require__(3)("2790b368", content, !1);
      }, function(module, exports, __webpack_require__) {
          var content = __webpack_require__(15);
          "string" == typeof content && (content = [ [ module.i, content, "" ] ]), content.locals && (module.exports = content.locals);
          __webpack_require__(3)("02ec91af", content, !1);
      }, function(module, exports) {
          module.exports = function(parentId, list) {
              for (var styles = [], newStyles = {}, i = 0; i < list.length; i++) {
                  var item = list[i], id = item[0], css = item[1], media = item[2], sourceMap = item[3], part = {
                      id: parentId + ":" + i,
                      css: css,
                      media: media,
                      sourceMap: sourceMap
                  };
                  newStyles[id] ? newStyles[id].parts.push(part) : styles.push(newStyles[id] = {
                      id: id,
                      parts: [ part ]
                  });
              }
              return styles;
          };
      } ]);
  });
  });

  var VModal = unwrapExports(dist);

  var Vue$1 = Vue;
  Vue$1 = 'default' in Vue$1 ? Vue$1['default'] : Vue$1;

  var version = '2.2.2';

  var compatible = (/^2\./).test(Vue$1.version);
  if (!compatible) {
    Vue$1.util.warn('VueClickaway ' + version + ' only supports Vue 2.x, and does not support Vue ' + Vue$1.version);
  }



  // @SECTION: implementation

  var HANDLER = '_vue_clickaway_handler';

  function bind$2(el, binding, vnode) {
    unbind(el);

    var vm = vnode.context;

    var callback = binding.value;
    if (typeof callback !== 'function') {
      {
        Vue$1.util.warn(
          'v-' + binding.name + '="' +
          binding.expression + '" expects a function value, ' +
          'got ' + callback
        );
      }
      return;
    }

    // @NOTE: Vue binds directives in microtasks, while UI events are dispatched
    //        in macrotasks. This causes the listener to be set up before
    //        the "origin" click event (the event that lead to the binding of
    //        the directive) arrives at the document root. To work around that,
    //        we ignore events until the end of the "initial" macrotask.
    // @REFERENCE: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
    // @REFERENCE: https://github.com/simplesmiler/vue-clickaway/issues/8
    var initialMacrotaskEnded = false;
    setTimeout(function() {
      initialMacrotaskEnded = true;
    }, 0);

    el[HANDLER] = function(ev) {
      // @NOTE: this test used to be just `el.containts`, but working with path is better,
      //        because it tests whether the element was there at the time of
      //        the click, not whether it is there now, that the event has arrived
      //        to the top.
      // @NOTE: `.path` is non-standard, the standard way is `.composedPath()`
      var path = ev.path || (ev.composedPath ? ev.composedPath() : undefined);
      if (initialMacrotaskEnded && (path ? path.indexOf(el) < 0 : !el.contains(ev.target))) {
        return callback.call(vm, ev);
      }
    };

    document.documentElement.addEventListener('click', el[HANDLER], false);
  }

  function unbind(el) {
    document.documentElement.removeEventListener('click', el[HANDLER], false);
    delete el[HANDLER];
  }

  var directive$1 = {
    bind: bind$2,
    update: function(el, binding) {
      if (binding.value === binding.oldValue) return;
      bind$2(el, binding);
    },
    unbind: unbind,
  };
  var directive_1 = directive$1;

  var vueDialogDrag_umd = createCommonjsModule(function (module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
  	module.exports = factory();
  })(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
  return /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  /******/
  /******/ 		// Check if module is in cache
  /******/ 		if(installedModules[moduleId]) {
  /******/ 			return installedModules[moduleId].exports;
  /******/ 		}
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = installedModules[moduleId] = {
  /******/ 			i: moduleId,
  /******/ 			l: false,
  /******/ 			exports: {}
  /******/ 		};
  /******/
  /******/ 		// Execute the module function
  /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  /******/
  /******/ 		// Flag the module as loaded
  /******/ 		module.l = true;
  /******/
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// define getter function for harmony exports
  /******/ 	__webpack_require__.d = function(exports, name, getter) {
  /******/ 		if(!__webpack_require__.o(exports, name)) {
  /******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
  /******/ 		}
  /******/ 	};
  /******/
  /******/ 	// define __esModule on exports
  /******/ 	__webpack_require__.r = function(exports) {
  /******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  /******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  /******/ 		}
  /******/ 		Object.defineProperty(exports, '__esModule', { value: true });
  /******/ 	};
  /******/
  /******/ 	// create a fake namespace object
  /******/ 	// mode & 1: value is a module id, require it
  /******/ 	// mode & 2: merge all properties of value into the ns
  /******/ 	// mode & 4: return value when already ns object
  /******/ 	// mode & 8|1: behave like require
  /******/ 	__webpack_require__.t = function(value, mode) {
  /******/ 		if(mode & 1) value = __webpack_require__(value);
  /******/ 		if(mode & 8) return value;
  /******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
  /******/ 		var ns = Object.create(null);
  /******/ 		__webpack_require__.r(ns);
  /******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
  /******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
  /******/ 		return ns;
  /******/ 	};
  /******/
  /******/ 	// getDefaultExport function for compatibility with non-harmony modules
  /******/ 	__webpack_require__.n = function(module) {
  /******/ 		var getter = module && module.__esModule ?
  /******/ 			function getDefault() { return module['default']; } :
  /******/ 			function getModuleExports() { return module; };
  /******/ 		__webpack_require__.d(getter, 'a', getter);
  /******/ 		return getter;
  /******/ 	};
  /******/
  /******/ 	// Object.prototype.hasOwnProperty.call
  /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(__webpack_require__.s = "+xUi");
  /******/ })
  /************************************************************************/
  /******/ ({

  /***/ "+rLv":
  /***/ (function(module, exports, __webpack_require__) {

  var document = __webpack_require__("dyZX").document;
  module.exports = document && document.documentElement;


  /***/ }),

  /***/ "+xUi":
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  __webpack_require__.r(__webpack_exports__);

  // EXTERNAL MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
  var setPublicPath = __webpack_require__("HrLf");

  // CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"/var/share/vue-dialog-drag/node_modules/.cache/vue-loader","cacheIdentifier":"847cbeee-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/pug-plain-loader!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/vue-dialog-drag.vue?vue&type=template&id=1c049c8d&lang=pug&
  var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"dialog-drag",class:(!_vm.drag) ? "fixed":"",style:(_vm.dialogStyle),attrs:{"id":_vm.id,"draggable":_vm.drag},on:{"mousedown":_vm.mouseDown,"touchstart":function($event){$event.preventDefault();return _vm.touchStart($event)},"&touchmove":function($event){return _vm.touchMove($event)},"touchend":function($event){$event.stopPropagation();return _vm.touchEnd($event)}}},[_c('div',{staticClass:"dialog-header",on:{"dragstart":function($event){$event.stopPropagation();}}},[_c('div',{staticClass:"title"},[_vm._t("title",[(_vm.title)?_c('span',[_vm._v(_vm._s(_vm.title))]):_c('span',[_vm._v(" ")])])],2),_c('div',{staticClass:"buttons"},[(_vm.buttonPin)?_c('button',{staticClass:"pin",on:{"click":_vm.setDrag,"touchstart":_vm.setDrag}},[(_vm.drag)?_vm._t("button-pin"):_vm._e(),(!_vm.drag)?_vm._t("button-pinned",[(!_vm.drag)?_vm._t("button-pin"):_vm._e()]):_vm._e()],2):_vm._e(),(_vm.buttonClose)?_c('button',{staticClass:"close",on:{"click":function($event){$event.stopPropagation();return _vm.close($event)},"&touchstart":function($event){return _vm.close($event)}}},[_vm._t("button-close")],2):_vm._e()])]),_c('div',{staticClass:"dialog-body",on:{"dragstart":function($event){$event.stopPropagation();}}},[_vm._t("default",[_c('div',{staticClass:"blank-body"})])],2)])};
  var staticRenderFns = [];


  // CONCATENATED MODULE: ./src/components/vue-dialog-drag.vue?vue&type=template&id=1c049c8d&lang=pug&

  // EXTERNAL MODULE: ./node_modules/core-js/modules/es7.symbol.async-iterator.js
  var es7_symbol_async_iterator = __webpack_require__("rE2o");

  // EXTERNAL MODULE: ./node_modules/core-js/modules/es6.symbol.js
  var es6_symbol = __webpack_require__("ioFf");

  // EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
  var web_dom_iterable = __webpack_require__("rGqo");

  // CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib??vue-loader-options!./src/components/vue-dialog-drag.vue?vue&type=script&lang=js&



  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  /* harmony default export */ var vue_dialog_dragvue_type_script_lang_js_ = ({
    name: 'dialog-drag',
    props: ['id', 'title', 'options', 'eventCb'],
    data: function data() {
      return {
        width: 0,
        height: 0,
        zIndex: 0,
        offset: {
          x: 0,
          y: 0
        },
        left: 0,
        top: 0,
        buttonClose: true,
        buttonPin: true,
        dragEnabled: true,
        drag: true,
        touch: null,
        overEvent: null,
        centered: false,
        dropEnabled: true,
        dragCursor: 'default',
        dragging: false,
        clickButton: false,
        pX: 0,
        pY: 0,
        availableOptions: ['left', 'top', 'width', 'height', 'buttonPin', 'buttonClose', 'centered', 'dropEnabled', 'dragCursor', 'zIndex']
      };
    },
    created: function created() {
      this.setOptions(this.options);
    },
    mounted: function mounted() {
      if (this.dropEnabled) {
        this.$el.addEventListener('dragstart', this.dragStart);
        this.$el.addEventListener('dragend', this.dragEnd);
        window.addEventListener('dragover', this.dragOver);
      } else {
        document.addEventListener('mousemove', this.mouseMove, {
          passive: true
        });
        document.addEventListener('mouseup', this.mouseUp);
      }

      if (this.centered) {
        var vm = this;
        this.$nextTick(function () {
          vm.center();
          vm.emit('load');
        });
      } else {
        this.emit('load');
      }
    },
    beforeDestroy: function beforeDestroy() {
      if (this.dropEnabled) {
        window.removeEventListener('dragover', this.dragOver);
      } else {
        document.removeEventListener('mousemove', this.mouseMove);
        document.removeEventListener('mouseup', this.mouseUp);
      }
    },
    watch: {
      options: function options(newValue) {
        this.setOptions(newValue);
        if (newValue.centered) this.center();
      }
    },
    computed: {
      dialogStyle: function dialogStyle() {
        var style = {
          left: this.left + 'px',
          top: this.top + 'px'
        };
        if (this.width) style.width = this.width + 'px';
        if (this.height) style.height = this.height + 'px';
        if (this.zIndex) style.zIndex = this.zIndex;

        if (this.drag) {
          style['user-select'] = 'none';
          style.cursor = this.dragCursor;
        }

        return style;
      }
    },
    methods: {
      mouseOut: function mouseOut(event) {
        if (!this.dragEnabled && this.dragging) {
          this.move(event);
        }
      },
      dragOver: function dragOver(event) {
        if (this.dropEnabled) {
          this.overEvent = event;
          this.emit('move');
        }
      },
      mouseOver: function mouseOver(event) {
        setTimeout(this.mouseMove(event), 50);
      },
      close: function close() {
        this.clickButton = 'close';
        this.emit('close');
      },
      setDrag: function setDrag() {
        if (this.dragEnabled) {
          this.drag = !this.drag;
          this.emit('pin');
        }
      },
      dragStart: function dragStart(event) {
        event.stopPropagation();

        if (this.drag && this.dragEnabled && this.dropEnabled) {
          event.dataTransfer.setData('text', event.target.id);
          this.startMove(event);
        }
      },
      dragEnd: function dragEnd(event) {
        event.preventDefault();

        if (this.dropEnabled) {
          this.move(event);
          this.emit('drag-end');
        }
      },
      mouseDown: function mouseDown(event) {
        if (!this.dragging) this.focus();

        if (!this.dropEnabled) {
          if (this.drag) event.preventDefault();
          this.startMove(event);
        }
      },
      mouseMove: function mouseMove(event) {
        // event.preventDefault()
        if (!this.dropEnabled && this.dragging && this.drag) {
          // event.stopPropagation()
          setTimeout(this.move(event), 50);
        }
      },
      mouseUp: function mouseUp(event) {
        event.preventDefault();

        if (!this.dropEnabled) {
          this.stopMove();
          this.emit('dragEnd');
        }
      },
      touchStart: function touchStart(event) {
        this.emit('focus');
        this.startMove(event.targetTouches[0]);
      },
      touchMove: function touchMove(event) {
        this.move(event.targetTouches[0]);
      },
      touchEnd: function touchEnd(event) {
        this.emit('dragEnd');
        this.stopMove();
      },
      stopMove: function stopMove() {
        this.dragging = false;
        this.pX = 0;
        this.pY = 0;
      },
      emit: function emit(eventName, data) {
        data = data || {
          id: this.id,
          left: this.left,
          top: this.top,
          x: this.left,
          y: this.top,
          z: this.zIndex,
          pinned: !this.drag,
          width: this.$el.clientWidth,
          height: this.$el.clientHeight
        };

        if (this.eventCb) {
          var ef = this.eventCb;

          if (ef && typeof ef === 'function') {
            data = ef(data);
          }
        }

        this.$emit(eventName, data);
      },
      move: function move(event) {
        if (this.drag && this.dragEnabled) {
          if (event.clientX === 0) event = this.overEvent; // for firefox

          if (event && event.clientX && event.clientY) {
            var x = event.clientX;
            var y = event.clientY;
            this.left = x + this.offset.x;
            this.top = y + this.offset.y;
            this.dragging++;
            this.emit('move');
          }
        }
      },
      clearSelection: function clearSelection() {
        if (document.selection) {
          document.selection.empty();
        } else if (window.getSelection) {
          window.getSelection().removeAllRanges();
        }
      },
      startMove: function startMove(event) {
        var x = this.left - event.clientX;
        var y = this.top - event.clientY;
        this.offset = {
          x: x,
          y: y
        };
        this.dragging = 1;
        this.emit('drag-start');
      },
      focus: function focus(event) {
        if (this.drag) this.clearSelection();
        var vm = this;
        setTimeout(function () {
          if (!vm.clickButton) vm.emit('focus');
        }, 200);
      },
      center: function center() {
        var ww, wh;

        if (this.centered === 'window') {
          ww = window.innerWidth;
          wh = window.innerHeight;
        }

        if (this.centered === 'viewport') {
          var body = document.body;
          ww = body.clientWidth + body.scrollLeft;
          wh = body.clientHeight + body.scrollTop;
        }

        ww = ww || this.$parent.$el.clientWidth;
        wh = wh || this.$parent.$el.clientHeight;
        this.left = ww / 2 - this.$el.clientWidth / 2;
        this.top = wh / 2 - this.$el.clientHeight / 2;
      },
      setOptions: function setOptions(options) {
        if (options) {
          if (options.x) options.left = options.x;
          if (options.y) options.top = options.y;
          if (options.z) options.zIndex = options.z;
          this.drag = this.options.pinned ? false : this.drag; // available options

          var ops = this.availableOptions;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = ops[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var op = _step.value;

              if (this.options.hasOwnProperty(op)) {
                this.$set(this, op, this.options[op]);
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
    }
  });
  // CONCATENATED MODULE: ./src/components/vue-dialog-drag.vue?vue&type=script&lang=js&
   /* harmony default export */ var components_vue_dialog_dragvue_type_script_lang_js_ = (vue_dialog_dragvue_type_script_lang_js_); 
  // EXTERNAL MODULE: ./src/components/vue-dialog-drag.vue?vue&type=style&index=0&lang=stylus&
  var vue_dialog_dragvue_type_style_index_0_lang_stylus_ = __webpack_require__("r8ud");

  // CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
  /* globals __VUE_SSR_CONTEXT__ */

  // IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
  // This module is a runtime utility for cleaner component module output and will
  // be included in the final webpack user bundle.

  function normalizeComponent (
    scriptExports,
    render,
    staticRenderFns,
    functionalTemplate,
    injectStyles,
    scopeId,
    moduleIdentifier, /* server only */
    shadowMode /* vue-cli only */
  ) {
    // Vue.extend constructor export interop
    var options = typeof scriptExports === 'function'
      ? scriptExports.options
      : scriptExports;

    // render functions
    if (render) {
      options.render = render;
      options.staticRenderFns = staticRenderFns;
      options._compiled = true;
    }

    // functional template
    if (functionalTemplate) {
      options.functional = true;
    }

    // scopedId
    if (scopeId) {
      options._scopeId = 'data-v-' + scopeId;
    }

    var hook;
    if (moduleIdentifier) { // server build
      hook = function (context) {
        // 2.3 injection
        context =
          context || // cached call
          (this.$vnode && this.$vnode.ssrContext) || // stateful
          (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
        // 2.2 with runInNewContext: true
        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__;
        }
        // inject component styles
        if (injectStyles) {
          injectStyles.call(this, context);
        }
        // register component module identifier for async chunk inferrence
        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      };
      // used by ssr in case component is cached and beforeCreate
      // never gets called
      options._ssrRegister = hook;
    } else if (injectStyles) {
      hook = shadowMode
        ? function () { injectStyles.call(this, this.$root.$options.shadowRoot); }
        : injectStyles;
    }

    if (hook) {
      if (options.functional) {
        // for template-only hot-reload because in that case the render fn doesn't
        // go through the normalizer
        options._injectStyles = hook;
        // register for functioal component in vue file
        var originalRender = options.render;
        options.render = function renderWithStyleInjection (h, context) {
          hook.call(context);
          return originalRender(h, context)
        };
      } else {
        // inject component registration as beforeCreate hook
        var existing = options.beforeCreate;
        options.beforeCreate = existing
          ? [].concat(existing, hook)
          : [hook];
      }
    }

    return {
      exports: scriptExports,
      options: options
    }
  }

  // CONCATENATED MODULE: ./src/components/vue-dialog-drag.vue






  /* normalize component */

  var component = normalizeComponent(
    components_vue_dialog_dragvue_type_script_lang_js_,
    render,
    staticRenderFns,
    false,
    null,
    null,
    null
    
  );

  /* harmony default export */ var vue_dialog_drag = (component.exports);
  // CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


  /* harmony default export */ var entry_lib = __webpack_exports__["default"] = (vue_dialog_drag);



  /***/ }),

  /***/ "0/R4":
  /***/ (function(module, exports) {

  module.exports = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };


  /***/ }),

  /***/ "1MBn":
  /***/ (function(module, exports, __webpack_require__) {

  // all enumerable object keys, includes symbols
  var getKeys = __webpack_require__("DVgA");
  var gOPS = __webpack_require__("JiEa");
  var pIE = __webpack_require__("UqcF");
  module.exports = function (it) {
    var result = getKeys(it);
    var getSymbols = gOPS.f;
    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = pIE.f;
      var i = 0;
      var key;
      while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
    } return result;
  };


  /***/ }),

  /***/ "1TsA":
  /***/ (function(module, exports) {

  module.exports = function (done, value) {
    return { value: value, done: !!done };
  };


  /***/ }),

  /***/ "2OiF":
  /***/ (function(module, exports) {

  module.exports = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };


  /***/ }),

  /***/ "4R4u":
  /***/ (function(module, exports) {

  // IE 8- don't enum bug keys
  module.exports = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');


  /***/ }),

  /***/ "Afnz":
  /***/ (function(module, exports, __webpack_require__) {

  var LIBRARY = __webpack_require__("LQAc");
  var $export = __webpack_require__("XKFU");
  var redefine = __webpack_require__("KroJ");
  var hide = __webpack_require__("Mukb");
  var Iterators = __webpack_require__("hPIQ");
  var $iterCreate = __webpack_require__("QaDb");
  var setToStringTag = __webpack_require__("fyDq");
  var getPrototypeOf = __webpack_require__("OP3Y");
  var ITERATOR = __webpack_require__("K0xU")('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    $iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        setToStringTag(IteratorPrototype, TAG, true);
        // fix for some old engines
        if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      hide(proto, ITERATOR, $default);
    }
    // Plug for library
    Iterators[NAME] = $default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) redefine(proto, key, methods[key]);
      } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };


  /***/ }),

  /***/ "Ayid":
  /***/ (function(module, exports, __webpack_require__) {

  // extracted by mini-css-extract-plugin

  /***/ }),

  /***/ "DVgA":
  /***/ (function(module, exports, __webpack_require__) {

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  var $keys = __webpack_require__("zhAb");
  var enumBugKeys = __webpack_require__("4R4u");

  module.exports = Object.keys || function keys(O) {
    return $keys(O, enumBugKeys);
  };


  /***/ }),

  /***/ "EWmC":
  /***/ (function(module, exports, __webpack_require__) {

  // 7.2.2 IsArray(argument)
  var cof = __webpack_require__("LZWt");
  module.exports = Array.isArray || function isArray(arg) {
    return cof(arg) == 'Array';
  };


  /***/ }),

  /***/ "EemH":
  /***/ (function(module, exports, __webpack_require__) {

  var pIE = __webpack_require__("UqcF");
  var createDesc = __webpack_require__("RjD/");
  var toIObject = __webpack_require__("aCFj");
  var toPrimitive = __webpack_require__("apmT");
  var has = __webpack_require__("aagx");
  var IE8_DOM_DEFINE = __webpack_require__("xpql");
  var gOPD = Object.getOwnPropertyDescriptor;

  exports.f = __webpack_require__("nh4g") ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = toIObject(O);
    P = toPrimitive(P, true);
    if (IE8_DOM_DEFINE) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
  };


  /***/ }),

  /***/ "FJW5":
  /***/ (function(module, exports, __webpack_require__) {

  var dP = __webpack_require__("hswa");
  var anObject = __webpack_require__("y3w9");
  var getKeys = __webpack_require__("DVgA");

  module.exports = __webpack_require__("nh4g") ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = getKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) dP.f(O, P = keys[i++], Properties[P]);
    return O;
  };


  /***/ }),

  /***/ "HrLf":
  /***/ (function(module, exports, __webpack_require__) {

  // This file is imported into lib/wc client bundles.

  if (typeof window !== 'undefined') {
    var i;
    if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js$/))) {
      __webpack_require__.p = i[1]; // eslint-disable-line
    }
  }


  /***/ }),

  /***/ "Iw71":
  /***/ (function(module, exports, __webpack_require__) {

  var isObject = __webpack_require__("0/R4");
  var document = __webpack_require__("dyZX").document;
  // typeof document.createElement is 'object' in old IE
  var is = isObject(document) && isObject(document.createElement);
  module.exports = function (it) {
    return is ? document.createElement(it) : {};
  };


  /***/ }),

  /***/ "JiEa":
  /***/ (function(module, exports) {

  exports.f = Object.getOwnPropertySymbols;


  /***/ }),

  /***/ "K0xU":
  /***/ (function(module, exports, __webpack_require__) {

  var store = __webpack_require__("VTer")('wks');
  var uid = __webpack_require__("ylqs");
  var Symbol = __webpack_require__("dyZX").Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
  };

  $exports.store = store;


  /***/ }),

  /***/ "KroJ":
  /***/ (function(module, exports, __webpack_require__) {

  var global = __webpack_require__("dyZX");
  var hide = __webpack_require__("Mukb");
  var has = __webpack_require__("aagx");
  var SRC = __webpack_require__("ylqs")('src');
  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];
  var TPL = ('' + $toString).split(TO_STRING);

  __webpack_require__("g3g5").inspectSource = function (it) {
    return $toString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) has(val, 'name') || hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      hide(O, key, val);
    }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || $toString.call(this);
  });


  /***/ }),

  /***/ "Kuth":
  /***/ (function(module, exports, __webpack_require__) {

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  var anObject = __webpack_require__("y3w9");
  var dPs = __webpack_require__("FJW5");
  var enumBugKeys = __webpack_require__("4R4u");
  var IE_PROTO = __webpack_require__("YTvA")('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = __webpack_require__("Iw71")('iframe');
    var i = enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    __webpack_require__("+rLv").appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
    return createDict();
  };

  module.exports = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE] = anObject(O);
      result = new Empty();
      Empty[PROTOTYPE] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : dPs(result, Properties);
  };


  /***/ }),

  /***/ "LQAc":
  /***/ (function(module, exports) {

  module.exports = false;


  /***/ }),

  /***/ "LZWt":
  /***/ (function(module, exports) {

  var toString = {}.toString;

  module.exports = function (it) {
    return toString.call(it).slice(8, -1);
  };


  /***/ }),

  /***/ "Mukb":
  /***/ (function(module, exports, __webpack_require__) {

  var dP = __webpack_require__("hswa");
  var createDesc = __webpack_require__("RjD/");
  module.exports = __webpack_require__("nh4g") ? function (object, key, value) {
    return dP.f(object, key, createDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };


  /***/ }),

  /***/ "N8g3":
  /***/ (function(module, exports, __webpack_require__) {

  exports.f = __webpack_require__("K0xU");


  /***/ }),

  /***/ "OP3Y":
  /***/ (function(module, exports, __webpack_require__) {

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  var has = __webpack_require__("aagx");
  var toObject = __webpack_require__("S/j/");
  var IE_PROTO = __webpack_require__("YTvA")('IE_PROTO');
  var ObjectProto = Object.prototype;

  module.exports = Object.getPrototypeOf || function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO)) return O[IE_PROTO];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };


  /***/ }),

  /***/ "OnI7":
  /***/ (function(module, exports, __webpack_require__) {

  var global = __webpack_require__("dyZX");
  var core = __webpack_require__("g3g5");
  var LIBRARY = __webpack_require__("LQAc");
  var wksExt = __webpack_require__("N8g3");
  var defineProperty = __webpack_require__("hswa").f;
  module.exports = function (name) {
    var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
    if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
  };


  /***/ }),

  /***/ "QaDb":
  /***/ (function(module, exports, __webpack_require__) {

  var create = __webpack_require__("Kuth");
  var descriptor = __webpack_require__("RjD/");
  var setToStringTag = __webpack_require__("fyDq");
  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  __webpack_require__("Mukb")(IteratorPrototype, __webpack_require__("K0xU")('iterator'), function () { return this; });

  module.exports = function (Constructor, NAME, next) {
    Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
    setToStringTag(Constructor, NAME + ' Iterator');
  };


  /***/ }),

  /***/ "RYi7":
  /***/ (function(module, exports) {

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  module.exports = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };


  /***/ }),

  /***/ "RjD/":
  /***/ (function(module, exports) {

  module.exports = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };


  /***/ }),

  /***/ "S/j/":
  /***/ (function(module, exports, __webpack_require__) {

  // 7.1.13 ToObject(argument)
  var defined = __webpack_require__("vhPU");
  module.exports = function (it) {
    return Object(defined(it));
  };


  /***/ }),

  /***/ "UqcF":
  /***/ (function(module, exports) {

  exports.f = {}.propertyIsEnumerable;


  /***/ }),

  /***/ "VTer":
  /***/ (function(module, exports, __webpack_require__) {

  var core = __webpack_require__("g3g5");
  var global = __webpack_require__("dyZX");
  var SHARED = '__core-js_shared__';
  var store = global[SHARED] || (global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: core.version,
    mode: __webpack_require__("LQAc") ? 'pure' : 'global',
    copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
  });


  /***/ }),

  /***/ "XKFU":
  /***/ (function(module, exports, __webpack_require__) {

  var global = __webpack_require__("dyZX");
  var core = __webpack_require__("g3g5");
  var hide = __webpack_require__("Mukb");
  var redefine = __webpack_require__("KroJ");
  var ctx = __webpack_require__("m0Pp");
  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
      // extend global
      if (target) redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  global.core = core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  module.exports = $export;


  /***/ }),

  /***/ "YTvA":
  /***/ (function(module, exports, __webpack_require__) {

  var shared = __webpack_require__("VTer")('keys');
  var uid = __webpack_require__("ylqs");
  module.exports = function (key) {
    return shared[key] || (shared[key] = uid(key));
  };


  /***/ }),

  /***/ "Ymqv":
  /***/ (function(module, exports, __webpack_require__) {

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var cof = __webpack_require__("LZWt");
  // eslint-disable-next-line no-prototype-builtins
  module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };


  /***/ }),

  /***/ "Z6vF":
  /***/ (function(module, exports, __webpack_require__) {

  var META = __webpack_require__("ylqs")('meta');
  var isObject = __webpack_require__("0/R4");
  var has = __webpack_require__("aagx");
  var setDesc = __webpack_require__("hswa").f;
  var id = 0;
  var isExtensible = Object.isExtensible || function () {
    return true;
  };
  var FREEZE = !__webpack_require__("eeVq")(function () {
    return isExtensible(Object.preventExtensions({}));
  });
  var setMeta = function (it) {
    setDesc(it, META, { value: {
      i: 'O' + ++id, // object ID
      w: {}          // weak collections IDs
    } });
  };
  var fastKey = function (it, create) {
    // return primitive with prefix
    if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMeta(it);
    // return object ID
    } return it[META].i;
  };
  var getWeak = function (it, create) {
    if (!has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMeta(it);
    // return hash weak collections IDs
    } return it[META].w;
  };
  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
    return it;
  };
  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };


  /***/ }),

  /***/ "aCFj":
  /***/ (function(module, exports, __webpack_require__) {

  // to indexed object, toObject with fallback for non-array-like ES3 strings
  var IObject = __webpack_require__("Ymqv");
  var defined = __webpack_require__("vhPU");
  module.exports = function (it) {
    return IObject(defined(it));
  };


  /***/ }),

  /***/ "aagx":
  /***/ (function(module, exports) {

  var hasOwnProperty = {}.hasOwnProperty;
  module.exports = function (it, key) {
    return hasOwnProperty.call(it, key);
  };


  /***/ }),

  /***/ "apmT":
  /***/ (function(module, exports, __webpack_require__) {

  // 7.1.1 ToPrimitive(input [, PreferredType])
  var isObject = __webpack_require__("0/R4");
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  module.exports = function (it, S) {
    if (!isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };


  /***/ }),

  /***/ "d/Gc":
  /***/ (function(module, exports, __webpack_require__) {

  var toInteger = __webpack_require__("RYi7");
  var max = Math.max;
  var min = Math.min;
  module.exports = function (index, length) {
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  };


  /***/ }),

  /***/ "dyZX":
  /***/ (function(module, exports) {

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


  /***/ }),

  /***/ "e7yV":
  /***/ (function(module, exports, __webpack_require__) {

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  var toIObject = __webpack_require__("aCFj");
  var gOPN = __webpack_require__("kJMx").f;
  var toString = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN(it);
    } catch (e) {
      return windowNames.slice();
    }
  };

  module.exports.f = function getOwnPropertyNames(it) {
    return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
  };


  /***/ }),

  /***/ "eeVq":
  /***/ (function(module, exports) {

  module.exports = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };


  /***/ }),

  /***/ "fyDq":
  /***/ (function(module, exports, __webpack_require__) {

  var def = __webpack_require__("hswa").f;
  var has = __webpack_require__("aagx");
  var TAG = __webpack_require__("K0xU")('toStringTag');

  module.exports = function (it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
  };


  /***/ }),

  /***/ "g3g5":
  /***/ (function(module, exports) {

  var core = module.exports = { version: '2.5.7' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


  /***/ }),

  /***/ "hPIQ":
  /***/ (function(module, exports) {

  module.exports = {};


  /***/ }),

  /***/ "hswa":
  /***/ (function(module, exports, __webpack_require__) {

  var anObject = __webpack_require__("y3w9");
  var IE8_DOM_DEFINE = __webpack_require__("xpql");
  var toPrimitive = __webpack_require__("apmT");
  var dP = Object.defineProperty;

  exports.f = __webpack_require__("nh4g") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (IE8_DOM_DEFINE) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };


  /***/ }),

  /***/ "ioFf":
  /***/ (function(module, exports, __webpack_require__) {

  // ECMAScript 6 symbols shim
  var global = __webpack_require__("dyZX");
  var has = __webpack_require__("aagx");
  var DESCRIPTORS = __webpack_require__("nh4g");
  var $export = __webpack_require__("XKFU");
  var redefine = __webpack_require__("KroJ");
  var META = __webpack_require__("Z6vF").KEY;
  var $fails = __webpack_require__("eeVq");
  var shared = __webpack_require__("VTer");
  var setToStringTag = __webpack_require__("fyDq");
  var uid = __webpack_require__("ylqs");
  var wks = __webpack_require__("K0xU");
  var wksExt = __webpack_require__("N8g3");
  var wksDefine = __webpack_require__("OnI7");
  var enumKeys = __webpack_require__("1MBn");
  var isArray = __webpack_require__("EWmC");
  var anObject = __webpack_require__("y3w9");
  var isObject = __webpack_require__("0/R4");
  var toIObject = __webpack_require__("aCFj");
  var toPrimitive = __webpack_require__("apmT");
  var createDesc = __webpack_require__("RjD/");
  var _create = __webpack_require__("Kuth");
  var gOPNExt = __webpack_require__("e7yV");
  var $GOPD = __webpack_require__("EemH");
  var $DP = __webpack_require__("hswa");
  var $keys = __webpack_require__("DVgA");
  var gOPD = $GOPD.f;
  var dP = $DP.f;
  var gOPN = gOPNExt.f;
  var $Symbol = global.Symbol;
  var $JSON = global.JSON;
  var _stringify = $JSON && $JSON.stringify;
  var PROTOTYPE = 'prototype';
  var HIDDEN = wks('_hidden');
  var TO_PRIMITIVE = wks('toPrimitive');
  var isEnum = {}.propertyIsEnumerable;
  var SymbolRegistry = shared('symbol-registry');
  var AllSymbols = shared('symbols');
  var OPSymbols = shared('op-symbols');
  var ObjectProto = Object[PROTOTYPE];
  var USE_NATIVE = typeof $Symbol == 'function';
  var QObject = global.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDesc = DESCRIPTORS && $fails(function () {
    return _create(dP({}, 'a', {
      get: function () { return dP(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD(ObjectProto, key);
    if (protoDesc) delete ObjectProto[key];
    dP(it, key, D);
    if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
  } : dP;

  var wrap = function (tag) {
    var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
    sym._k = tag;
    return sym;
  };

  var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return it instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
    anObject(it);
    key = toPrimitive(key, true);
    anObject(D);
    if (has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
        D = _create(D, { enumerable: createDesc(0, false) });
      } return setSymbolDesc(it, key, D);
    } return dP(it, key, D);
  };
  var $defineProperties = function defineProperties(it, P) {
    anObject(it);
    var keys = enumKeys(P = toIObject(P));
    var i = 0;
    var l = keys.length;
    var key;
    while (l > i) $defineProperty(it, key = keys[i++], P[key]);
    return it;
  };
  var $create = function create(it, P) {
    return P === undefined ? _create(it) : $defineProperties(_create(it), P);
  };
  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum.call(this, key = toPrimitive(key, true));
    if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };
  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    it = toIObject(it);
    key = toPrimitive(key, true);
    if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
    var D = gOPD(it, key);
    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
    return D;
  };
  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN(toIObject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
    } return result;
  };
  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto;
    var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
    } return result;
  };

  // 19.4.1.1 Symbol([description])
  if (!USE_NATIVE) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
      var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
      var $set = function (value) {
        if (this === ObjectProto) $set.call(OPSymbols, value);
        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, createDesc(1, value));
      };
      if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
      return wrap(tag);
    };
    redefine($Symbol[PROTOTYPE], 'toString', function toString() {
      return this._k;
    });

    $GOPD.f = $getOwnPropertyDescriptor;
    $DP.f = $defineProperty;
    __webpack_require__("kJMx").f = gOPNExt.f = $getOwnPropertyNames;
    __webpack_require__("UqcF").f = $propertyIsEnumerable;
    __webpack_require__("JiEa").f = $getOwnPropertySymbols;

    if (DESCRIPTORS && !__webpack_require__("LQAc")) {
      redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    wksExt.f = function (name) {
      return wrap(wks(name));
    };
  }

  $export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

  for (var es6Symbols = (
    // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

  for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

  $export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = $Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
      for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
    },
    useSetter: function () { setter = true; },
    useSimple: function () { setter = false; }
  });

  $export($export.S + $export.F * !USE_NATIVE, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // 24.3.2 JSON.stringify(value [, replacer [, space]])
  $JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
    var S = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols
    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;
      while (arguments.length > i) args.push(arguments[i++]);
      $replacer = replacer = args[1];
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON, args);
    }
  });

  // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
  $Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__("Mukb")($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
  // 19.4.3.5 Symbol.prototype[@@toStringTag]
  setToStringTag($Symbol, 'Symbol');
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, 'Math', true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);


  /***/ }),

  /***/ "kJMx":
  /***/ (function(module, exports, __webpack_require__) {

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  var $keys = __webpack_require__("zhAb");
  var hiddenKeys = __webpack_require__("4R4u").concat('length', 'prototype');

  exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return $keys(O, hiddenKeys);
  };


  /***/ }),

  /***/ "m0Pp":
  /***/ (function(module, exports, __webpack_require__) {

  // optional / simple context binding
  var aFunction = __webpack_require__("2OiF");
  module.exports = function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };


  /***/ }),

  /***/ "nGyu":
  /***/ (function(module, exports, __webpack_require__) {

  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = __webpack_require__("K0xU")('unscopables');
  var ArrayProto = Array.prototype;
  if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__("Mukb")(ArrayProto, UNSCOPABLES, {});
  module.exports = function (key) {
    ArrayProto[UNSCOPABLES][key] = true;
  };


  /***/ }),

  /***/ "ne8i":
  /***/ (function(module, exports, __webpack_require__) {

  // 7.1.15 ToLength
  var toInteger = __webpack_require__("RYi7");
  var min = Math.min;
  module.exports = function (it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };


  /***/ }),

  /***/ "nh4g":
  /***/ (function(module, exports, __webpack_require__) {

  // Thank's IE8 for his funny defineProperty
  module.exports = !__webpack_require__("eeVq")(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });


  /***/ }),

  /***/ "r8ud":
  /***/ (function(module, __webpack_exports__, __webpack_require__) {
  /* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_index_js_ref_11_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_11_oneOf_1_2_node_modules_stylus_loader_index_js_ref_11_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_vue_dialog_drag_vue_vue_type_style_index_0_lang_stylus___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("Ayid");
  /* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_index_js_ref_11_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_11_oneOf_1_2_node_modules_stylus_loader_index_js_ref_11_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_vue_dialog_drag_vue_vue_type_style_index_0_lang_stylus___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_index_js_ref_11_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_11_oneOf_1_2_node_modules_stylus_loader_index_js_ref_11_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_vue_dialog_drag_vue_vue_type_style_index_0_lang_stylus___WEBPACK_IMPORTED_MODULE_0__);
  /* unused harmony reexport * */
   /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_index_js_ref_11_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_lib_index_js_ref_11_oneOf_1_2_node_modules_stylus_loader_index_js_ref_11_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_vue_dialog_drag_vue_vue_type_style_index_0_lang_stylus___WEBPACK_IMPORTED_MODULE_0___default.a); 

  /***/ }),

  /***/ "rE2o":
  /***/ (function(module, exports, __webpack_require__) {

  __webpack_require__("OnI7")('asyncIterator');


  /***/ }),

  /***/ "rGqo":
  /***/ (function(module, exports, __webpack_require__) {

  var $iterators = __webpack_require__("yt8O");
  var getKeys = __webpack_require__("DVgA");
  var redefine = __webpack_require__("KroJ");
  var global = __webpack_require__("dyZX");
  var hide = __webpack_require__("Mukb");
  var Iterators = __webpack_require__("hPIQ");
  var wks = __webpack_require__("K0xU");
  var ITERATOR = wks('iterator');
  var TO_STRING_TAG = wks('toStringTag');
  var ArrayValues = Iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
    var NAME = collections[i];
    var explicit = DOMIterables[NAME];
    var Collection = global[NAME];
    var proto = Collection && Collection.prototype;
    var key;
    if (proto) {
      if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
      if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
      Iterators[NAME] = ArrayValues;
      if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
    }
  }


  /***/ }),

  /***/ "vhPU":
  /***/ (function(module, exports) {

  // 7.2.1 RequireObjectCoercible(argument)
  module.exports = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };


  /***/ }),

  /***/ "w2a5":
  /***/ (function(module, exports, __webpack_require__) {

  // false -> Array#indexOf
  // true  -> Array#includes
  var toIObject = __webpack_require__("aCFj");
  var toLength = __webpack_require__("ne8i");
  var toAbsoluteIndex = __webpack_require__("d/Gc");
  module.exports = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };


  /***/ }),

  /***/ "xpql":
  /***/ (function(module, exports, __webpack_require__) {

  module.exports = !__webpack_require__("nh4g") && !__webpack_require__("eeVq")(function () {
    return Object.defineProperty(__webpack_require__("Iw71")('div'), 'a', { get: function () { return 7; } }).a != 7;
  });


  /***/ }),

  /***/ "y3w9":
  /***/ (function(module, exports, __webpack_require__) {

  var isObject = __webpack_require__("0/R4");
  module.exports = function (it) {
    if (!isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };


  /***/ }),

  /***/ "ylqs":
  /***/ (function(module, exports) {

  var id = 0;
  var px = Math.random();
  module.exports = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };


  /***/ }),

  /***/ "yt8O":
  /***/ (function(module, exports, __webpack_require__) {

  var addToUnscopables = __webpack_require__("nGyu");
  var step = __webpack_require__("1TsA");
  var Iterators = __webpack_require__("hPIQ");
  var toIObject = __webpack_require__("aCFj");

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  module.exports = __webpack_require__("Afnz")(Array, 'Array', function (iterated, kind) {
    this._t = toIObject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return step(1);
    }
    if (kind == 'keys') return step(0, index);
    if (kind == 'values') return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators.Arguments = Iterators.Array;

  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');


  /***/ }),

  /***/ "zhAb":
  /***/ (function(module, exports, __webpack_require__) {

  var has = __webpack_require__("aagx");
  var toIObject = __webpack_require__("aCFj");
  var arrayIndexOf = __webpack_require__("w2a5")(false);
  var IE_PROTO = __webpack_require__("YTvA")('IE_PROTO');

  module.exports = function (object, names) {
    var O = toIObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };


  /***/ })

  /******/ })["default"];
  });

  });

  var DialogDrag = unwrapExports(vueDialogDrag_umd);

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = ".loader-box {\n  display: flex;\n  justify-content: center; }\n\n.overlay-box {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  justify-content: space-evenly; }\n";
  styleInject(css);

  var css$1 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.hollow-dots-spinner, .hollow-dots-spinner * {\n  box-sizing: border-box;\n}\n\n.hollow-dots-spinner {\n  height: 15px;\n  width: calc(30px * 3);\n}\n\n.hollow-dots-spinner .dot {\n  width: 15px;\n  height: 15px;\n  margin: 0 calc(15px / 2);\n  border: calc(15px / 5) solid #ff1d5e;\n  border-radius: 50%;\n  float: left;\n  transform: scale(0);\n  animation: hollow-dots-spinner-animation 1000ms ease infinite 0ms;\n}\n\n.hollow-dots-spinner .dot:nth-child(1) {\n  animation-delay: calc(300ms * 1);\n}\n\n.hollow-dots-spinner .dot:nth-child(2) {\n  animation-delay: calc(300ms * 2);\n}\n\n.hollow-dots-spinner .dot:nth-child(3) {\n  animation-delay: calc(300ms * 3);\n\n}\n\n@keyframes hollow-dots-spinner-animation {\n  50% {\n    transform: scale(1);\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n";
  styleInject(css$1);

  var css$2 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.pixel-spinner, .pixel-spinner * {\n  box-sizing: border-box;\n}\n\n.pixel-spinner {\n  height: 70px;\n  width: 70px;\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n}\n\n.pixel-spinner .pixel-spinner-inner {\n  width: calc(70px / 7);\n  height: calc(70px / 7);\n  background-color: #ff1d5e;\n  color: #ff1d5e;\n  box-shadow: 15px 15px  0 0,\n  -15px -15px  0 0,\n  15px -15px  0 0,\n  -15px 15px  0 0,\n  0 15px  0 0,\n  15px 0  0 0,\n  -15px 0  0 0,\n  0 -15px 0 0;\n  animation: pixel-spinner-animation 2000ms linear infinite;\n}\n\n@keyframes pixel-spinner-animation {\n  50% {\n    box-shadow: 20px 20px 0px 0px,\n    -20px -20px 0px 0px,\n    20px -20px 0px 0px,\n    -20px 20px 0px 0px,\n    0px 10px 0px 0px,\n    10px 0px 0px 0px,\n    -10px 0px 0px 0px,\n    0px -10px 0px 0px;\n  }\n  75% {\n    box-shadow: 20px 20px 0px 0px,\n    -20px -20px 0px 0px,\n    20px -20px 0px 0px,\n    -20px 20px 0px 0px,\n    0px 10px 0px 0px,\n    10px 0px 0px 0px,\n    -10px 0px 0px 0px,\n    0px -10px 0px 0px;\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n";
  styleInject(css$2);

  var css$3 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.flower-spinner,  .flower-spinner * {\n  box-sizing: border-box;\n}\n\n.flower-spinner {\n  height: 70px;\n  width: 70px;\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: center;\n}\n\n.flower-spinner .dots-container {\n  height: calc(70px / 7);\n  width: calc(70px / 7);\n}\n\n.flower-spinner .smaller-dot {\n  background: #ff1d5e;\n  height: 100%;\n  width: 100%;\n  border-radius: 50%;\n  animation: flower-spinner-smaller-dot-animation 2.5s 0s infinite both;\n\n}\n\n.flower-spinner .bigger-dot {\n  background: #ff1d5e;\n  height: 100%;\n  width: 100%;\n  padding: 10%;\n  border-radius: 50%;\n  animation: flower-spinner-bigger-dot-animation 2.5s 0s infinite both;\n}\n\n@keyframes flower-spinner-bigger-dot-animation {\n  0%, 100% {\n    box-shadow: rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px;\n  }\n\n  50% {\n    transform: rotate(180deg);\n  }\n\n  25%, 75% {\n    box-shadow: rgb(255, 29, 94) 26px 0px 0px,\n    rgb(255, 29, 94) -26px 0px 0px,\n    rgb(255, 29, 94) 0px 26px 0px,\n    rgb(255, 29, 94) 0px -26px 0px,\n    rgb(255, 29, 94) 19px -19px 0px,\n    rgb(255, 29, 94) 19px 19px 0px,\n    rgb(255, 29, 94) -19px -19px 0px,\n    rgb(255, 29, 94) -19px 19px 0px;\n  }\n\n  100% {\n    transform: rotate(360deg);\n    box-shadow: rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px;\n  }\n}\n\n@keyframes flower-spinner-smaller-dot-animation {\n  0%, 100% {\n    box-shadow: rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px;\n  }\n\n  25%, 75% {\n    box-shadow: rgb(255, 29, 94) 14px 0px 0px,\n    rgb(255, 29, 94) -14px 0px 0px,\n    rgb(255, 29, 94) 0px 14px 0px,\n    rgb(255, 29, 94) 0px -14px 0px,\n    rgb(255, 29, 94) 10px -10px 0px,\n    rgb(255, 29, 94) 10px 10px 0px,\n    rgb(255, 29, 94) -10px -10px 0px,\n    rgb(255, 29, 94) -10px 10px 0px;\n  }\n\n  100% {\n    box-shadow: rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px,\n    rgb(255, 29, 94) 0px 0px 0px;\n  }\n}\n";
  styleInject(css$3);

  var css$4 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.intersecting-circles-spinner, .intersecting-circles-spinner * {\n  box-sizing: border-box;\n}\n\n.intersecting-circles-spinner {\n  height: 70px;\n  width: 70px;\n  position: relative;\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n}\n\n.intersecting-circles-spinner .spinnerBlock {\n  animation: intersecting-circles-spinners-animation 1200ms linear infinite;\n  transform-origin: center;\n  display: block;\n  height: 35px;\n  width: 35px;\n}\n\n.intersecting-circles-spinner .circle {\n  display: block;\n  border: 2px solid #ff1d5e;\n  border-radius: 50%;\n  height: 100%;\n  width: 100%;\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.intersecting-circles-spinner .circle:nth-child(1) {\n  left: 0;\n  top: 0;\n}\n\n.intersecting-circles-spinner .circle:nth-child(2) {\n  left: calc(35px * -0.36);\n  top: calc(35px * 0.2);\n}\n\n.intersecting-circles-spinner .circle:nth-child(3) {\n  left: calc(35px * -0.36);\n  top: calc(35px * -0.2);\n}\n\n.intersecting-circles-spinner .circle:nth-child(4) {\n  left: 0;\n  top: calc(35px * -0.36);\n}\n\n.intersecting-circles-spinner .circle:nth-child(5) {\n  left: calc(35px * 0.36);\n  top: calc(35px * -0.2);\n}\n\n.intersecting-circles-spinner .circle:nth-child(6) {\n  left: calc(35px * 0.36);\n  top: calc(35px * 0.2);\n}\n\n.intersecting-circles-spinner .circle:nth-child(7) {\n  left: 0;\n  top: calc(35px * 0.36);\n}\n\n@keyframes intersecting-circles-spinners-animation {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n";
  styleInject(css$4);

  var css$5 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.orbit-spinner, .orbit-spinner * {\n  box-sizing: border-box;\n}\n\n.orbit-spinner {\n  height: 55px;\n  width: 55px;\n  border-radius: 50%;\n  perspective: 800px;\n}\n\n.orbit-spinner .orbit {\n  position: absolute;\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n}\n\n.orbit-spinner .orbit:nth-child(1) {\n  left: 0%;\n  top: 0%;\n  animation: orbit-spinner-orbit-one-animation 1200ms linear infinite;\n  border-bottom: 3px solid #ff1d5e;\n}\n\n.orbit-spinner .orbit:nth-child(2) {\n  right: 0%;\n  top: 0%;\n  animation: orbit-spinner-orbit-two-animation 1200ms linear infinite;\n  border-right: 3px solid #ff1d5e;\n}\n\n.orbit-spinner .orbit:nth-child(3) {\n  right: 0%;\n  bottom: 0%;\n  animation: orbit-spinner-orbit-three-animation 1200ms linear infinite;\n  border-top: 3px solid #ff1d5e;\n}\n\n@keyframes orbit-spinner-orbit-one-animation {\n  0% {\n    transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);\n  }\n  100% {\n    transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);\n  }\n}\n\n@keyframes orbit-spinner-orbit-two-animation {\n  0% {\n    transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);\n  }\n  100% {\n    transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);\n  }\n}\n\n@keyframes orbit-spinner-orbit-three-animation {\n  0% {\n    transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);\n  }\n  100% {\n    transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);\n  }\n}\n";
  styleInject(css$5);

  var css$6 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.fingerprint-spinner, .fingerprint-spinner * {\n  box-sizing: border-box;\n}\n\n.fingerprint-spinner {\n  height: 64px;\n  width: 64px;\n  padding: 2px;\n  overflow: hidden;\n  position: relative;\n}\n\n.fingerprint-spinner .spinner-ring {\n  position: absolute;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  border-top-color: #ff1d5e;\n  animation: fingerprint-spinner-animation 1500ms cubic-bezier(0.680, -0.750, 0.265, 1.750) infinite forwards;\n  margin: auto;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  top: 0;\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(1) {\n  height: calc(60px / 9 + 0 * 60px / 9);\n  width: calc(60px / 9 + 0 * 60px / 9);\n  animation-delay: calc(50ms * 1);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(2) {\n  height: calc(60px / 9 + 1 * 60px / 9);\n  width: calc(60px / 9 + 1 * 60px / 9);\n  animation-delay: calc(50ms * 2);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(3) {\n  height: calc(60px / 9 + 2 * 60px / 9);\n  width: calc(60px / 9 + 2 * 60px / 9);\n  animation-delay: calc(50ms * 3);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(4) {\n  height: calc(60px / 9 + 3 * 60px / 9);\n  width: calc(60px / 9 + 3 * 60px / 9);\n  animation-delay: calc(50ms * 4);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(5) {\n  height: calc(60px / 9 + 4 * 60px / 9);\n  width: calc(60px / 9 + 4 * 60px / 9);\n  animation-delay: calc(50ms * 5);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(6) {\n  height: calc(60px / 9 + 5 * 60px / 9);\n  width: calc(60px / 9 + 5 * 60px / 9);\n  animation-delay: calc(50ms * 6);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(7) {\n  height: calc(60px / 9 + 6 * 60px / 9);\n  width: calc(60px / 9 + 6 * 60px / 9);\n  animation-delay: calc(50ms * 7);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(8) {\n  height: calc(60px / 9 + 7 * 60px / 9);\n  width: calc(60px / 9 + 7 * 60px / 9);\n  animation-delay: calc(50ms * 8);\n}\n\n.fingerprint-spinner .spinner-ring:nth-child(9) {\n  height: calc(60px / 9 + 8 * 60px / 9);\n  width: calc(60px / 9 + 8 * 60px / 9);\n  animation-delay: calc(50ms * 9);\n}\n\n@keyframes fingerprint-spinner-animation {\n  100% {\n    transform: rotate( 360deg );\n  }\n}\n";
  styleInject(css$6);

  var css$7 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.trinity-rings-spinner, .trinity-rings-spinner * {\n  box-sizing: border-box;\n}\n\n.trinity-rings-spinner {\n  height: 66px;\n  width: 66px;\n  padding: 3px;\n  position: relative;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-direction: row;\n  overflow: hidden;\n  box-sizing: border-box;\n}\n.trinity-rings-spinner .circle {\n  position:absolute;\n  display:block;\n  border-radius:50%;\n  border: 3px solid #ff1d5e;\n  opacity: 1;\n}\n\n.trinity-rings-spinner .circle:nth-child(1) {\n  height: 60px;\n  width: 60px;\n  animation : trinity-rings-spinner-circle1-animation 1.5s infinite linear;\n  border-width: 3px;\n}\n.trinity-rings-spinner .circle:nth-child(2) {\n  height: calc(60px * 0.65);\n  width: calc(60px * 0.65);\n  animation : trinity-rings-spinner-circle2-animation 1.5s infinite linear;\n  border-width: 2px;\n}\n.trinity-rings-spinner .circle:nth-child(3) {\n  height: calc(60px * 0.1);\n  width: calc(60px * 0.1);\n  animation:trinity-rings-spinner-circle3-animation 1.5s infinite linear;\n  border-width: 1px;\n}\n\n@keyframes trinity-rings-spinner-circle1-animation{\n  0% {\n    transform: rotateZ(20deg) rotateY(0deg);\n  }\n  100% {\n    transform: rotateZ(100deg) rotateY(360deg);\n  }\n}\n@keyframes trinity-rings-spinner-circle2-animation{\n  0% {\n    transform: rotateZ(100deg) rotateX(0deg);\n  }\n  100% {\n    transform: rotateZ(0deg) rotateX(360deg);\n  }\n}\n@keyframes trinity-rings-spinner-circle3-animation{\n  0% {\n    transform: rotateZ(100deg) rotateX(-360deg);\n  }\n  100% {\n    transform: rotateZ(-360deg) rotateX(360deg);\n  }\n}\n";
  styleInject(css$7);

  var css$8 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.fulfilling-square-spinner, .fulfilling-square-spinner * {\n  box-sizing: border-box;\n}\n\n.fulfilling-square-spinner {\n  height: 50px;\n  width: 50px;\n  position: relative;\n  border: 4px solid #ff1d5e;\n  animation: fulfilling-square-spinner-animation 4s infinite ease;\n}\n\n.fulfilling-square-spinner .spinner-inner {\n  vertical-align: top;\n  display: inline-block;\n  background-color: #ff1d5e;\n  width: 100%;\n  opacity: 1;\n  animation: fulfilling-square-spinner-inner-animation 4s infinite ease-in;\n}\n\n@keyframes fulfilling-square-spinner-animation {\n  0% {\n    transform: rotate(0deg);\n  }\n\n  25% {\n    transform: rotate(180deg);\n  }\n\n  50% {\n    transform: rotate(180deg);\n  }\n\n  75% {\n    transform: rotate(360deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes fulfilling-square-spinner-inner-animation {\n  0% {\n    height: 0%;\n  }\n\n  25% {\n    height: 0%;\n  }\n\n  50% {\n    height: 100%;\n  }\n\n  75% {\n    height: 100%;\n  }\n\n  100% {\n    height: 0%;\n  }\n}\n";
  styleInject(css$8);

  var css$9 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.circles-to-rhombuses-spinner, .circles-to-rhombuses-spinner * {\n  box-sizing: border-box;\n}\n\n.circles-to-rhombuses-spinner {\n  height: 15px;\n  width: calc( (15px + 15px * 1.125) * 3);\n  display: flex;\n  align-items: center;\n  justify-content: center\n}\n\n.circles-to-rhombuses-spinner .circle {\n  height: 15px;\n  width: 15px;\n  margin-left: calc(15px * 1.125);\n  transform: rotate(45deg);\n  border-radius: 10%;\n  border: 3px solid #ff1d5e;\n  overflow: hidden;\n  background: transparent;\n\n  animation: circles-to-rhombuses-animation 1200ms linear infinite;\n}\n\n.circles-to-rhombuses-spinner .circle:nth-child(1) {\n  animation-delay: calc(150ms * 1);\n  margin-left: 0\n}\n\n.circles-to-rhombuses-spinner .circle:nth-child(2) {\n  animation-delay: calc(150ms * 2);\n}\n\n.circles-to-rhombuses-spinner .circle:nth-child(3) {\n  animation-delay: calc(150ms * 3);\n}\n\n@keyframes circles-to-rhombuses-animation {\n  0% {\n    border-radius: 10%;\n  }\n\n  17.5% {\n    border-radius: 10%;\n  }\n\n  50% {\n    border-radius: 100%;\n  }\n\n\n  93.5% {\n    border-radius: 10%;\n  }\n\n  100% {\n    border-radius: 10%;\n  }\n}\n\n@keyframes circles-to-rhombuses-background-animation {\n  50% {\n    opacity: 0.4;\n  }\n}\n\n";
  styleInject(css$9);

  var css$10 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.semipolar-spinner, .semipolar-spinner * {\n  box-sizing: border-box;\n}\n\n.semipolar-spinner {\n  height: 65px;\n  width: 65px;\n  position: relative;\n}\n\n.semipolar-spinner .ring {\n  border-radius: 50%;\n  position: absolute;\n  border: calc(65px * 0.05) solid transparent;\n  border-top-color: #ff1d5e;\n  border-left-color: #ff1d5e;\n  animation: semipolar-spinner-animation 2s infinite;\n}\n\n.semipolar-spinner .ring:nth-child(1) {\n  height: calc(65px - 65px * 0.2 * 0);\n  width: calc(65px - 65px * 0.2 * 0);\n  top: calc(65px * 0.1 * 0);\n  left: calc(65px * 0.1 * 0);\n  animation-delay: calc(2000ms * 0.1 * 4);\n  z-index: 5;\n}\n\n.semipolar-spinner .ring:nth-child(2) {\n  height: calc(65px - 65px * 0.2 * 1);\n  width: calc(65px - 65px * 0.2 * 1);\n  top: calc(65px * 0.1 * 1);\n  left: calc(65px * 0.1 * 1);\n  animation-delay: calc(2000ms * 0.1 * 3);\n  z-index: 4;\n}\n\n.semipolar-spinner .ring:nth-child(3) {\n  height: calc(65px - 65px * 0.2 * 2);\n  width: calc(65px - 65px * 0.2 * 2);\n  top: calc(65px * 0.1 * 2);\n  left: calc(65px * 0.1 * 2);\n  animation-delay: calc(2000ms * 0.1 * 2);\n  z-index: 3;\n}\n\n.semipolar-spinner .ring:nth-child(4) {\n  height: calc(65px - 65px * 0.2 * 3);\n  width: calc(65px - 65px * 0.2 * 3);\n  top: calc(65px * 0.1 * 3);\n  left: calc(65px * 0.1 * 3);\n  animation-delay: calc(2000ms * 0.1 * 1);\n  z-index: 2;\n}\n\n.semipolar-spinner .ring:nth-child(5) {\n  height: calc(65px - 65px * 0.2 * 4);\n  width: calc(65px - 65px * 0.2 * 4);\n  top: calc(65px * 0.1 * 4);\n  left: calc(65px * 0.1 * 4);\n  animation-delay: calc(2000ms * 0.1 * 0);\n  z-index: 1;\n}\n\n@keyframes semipolar-spinner-animation {\n  50% {\n    transform: rotate(360deg) scale(0.7);\n  }\n}\n";
  styleInject(css$10);

  var css$11 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.breeding-rhombus-spinner {\n  height: 65px;\n  width: 65px;\n  position: relative;\n  transform: rotate(45deg);\n}\n\n.breeding-rhombus-spinner, .breeding-rhombus-spinner * {\n  box-sizing: border-box;\n}\n\n.breeding-rhombus-spinner .rhombus {\n  height: calc(65px / 7.5);\n  width: calc(65px / 7.5);\n  animation-duration: 2000ms;\n  top: calc(65px / 2.3077);\n  left: calc(65px / 2.3077);\n  background-color: #ff1d5e;\n  position: absolute;\n  animation-iteration-count: infinite;\n}\n\n.breeding-rhombus-spinner .rhombus:nth-child(2n+0) {\n  margin-right: 0;\n}\n\n.breeding-rhombus-spinner .rhombus.child-1 {\n  animation-name: breeding-rhombus-spinner-animation-child-1;\n  animation-delay: calc(100ms * 1);\n}\n\n.breeding-rhombus-spinner .rhombus.child-2 {\n  animation-name: breeding-rhombus-spinner-animation-child-2;\n  animation-delay: calc(100ms * 2);\n}\n\n.breeding-rhombus-spinner .rhombus.child-3 {\n  animation-name: breeding-rhombus-spinner-animation-child-3;\n  animation-delay: calc(100ms * 3);\n}\n\n.breeding-rhombus-spinner .rhombus.child-4 {\n  animation-name: breeding-rhombus-spinner-animation-child-4;\n  animation-delay: calc(100ms * 4);\n}\n\n.breeding-rhombus-spinner .rhombus.child-5 {\n  animation-name: breeding-rhombus-spinner-animation-child-5;\n  animation-delay: calc(100ms * 5);\n}\n\n.breeding-rhombus-spinner .rhombus.child-6 {\n  animation-name: breeding-rhombus-spinner-animation-child-6;\n  animation-delay: calc(100ms * 6);\n}\n\n.breeding-rhombus-spinner .rhombus.child-7 {\n  animation-name: breeding-rhombus-spinner-animation-child-7;\n  animation-delay: calc(100ms * 7);\n}\n\n.breeding-rhombus-spinner .rhombus.child-8 {\n  animation-name: breeding-rhombus-spinner-animation-child-8;\n  animation-delay: calc(100ms * 8);\n}\n\n.breeding-rhombus-spinner .rhombus.big {\n  height: calc(65px / 3);\n  width: calc(65px / 3);\n  animation-duration: 2000ms;\n  top: calc(65px / 3);\n  left: calc(65px / 3);\n  background-color: #ff1d5e;\n  animation: breeding-rhombus-spinner-animation-child-big 2s infinite;\n  animation-delay: 0.5s;\n}\n\n\n@keyframes breeding-rhombus-spinner-animation-child-1 {\n  50% {\n    transform: translate(-325%, -325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-2 {\n  50% {\n    transform: translate(0, -325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-3 {\n  50% {\n    transform: translate(325%, -325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-4 {\n  50% {\n    transform: translate(325%, 0);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-5 {\n  50% {\n    transform: translate(325%, 325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-6 {\n  50% {\n    transform: translate(0, 325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-7 {\n  50% {\n    transform: translate(-325%, 325%);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-8 {\n  50% {\n    transform: translate(-325%, 0);\n  }\n}\n\n@keyframes breeding-rhombus-spinner-animation-child-big {\n  50% {\n    transform: scale(0.5);\n  }\n}\n";
  styleInject(css$11);

  var css$12 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.swapping-squares-spinner, .swapping-squares-spinner * {\n  box-sizing: border-box;\n}\n\n.swapping-squares-spinner {\n  height: 65px;\n  width: 65px;\n  position: relative;\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n}\n\n.swapping-squares-spinner .square {\n  height: calc(65px * 0.25 / 1.3);\n  width:  calc(65px * 0.25 / 1.3);\n  animation-duration: 1000ms;\n  border: calc(65px * 0.04 / 1.3) solid #ff1d5e;\n  margin-right: auto;\n  margin-left: auto;\n  position: absolute;\n  animation-iteration-count: infinite;\n}\n\n.swapping-squares-spinner .square:nth-child(1) {\n  animation-name: swapping-squares-animation-child-1;\n  animation-delay: 500ms;\n}\n\n.swapping-squares-spinner .square:nth-child(2) {\n  animation-name: swapping-squares-animation-child-2;\n  animation-delay: 0ms;\n}\n\n.swapping-squares-spinner .square:nth-child(3) {\n  animation-name: swapping-squares-animation-child-3;\n  animation-delay: 500ms;\n}\n\n.swapping-squares-spinner .square:nth-child(4) {\n  animation-name: swapping-squares-animation-child-4;\n  animation-delay: 0ms;\n}\n\n@keyframes swapping-squares-animation-child-1 {\n  50% {\n    transform: translate(150%,150%) scale(2,2);\n  }\n}\n\n@keyframes swapping-squares-animation-child-2 {\n  50% {\n    transform: translate(-150%,150%) scale(2,2);\n  }\n}\n\n@keyframes swapping-squares-animation-child-3 {\n  50% {\n    transform: translate(-150%,-150%) scale(2,2);\n  }\n}\n\n@keyframes swapping-squares-animation-child-4 {\n  50% {\n    transform: translate(150%,-150%) scale(2,2);\n  }\n}\n";
  styleInject(css$12);

  var css$13 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.scaling-squares-spinner, .scaling-squares-spinner * {\n  box-sizing: border-box;\n}\n\n.scaling-squares-spinner {\n  height: 65px;\n  width: 65px;\n  position: relative;\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: center;\n  animation: scaling-squares-animation 1250ms;\n  animation-iteration-count: infinite;\n  transform: rotate(0deg);\n}\n\n.scaling-squares-spinner .square {\n  height: calc(65px * 0.25 / 1.3);\n  width: calc(65px * 0.25 / 1.3);\n  margin-right: auto;\n  margin-left: auto;\n  border: calc(65px * 0.04 / 1.3) solid #ff1d5e;\n  position: absolute;\n  animation-duration: 1250ms;\n  animation-iteration-count: infinite;\n}\n\n.scaling-squares-spinner .square:nth-child(1) {\n  animation-name: scaling-squares-spinner-animation-child-1;\n}\n\n.scaling-squares-spinner .square:nth-child(2) {\n  animation-name: scaling-squares-spinner-animation-child-2;\n}\n\n.scaling-squares-spinner .square:nth-child(3) {\n  animation-name: scaling-squares-spinner-animation-child-3;\n}\n\n.scaling-squares-spinner .square:nth-child(4) {\n  animation-name: scaling-squares-spinner-animation-child-4;\n}\n\n\n@keyframes scaling-squares-animation {\n\n  50% {\n    transform: rotate(90deg);\n  }\n\n  100% {\n    transform: rotate(180deg);\n  }\n}\n\n@keyframes scaling-squares-spinner-animation-child-1 {\n  50% {\n    transform: translate(150%,150%) scale(2,2);\n  }\n}\n\n@keyframes scaling-squares-spinner-animation-child-2 {\n  50% {\n    transform: translate(-150%,150%) scale(2,2);\n  }\n}\n\n@keyframes scaling-squares-spinner-animation-child-3 {\n  50% {\n    transform: translate(-150%,-150%) scale(2,2);\n  }\n}\n\n@keyframes scaling-squares-spinner-animation-child-4 {\n  50% {\n    transform: translate(150%,-150%) scale(2,2);\n  }\n}\n";
  styleInject(css$13);

  var css$14 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.fulfilling-bouncing-circle-spinner, .fulfilling-bouncing-circle-spinner * {\n  box-sizing: border-box;\n}\n\n.fulfilling-bouncing-circle-spinner {\n  height: 60px;\n  width: 60px;\n  position: relative;\n  animation: fulfilling-bouncing-circle-spinner-animation infinite 4000ms ease;\n}\n\n.fulfilling-bouncing-circle-spinner .orbit {\n  height: 60px;\n  width: 60px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  border-radius: 50%;\n  border: calc(60px * 0.03) solid #ff1d5e;\n  animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite 4000ms ease;\n}\n\n.fulfilling-bouncing-circle-spinner .circle {\n  height: 60px;\n  width: 60px;\n  color: #ff1d5e;\n  display: block;\n  border-radius: 50%;\n  position: relative;\n  border: calc(60px * 0.1) solid #ff1d5e;\n  animation: fulfilling-bouncing-circle-spinner-circle-animation infinite 4000ms ease;\n  transform: rotate(0deg) scale(1);\n}\n\n@keyframes fulfilling-bouncing-circle-spinner-animation {\n  0% {\n    transform: rotate(0deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes fulfilling-bouncing-circle-spinner-orbit-animation {\n  0% {\n    transform: scale(1);\n  }\n  50% {\n    transform: scale(1);\n  }\n  62.5% {\n    transform: scale(0.8);\n  }\n  75% {\n    transform: scale(1);\n  }\n  87.5% {\n    transform: scale(0.8);\n  }\n  100% {\n    transform: scale(1);\n  }\n}\n\n@keyframes fulfilling-bouncing-circle-spinner-circle-animation {\n  0% {\n    transform: scale(1);\n    border-color: transparent;\n    border-top-color: inherit;\n  }\n  16.7% {\n    border-color: transparent;\n    border-top-color: initial;\n    border-right-color: initial;\n  }\n  33.4% {\n    border-color: transparent;\n    border-top-color: inherit;\n    border-right-color: inherit;\n    border-bottom-color: inherit;\n  }\n  50% {\n    border-color: inherit;\n    transform: scale(1);\n  }\n  62.5% {\n    border-color: inherit;\n    transform: scale(1.4);\n  }\n  75% {\n    border-color: inherit;\n    transform: scale(1);\n    opacity: 1;\n  }\n  87.5% {\n    border-color: inherit;\n    transform: scale(1.4);\n  }\n  100% {\n    border-color: transparent;\n    border-top-color: inherit;\n    transform: scale(1);\n  }\n}\n";
  styleInject(css$14);

  var FulfillingBouncingCircleSpinner = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"fulfilling-bouncing-circle-spinner",style:(_vm.spinnerStyle)},[_c('div',{staticClass:"circle",style:(_vm.circleStyle)}),_vm._v(" "),_c('div',{staticClass:"orbit",style:(_vm.orbitStyle)})])},staticRenderFns: [],_scopeId: 'data-v-dd350904',
    name: 'FulfillingBouncingCircleSpinner',

    props: {
      animationDuration: {
        type: Number,
        default: 4000
      },
      size: {
        type: Number,
        default: 60
      },
      color: {
        type: String,
        default: '#fff'
      }
    },

    computed: {
      spinnerStyle () {
        return {
          height: `${this.size}px`,
          width: `${this.size}px`,
          animationDuration: `${this.animationDuration}ms`
        }
      },

      orbitStyle () {
        return {
          height: `${this.size}px`,
          width: `${this.size}px`,
          borderColor: this.color,
          borderWidth: `${this.size * 0.03}px`,
          animationDuration: `${this.animationDuration}ms`
        }
      },

      circleStyle () {
        return {
          height: `${this.size}px`,
          width: `${this.size}px`,
          borderColor: this.color,
          color: this.color,
          borderWidth: `${this.size * 0.1}px`,
          animationDuration: `${this.animationDuration}ms`
        }
      }
    }
  }

  var css$15 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.radar-spinner, .radar-spinner * {\n  box-sizing: border-box;\n}\n\n.radar-spinner {\n  height: 60px;\n  width: 60px;\n  position: relative;\n}\n\n.radar-spinner .circle {\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  top: 0;\n  left: 0;\n  animation: radar-spinner-animation 2s infinite;\n}\n\n.radar-spinner .circle:nth-child(1) {\n  padding: calc(60px * 5 * 2 * 0 / 110);\n  animation-delay: 300ms;\n}\n\n.radar-spinner .circle:nth-child(2) {\n  padding: calc(60px * 5 * 2 * 1 / 110);\n  animation-delay: 300ms;\n}\n\n.radar-spinner .circle:nth-child(3) {\n  padding: calc(60px * 5 * 2 * 2 / 110);\n  animation-delay: 300ms;\n}\n\n.radar-spinner .circle:nth-child(4) {\n  padding: calc(60px * 5 * 2 * 3 / 110);\n  animation-delay: 0ms;\n}\n\n.radar-spinner .circle-inner, .radar-spinner .circle-inner-container {\n  height: 100%;\n  width: 100%;\n  border-radius: 50%;\n  border: calc(60px * 5 / 110) solid transparent;\n}\n\n.radar-spinner .circle-inner {\n  border-left-color: #ff1d5e;\n  border-right-color: #ff1d5e;\n}\n\n@keyframes radar-spinner-animation {\n  50% {\n    transform: rotate(180deg);\n  }\n  100% {\n    transform: rotate(0deg);\n  }\n}\n";
  styleInject(css$15);

  var css$16 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.self-building-square-spinner, .self-building-square-spinner * {\n  box-sizing: border-box;\n}\n\n.self-building-square-spinner {\n  height: 40px;\n  width: 40px;\n  top: calc( -10px * 2 / 3);\n}\n\n.self-building-square-spinner .square {\n  height: 10px;\n  width: 10px;\n  top: calc( -10px * 2 / 3);\n  margin-right: calc(10px / 3);\n  margin-top: calc(10px / 3);\n  background: #ff1d5e;\n  float: left;\n  position:relative;\n  opacity: 0;\n  animation: self-building-square-spinner 6s infinite;\n}\n\n.self-building-square-spinner .square:nth-child(1) {\n  animation-delay: calc(300ms * 6);\n}\n\n.self-building-square-spinner .square:nth-child(2) {\n  animation-delay: calc(300ms * 7);\n}\n\n.self-building-square-spinner .square:nth-child(3) {\n  animation-delay: calc(300ms * 8);\n}\n\n.self-building-square-spinner .square:nth-child(4) {\n  animation-delay: calc(300ms * 3);\n}\n\n.self-building-square-spinner .square:nth-child(5) {\n  animation-delay: calc(300ms * 4);\n}\n\n.self-building-square-spinner .square:nth-child(6) {\n  animation-delay: calc(300ms * 5);\n}\n\n.self-building-square-spinner .square:nth-child(7) {\n  animation-delay: calc(300ms * 0);\n}\n\n.self-building-square-spinner .square:nth-child(8) {\n  animation-delay: calc(300ms * 1);\n}\n\n.self-building-square-spinner .square:nth-child(9) {\n  animation-delay: calc(300ms * 2);\n}\n\n.self-building-square-spinner .clear{\n  clear: both;\n}\n\n@keyframes self-building-square-spinner {\n  0% {\n    opacity: 0;\n  }\n  5% {\n    opacity: 1;\n    top: 0;\n  }\n  50.9% {\n    opacity: 1;\n    top: 0;\n  }\n  55.9% {\n    opacity: 0;\n    top: inherit;\n  }\n}\n";
  styleInject(css$16);

  var css$17 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.spring-spinner, .spring-spinner * {\n  box-sizing: border-box;\n}\n\n.spring-spinner {\n  height: 60px;\n  width: 60px;\n}\n\n.spring-spinner .spring-spinner-part {\n  overflow: hidden;\n  height: calc(60px / 2);\n  width: 60px;\n}\n\n.spring-spinner  .spring-spinner-part.bottom {\n  transform: rotate(180deg) scale(-1, 1);\n}\n\n.spring-spinner .spring-spinner-rotator {\n  width: 60px;\n  height: 60px;\n  border: calc(60px / 7) solid transparent;\n  border-right-color: #ff1d5e;\n  border-top-color: #ff1d5e;\n  border-radius: 50%;\n  box-sizing: border-box;\n  animation: spring-spinner-animation 3s ease-in-out infinite;\n  transform: rotate(-200deg);\n}\n\n@keyframes spring-spinner-animation {\n  0% {\n    border-width: calc(60px / 7);\n  }\n  25% {\n    border-width: calc(60px / 23.33);\n  }\n  50% {\n    transform: rotate(115deg);\n    border-width: calc(60px / 7);\n  }\n  75% {\n    border-width: calc(60px / 23.33);\n  }\n  100% {\n    border-width: calc(60px / 7);\n  }\n}\n";
  styleInject(css$17);

  var css$18 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.looping-rhombuses-spinner, .looping-rhombuses-spinner * {\n  box-sizing: border-box;\n}\n\n.looping-rhombuses-spinner {\n  width: calc(15px * 4);\n  height: 15px;\n  position: relative;\n}\n\n.looping-rhombuses-spinner .rhombus {\n  height: 15px;\n  width: 15px;\n  background-color: #ff1d5e;\n  left: calc(15px * 4);\n  position: absolute;\n  margin: 0 auto;\n  border-radius: 2px;\n  transform: translateY(0) rotate(45deg) scale(0);\n  animation: looping-rhombuses-spinner-animation 2500ms linear infinite;\n}\n\n.looping-rhombuses-spinner .rhombus:nth-child(1) {\n  animation-delay: calc(2500ms * 1 / -1.5);\n}\n\n.looping-rhombuses-spinner .rhombus:nth-child(2) {\n  animation-delay: calc(2500ms * 2 / -1.5);\n}\n\n.looping-rhombuses-spinner .rhombus:nth-child(3) {\n  animation-delay: calc(2500ms * 3 / -1.5);\n}\n\n@keyframes looping-rhombuses-spinner-animation {\n  0% {\n    transform: translateX(0) rotate(45deg) scale(0);\n  }\n  50% {\n    transform: translateX(-233%) rotate(45deg) scale(1);\n  }\n  100% {\n    transform: translateX(-466%) rotate(45deg) scale(0);\n  }\n}\n";
  styleInject(css$18);

  var css$19 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.half-circle-spinner, .half-circle-spinner * {\n  box-sizing: border-box;\n}\n\n.half-circle-spinner {\n  width: 60px;\n  height: 60px;\n  border-radius: 100%;\n  position: relative;\n}\n\n.half-circle-spinner .circle {\n  content: \"\";\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  border-radius: 100%;\n  border: calc(60px / 10) solid transparent;\n}\n\n.half-circle-spinner .circle.circle-1 {\n  border-top-color: #ff1d5e;\n  animation: half-circle-spinner-animation 1s infinite;\n}\n\n.half-circle-spinner .circle.circle-2 {\n  border-bottom-color: #ff1d5e;\n  animation: half-circle-spinner-animation 1s infinite alternate;\n}\n\n@keyframes half-circle-spinner-animation {\n  0% {\n    transform: rotate(0deg);\n\n  }\n  100%{\n    transform: rotate(360deg);\n  }\n}\n";
  styleInject(css$19);

  var css$20 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.atom-spinner, .atom-spinner * {\n  box-sizing: border-box;\n}\n\n.atom-spinner {\n  height: 60px;\n  width: 60px;\n  overflow: hidden;\n}\n\n.atom-spinner .spinner-inner {\n  position: relative;\n  display: block;\n  height: 100%;\n  width: 100%;\n}\n\n.atom-spinner .spinner-circle {\n  display: block;\n  position: absolute;\n  color: #ff1d5e;\n  font-size: calc(60px * 0.24);\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n.atom-spinner .spinner-line {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  animation-duration: 1s;\n  border-left-width: calc(60px / 25);\n  border-top-width: calc(60px / 25);\n  border-left-color: #ff1d5e;\n  border-left-style: solid;\n  border-top-style: solid;\n  border-top-color: transparent;\n}\n\n.atom-spinner .spinner-line:nth-child(1) {\n  animation: atom-spinner-animation-1 1s linear infinite;\n  transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);\n}\n\n.atom-spinner .spinner-line:nth-child(2) {\n  animation: atom-spinner-animation-2 1s linear infinite;\n  transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);\n}\n\n.atom-spinner .spinner-line:nth-child(3) {\n  animation: atom-spinner-animation-3 1s linear infinite;\n  transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);\n}\n\n@keyframes atom-spinner-animation-1 {\n  100% {\n    transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);\n  }\n}\n\n@keyframes atom-spinner-animation-2 {\n  100% {\n    transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);\n  }\n}\n\n@keyframes atom-spinner-animation-3 {\n  100% {\n    transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);\n  }\n}\n\n\n";
  styleInject(css$20);

  var PopupSpinner = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('modal',{staticStyle:{"opacity":"1.0"},attrs:{"name":"popup-spinner","height":_vm.modalHeight,"width":_vm.modalWidth,"click-to-close":false},on:{"before-open":_vm.beforeOpen,"before-close":_vm.beforeClose}},[_c('div',{staticClass:"overlay-box"},[_c('div',{staticClass:"loader-box"},[_c('fulfilling-bouncing-circle-spinner',{attrs:{"color":_vm.color,"size":_vm.spinnerSize,"animation-duration":2000}})],1),_vm._v(" "),(_vm.title !== '')?_c('div',{style:(_vm.titleStyle)},[_vm._v(" "+_vm._s(_vm.title)+" ")]):_vm._e(),_vm._v(" "),(_vm.hasCancelButton)?_c('div',{staticStyle:{"padding":"13px"}},[_c('button',{style:(_vm.cancelButtonStyle),on:{"click":_vm.cancel}},[_vm._v("Cancel")])]):_vm._e()])])},staticRenderFns: [],_scopeId: 'data-v-3515e57d',
    name: 'PopupSpinner',

    components: {
      FulfillingBouncingCircleSpinner 
    },
    
    props: {
      loading: {
        type: Boolean,
        default: true
      },
     title: {
        type: String,
        default: ''      
      },
      hasCancelButton: {
        type: Boolean,
        default: false      
      }, 
      color: {
        type: String,
        default: '#0000ff'
      },
      size: {
        type: String,
        default: '50px'
      },
      margin: {
        type: String,
        default: '2px'
      },
      padding: {
        type: String,
        default: '15px'      
      },
      radius: {
        type: String,
        default: '100%'
      }
    },
    
    data() {
      return {
        titleStyle: {
          textAlign: 'center'
        },
        cancelButtonStyle: {
          padding: '2px'
        },          
        opened: false
      }
    },
    
    beforeMount() {
      // Create listener for start event.
      EventBus.$on('spinner:start', () => {
        this.show();
      });
      
      // Create listener for stop event.
      EventBus.$on('spinner:stop', () => {
        this.hide();
      });      
    },
    
    computed: {
      spinnerSize(){
        return parseFloat(this.size) - 25; 
      },
      modalHeight() {
        // Start with the height of the spinner wrapper.
        let fullHeight = parseFloat(this.size) + 2 * parseFloat(this.padding); 
        
        // If there is a title there, add space for the text.
        if (this.title !== '') {
          fullHeight = fullHeight + 20 + parseFloat(this.padding);        
        }
        
        // If there is a cancel button there, add space for it.
        if (this.hasCancelButton) {
          fullHeight = fullHeight + 20 + parseFloat(this.padding);
        }
        
        return fullHeight + 'px'
      },
      
      modalWidth() {
        return parseFloat(this.size) + 2 * parseFloat(this.padding) + 'px'
      },
    }, 
    
    methods: {
      beforeOpen() {
        window.addEventListener('keyup', this.onKey);
        this.opened = true;
      }, 
      
      beforeClose() {
        window.removeEventListener('keyup', this.onKey);
        this.opened = false;
      }, 
      
      onKey(event) {
        if (event.keyCode == 27) {
          console.log('Exited spinner through Esc key');
          this.cancel();
        }
      }, 
      
      cancel() {
        this.$emit('spinner-cancel');
        this.hide();      
      },
      
      show() {
        this.$modal.show('popup-spinner'); // Bring up the spinner modal.
      },
      
      hide() {
        this.$modal.hide('popup-spinner'); // Dispel the spinner modal.
      }
    }

  }

  var css$21 = ".list-item {\n  display: inline-block;\n  margin-right: 10px; }\n\n.list-enter-active,\n.list-leave-active {\n  transition: all 1s; }\n\n.list-enter,\n.list-leave-to {\n  opacity: 0;\n  transform: translateY(-30px); }\n";
  styleInject(css$21);

  var css$22 = ".fade-enter-active,\n.fade-leave-active {\n  transition: opacity .3s; }\n\n.fade-enter,\n.fade-leave-to {\n  opacity: 0; }\n\n.close-button,\n.close-button:hover {\n  background: none;\n  line-height: 0em;\n  padding: 5px 5px;\n  margin-left: 10px;\n  border-radius: 3px; }\n\n.close-button:hover {\n  background: #ffffff63;\n  color: #737373; }\n\n.alert {\n  border: 0;\n  border-radius: 0;\n  color: #FFFFFF;\n  padding: 20px 15px;\n  font-size: 14px;\n  z-index: 100;\n  display: inline-block;\n  position: fixed;\n  transition: all 0.5s ease-in-out; }\n  .container .alert {\n    border-radius: 4px; }\n  .alert.center {\n    left: 0px;\n    right: 0px;\n    margin: 0 auto; }\n  .alert.left {\n    left: 20px; }\n  .alert.right {\n    right: 20px; }\n  .container .alert {\n    border-radius: 0px; }\n  .alert .alert-icon {\n    font-size: 30px;\n    margin-right: 5px; }\n  .alert .close ~ span {\n    display: inline-block;\n    max-width: 89%; }\n  .alert[data-notify=\"container\"] {\n    padding: 0;\n    border-radius: 2px; }\n  .alert span[data-notify=\"icon\"] {\n    font-size: 30px;\n    display: block;\n    left: 15px;\n    position: absolute;\n    top: 50%;\n    margin-top: -20px; }\n\n.alert-info {\n  background-color: #7CE4FE;\n  color: #3091B2; }\n\n.alert-success {\n  background-color: #008800;\n  color: #fff; }\n\n.alert-warning {\n  background-color: #e29722;\n  color: #fff; }\n\n.alert-danger {\n  background-color: #FF8F5E;\n  color: #B33C12; }\n\n.message-box {\n  font-size: 15px;\n  align-content: center;\n  max-width: 400px;\n  min-width: 150px;\n  padding-left: 10px;\n  flex-grow: 1; }\n\n.message-box .message {\n  line-height: 1.5em;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  width: 100%; }\n\n.notification-box {\n  display: flex;\n  justify-content: flex-start;\n  padding: 10px 15px; }\n\n.notification-box > div {\n  align-self: center; }\n\n.btn__trans {\n  font-size: 18px;\n  color: white;\n  background-color: transparent;\n  background-repeat: no-repeat;\n  border: none;\n  cursor: pointer;\n  overflow: hidden;\n  background-image: none;\n  outline: none; }\n";
  styleInject(css$22);

  var css$23 = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n \n@import \"https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css\";\n";
  styleInject(css$23);

  var Notification = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"alert open alert-with-icon",class:[_vm.verticalAlign, _vm.horizontalAlign, _vm.alertType],style:(_vm.customPosition),attrs:{"role":"alert","data-notify":"container","data-notify-position":"top-center"}},[_c('div',{staticClass:"notification-box"},[_c('div',[_c('span',{staticClass:"alert-icon",class:_vm.icon,attrs:{"data-notify":"message"}})]),_vm._v(" "),_c('div',{staticClass:"message-box"},[_c('div',{staticClass:"message",attrs:{"data-notify":"message"},domProps:{"innerHTML":_vm._s(_vm.message)}})]),_vm._v(" "),_c('div',[_c('button',{staticClass:"btn__trans close-button",attrs:{"aria-hidden":"true","data-notify":"dismiss"},on:{"click":_vm.close}},[_c('i',{staticClass:"ti-close"})])])])])},staticRenderFns: [],_scopeId: 'data-v-9084a0ca',
    name: 'notification',
    props: {
      message: String,
      icon: {
        type: String,
        default: 'ti-info-alt'
      },
      verticalAlign: {
        type: String,
        default: 'top'
      },
      horizontalAlign: {
        type: String,
        default: 'right'
      },
      type: {
        type: String,
        default: 'info'
      },
      timeout: {
        type: Number,
        default: 2000
      },
      timestamp: {
        type: Date,
        default: () => new Date()
      },      
    },
    data () {
      return {}
    },
    computed: {
      hasIcon () {
        return this.icon && this.icon.length > 0
      },
      alertType () {
        return `alert-${this.type}`
      },
      customPosition () {
        let initialMargin = 20;
        let alertHeight = 60;
        let sameAlertsCount = this.$notifications.state.filter((alert) => {
          return alert.horizontalAlign === this.horizontalAlign && alert.verticalAlign === this.verticalAlign
        }).length;
        let pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
        let styles = {};
        if (this.verticalAlign === 'top') {
          styles.top = `${pixels}px`;
        } else {
          styles.bottom = `${pixels}px`;
        }
        return styles
      }
    },
    methods: {
      close () {
        this.$parent.$emit('on-close', this.timestamp);  
      }
    },
    mounted () {
      if (this.timeout) {
        setTimeout(this.close, this.timeout);
      }
    }
  }

  var Notifications = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"notifications"},[_c('transition-group',{attrs:{"name":"list"},on:{"on-close":_vm.removeNotification}},_vm._l((_vm.notifications),function(notification,index){return _c('notification',{key:index,attrs:{"message":notification.message,"icon":notification.icon,"type":notification.type,"vertical-align":notification.verticalAlign,"horizontal-align":notification.horizontalAlign,"timeout":notification.timeout,"timestamp":notification.timestamp}})}))],1)},staticRenderFns: [],
    components: {
      Notification
    },
    data () {
      return {
        notifications: this.$notifications.state
      }
    },
    methods: {
      removeNotification (timestamp) {
        this.$notifications.removeNotification(timestamp);
      },
      
      clearAllNotifications () {
        this.$notifications.clear();
      }
    }
  }

  var css$24 = ".dropdown-toggle {\n  cursor: pointer;\n  display: flex;\n  justify-content: space-evenly;\n  text-transform: initial; }\n\n.dropdown-toggle:after {\n  position: absolute;\n  right: 10px;\n  top: 50%;\n  margin-top: -2px; }\n\n.dropdown-menu {\n  margin-top: 20px; }\n";
  styleInject(css$24);

  var Dropdown = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{directives:[{name:"click-outside",rawName:"v-click-outside",value:(_vm.closeDropDown),expression:"closeDropDown"}],staticClass:"dropdown",class:{open:_vm.isOpen}},[_c('a',{staticClass:"dropdown-toggle btn-rotate",style:(_vm.style),attrs:{"href":"javascript:void(0)","data-toggle":"dropdown"},on:{"click":_vm.toggleDropDown}},[_vm._t("title",[_c('i',{class:_vm.icon}),_vm._v(" "),_c('div',{staticClass:"dropdown-title"},[_vm._v(_vm._s(_vm.title)+" "),_c('b',{staticClass:"caret"})])])],2),_vm._v(" "),_c('ul',{staticClass:"dropdown-menu"},[_vm._t("default")],2)])},staticRenderFns: [],
    props: {
      title: String,
      icon: String,
      width: {
        type: String,
        default: "170px"
      },
    },
    data () {
      return {
        isOpen: false
      }
    },
    computed: {
      style () {
        return 'width: ' + this.width;
      }
    },
    methods: {
      toggleDropDown () {
        this.isOpen = !this.isOpen;
      },
      closeDropDown () {
        this.isOpen = false;
      }
    }
  }

  const NotificationStore = {
    state: [],

    // here the notifications will be added
    removeNotification(timestamp) {
      const indexToDelete = this.state.findIndex(n => n.timestamp === timestamp);

      if (indexToDelete !== -1) {
        this.state.splice(indexToDelete, 1);
      }
    },

    notify(notification) {
      // Create a timestamp to serve as a unique ID for the notification.
      notification.timestamp = new Date();
      notification.timestamp.setMilliseconds(notification.timestamp.getMilliseconds() + this.state.length);
      this.state.push(notification);
    },

    clear() {
      // This removes all of them in a way that the GUI keeps up.
      while (this.state.length > 0) {
        this.removeNotification(this.state[0].timestamp);
      }
    }

  };

  function setupSpinner(Vue) {
    // Create the global $spinner functions the user can call 
    // from inside any component.
    Vue.prototype.$spinner = {
      start() {
        // Send a start event to the bus.
        EventBus.$emit('spinner:start');
      },

      stop() {
        // Send a stop event to the bus.
        EventBus.$emit('spinner:stop');
      }

    };
  }

  function setupNotifications(Vue) {
    Object.defineProperty(Vue.prototype, '$notifications', {
      get() {
        return NotificationStore;
      }

    });
  }

  function setupProgressBar(Vue, options) {
    Vue.use(vueProgressbar, options);
  }

  function install(Vue, options = {}) {
    Vue.use(VModal);

    if (!options.notifications || !options.notifications.disabled) {
      setupNotifications(Vue);
      Vue.component('Notifications', Notifications);
    }

    if ((!options.spinner || !options.spinner.disabled) && !this.spinnerInstalled) {
      this.spinnerInstalled = true;
      setupSpinner(Vue);
      Vue.component('PopupSpinner', PopupSpinner);
    }

    if (!options.progressbar || !options.progressbar.disabled) {
      var progressbarOptions = options.progressbar ? options.progressbar.options : {};
      setupProgressBar(Vue, progressbarOptions);
    }

    Vue.component('Dropdown', Dropdown);
    Vue.component('DialogDrag', DialogDrag);
    Vue.directive('click-outside', directive_1);
  } // Automatic installation if Vue has been added to the global scope.


  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use({
      install
    });
  }

  var ScirisVue = {
    install
  };

  const rpc = rpcs.rpc;
  const download = rpcs.download;
  const upload = rpcs.upload;
  const succeed$1 = status.succeed;
  const fail$1 = status.fail;
  const start$1 = status.start;
  const updateSets$1 = shared.updateSets;
  const exportGraphs$1 = shared.exportGraphs;
  const exportResults$1 = shared.exportResults;
  const placeholders$1 = graphs.placeholders;
  const clearGraphs$1 = graphs.clearGraphs;
  const getPlotOptions$1 = graphs.getPlotOptions;
  const togglePlotControls$1 = graphs.togglePlotControls;
  const makeGraphs$1 = graphs.makeGraphs;
  const reloadGraphs$1 = graphs.reloadGraphs;
  const scaleFigs$1 = graphs.scaleFigs;
  const showBrowserWindowSize$1 = graphs.showBrowserWindowSize;
  const addListener$1 = graphs.addListener;
  const onMouseUpdate$1 = graphs.onMouseUpdate;
  const createDialogs$1 = graphs.createDialogs;
  const newDialog$1 = graphs.newDialog;
  const findDialog$1 = graphs.findDialog;
  const maximize$1 = graphs.maximize;
  const minimize$1 = graphs.minimize;
  const getTaskResultWaiting$1 = tasks.getTaskResultWaiting;
  const getTaskResultPolling$1 = tasks.getTaskResultPolling;
  const loginCall$1 = user.loginCall;
  const logoutCall$1 = user.logoutCall;
  const getCurrentUserInfo$1 = user.getCurrentUserInfo;
  const registerUser$1 = user.registerUser;
  const changeUserInfo$1 = user.changeUserInfo;
  const changeUserPassword$1 = user.changeUserPassword;
  const adminGetUserInfo$1 = user.adminGetUserInfo;
  const deleteUser$1 = user.deleteUser;
  const activateUserAccount$1 = user.activateUserAccount;
  const deactivateUserAccount$1 = user.deactivateUserAccount;
  const grantUserAdminRights$1 = user.grantUserAdminRights;
  const revokeUserAdminRights$1 = user.revokeUserAdminRights;
  const resetUserPassword$1 = user.resetUserPassword;
  const getUserInfo$1 = user.getUserInfo;
  const currentUser = user.currentUser;
  const checkLoggedIn$1 = user.checkLoggedIn;
  const checkAdminLoggedIn$1 = user.checkAdminLoggedIn;
  const logOut = user.logOut;
  const sleep$1 = utils.sleep;
  const getUniqueName$1 = utils.getUniqueName;
  const validateYears$1 = utils.validateYears;
  const projectID$1 = utils.projectID;
  const hasData$1 = utils.hasData;
  const hasPrograms$1 = utils.hasPrograms;
  const simStart$1 = utils.simStart;
  const simEnd$1 = utils.simEnd;
  const simYears$1 = utils.simYears;
  const dataStart$1 = utils.dataStart;
  const dataEnd$1 = utils.dataEnd;
  const dataYears$1 = utils.dataYears;
  const projectionYears$1 = utils.projectionYears;
  const activePops$1 = utils.activePops;
  const updateSorting$1 = utils.updateSorting;
  const sciris = {
    // rpc-service.js
    rpc,
    download,
    upload,
    // shared.js
    updateSets: updateSets$1,
    exportGraphs: exportGraphs$1,
    exportResults: exportResults$1,
    // graphs.js
    placeholders: placeholders$1,
    clearGraphs: clearGraphs$1,
    getPlotOptions: getPlotOptions$1,
    togglePlotControls: togglePlotControls$1,
    makeGraphs: makeGraphs$1,
    reloadGraphs: reloadGraphs$1,
    scaleFigs: scaleFigs$1,
    showBrowserWindowSize: showBrowserWindowSize$1,
    addListener: addListener$1,
    onMouseUpdate: onMouseUpdate$1,
    createDialogs: createDialogs$1,
    newDialog: newDialog$1,
    findDialog: findDialog$1,
    maximize: maximize$1,
    minimize: minimize$1,
    // status-service.js
    succeed: succeed$1,
    fail: fail$1,
    start: start$1,
    // task-service.js
    getTaskResultWaiting: getTaskResultWaiting$1,
    getTaskResultPolling: getTaskResultPolling$1,
    // user-service.js
    loginCall: loginCall$1,
    logoutCall: logoutCall$1,
    getCurrentUserInfo: getCurrentUserInfo$1,
    registerUser: registerUser$1,
    changeUserInfo: changeUserInfo$1,
    changeUserPassword: changeUserPassword$1,
    adminGetUserInfo: adminGetUserInfo$1,
    deleteUser: deleteUser$1,
    activateUserAccount: activateUserAccount$1,
    deactivateUserAccount: deactivateUserAccount$1,
    grantUserAdminRights: grantUserAdminRights$1,
    revokeUserAdminRights: revokeUserAdminRights$1,
    resetUserPassword: resetUserPassword$1,
    getUserInfo: getUserInfo$1,
    currentUser,
    checkLoggedIn: checkLoggedIn$1,
    checkAdminLoggedIn: checkAdminLoggedIn$1,
    logOut,
    // utils.js
    sleep: sleep$1,
    getUniqueName: getUniqueName$1,
    validateYears: validateYears$1,
    projectID: projectID$1,
    hasData: hasData$1,
    hasPrograms: hasPrograms$1,
    simStart: simStart$1,
    simEnd: simEnd$1,
    simYears: simYears$1,
    dataStart: dataStart$1,
    dataEnd: dataEnd$1,
    dataYears: dataYears$1,
    projectionYears: projectionYears$1,
    activePops: activePops$1,
    updateSorting: updateSorting$1,
    rpcs,
    graphs,
    status,
    shared,
    user,
    tasks,
    utils,
    ScirisVue,
    EventBus
  };

  exports.default = sciris;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
