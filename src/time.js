/**
 * @file time.js
 *   An implementation of XEP-0202 (Entity Time)
 * @author Christoph Burschka
 * @see http://xmpp.org/extensions/xep-0202.html
 */

Strophe.addNamespace('TIME', 'urn:xmpp:time');
Strophe.addConnectionPlugin('time', {
  init(conn) {
    this._c = conn;
  },

  /**
   * Request time information from an entity.
   *
   * @param {string} to
   * @param {int} timeout
   *
   * @return {Promise} A promise that resolves to the response.
   */
  query(to, timeout) {
    const id = this._c.getUniqueId('time');
    const iq = $iq({id, to, type: 'get'});
    iq.c('time', {xmlns: Strophe.NS.TIME});

    return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
  },

  /**
   * Respond to a time request.
   *
   * @param {Stanza} request
   *
   * @return {boolean} Always returns true.
   */
  respond(request) {
    const iq = $iq({
      id: request.getAttribute('id'),
      to: request.getAttribute('from'),
      type: 'result',
    });
    iq.c('time', {xmlns: Strophe.NS.TIME});
    iq.c('utc', {}, moment().toISOString());
    iq.c('tzo', {}, moment().format('Z'));
    this._c.sendIQ(iq);
    return true;
  },

  /**
   * Add a time request handler.
   *
   * @param {function} handler (optional, defaults to a simple response).
   *
   * @return A reference to the handler that can be used to remove it.
   */
  addHandler(handler) {
    handler = handler || request => this.respond(request);
    return this._c.addHandler(handler, Strophe.NS.TIME, 'iq', 'get');
  }
});
