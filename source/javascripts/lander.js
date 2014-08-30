//= require 'scrollspy'
//= require 'skrollr'

document.addEventListener("DOMContentLoaded", function() {
  if (!(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera)) {
    s = skrollr.init({ easing: 'sqrt', smoothScrollingDuration: 500, forceHeight: false })
  }

  scrollSpy.init({
    items: 'nav li a'
  });
});