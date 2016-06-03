/**
 * @file commands.js
 *   Implements XEP-0050 (Ad-Hoc Commands).
 * @author Christoph Burschka
 * @see http://xmpp.org/extensions/xep-0050.html
 */

Strophe.addNamespace('COMMANDS', 'http://jabber.org/protocol/commands');
Strophe.addNamespace('DATA', 'jabber:x:data');
Strophe.addConnectionPlugin('commands', {
  init(connection) {
    this._c = connection;
  },

  /**
   * List the available command nodes on a component.
   *
   * @param {JID} to
   * @param {int} timeout (optional)
   *
   * @return {Promise}
   */
  list(to, timeout) {
    return this._c.disco.queryItems(to, {timeout, node: Strophe.NS.COMMANDS});
  },

  /**
   * Execute a command node.
   *
   * @param {JID} to
   * @param {String} node
   * @param {int} timeout (optional)
   *
   * @return {Promise}
   */
  execute(to, node, timeout) {
    const id = this._c.getUniqueId('commands');
    const iq = $iq({id, to, type: 'set'});
    iq.c('query', {node, xmlns: Strophe.NS.COMMANDS, action: 'execute'});
    return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
  },

  /**
   *
   * @param {JID} to
   * @param {String} node
   * @param {DOM} data (optional)
   * @param {int} timeout (optional)
   *
   * @return {Promise}
   */
  submit(to, node, data, timeout) {
    const id = this._c.getUniqueId('commands');
    const iq = $iq({id, to, type: 'set'});
    iq.c('query', {node, xmlns: Strophe.NS.COMMANDS});
    iq.c('x', {xmlns: Strophe.NS.DATA, type: 'submit'});
    Array.concat(data).forEach(node => iq.cnode(node).up());
    return new Promise((resolve, reject) => this._c.sendIQ(iq, resolve, reject, timeout));
  },
});
