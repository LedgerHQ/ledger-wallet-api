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
  sendPayment: function(address, amount) {
    Ledger._messageAfterSession({ command:"send_payment", address:address, amount:amount })
  },
  _createProxy: function() {
    var div = document.createElement('div');
    div.id = 'ledger-iframe';
    div.style.position = 'absolute'
    div.style.left = '-5000px'
    document.body.appendChild(div);
    Ledger._iframe = document.createElement('iframe');
    if (Ledger._options.debug) {
      url = "//dev.ledgerwallet.com:3000/proxy";
    } else {
      url = "//www.ledgerwallet.com/proxy";
    }
    Ledger._iframe.setAttribute("src", url);
    document.getElementById('ledger-iframe').appendChild(Ledger._iframe);
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