/**
 *
 * Scrollspy v0.0.1
 * Vanilla JS scrollspy with smooth scrolling for navigation menus
 * by Jake Johnson
 * http://divshot.com
 *
 * Free to use under the MIT License.
 * http://github.com/fastdivision/scrollspy
 *
 */

(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
    define('scrollSpy', factory(root));
  } else if ( typeof exports === 'object' ) {
    module.exports = factory(root);
  } else {
    root.scrollSpy = factory(root);
  }
})(this, function (root) {

  'use strict';

  var exports = {};
  var supports = !!document.querySelector && !!root.addEventListener;
  var anchors;
  var settings;
  var defaults = {
    container: 'body',
    items: '.nav li a',
    activeClass: 'active',
    offset: 20,
    scrollSpeed: 500,
    scrollEasing: 'easeInOutCubic',
    activated: function () {}
  };

  /**
   * A simple forEach() implementation for Arrays, Objects and NodeLists
   * @private
   * @param {Array|Object|NodeList} collection Collection of items to iterate
   * @param {Function} callback Callback function for each iteration
   * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
   */
  var forEach = function (collection, callback, scope) {
    if (Object.prototype.toString.call(collection) === '[object Object]') {
      for (var prop in collection) {
        if (Object.prototype.hasOwnProperty.call(collection, prop)) {
          callback.call(scope, collection[prop], prop, collection);
        }
      }
    } else {
      for (var i = 0, len = collection.length; i < len; i++) {
        callback.call(scope, collection[i], i, collection);
      }
    }
  };

  /**
   * Merge defaults with user options
   * @private
   * @param {Object} defaults Default settings
   * @param {Object} options User options
   * @returns {Object} Merged values of defaults and options
   */
  var extend = function ( defaults, options ) {
    var extended = {};
    forEach(defaults, function (value, prop) {
      extended[prop] = defaults[prop];
    });
    forEach(options, function (value, prop) {
      extended[prop] = options[prop];
    });
    return extended;
  };

  /**
   * Escape special characters for use with querySelector
   * @private
   * @param {String} id The anchor ID to escape
   * @author Mathias Bynens
   * @link https://github.com/mathiasbynens/CSS.escape
   */
  var escapeCharacters = function ( id ) {
    var string = String(id);
    var length = string.length;
    var index = -1;
    var codeUnit;
    var result = '';
    var firstCodeUnit = string.charCodeAt(0);
    while (++index < length) {
      codeUnit = string.charCodeAt(index);
      // Note: there’s no need to special-case astral symbols, surrogate
      // pairs, or lone surrogates.

      // If the character is NULL (U+0000), then throw an
      // `InvalidCharacterError` exception and terminate these steps.
      if (codeUnit === 0x0000) {
        throw new InvalidCharacterError(
          'Invalid character: the input contains U+0000.'
        );
      }

      if (
        // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
        // U+007F, […]
        (codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
        // If the character is the first character and is in the range [0-9]
        // (U+0030 to U+0039), […]
        (index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
        // If the character is the second character and is in the range [0-9]
        // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
        (
          index === 1 &&
          codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
          firstCodeUnit === 0x002D
        )
      ) {
        // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
        result += '\\' + codeUnit.toString(16) + ' ';
        continue;
      }

      // If the character is not handled by one of the above rules and is
      // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
      // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
      // U+005A), or [a-z] (U+0061 to U+007A), […]
      if (
        codeUnit >= 0x0080 ||
        codeUnit === 0x002D ||
        codeUnit === 0x005F ||
        codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
        codeUnit >= 0x0041 && codeUnit <= 0x005A ||
        codeUnit >= 0x0061 && codeUnit <= 0x007A
      ) {
        // the character itself
        result += string.charAt(index);
        continue;
      }

      // Otherwise, the escaped character.
      // http://dev.w3.org/csswg/cssom/#escape-a-character
      result += '\\' + string.charAt(index);

    }
    return result;
  };

  /**
   * Calculate the easing pattern
   * @private
   * @param {String} type Easing pattern
   * @param {Number} time Time animation should take to complete
   * @returns {Number}
   */
  var easingPattern = function ( type, time ) {
    var pattern;
    if ( type === 'easeInQuad' ) pattern = time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuad' ) pattern = time * (2 - time); // decelerating to zero velocity
    if ( type === 'easeInOutQuad' ) pattern = time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
    if ( type === 'easeInCubic' ) pattern = time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutCubic' ) pattern = (--time) * time * time + 1; // decelerating to zero velocity
    if ( type === 'easeInOutCubic' ) pattern = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
    if ( type === 'easeInQuart' ) pattern = time * time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuart' ) pattern = 1 - (--time) * time * time * time; // decelerating to zero velocity
    if ( type === 'easeInOutQuart' ) pattern = time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
    if ( type === 'easeInQuint' ) pattern = time * time * time * time * time; // accelerating from zero velocity
    if ( type === 'easeOutQuint' ) pattern = 1 + (--time) * time * time * time * time; // decelerating to zero velocity
    if ( type === 'easeInOutQuint' ) pattern = time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration
    return pattern || time; // no easing, no acceleration
  };

  /**
   * Calculate how far to scroll
   * @private
   * @param {Element} anchor The anchor element to scroll to
   * @param {Number} headerHeight Height of a fixed header, if any
   * @param {Number} offset Number of pixels by which to offset scroll
   * @returns {Number}
   */
  var getEndLocation = function ( anchor, headerHeight, offset ) {
    var location = 0;
    if (anchor.offsetParent) {
      do {
        location += anchor.offsetTop;
        anchor = anchor.offsetParent;
      } while (anchor);
    }
    location = location - headerHeight - offset;
    return location >= 0 ? location : 0;
  };

  /**
   * Determine the document's height
   * @private
   * @returns {Number}
   */
  var getDocumentHeight = function () {
    return Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
  };

  /**
   * Update the URL
   * @private
   * @param {Element} anchor The element to scroll to
   * @param {Boolean} url Whether or not to update the URL history
   */
  var updateUrl = function ( anchor, url ) {
    if ( history.pushState && (url || url === 'true') ) {
      history.pushState( {
        pos: anchor.id
      }, '', window.location.pathname + anchor );
    }
  };

  /**
   * Start/stop the scrolling animation
   * @public
   * @param {Element} toggle The element that toggled the scroll event
   * @param {Element} anchor The element to scroll to
   * @param {Object} settings
   * @param {Event} event
   */
  exports.animateScroll = function ( toggle, anchor, options, event ) {

    // Options and overrides
    var settings = extend( settings || defaults, options || {} );  // Merge user options with defaults
    anchor = '#' + escapeCharacters(anchor.substr(1)); // Escape special characters and leading numbers

    // Selectors and variables
    var startLocation = root.pageYOffset; // Current location on the page
    var endLocation = getEndLocation( document.querySelector(anchor), 0, parseInt(settings.offset, 10) ); // Scroll to location
    var animationInterval; // interval timer
    var distance = endLocation - startLocation; // distance to travel
    var documentHeight = getDocumentHeight();
    var timeLapsed = 0;
    var percentage, position;

    // Update URL
    updateUrl(anchor, true);

    /**
     * Stop the scroll animation when it reaches its target (or the bottom/top of page)
     * @private
     * @param {Number} position Current position on the page
     * @param {Number} endLocation Scroll to location
     * @param {Number} animationInterval How much to scroll on this loop
     */
    var stopAnimateScroll = function (position, endLocation, animationInterval) {
      var currentLocation = root.pageYOffset;
      if ( position == endLocation || currentLocation == endLocation || ( (root.innerHeight + currentLocation) >= documentHeight ) ) {
        clearInterval(animationInterval);
      }
    };

    /**
     * Loop scrolling animation
     * @private
     */
    var loopAnimateScroll = function () {
      timeLapsed += 16;
      percentage = ( timeLapsed / parseInt(settings.scrollSpeed, 10) );
      percentage = ( percentage > 1 ) ? 1 : percentage;
      position = startLocation + ( distance * easingPattern(settings.scrollEasing, percentage) );
      root.scrollTo( 0, Math.floor(position) );
      stopAnimateScroll(position, endLocation, animationInterval);
    };

    /**
     * Set interval timer
     * @private
     */
    var startAnimateScroll = function () {
      animationInterval = setInterval(loopAnimateScroll, 16);
    };

    /**
     * Reset position to fix weird iOS bug
     * @link https://github.com/cferdinandi/smooth-scroll/issues/45
     */
    if ( root.pageYOffset === 0 ) {
      root.scrollTo( 0, 0 );
    }

    // Start scrolling animation
    startAnimateScroll();

  };

  var clickHandler = function (event) {
    if (event.target.tagName.toLowerCase() === 'a') {
      event.preventDefault();
      scrollSpy.animateScroll( event.target, event.target.hash, settings, event );
    }
  };

  var scrollHandler = function (event) {
    var closestLink = findClosest(anchors, root.pageYOffset);
    var prevLink = document.querySelector(settings.items + '.' + settings.activeClass);
    if (prevLink && prevLink != closestLink.link) {
      prevLink.classList.remove(settings.activeClass);
      settings.activated();
    }
    closestLink.link.classList.add(settings.activeClass);
  };

  var findAnchors = function (links) {
    var anchors = [];
    var container = document.querySelector(settings.container);

    if (container)
      var containerRect = container.getBoundingClientRect();
    else
      return console.error('Scrollspy container not found.');

    forEach(links, function(link) {
      var anchor = {};
      anchor.link = link;
      anchor.el = document.querySelector(link.attributes.href.value); 

      var rect = anchor.el.getBoundingClientRect();
      anchor.offset = Math.floor(rect.top - containerRect.top);

      anchors.push(anchor);
    });

    return anchors;
  };

  var findClosest = function (anchors, offset) {
    var closest = null;

    forEach(anchors, function(anchor) {
      if (closest == null || Math.abs(anchor.offset - offset) < Math.abs(closest.offset - offset)) {
        closest = anchor;
      }
    });

    return closest;
  };

  /**
   * Destroy the current initialization.
   * @public
   */
  exports.destroy = function () {
    if ( !settings ) return;
    document.removeEventListener( 'click', clickHandler, false );
    root.removeEventListener( 'scroll', scrollHandler, false );
    settings = null;
  };

  /**
   * Refresh scrollspy.
   * @public
  */
  exports.refresh = function () {
    anchors = findAnchors(links);
  };

  /**
   * Initialize Plugin
   * @public
   * @param {Object} options User settings
   */
  exports.init = function ( options ) {
    if ( !supports ) return;

    // Destroy any existing initializations
    scrollSpy.destroy();

    // Selectors and variables
    settings = extend( defaults, options || {} ); // Merge user options with defaults

    var links = document.querySelectorAll(settings.items);
    anchors = findAnchors(links);

    document.addEventListener('click', clickHandler, false);
    root.addEventListener('scroll', scrollHandler, false);

    // Check scroll on init
    scrollHandler(false);
  };

  return exports;

});