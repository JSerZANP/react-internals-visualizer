/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function () {
  (function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined"
      ? factory(exports)
      : typeof define === "function" && define.amd
      ? define(["exports"], factory)
      : ((global = global || self), factory((global.React = {})));
  })(this, function (exports) {
    "use strict";

    // TODO: this is special because it gets imported during build.
    //
    // TODO: 18.0.0 has not been released to NPM;
    // It exists as a placeholder so that DevTools can support work tag changes between releases.
    // When we next publish a release, update the matching TODO in backend/renderer.js
    // TODO: This module is used both by the release scripts and to expose a version
    // at runtime. We should instead inject the version number as part of the build
    // process, and use the ReactVersions.js module as the single source of truth.
    var ReactVersion = "18.1.0";

    // ATTENTION
    // When adding new symbols to this file,
    // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
    // The Symbol used to tag the ReactElement-like types.
    const REACT_ELEMENT_TYPE = Symbol.for("react.element");
    const REACT_PORTAL_TYPE = Symbol.for("react.portal");
    const REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    const REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
    const REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    const REACT_PROVIDER_TYPE = Symbol.for("react.provider");
    const REACT_CONTEXT_TYPE = Symbol.for("react.context");
    const REACT_SERVER_CONTEXT_TYPE = Symbol.for("react.server_context");
    const REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
    const REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
    const REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
    const REACT_MEMO_TYPE = Symbol.for("react.memo");
    const REACT_LAZY_TYPE = Symbol.for("react.lazy");
    const REACT_DEBUG_TRACING_MODE_TYPE = Symbol.for("react.debug_trace_mode");
    const REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
    const REACT_CACHE_TYPE = Symbol.for("react.cache");
    const REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED = Symbol.for(
      "react.default_value"
    );
    const MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    const FAUX_ITERATOR_SYMBOL = "@@iterator";
    function getIteratorFn(maybeIterable) {
      if (maybeIterable === null || typeof maybeIterable !== "object") {
        return null;
      }

      const maybeIterator =
        (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
        maybeIterable[FAUX_ITERATOR_SYMBOL];

      if (typeof maybeIterator === "function") {
        return maybeIterator;
      }

      return null;
    }

    /**
     * This is the abstract API for an update queue.
     */

    const ReactNoopUpdateQueue = {
      /**
       * Checks whether or not this composite component is mounted.
       * @param {ReactClass} publicInstance The instance we want to test.
       * @return {boolean} True if mounted, false otherwise.
       * @protected
       * @final
       */
      isMounted: function (publicInstance) {
        return false;
      },

      /**
       * Forces an update. This should only be invoked when it is known with
       * certainty that we are **not** in a DOM transaction.
       *
       * You may want to call this when you know that some deeper aspect of the
       * component's state has changed but `setState` was not called.
       *
       * This will not invoke `shouldComponentUpdate`, but it will invoke
       * `componentWillUpdate` and `componentDidUpdate`.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {?function} callback Called after component is updated.
       * @param {?string} callerName name of the calling function in the public API.
       * @internal
       */
      enqueueForceUpdate: function (publicInstance, callback, callerName) {},

      /**
       * Replaces all of the state. Always use this or `setState` to mutate state.
       * You should treat `this.state` as immutable.
       *
       * There is no guarantee that `this.state` will be immediately updated, so
       * accessing `this.state` after calling this method may return the old value.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {object} completeState Next state.
       * @param {?function} callback Called after component is updated.
       * @param {?string} callerName name of the calling function in the public API.
       * @internal
       */
      enqueueReplaceState: function (
        publicInstance,
        completeState,
        callback,
        callerName
      ) {},

      /**
       * Sets a subset of the state. This only exists because _pendingState is
       * internal. This provides a merging strategy that is not available to deep
       * properties which is confusing. TODO: Expose pendingState or don't use it
       * during the merge.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {object} partialState Next partial state to be merged with state.
       * @param {?function} callback Called after component is updated.
       * @param {?string} Name of the calling function in the public API.
       * @internal
       */
      enqueueSetState: function (
        publicInstance,
        partialState,
        callback,
        callerName
      ) {},
    };

    const assign = Object.assign;

    const emptyObject = {};
    /**
     * Base class helpers for the updating state of a component.
     */

    function Component(props, context, updater) {
      this.props = props;
      this.context = context; // If a component has string refs, we will assign a different object later.

      this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
      // renderer.

      this.updater = updater || ReactNoopUpdateQueue;
    }

    Component.prototype.isReactComponent = {};
    /**
     * Sets a subset of the state. Always use this to mutate
     * state. You should treat `this.state` as immutable.
     *
     * There is no guarantee that `this.state` will be immediately updated, so
     * accessing `this.state` after calling this method may return the old value.
     *
     * There is no guarantee that calls to `setState` will run synchronously,
     * as they may eventually be batched together.  You can provide an optional
     * callback that will be executed when the call to setState is actually
     * completed.
     *
     * When a function is provided to setState, it will be called at some point in
     * the future (not synchronously). It will be called with the up to date
     * component arguments (state, props, context). These values can be different
     * from this.* because your function may be called after receiveProps but before
     * shouldComponentUpdate, and this new state, props, and context will not yet be
     * assigned to this.
     *
     * @param {object|function} partialState Next partial state or function to
     *        produce next partial state to be merged with current state.
     * @param {?function} callback Called after state is updated.
     * @final
     * @protected
     */

    Component.prototype.setState = function (partialState, callback) {
      if (
        typeof partialState !== "object" &&
        typeof partialState !== "function" &&
        partialState != null
      ) {
        throw new Error(
          "setState(...): takes an object of state variables to update or a " +
            "function which returns an object of state variables."
        );
      }

      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     *
     * @param {?function} callback Called after update is complete.
     * @final
     * @protected
     */

    Component.prototype.forceUpdate = function (callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };

    function ComponentDummy() {}

    ComponentDummy.prototype = Component.prototype;
    /**
     * Convenience component with default shallow equality check for sCU.
     */

    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context; // If a component has string refs, we will assign a different object later.

      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }

    const pureComponentPrototype = (PureComponent.prototype =
      new ComponentDummy());
    pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;

    // an immutable object with a single mutable value
    function createRef() {
      const refObject = {
        current: null,
      };

      return refObject;
    }

    const isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

    function isArray(a) {
      return isArrayImpl(a);
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * Keeps track of the current owner.
     *
     * The current owner is the component who should own any components that are
     * currently being constructed.
     */
    const ReactCurrentOwner = {
      /**
       * @internal
       * @type {ReactComponent}
       */
      current: null,
    };

    const RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true,
    };

    function hasValidRef(config) {
      return config.ref !== undefined;
    }

    function hasValidKey(config) {
      return config.key !== undefined;
    }
    /**
     * Factory method to create a new React element. This no longer adheres to
     * the class pattern, so do not use new to call it. Also, instanceof check
     * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
     * if something is a React Element.
     *
     * @param {*} type
     * @param {*} props
     * @param {*} key
     * @param {string|object} ref
     * @param {*} owner
     * @param {*} self A *temporary* helper to detect places where `this` is
     * different from the `owner` when React.createElement is called, so that we
     * can warn. We want to get rid of owner and replace string `ref`s with arrow
     * functions, and as long as `this` and owner are the same, there will be no
     * change in behavior.
     * @param {*} source An annotation object (added by a transpiler or otherwise)
     * indicating filename, line number, and/or other information.
     * @internal
     */

    const ReactElement = function (type, key, ref, self, source, owner, props) {
      const element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type: type,
        key: key,
        ref: ref,
        props: props,
        // Record the component responsible for creating this element.
        _owner: owner,
      };

      return element;
    };
    /**
     * Create and return a new ReactElement of the given type.
     * See https://reactjs.org/docs/react-api.html#createelement
     */

    function createElement(type, config, children) {
      let propName; // Reserved names are extracted

      const props = {};
      let key = null;
      let ref = null;
      let self = null;
      let source = null;

      if (config != null) {
        if (hasValidRef(config)) {
          ref = config.ref;
        }

        if (hasValidKey(config)) {
          key = "" + config.key;
        }

        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

        for (propName in config) {
          if (
            hasOwnProperty.call(config, propName) &&
            !RESERVED_PROPS.hasOwnProperty(propName)
          ) {
            props[propName] = config[propName];
          }
        }
      } // Children can be more than one argument, and those are transferred onto
      // the newly allocated props object.

      const childrenLength = arguments.length - 2;

      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);

        for (let i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
      } // Resolve default props

      if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;

        for (propName in defaultProps) {
          if (props[propName] === undefined) {
            props[propName] = defaultProps[propName];
          }
        }
      }

      return ReactElement(
        type,
        key,
        ref,
        self,
        source,
        ReactCurrentOwner.current,
        props
      );
    }
    /**
     * Return a function that produces ReactElements of a given type.
     * See https://reactjs.org/docs/react-api.html#createfactory
     */

    function createFactory(type) {
      const factory = createElement.bind(null, type); // Expose the type on the factory and the prototype so that it can be
      // easily accessed on elements. E.g. `<Foo />.type === Foo`.
      // This should not be named `constructor` since this may not be the function
      // that created the element, and it may not even be a constructor.
      // Legacy hook: remove it

      factory.type = type;
      return factory;
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      const newElement = ReactElement(
        oldElement.type,
        newKey,
        oldElement.ref,
        oldElement._self,
        oldElement._source,
        oldElement._owner,
        oldElement.props
      );
      return newElement;
    }
    /**
     * Clone and return a new ReactElement using element as the starting point.
     * See https://reactjs.org/docs/react-api.html#cloneelement
     */

    function cloneElement(element, config, children) {
      if (element === null || element === undefined) {
        throw new Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            element +
            "."
        );
      }

      let propName; // Original props are copied

      const props = assign({}, element.props); // Reserved names are extracted

      let key = element.key;
      let ref = element.ref; // Self is preserved since the owner is preserved.

      const self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
      // transpiler, and the original source is probably a better indicator of the
      // true owner.

      const source = element._source; // Owner will be preserved, unless ref is overridden

      let owner = element._owner;

      if (config != null) {
        if (hasValidRef(config)) {
          // Silently steal the ref from the parent.
          ref = config.ref;
          owner = ReactCurrentOwner.current;
        }

        if (hasValidKey(config)) {
          key = "" + config.key;
        } // Remaining properties override existing props

        let defaultProps;

        if (element.type && element.type.defaultProps) {
          defaultProps = element.type.defaultProps;
        }

        for (propName in config) {
          if (
            hasOwnProperty.call(config, propName) &&
            !RESERVED_PROPS.hasOwnProperty(propName)
          ) {
            if (config[propName] === undefined && defaultProps !== undefined) {
              // Resolve default props
              props[propName] = defaultProps[propName];
            } else {
              props[propName] = config[propName];
            }
          }
        }
      } // Children can be more than one argument, and those are transferred onto
      // the newly allocated props object.

      const childrenLength = arguments.length - 2;

      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);

        for (let i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
      }

      return ReactElement(element.type, key, ref, self, source, owner, props);
    }
    /**
     * Verifies the object is a ReactElement.
     * See https://reactjs.org/docs/react-api.html#isvalidelement
     * @param {?object} object
     * @return {boolean} True if `object` is a ReactElement.
     * @final
     */

    function isValidElement(object) {
      return (
        typeof object === "object" &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE
      );
    }

    const SEPARATOR = ".";
    const SUBSEPARATOR = ":";
    /**
     * Escape and wrap key so it is safe to use as a reactid
     *
     * @param {string} key to be escaped.
     * @return {string} the escaped key.
     */

    function escape(key) {
      const escapeRegex = /[=:]/g;
      const escaperLookup = {
        "=": "=0",
        ":": "=2",
      };
      const escapedString = key.replace(escapeRegex, function (match) {
        return escaperLookup[match];
      });
      return "$" + escapedString;
    }
    const userProvidedKeyEscapeRegex = /\/+/g;

    function escapeUserProvidedKey(text) {
      return text.replace(userProvidedKeyEscapeRegex, "$&/");
    }
    /**
     * Generate a key string that identifies a element within a set.
     *
     * @param {*} element A element that could contain a manual key.
     * @param {number} index Index that is used if a manual key is not provided.
     * @return {string}
     */

    function getElementKey(element, index) {
      // Do some typechecking here since we call this blindly. We want to ensure
      // that we don't block potential future ES APIs.
      if (
        typeof element === "object" &&
        element !== null &&
        element.key != null
      ) {
        return escape("" + element.key);
      } // Implicit key determined by the index in the set

      return index.toString(36);
    }

    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      const type = typeof children;

      if (type === "undefined" || type === "boolean") {
        // All of the above are perceived as null.
        children = null;
      }

      let invokeCallback = false;

      if (children === null) {
        invokeCallback = true;
      } else {
        switch (type) {
          case "string":
          case "number":
            invokeCallback = true;
            break;

          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
            }
        }
      }

      if (invokeCallback) {
        const child = children;
        let mappedChild = callback(child); // If it's the only child, treat the name as if it was wrapped in an array
        // so that it's consistent if the number of children grows:

        const childKey =
          nameSoFar === "" ? SEPARATOR + getElementKey(child, 0) : nameSoFar;

        if (isArray(mappedChild)) {
          let escapedChildKey = "";

          if (childKey != null) {
            escapedChildKey = escapeUserProvidedKey(childKey) + "/";
          }

          mapIntoArray(mappedChild, array, escapedChildKey, "", (c) => c);
        } else if (mappedChild != null) {
          if (isValidElement(mappedChild)) {
            mappedChild = cloneAndReplaceKey(
              mappedChild, // Keep both the (mapped) and old keys if they differ, just as
              // traverseAllChildren used to do for objects as children
              escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                (mappedChild.key && (!child || child.key !== mappedChild.key) // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                  ? // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  : "") +
                childKey
            );
          }

          array.push(mappedChild);
        }

        return 1;
      }

      let child;
      let nextName;
      let subtreeCount = 0; // Count of children found in the current subtree.

      const nextNamePrefix =
        nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;

      if (isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          child = children[i];
          nextName = nextNamePrefix + getElementKey(child, i);
          subtreeCount += mapIntoArray(
            child,
            array,
            escapedPrefix,
            nextName,
            callback
          );
        }
      } else {
        const iteratorFn = getIteratorFn(children);

        if (typeof iteratorFn === "function") {
          const iterableChildren = children;

          const iterator = iteratorFn.call(iterableChildren);
          let step;
          let ii = 0;

          while (!(step = iterator.next()).done) {
            child = step.value;
            nextName = nextNamePrefix + getElementKey(child, ii++);
            subtreeCount += mapIntoArray(
              child,
              array,
              escapedPrefix,
              nextName,
              callback
            );
          }
        } else if (type === "object") {
          // eslint-disable-next-line react-internal/safe-string-coercion
          const childrenString = String(children);
          throw new Error(
            "Objects are not valid as a React child (found: " +
              (childrenString === "[object Object]"
                ? "object with keys {" + Object.keys(children).join(", ") + "}"
                : childrenString) +
              "). " +
              "If you meant to render a collection of children, use an array " +
              "instead."
          );
        }
      }

      return subtreeCount;
    }

    /**
     * Maps children that are typically specified as `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenmap
     *
     * The provided mapFunction(child, index) will be called for each
     * leaf child.
     *
     * @param {?*} children Children tree container.
     * @param {function(*, int)} func The map function.
     * @param {*} context Context for mapFunction.
     * @return {object} Object containing the ordered map of results.
     */
    function mapChildren(children, func, context) {
      if (children == null) {
        return children;
      }

      const result = [];
      let count = 0;
      mapIntoArray(children, result, "", "", function (child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    /**
     * Count the number of children that are typically specified as
     * `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrencount
     *
     * @param {?*} children Children tree container.
     * @return {number} The number of children.
     */

    function countChildren(children) {
      let n = 0;
      mapChildren(children, () => {
        n++; // Don't return anything
      });
      return n;
    }

    /**
     * Iterates through children that are typically specified as `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
     *
     * The provided forEachFunc(child, index) will be called for each
     * leaf child.
     *
     * @param {?*} children Children tree container.
     * @param {function(*, int)} forEachFunc
     * @param {*} forEachContext Context for forEachContext.
     */
    function forEachChildren(children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function () {
          forEachFunc.apply(this, arguments); // Don't return anything.
        },
        forEachContext
      );
    }
    /**
     * Flatten a children object (typically specified as `props.children`) and
     * return an array with appropriately re-keyed children.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
     */

    function toArray(children) {
      return mapChildren(children, (child) => child) || [];
    }
    /**
     * Returns the first child in a collection of children and verifies that there
     * is only one child in the collection.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenonly
     *
     * The current implementation of this function assumes that a single child gets
     * passed without a wrapper, but the purpose of this helper function is to
     * abstract away the particular structure of children.
     *
     * @param {?object} children Child collection structure.
     * @return {ReactElement} The first and only `ReactElement` contained in the
     * structure.
     */

    function onlyChild(children) {
      if (!isValidElement(children)) {
        throw new Error(
          "React.Children.only expected to receive a single React element child."
        );
      }

      return children;
    }

    function createContext(defaultValue) {
      // TODO: Second argument used to be an optional `calculateChangedBits`
      // function. Warn to reserve for future use?
      const context = {
        $$typeof: REACT_CONTEXT_TYPE,
        // As a workaround to support multiple concurrent renderers, we categorize
        // some renderers as primary and others as secondary. We only expect
        // there to be two concurrent renderers at most: React Native (primary) and
        // Fabric (secondary); React DOM (primary) and React ART (secondary).
        // Secondary renderers store their context values on separate fields.
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        // Used to track how many concurrent renderers this context currently
        // supports within in a single renderer. Such as parallel server rendering.
        _threadCount: 0,
        // These are circular
        Provider: null,
        Consumer: null,
        // Add these to use same hidden class in VM as ServerContext
        _defaultValue: null,
        _globalName: null,
      };
      context.Provider = {
        $$typeof: REACT_PROVIDER_TYPE,
        _context: context,
      };

      {
        context.Consumer = context;
      }

      return context;
    }

    const Uninitialized = -1;
    const Pending = 0;
    const Resolved = 1;
    const Rejected = 2;

    function lazyInitializer(payload) {
      if (payload._status === Uninitialized) {
        const ctor = payload._result;
        const thenable = ctor(); // Transition to the next state.
        // This might throw either because it's missing or throws. If so, we treat it
        // as still uninitialized and try again next time. Which is the same as what
        // happens if the ctor or any wrappers processing the ctor throws. This might
        // end up fixing it if the resolution was a concurrency bug.

        thenable.then(
          (moduleObject) => {
            if (
              payload._status === Pending ||
              payload._status === Uninitialized
            ) {
              // Transition to the next state.
              const resolved = payload;
              resolved._status = Resolved;
              resolved._result = moduleObject;
            }
          },
          (error) => {
            if (
              payload._status === Pending ||
              payload._status === Uninitialized
            ) {
              // Transition to the next state.
              const rejected = payload;
              rejected._status = Rejected;
              rejected._result = error;
            }
          }
        );

        if (payload._status === Uninitialized) {
          // In case, we're still uninitialized, then we're waiting for the thenable
          // to resolve. Set it as pending in the meantime.
          const pending = payload;
          pending._status = Pending;
          pending._result = thenable;
        }
      }

      if (payload._status === Resolved) {
        const moduleObject = payload._result;

        return moduleObject.default;
      } else {
        throw payload._result;
      }
    }

    function lazy(ctor) {
      const payload = {
        // We use these fields to store the result.
        _status: Uninitialized,
        _result: ctor,
      };
      const lazyType = {
        $$typeof: REACT_LAZY_TYPE,
        _payload: payload,
        _init: lazyInitializer,
      };

      return lazyType;
    }

    function forwardRef(render) {
      const elementType = {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render,
      };

      return elementType;
    }

    function memo(type, compare) {
      const elementType = {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: compare === undefined ? null : compare,
      };

      return elementType;
    }

    /**
     * Keeps track of the current dispatcher.
     */
    const ReactCurrentDispatcher = {
      /**
       * @internal
       * @type {ReactComponent}
       */
      current: null,
    };

    function resolveDispatcher() {
      const dispatcher = ReactCurrentDispatcher.current;
      // intentionally don't throw our own error because this is in a hot path.
      // Also helps ensure this is inlined.

      return dispatcher;
    }

    function getCacheSignal() {
      const dispatcher = resolveDispatcher(); // $FlowFixMe This is unstable, thus optional

      return dispatcher.getCacheSignal();
    }
    function getCacheForType(resourceType) {
      const dispatcher = resolveDispatcher(); // $FlowFixMe This is unstable, thus optional

      return dispatcher.getCacheForType(resourceType);
    }
    function useContext(Context) {
      const dispatcher = resolveDispatcher();

      return dispatcher.useContext(Context);
    }
    function useState(initialState) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useState(initialState);
    }
    function useReducer(reducer, initialArg, init) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useReducer(reducer, initialArg, init);
    }
    function useRef(initialValue) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useRef(initialValue);
    }
    function useEffect(create, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useEffect(create, deps);
    }
    function useInsertionEffect(create, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useInsertionEffect(create, deps);
    }
    function useLayoutEffect(create, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useLayoutEffect(create, deps);
    }
    function useCallback(callback, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useCallback(callback, deps);
    }
    function useMemo(create, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useMemo(create, deps);
    }
    function useImperativeHandle(ref, create, deps) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useImperativeHandle(ref, create, deps);
    }
    function useDebugValue(value, formatterFn) {}
    function useTransition() {
      const dispatcher = resolveDispatcher();
      return dispatcher.useTransition();
    }
    function useDeferredValue(value) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useDeferredValue(value);
    }
    function useId() {
      const dispatcher = resolveDispatcher();
      return dispatcher.useId();
    }
    function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
      const dispatcher = resolveDispatcher();
      return dispatcher.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    }
    function useCacheRefresh() {
      const dispatcher = resolveDispatcher(); // $FlowFixMe This is unstable, thus optional

      return dispatcher.useCacheRefresh();
    }

    /**
     * Keeps track of the current batch's configuration such as how long an update
     * should suspend for if it needs to.
     */
    const ReactCurrentBatchConfig = {
      transition: null,
    };

    const ContextRegistry = {};

    const ReactSharedInternals = {
      ReactCurrentDispatcher,
      ReactCurrentBatchConfig,
      ReactCurrentOwner,
    };

    {
      ReactSharedInternals.ContextRegistry = ContextRegistry;
    }

    const ContextRegistry$1 = ReactSharedInternals.ContextRegistry;
    function createServerContext(globalName, defaultValue) {
      let wasDefined = true;

      if (!ContextRegistry$1[globalName]) {
        wasDefined = false;
        const context = {
          $$typeof: REACT_SERVER_CONTEXT_TYPE,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _defaultValue: defaultValue,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          _globalName: globalName,
        };
        context.Provider = {
          $$typeof: REACT_PROVIDER_TYPE,
          _context: context,
        };

        ContextRegistry$1[globalName] = context;
      }

      const context = ContextRegistry$1[globalName];

      if (
        context._defaultValue === REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED
      ) {
        context._defaultValue = defaultValue;

        if (
          context._currentValue ===
          REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED
        ) {
          context._currentValue = defaultValue;
        }

        if (
          context._currentValue2 ===
          REACT_SERVER_CONTEXT_DEFAULT_VALUE_NOT_LOADED
        ) {
          context._currentValue2 = defaultValue;
        }
      } else if (wasDefined) {
        throw new Error("ServerContext: " + globalName + " already defined");
      }

      return context;
    }

    const enableSchedulerDebugging = false;
    const enableProfiling = false;
    const frameYieldMs = 5;

    function push(heap, node) {
      const index = heap.length;
      heap.push(node);
      siftUp(heap, node, index);
    }
    function peek(heap) {
      return heap.length === 0 ? null : heap[0];
    }
    function pop(heap) {
      if (heap.length === 0) {
        return null;
      }

      const first = heap[0];
      const last = heap.pop();

      if (last !== first) {
        heap[0] = last;
        siftDown(heap, last, 0);
      }

      return first;
    }

    function siftUp(heap, node, i) {
      let index = i;

      while (index > 0) {
        const parentIndex = (index - 1) >>> 1;
        const parent = heap[parentIndex];

        if (compare(parent, node) > 0) {
          // The parent is larger. Swap positions.
          heap[parentIndex] = node;
          heap[index] = parent;
          index = parentIndex;
        } else {
          // The parent is smaller. Exit.
          return;
        }
      }
    }

    function siftDown(heap, node, i) {
      let index = i;
      const length = heap.length;
      const halfLength = length >>> 1;

      while (index < halfLength) {
        const leftIndex = (index + 1) * 2 - 1;
        const left = heap[leftIndex];
        const rightIndex = leftIndex + 1;
        const right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

        if (compare(left, node) < 0) {
          if (rightIndex < length && compare(right, left) < 0) {
            heap[index] = right;
            heap[rightIndex] = node;
            index = rightIndex;
          } else {
            heap[index] = left;
            heap[leftIndex] = node;
            index = leftIndex;
          }
        } else if (rightIndex < length && compare(right, node) < 0) {
          heap[index] = right;
          heap[rightIndex] = node;
          index = rightIndex;
        } else {
          // Neither child is smaller. Exit.
          return;
        }
      }
    }

    function compare(a, b) {
      // Compare sort index first, then task id.
      const diff = a.sortIndex - b.sortIndex;
      return diff !== 0 ? diff : a.id - b.id;
    }

    // TODO: Use symbols?
    const ImmediatePriority = 1;
    const UserBlockingPriority = 2;
    const NormalPriority = 3;
    const LowPriority = 4;
    const IdlePriority = 5;

    function markTaskErrored(task, ms) {}

    /* eslint-disable no-var */
    let getCurrentTime;
    const hasPerformanceNow =
      typeof performance === "object" && typeof performance.now === "function";

    if (hasPerformanceNow) {
      const localPerformance = performance;

      getCurrentTime = () => localPerformance.now();
    } else {
      const localDate = Date;
      const initialTime = localDate.now();

      getCurrentTime = () => localDate.now() - initialTime;
    } // Max 31 bit integer. The max integer size in V8 for 32-bit systems.
    // Math.pow(2, 30) - 1
    // 0b111111111111111111111111111111

    var maxSigned31BitInt = 1073741823; // Times out immediately

    var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

    var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
    var NORMAL_PRIORITY_TIMEOUT = 5000;
    var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

    var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // Tasks are stored on a min heap

    var taskQueue = [];
    var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

    var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.
    var currentTask = null;
    var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrance.

    var isPerformingWork = false;
    var isHostCallbackScheduled = false;
    var isHostTimeoutScheduled = false; // Capture local references to native APIs, in case a polyfill overrides them.

    const localSetTimeout =
      typeof setTimeout === "function" ? setTimeout : null;
    const localClearTimeout =
      typeof clearTimeout === "function" ? clearTimeout : null;
    const localSetImmediate =
      typeof setImmediate !== "undefined" ? setImmediate : null; // IE and Node.js + jsdom

    const isInputPending =
      typeof navigator !== "undefined" &&
      navigator.scheduling !== undefined &&
      navigator.scheduling.isInputPending !== undefined
        ? navigator.scheduling.isInputPending.bind(navigator.scheduling)
        : null;

    function advanceTimers(currentTime) {
      // Check for tasks that are no longer delayed and add them to the queue.
      let timer = peek(timerQueue);

      while (timer !== null) {
        if (timer.callback === null) {
          // Timer was cancelled.
          pop(timerQueue);
        } else if (timer.startTime <= currentTime) {
          // Timer fired. Transfer to the task queue.
          pop(timerQueue);
          timer.sortIndex = timer.expirationTime;
          push(taskQueue, timer);
        } else {
          // Remaining timers are pending.
          return;
        }

        timer = peek(timerQueue);
      }
    }

    function handleTimeout(currentTime) {
      isHostTimeoutScheduled = false;
      advanceTimers(currentTime);

      if (!isHostCallbackScheduled) {
        if (peek(taskQueue) !== null) {
          isHostCallbackScheduled = true;
          requestHostCallback(flushWork);
        } else {
          const firstTimer = peek(timerQueue);

          if (firstTimer !== null) {
            requestHostTimeout(
              handleTimeout,
              firstTimer.startTime - currentTime
            );
          }
        }
      }
    }

    function flushWork(hasTimeRemaining, initialTime) {
      isHostCallbackScheduled = false;

      if (isHostTimeoutScheduled) {
        // We scheduled a timeout but it's no longer needed. Cancel it.
        isHostTimeoutScheduled = false;
        cancelHostTimeout();
      }

      isPerformingWork = true;
      const previousPriorityLevel = currentPriorityLevel;

      try {
        if (enableProfiling) {
          try {
            return workLoop(hasTimeRemaining, initialTime);
          } catch (error) {
            if (currentTask !== null) {
              const currentTime = getCurrentTime();
              markTaskErrored(currentTask, currentTime);
              currentTask.isQueued = false;
            }

            throw error;
          }
        } else {
          // No catch in prod code path.
          return workLoop(hasTimeRemaining, initialTime);
        }
      } finally {
        currentTask = null;
        currentPriorityLevel = previousPriorityLevel;
        isPerformingWork = false;
      }
    }

    function workLoop(hasTimeRemaining, initialTime) {
      let currentTime = initialTime;
      advanceTimers(currentTime);
      currentTask = peek(taskQueue);

      while (currentTask !== null && !enableSchedulerDebugging) {
        if (
          currentTask.expirationTime > currentTime &&
          (!hasTimeRemaining || shouldYieldToHost())
        ) {
          // This currentTask hasn't expired, and we've reached the deadline.
          break;
        }

        const callback = currentTask.callback;

        if (typeof callback === "function") {
          currentTask.callback = null;
          currentPriorityLevel = currentTask.priorityLevel;
          const didUserCallbackTimeout =
            currentTask.expirationTime <= currentTime;

          const continuationCallback = callback(didUserCallbackTimeout);
          currentTime = getCurrentTime();

          if (typeof continuationCallback === "function") {
            currentTask.callback = continuationCallback;
          } else {
            if (currentTask === peek(taskQueue)) {
              pop(taskQueue);
            }
          }

          advanceTimers(currentTime);
        } else {
          pop(taskQueue);
        }

        currentTask = peek(taskQueue);
      } // Return whether there's additional work

      if (currentTask !== null) {
        return true;
      } else {
        const firstTimer = peek(timerQueue);

        if (firstTimer !== null) {
          requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }

        return false;
      }
    }

    function unstable_runWithPriority(priorityLevel, eventHandler) {
      switch (priorityLevel) {
        case ImmediatePriority:
        case UserBlockingPriority:
        case NormalPriority:
        case LowPriority:
        case IdlePriority:
          break;

        default:
          priorityLevel = NormalPriority;
      }

      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;

      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    }

    function unstable_next(eventHandler) {
      var priorityLevel;

      switch (currentPriorityLevel) {
        case ImmediatePriority:
        case UserBlockingPriority:
        case NormalPriority:
          // Shift down to normal priority
          priorityLevel = NormalPriority;
          break;

        default:
          // Anything lower than normal priority should remain at the current level.
          priorityLevel = currentPriorityLevel;
          break;
      }

      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = priorityLevel;

      try {
        return eventHandler();
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    }

    function unstable_wrapCallback(callback) {
      var parentPriorityLevel = currentPriorityLevel;
      return function () {
        // This is a fork of runWithPriority, inlined for performance.
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = parentPriorityLevel;

        try {
          return callback.apply(this, arguments);
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      };
    }

    function unstable_scheduleCallback(priorityLevel, callback, options) {
      var currentTime = getCurrentTime();
      var startTime;

      if (typeof options === "object" && options !== null) {
        var delay = options.delay;

        if (typeof delay === "number" && delay > 0) {
          startTime = currentTime + delay;
        } else {
          startTime = currentTime;
        }
      } else {
        startTime = currentTime;
      }

      var timeout;

      switch (priorityLevel) {
        case ImmediatePriority:
          timeout = IMMEDIATE_PRIORITY_TIMEOUT;
          break;

        case UserBlockingPriority:
          timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
          break;

        case IdlePriority:
          timeout = IDLE_PRIORITY_TIMEOUT;
          break;

        case LowPriority:
          timeout = LOW_PRIORITY_TIMEOUT;
          break;

        case NormalPriority:
        default:
          timeout = NORMAL_PRIORITY_TIMEOUT;
          break;
      }

      var expirationTime = startTime + timeout;
      var newTask = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime,
        expirationTime,
        sortIndex: -1,
      };

      if (startTime > currentTime) {
        // This is a delayed task.
        newTask.sortIndex = startTime;
        push(timerQueue, newTask);

        if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
          // All tasks are delayed, and this is the task with the earliest delay.
          if (isHostTimeoutScheduled) {
            // Cancel an existing timeout.
            cancelHostTimeout();
          } else {
            isHostTimeoutScheduled = true;
          } // Schedule a timeout.

          requestHostTimeout(handleTimeout, startTime - currentTime);
        }
      } else {
        newTask.sortIndex = expirationTime;
        push(taskQueue, newTask);
        // wait until the next time we yield.

        if (!isHostCallbackScheduled && !isPerformingWork) {
          isHostCallbackScheduled = true;
          requestHostCallback(flushWork);
        }
      }

      return newTask;
    }

    function unstable_pauseExecution() {}

    function unstable_continueExecution() {
      if (!isHostCallbackScheduled && !isPerformingWork) {
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
      }
    }

    function unstable_getFirstCallbackNode() {
      return peek(taskQueue);
    }

    function unstable_cancelCallback(task) {
      // remove from the queue because you can't remove arbitrary nodes from an
      // array based heap, only the first one.)

      task.callback = null;
    }

    function unstable_getCurrentPriorityLevel() {
      return currentPriorityLevel;
    }

    let isMessageLoopRunning = false;
    let scheduledHostCallback = null;
    let taskTimeoutID = -1; // Scheduler periodically yields in case there is other work on the main
    // thread, like user events. By default, it yields multiple times per frame.
    // It does not attempt to align with frame boundaries, since most tasks don't
    // need to be frame aligned; for those that do, use requestAnimationFrame.

    let frameInterval = frameYieldMs;
    let startTime = -1;

    function shouldYieldToHost() {
      const timeElapsed = getCurrentTime() - startTime;

      if (timeElapsed < frameInterval) {
        // The main thread has only been blocked for a really short amount of time;
        // smaller than a single frame. Don't yield yet.
        return false;
      } // The main thread has been blocked for a non-negligible amount of time. We

      return true;
    }

    function requestPaint() {}

    function forceFrameRate(fps) {
      if (fps < 0 || fps > 125) {
        // Using console['error'] to evade Babel and ESLint
        console["error"](
          "forceFrameRate takes a positive int between 0 and 125, " +
            "forcing frame rates higher than 125 fps is not supported"
        );
        return;
      }

      if (fps > 0) {
        frameInterval = Math.floor(1000 / fps);
      } else {
        // reset the framerate
        frameInterval = frameYieldMs;
      }
    }

    const performWorkUntilDeadline = () => {
      if (scheduledHostCallback !== null) {
        const currentTime = getCurrentTime(); // Keep track of the start time so we can measure how long the main thread
        // has been blocked.

        startTime = currentTime;
        const hasTimeRemaining = true; // If a scheduler task throws, exit the current browser task so the
        // error can be observed.
        //
        // Intentionally not using a try-catch, since that makes some debugging
        // techniques harder. Instead, if `scheduledHostCallback` errors, then
        // `hasMoreWork` will remain true, and we'll continue the work loop.

        let hasMoreWork = true;

        try {
          hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
        } finally {
          if (hasMoreWork) {
            // If there's more work, schedule the next message event at the end
            // of the preceding one.
            schedulePerformWorkUntilDeadline();
          } else {
            isMessageLoopRunning = false;
            scheduledHostCallback = null;
          }
        }
      } else {
        isMessageLoopRunning = false;
      } // Yielding to the browser will give it a chance to paint, so we can
    };

    let schedulePerformWorkUntilDeadline;

    if (typeof localSetImmediate === "function") {
      // Node.js and old IE.
      // There's a few reasons for why we prefer setImmediate.
      //
      // Unlike MessageChannel, it doesn't prevent a Node.js process from exiting.
      // (Even though this is a DOM fork of the Scheduler, you could get here
      // with a mix of Node.js 15+, which has a MessageChannel, and jsdom.)
      // https://github.com/facebook/react/issues/20756
      //
      // But also, it runs earlier which is the semantic we want.
      // If other browsers ever implement it, it's better to use it.
      // Although both of these would be inferior to native scheduling.
      schedulePerformWorkUntilDeadline = () => {
        localSetImmediate(performWorkUntilDeadline);
      };
    } else if (typeof MessageChannel !== "undefined") {
      // DOM and Worker environments.
      // We prefer MessageChannel because of the 4ms setTimeout clamping.
      const channel = new MessageChannel();
      const port = channel.port2;
      channel.port1.onmessage = performWorkUntilDeadline;

      schedulePerformWorkUntilDeadline = () => {
        port.postMessage(null);
      };
    } else {
      // We should only fallback here in non-browser environments.
      schedulePerformWorkUntilDeadline = () => {
        localSetTimeout(performWorkUntilDeadline, 0);
      };
    }

    function requestHostCallback(callback) {
      scheduledHostCallback = callback;

      if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        schedulePerformWorkUntilDeadline();
      }
    }

    function requestHostTimeout(callback, ms) {
      taskTimeoutID = localSetTimeout(() => {
        callback(getCurrentTime());
      }, ms);
    }

    function cancelHostTimeout() {
      localClearTimeout(taskTimeoutID);
      taskTimeoutID = -1;
    }

    const unstable_requestPaint = requestPaint;
    const unstable_Profiling = null;

    var Scheduler = {
      __proto__: null,
      unstable_ImmediatePriority: ImmediatePriority,
      unstable_UserBlockingPriority: UserBlockingPriority,
      unstable_NormalPriority: NormalPriority,
      unstable_IdlePriority: IdlePriority,
      unstable_LowPriority: LowPriority,
      unstable_runWithPriority: unstable_runWithPriority,
      unstable_next: unstable_next,
      unstable_scheduleCallback: unstable_scheduleCallback,
      unstable_cancelCallback: unstable_cancelCallback,
      unstable_wrapCallback: unstable_wrapCallback,
      unstable_getCurrentPriorityLevel: unstable_getCurrentPriorityLevel,
      unstable_shouldYield: shouldYieldToHost,
      unstable_requestPaint: unstable_requestPaint,
      unstable_continueExecution: unstable_continueExecution,
      unstable_pauseExecution: unstable_pauseExecution,
      unstable_getFirstCallbackNode: unstable_getFirstCallbackNode,
      get unstable_now() {
        return getCurrentTime;
      },
      unstable_forceFrameRate: forceFrameRate,
      unstable_Profiling: unstable_Profiling,
    };

    const ReactSharedInternals$1 = {
      ReactCurrentDispatcher,
      ReactCurrentOwner,
      ReactCurrentBatchConfig,
      // Re-export the schedule API(s) for UMD bundles.
      // This avoids introducing a dependency on a new UMD global in a minor update,
      // Since that would be a breaking change (e.g. for all existing CodeSandboxes).
      // This re-export is only required for UMD bundles;
      // CJS bundles use the shared NPM package.
      Scheduler,
    };

    {
      ReactSharedInternals$1.ContextRegistry = ContextRegistry;
    }

    function startTransition(scope, options) {
      const prevTransition = ReactCurrentBatchConfig.transition;
      ReactCurrentBatchConfig.transition = {};

      try {
        scope();
      } finally {
        ReactCurrentBatchConfig.transition = prevTransition;
      }
    }

    function act(callback) {
      {
        throw new Error(
          "act(...) is not supported in production builds of React."
        );
      }
    }

    const createElement$1 = createElement;
    const cloneElement$1 = cloneElement;
    const createFactory$1 = createFactory;
    const Children = {
      map: mapChildren,
      forEach: forEachChildren,
      count: countChildren,
      toArray,
      only: onlyChild,
    };

    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED =
      ReactSharedInternals$1;
    exports.cloneElement = cloneElement$1;
    exports.createContext = createContext;
    exports.createElement = createElement$1;
    exports.createFactory = createFactory$1;
    exports.createRef = createRef;
    exports.createServerContext = createServerContext;
    exports.forwardRef = forwardRef;
    exports.isValidElement = isValidElement;
    exports.lazy = lazy;
    exports.memo = memo;
    exports.startTransition = startTransition;
    exports.unstable_Cache = REACT_CACHE_TYPE;
    exports.unstable_DebugTracingMode = REACT_DEBUG_TRACING_MODE_TYPE;
    exports.unstable_Offscreen = REACT_OFFSCREEN_TYPE;
    exports.unstable_act = act;
    exports.unstable_getCacheForType = getCacheForType;
    exports.unstable_getCacheSignal = getCacheSignal;
    exports.unstable_useCacheRefresh = useCacheRefresh;
    exports.useCallback = useCallback;
    exports.useContext = useContext;
    exports.useDebugValue = useDebugValue;
    exports.useDeferredValue = useDeferredValue;
    exports.useEffect = useEffect;
    exports.useId = useId;
    exports.useImperativeHandle = useImperativeHandle;
    exports.useInsertionEffect = useInsertionEffect;
    exports.useLayoutEffect = useLayoutEffect;
    exports.useMemo = useMemo;
    exports.useReducer = useReducer;
    exports.useRef = useRef;
    exports.useState = useState;
    exports.useSyncExternalStore = useSyncExternalStore;
    exports.useTransition = useTransition;
    exports.version = ReactVersion;
  });
})();
