/**
* Global Static Event Utilities helper that assists us to add
* cross platform events to any DOM object as well retrieving
* their target if any exists.
*
* @author Mohamed Mansour (http://mohamedmansour.com)
*/
var event_utils = {
  add: function(obj, type, callback) {
    if (obj.addEventListener)
      obj.addEventListener(type, callback, false);
    else if (obj.attachEvent)
      obj.attachEvent("on" + type, callback);
  }
}


/**
* Preloads an IFrame since it may take time to load.
*
* @param {string} id The identifier for the Iframe you want preloaded.
* @author Mohamed Mansour (http://mohamedmansour.com)
*/
IFramePreloader = function(id)
{
  that = this;
  this.id = id;
  this.iframe = document.getElementById(id);
  this.placeholder = this.createPlaceholder();
}

IFramePreloader.prototype = {

  /**
  * Initializes the preloader to wait till a load event occurs in the iframe.
  */
  init: function()
  {
    this.iframe.style.display = 'none';
    event_utils.add(this.iframe, 'load', function(e) { that.handleLoad(e); });
  },

  /**
  * Creates the placeholder for that Iframe.
  * @return {Element} The placeholder element.
  */
  createPlaceholder: function()
  {
    // Create placeholder.
    var newElement = document.createElement('div');
    newElement.id = this.id + '-placeholder';
    newElement.appendChild(document.createTextNode('Loading ...'));

    // Adding that placeholder right after the iframe. We first check if its the
    // last child, if so, we just append it. Otherwise, we insert it before the
    // next sibling.
    var parent = this.iframe.parentNode;
    if (parent.lastChild == this.iframe) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, this.iframe.nextSibling);
    }
    return newElement;
  },

  /**
  * Show the frame, hide the preloader. Since it has been loaded!
  */
  handleLoad: function()
  {
    this.iframe.style.display = 'block';
    this.placeholder.style.display = 'none';
  }
}