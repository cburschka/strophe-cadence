/**
 * @file disco.js
 *   Implements XEP-0030 (Service Discovery)
 * @see http://xmpp.org/extensions/xep-0030.html
 */

define(['strophe.js'], ({Strophe, $iq}) => {
  Strophe.addConnectionPlugin('disco', {
    identities: [],
    features: [],
    items: [],
    handlers: {},

    init(conn) {
      this._c = conn;
      // Add default info/items handlers.
      this.addInfoHandler();
      this.addItemHandler();
    },

    addIdentity(category, type, name = '', lang = '') {
      this.removeIdentity(category, type, name, lang);
      this.identities.push({category, type, name, lang});
    },

    removeIdentity(category, type, name = '', lang = '') {
      const search = `${category}/${type}/${name}/${lang}`;
      const index = this.identities.findIndex(({category, type, name, lang}) => (
        `${category}/${type}/${name}/${lang}` === search
      ));
      if (~index) delete this.identities[index];
    },

    addFeature(namespace) {
      this.features = namespace;
    },

    removeFeature(namespace) {
      const index = this.features.indexOf(namespace);
      if (~index) delete this.features[index];
    },

    addItem(jid, name) {
      this.removeItem(jid);
      this.items.push({jid, name});
    },

    removeItem(_jid) {
      const index = this.items.findIndex(({jid}) => jid === _jid);
      if (~index) delete this.items[index];
    },

    queryInfo(to, {timeout}) {
      const id = this._c.getUniqueId('disco#info');
      const iq = $iq({id, to, type: 'get'});
      iq.c('query', {xmlns: Strophe.NS.DISCO_INFO});
      return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    },

    queryItems(to, {node, timeout}) {
      const id = this._c.getUniqueId('disco#items');
      const iq = $iq({id, to, type: 'get'});
      iq.c('query', {xmlns: Strophe.NS.DISCO_ITEMS});
      if (node) iq.attr({node});
      return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    },

    respond(request) {
      const iq = $iq({
        id: request.getAttribute('id'),
        to: request.getAttribute('from'),
        type: 'result'
      });

      const query = request.querySelector('query');
      const xmlns = query.getAttribute('xmlns');

      iq.c('query', {xmlns});

      if (xmlns === Strophe.NS.DISCO_INFO) {
        this.identities.forEach(identity => iq.c('identity', identity, ''));
        this.features.forEach(feature => iq.c('feature', {'var': feature}, ''));
      }
      else this.items.forEach(item => iq.c('item', item, ''));

      return this._c.sendIQ(iq);
    },

    addInfoHandler(handler) {
      if (this.handlers.info) {
        this._c.deleteHandler(this.handlers.info);
      }
      handler = handler || (request => this.respond(request));
      this.handlers.info = this._c.addHandler(handler, Strophe.NS.DISCO_INFO, 'iq', 'get');
      return this.handlers.info;
    },

    addItemHandler(handler) {
      if (this.handlers.items) {
        this._c.deleteHandler(this.handlers.items);
      }
      handler = handler || (request => this.respond(request));
      this.handlers.items = this._c.addHandler(handler, Strophe.NS.DISCO_ITEMS, 'iq', 'get');
      return this.handlers.items;
    }
  });
});