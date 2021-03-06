/**
 * @file caps.js
 *   Implements XEP-0115 (Entity Capabilities)
 * @see http://xmpp.org/extensions/xep-0115.html
 * The disco plugin is recommended.
 */

define(['strophe.js'], ({Strophe, SHA1, $build}) => {
  const cmp = (a, b) => (a !== b) * (1 - 2 * (a < b));
  const cmpProp = prop => (a, b) => cmp(a[prop], b[prop]);
  const defaultNode = 'https://github.com/cburschka/strophe-cadence';

  Strophe.addNamespace('CAPS', 'http://jabber.org/protocol/caps');
  Strophe.addConnectionPlugin('caps', {
    init(conn) {
      this._c = conn;
    },

    /**
     * Add a caps element to a presence stanza.
     *
     * @param {Builder} pres (the index must be at the root element)
     * @param {Object} disco (optional, defaults to disco plugin).
     *                 If passed, should contain "identities" and "features" properties.
     *
     * @return {Builder}
     */
    caps(pres, disco) {
      const caps = this.createCapsNode(disco).tree();
      return pres.cnode(caps).up();
    },

    /**
     * Create a caps element.
     */
    createCapsNode(disco = this._c.disco) {
      const [identity={}] = disco.identities.values();
      const node = identity.name || defaultNode;
      const ver = SHA1.b64_sha1(this.ver(disco));
      return $build('c', {node, ver, hash: 'sha-1', xmlns: Strophe.NS.CAPS});
    },

    /**
     * Create a version string from the identities and features.
     */
    ver({identities, features}) {
      identities = Array.from(identities.values());
      features = Array.from(features).sort();
      ['category', 'type', 'lang'].forEach(prop => identities.sort(cmpProp(prop)));
      const idstrings = identities.map(
        ({category, type, lang, name}) => `${category}/${type}/${name}/${lang}`
      );
      return (idstrings + features.map(String)).join('<') + '<';
    }
  });
});
