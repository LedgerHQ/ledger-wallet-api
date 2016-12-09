var Ledger = {
  init: function(options) {
    Ledger._options = options
    Ledger._poll_session = false;
    Ledger._createProxy();
    addEventListener("message", Ledger._callback, false);
  },
  isAppAvailable: function() {
    Ledger._message({ command:"ping" });
  },
  launchApp: function() {
    Ledger._message({ command:"launch" });
  },
  hasSession: function() {
    Ledger._message({ command:"has_session" });
  },
  bitid: function(uri, silent) {
    Ledger._messageAfterSession({ command:"bitid", uri:uri, silent:silent })
  },
  getAccounts: function() {
    Ledger._messageAfterSession({ command:"get_accounts" })
  },
  getOperations: function(account_id) {
    Ledger._messageAfterSession({ command:"get_operations", account_id: account_id })
  },
  getNewAddresses: function(account_id, count) {
    Ledger._messageAfterSession({ command:"get_new_addresses", account_id: account_id, count: count })
  },
  sendPayment: function(address, amount, data) {
    Ledger._messageAfterSession({ command:"send_payment", address:address, amount:amount, data:data })
  },
  getXPubKey: function(path) {
    Ledger._messageAfterSession({ command:"get_xpubkey", path:path })
  },
  signMessage: function(path, message) {
    Ledger._messageAfterSession({ command:"sign_message", path:path, message:message })
  },
  signP2SH: function(inputs, scripts, outputs_number, outputs_script, paths) {
    Ledger._messageAfterSession({ command:"sign_p2sh", inputs: inputs, scripts: scripts, outputs_number: outputs_number, outputs_script: outputs_script, paths: paths })
  },
  _createProxy: function() {
    var div = document.createElement('div');
    div.id = 'ledger-iframe';
    div.style.position = 'absolute'
    div.style.left = '-5000px'
    document.body.appendChild(div);
    Ledger._iframe = document.createElement('iframe');
    Ledger._iframe.setAttribute("src", "https://www.ledgerwallet.com/proxy");
    document.getElementById('ledger-iframe').appendChild(Ledger._iframe);
    Ledger._iframe.addEventListener("load", function() {
        if (Ledger._after_session) {
          Ledger.launchApp(); 
        }
      }, false);
  },
  _message: function(data) {
    Ledger._iframe.contentWindow.postMessage(data, "*");
  },
  _messageAfterSession: function(data) {
    Ledger._after_session = data
    Ledger._message("launch");
    Ledger._should_poll_session = true;
    Ledger._do_poll_session();
  },
  _callback: function(event) {
    if (typeof event.data.response == "object" && event.data.response.command == "has_session" && event.data.response.success && typeof Ledger._after_session == "object") {
      Ledger._message(Ledger._after_session);
      Ledger._after_session = null;
      Ledger._should_poll_session = false;
    }
    Ledger._options.callback(event.data);
  },
  _do_poll_session: function() {
    Ledger.hasSession();
    if (Ledger._should_poll_session) {
      setTimeout(Ledger._do_poll_session, 500);
    }
  }
};