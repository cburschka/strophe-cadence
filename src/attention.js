/**
 * @file attention.js
 *   Implements XEP-0224 (Attention).
 * @author Christoph Burschka
 * @see http://xmpp.org/extensions/xep-0224.html
 */

Strophe.addNamespace('ATTENTION', 'urn:xmpp:attention:0');
Strophe.addConnectionPlugin('attention', {
  init(conn) {
    this._c = conn;
  },

  /**
   * Add <attention> to a message stanza.
   * The stanza must be generated and sent by the caller.
   *
   * @param {Builder} msg The message stanza builder.
   *                      The pointer must be at the root element.
   *
   * @return the stanza with <attention> appended.
   */
  attention(msg) {
    return msg.c('attention', {xmlns: Strophe.NS.ATTENTION}, '');
  },

  /**
   * Add a handler that listens for attention stanzas.
   *
   * @param {function} handler
   *
   * @return The reference that can be used to remove the handler.
   */
  addHandler(handler) {
    return this._c.addHandler(handler, Strophe.NS.ATTENTION, 'message');
  }
});
