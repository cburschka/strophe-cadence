/**
 * @file ping.js
 *   An implementation of XEP-0199 (Ping)
 * @see http://xmpp.org/extensions/xep-0199.html
 */

define(['strophe.js'], ({Strophe, $iq}) => {
  Strophe.addNamespace('PING', "urn:xmpp:ping");
  Strophe.addConnectionPlugin('ping', {
    init(conn) {
      this._c = conn;
      if (this._c.disco) {
        this._c.disco.addFeature(Strophe.NS.PING);
      }
      this.addHandler();
    },

    /**
     * Send a ping.
     *
     * @param {string} to
     * @param {int} timeout (optional)
     *
     * @return {Promise} A promise that will resolve to the response stanza.
     */
    query(to, timeout) {
      const id = this._c.getUniqueId('ping');
      const iq = $iq({id, to, type: 'get'});
      iq.c('ping', {xmlns: Strophe.NS.PING});

      return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    },

    /**
     * Respond to a ping.
     *
     * @param {Stanza} request - The ping stanza from the server
     */
    respond(request) {
      this._c.sendIQ($iq({
        id: request.getAttribute('id'),
        to: request.getAttribute('from'),
        type: 'result',
      }));
      return true;
    },

    /**
     * Add a handler for pings.
     *
     * @param {function} handler (optional, defaults to a simple response).
     *
     * @return {int} A reference to the handler that can be used to remove it.
     */
    addHandler(handler=null) {
      handler = handler || (request => this.respond(request));
      return this._c.addHandler(handler, Strophe.NS.PING, 'iq', 'get');
    }
  });
});
