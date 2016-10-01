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
   *
   * @return {Builder} A request stanza that can be filled with data.
   *               The .send(timeout) method will send the stanza to the server,
   *               and return a promise.
   */
  set(root, namespace) {
    const id = this._c.getUniqueId('storage');
    const iq = $iq({id, type: 'set'});
    iq.c('query', {xmlns: Strophe.NS.STORAGE});
    iq.c(root, {xmlns: namespace});
    iq.send = timeout => new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
    iq.write = data => this.write(iq, data);
    return iq;
  },

  /**
   * A simple recursive object writer.
   *
   * @param {Builder} node A strophe builder.
   * @param {data} data The data to encode.
   */
  write(node, data) {
    const encodeValue = (val, name) => {
      node.c('data', {name});
      if (typeof val !== 'object') {
        node.attrs({type: typeof val});
        if (val !== undefined) node.t(String(val));
      }
      else if (val instanceof Array) {
        node.attrs({type: 'array'});
        val.forEach(encodeValue);
      }
      // typeof null == 'object'. Blame Javascript.
      else if (val === null) node.attrs({type: 'null'});
      else {
        node.attrs({type: 'object'});
        Object.forEach(val,
          (key, value) => encodeValue(value, key)
        );
      }
      node.up();
    }

    encodeValue(data);
    return node;
  },

  /**
   * Traverse a DOM object to return a data object.
   */
  read(node) {
    const decodeValue = node => {
      const value = node.textContent;
      switch (node.getAttribute('type')) {
        case 'object': return decodeObject(node);
        case 'array': return decodeArray(node);
        case 'number': return parseFloat(value);
        case 'boolean': return value === 'true';
        case 'undefined': return undefined;
        case 'null': return null;
        default: return value;
      }
    };
    const decodeArray = ({childNodes}) => Array.from(childNodes).map(decodeValue);
    const decodeObject = ({childNodes}) => Object.fromEntries(Array.from(childNodes).map(
      e => [e.getAttribute('name'), decodeValue(e)]
    ));

    return decodeValue(node);
  }
});
