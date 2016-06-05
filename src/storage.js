/**
 * @file storage.js
 *   An implementation of XEP-0049 (Private XML Storage)
 * @author Christoph Burschka
 * @see http://xmpp.org/extensions/xep-0049.html
 */

Strophe.addNamespace('STORAGE', 'jabber:iq:private');
Strophe.addConnectionPlugin('storage', {
  init(conn) {
    this._c = conn;
  },

  /**
   * Retrieve data from storage.
   * This will retrieve the <{root} xmlns="{namespace}"> element.
   *
   * @param {string} root The element to retrieve.
   * @param {string} namespace The namespace of the element.
   * @param {int} timeout The (optional) timeout for the request.
   *
   * @return {Promise} A promise that resolves to the response stanza.
   */
  get(root, namespace, timeout) {
    const id = this._c.getUniqueId('storage');
    const iq = $iq({id, type: 'get'});
    iq.c('query', {xmlns: Strophe.NS.STORAGE});
    iq.c(root, {xmlns: namespace}, '');

    return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
  },

  /**
   * Send data to storage.
   * This will store data inside the <{root} xmlns="{namespace}"> element.
   *
   * @param {string} root The element to store.
   * @param {string} namespace The namespace of the element.
   * @param {DOM|Array} data An array of DOM nodes to insert.
   * @param {int} timeout The (optional) timeout for the request.
   *
   * @return {Promise} A promise that resolves to the response stanza.
   */
  set(root, namespace) {
    const id = this._c.getUniqueId('storage');
    const iq = $iq({id, type: 'set'});
    iq.c('query', {xmlns: Strophe.NS.STORAGE});
    iq.c(root, {xmlns: namespace});
    iq.send = timeout => new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    return iq;
  }
});
