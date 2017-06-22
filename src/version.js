/**
 * @file version.js
 *   An implementation of XEP-0092 (Software Version)
 * @author Christoph Burschka
 * @see http://xmpp.org/extensions/xep-0092.html
 */

define(['strophe.js'], ({Strophe, $iq}) => {
  Strophe.addNamespace('VERSION', 'jabber:iq:version');
  Strophe.addConnectionPlugin('version', {
    info: {
      name: '[name]',
      version: '[version]',
      os: '[os]',
    },

    /**
     * Initialize the plugin.
     *
     * @param conn
     */
    init(conn) {
      this._c = conn;
      if (this._c.disco) {
        this._c.disco.addFeature(Strophe.NS.VERSION);
      }
      this.addHandler(this.responder(this.info));
    },

    /**
     * Set version information.
     *
     * @param {Object} info
     * @returns integer
     */
    setInfo(info) {
      this.info = info;
      return this.addHandler(this.responder(info));
    },

    /**
     * Request version information from an entity.
     *
     * @param {string} to The JID of the target entity.
     * @param {int} timeout The (optional) timeout.
     *
     * @return {Promise} A promise that resolves to the response.
     */
    query(to, timeout) {
      const id = this._c.getUniqueId('version');
      const iq = $iq({type: 'get', to, id});
      iq.c('query', {xmlns: Strophe.NS.VERSION});

      return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    },

    /**
     * Respond to a version request.
     *
     * @param {Object} request
     * @param {string} name
     * @param {string} version
     * @param {string} os (optional)
     *
     * @return {boolean} Always returns true.
     */
    respond(request, name, version, os) {
      const iq = $iq({
        id: request.getAttribute('id'),
        to: request.getAttribute('from'),
        type: 'result',
      });
      iq.c('query', {xmlns: Strophe.NS.VERSION});
      iq.c('name', {}, name);
      iq.c('version', {}, version);
      if (os) iq.c('os', {}, os);
      this._c.sendIQ(iq);
      return true;
    },

    /**
     * Returns a curried function that responds to every request with fixed values.
     *
     * @param {string} name
     * @param {string} version
     * @param {string} os (optional)
     *
     * @return {function} A request handler.
     */
    responder({name, version, os}) {
      return request => this.respond(request, name, version, os);
    },

    /**
     * Add a version request handler.
     *
     * @param {function} handler.
     *
     * @return A reference to the handler that can be used to remove it.
     */
    addHandler(handler) {
      if (this.handler) {
        this._c.deleteHandler(this.handler);
      }
      this.handler = this._c.addHandler(handler, Strophe.NS.VERSION, 'iq', 'get');
      return this.handler;
    }
  });
});
