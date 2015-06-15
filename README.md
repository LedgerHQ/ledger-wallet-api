# High level API to the Ledger Wallet Chrome app

This is the high level JS API to the [Ledger Wallet Chrome](https://github.com/LedgerHQ/ledger-wallet-chrome) application. With this API, you can communicate directly with the Chrome app and use embedded features such as requesting an address to receive bitcoins, or send a Bitcoin transaction.

Each call to the API will trigger an UI response to the Chrome app, where the user will be able to validate the request.

## Demonstration

A very simple demonstration of the API calls is available here  
https://www.ledgerwallet.com/api/demo.html

## Usage

First, you need to insert the `ledger.js` file in your page:

```html
<head>
  <script src="ledger.js"></script>
</head>
```

Initialization of the `Ledger` object is as follow:

```javascript
function callback(event) {
  console.log(event.response);
};
Ledger.init({ callback: callback });
```

This will create an invisible iframe on the `ledgerwallet.com` domain, acting as a proxy between your web page and the Ledger Chrome app. Each time you request an API call, a message will be sent to the Chrome app and the response will be sent to the `callback` function.

All calls are asynchronous, and you are not garanteed to get a callback (for instance, if the user kills the Chrome app). If you are using a button to trigger a call, it is recommended to disable the action button for a few seconds using for instance `setTimeout(enableButtonFunction, 4000)`.

## API calls

1. [isAppAvailable()](#ledgerisappavailable)
2. [launchApp()](#ledgerlaunchapp)
3. [hasSession()](#ledgerhassession)
4. [getAccounts()](#ledgergetaccounts)
5. [getOperations(account_id)](#ledgergetoperationsaccount_id)
6. [getNewAddresses(account_id, count)](#ledgergetnewaddressesaccount_id-count)
7. [sendPayment(address, amount)](#ledgersendpaymentaddress-amount)
8. [getXPubKey(path)](#ledgergetxpubkeypath)
9. [signP2SH(inputs, scripts, outputs_number, outputs_script, paths)](#ledgersignp2shinputs-scripts-outputs_number-outputs_script-paths)
10. [bitid(uri, silent)](#ledgerbitiduri-silent)

===

##### `Ledger.isAppAvailable()`

Check if the Ledger Chrome app is installed.

```javascript
function callback(event) {
  if (!event) {
    console.log("Chrome app not available");
  } else {
    response = event.response;
    if (response.command == "ping") {
      console.log("Chrome app is available.");
    }
  }
};
Ledger.init({ callback: callback });
Ledger.isAppAvailable();
```

If the Ledger Chrome app is not available, the returned `event` will be `undefined`. If it is available it will return the following `event.response`:

```json
{  
   "command":"ping",
   "result":true
}
```

> All following API calls will return `undefined` if the Ledger Chrome app is not installed. In the next examples, it is taken for granted that the Chrome app is installed, and therefore we are not checking the existence of `event.response`.

===

##### `Ledger.launchApp()`

Launch the Ledger Chrome application. 

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "launch") {
    console.log("Chrome app has been launched.");
  }
};
Ledger.init({ callback: callback });
Ledger.launchApp();
```

It will always return the following response after having launched the app:

```json
{  
   "command":"launch",
   "result":true
}
```

> You usually don't have to use this call, as it will be used by other calls automatically.

===

##### `Ledger.hasSession()`

Check if the wallet is initialized and ready (Nano has been inserted, correct PIN entered, and wallet synchronized).

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "has_session") {
    if (response.result) {
      console.log("Wallet is ready");
    } else {
      console.log("Wallet is NOT ready");
    }
  }
};
Ledger.init({ callback: callback });
Ledger.hasSession();
```

If session is ready:

```json
{  
   "command":"has_session",
   "result":true
}
```

If session is not ready:

```json
{  
   "command":"has_session",
   "result":false
}
```

> You normally don't need to use this call. All following API calls require the wallet to be ready. They will therefore automatically check that app has been launched and wait for the session to be ready by pooling the `hasSession()` call.

===

##### `Ledger.getAccounts()`

Request export of your list of accounts (one account is a HD wallet account, including packs of public addresses).

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "get_accounts") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.getAccounts();
```

If user cancels the request:

```json
{
   "command":"get_accounts",
   "success":false,
   "message":"Request cancelled by the user"
}
```
If user grants the request:

```json
{
   "command":"get_accounts",
   "success":true,
   "accounts":[
      {
         "index":0,
         "name":"My account",
         "id":1,
         "wallet_id":1,
         "total_balance":0,
         "unconfirmed_balance":0,
         "root_path":"44'/0'/0'"
      }
   ]
}
```

Use the value of `id` for `account_id` in `getOperations`.

> All balances are in satoshis.

===

##### `Ledger.getOperations(account_id)`

Request export of all operations (incoming and outgoing transactions) for account `account_id`.

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "get_operations") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.getOperations(1);
```

If user cancels the request:

```json
{
   "command":"get_operations",
   "success":false,
   "message":"Request cancelled by the user"
}
```

If user grants the request:

```json
{  
   "command":"get_operations",
   "success":true,
   "operations":[  
      {  
         "hash":"f5263795501685d5f10ec08a37f3caceb4e215d8632f5cfd325faaa271675cde",
         "fees":50000,
         "time":1429643779892,
         "type":"reception",
         "value":150000,
         "confirmations":333,
         "senders":[  
            "3882TpSheaxuHESqNyMW8L3BA33qirEPYt",
            "3PQhX99dAH2rowwMYfPP1KWKRbdCn55cjJ"
         ],
         "recipients":[  
            "15Tc1vFcBQJD5vCs5sZM3s5cAZewLs8sM5"
         ],
         "id":81,
         "account_id":1
      },
      { }
   ]
}
```

===

##### `Ledger.getNewAddresses(account_id, count)`

Request export of `count` new addresses for account `account_id`.

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "get_new_addresses") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.getOperations(1,5);
```

If user cancels the request:

```json
{
   "command":"get_new_addresses",
   "success":false,
   "message":"Request cancelled by the user"
}
```
If user grants the request:

```json
{  
  "command":"get_new_addresses",
  "success":true,
  "addresses":{  
    "44'/0'/0'/0/36":"1633oRHv5jPwtZW2bASbS4geWKQd5ENR6F",
    "44'/0'/0'/0/37":"1rvTbWuwEuwDCWbMCgqyKTWUK69jqNXwkv",
    "44'/0'/0'/0/38":"1ewd4XZ8tbNSwGZ6e8fxNKdvFEwaQxVULn",
    "44'/0'/0'/0/39":"1cTyUnyCFfXwShaVMZmL6uMpArEUrKnanj",
    "44'/0'/0'/0/40":"185UpphCFnxowehNarFZnxp9FGFsLJsz6D"
  },
  "account_id":1
}
```

===

##### `Ledger.sendPayment(address, amount)`

Request the Chrome app to send a payment of `amount` BTC to `address`.

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "send_payment") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.sendPayment('19QM7ToSsi7N9zsZRdRTLcGZVspXQjQUY5',0.001);
```

If user cancels the request:

```json
{  
   "command":"send_payment",
   "success":false,
   "message":"Payment cancelled"
}
```

If user confirms the payment:

```json
{
   "command":"send_payment",
   "success":true,
   "transaction":{
      "amount":100000,
      "fee":10000,
      "hash":"d4b9377db50380aef6c7ba43316ed4c4573c9969cff726a2460febc789c635dc",
      "raw":"01000000025bca73777be5366d8a92226be8da32a4657ff80a80ac5dc33d42bf43e2d63929000000006a473044022004d695816488a4ebd733a45f24fc56bda675c61be65dc4b854f182baa4693e4802206e99b1bd3b40cd06fc7bae67a8c6fcd13f0eb92f3ce02b48e39aca9dbe7e5411012102109fe1ef60221ca9296a43bd3c9306b103c1588c5e413aab39e43e73bb9ce4c5ffffffffd373960e9a2569bf62451eaabc7ddb1bc16fa4088da2a7eb4dd4f626b3f40230000000006a47304402204f6e0e5935226aa235d6a21fe7ea4933447d57668c33d44837e66f4994fe871102201e09c162ffa03af5aa292bc630ab892a60cd07f330032fdb2b1e0bc45f2969c601210234277b06506b5aa8433cf5fa2df36cc252a9b5292a1c3e58a0ce737641ba13eeffffffff02a0860100000000001976a9145c2b5c8ee43ecc2f2b1141ec6924f53fdb0d009d88ac101e3402000000001976a91414baa4000d841e6e4a19a57efa2eeebdff3ce9b788ac00000000"
   }
}
```

> There is no need to push the raw transaction to the Bitcoin network as it has already been done by the Chrome app.

===

##### `Ledger.getXPubKey(path)`

Request the extended public key for `path`.

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "get_xpubkey") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.getXPubKey("44'/0'/0'");
```

If user cancels the request:

```json
{  
   "command":"get_xpubkey",
   "success":false,
   "message":"Export request cancelled"
}
```

If user confirms the export request:

```json
{  
   "command":"get_xpubkey",
   "success":true,
   "xpubkey":"xpub6D52jcEfKA4cGeGcVC9pwG37Ju8pUMQrhptw82QVHRSAGBELE5uCee7Qq8RJUqQVyxfJfwbJKYyqyFhc2Xg8cJyN11kRvnAaWcACXP6K0zv"
}
```

===

##### `Ledger.signP2SH(inputs, scripts, outputs_number, outputs_script, paths)`

Request the Ledger Nano to sign a multisignature transaction. 

- `inputs` is an array of previous tx hash (human readable), input index (on 4 bytes, big endian encoded)
- `scripts` is an array containing the redeem scripts
- `outputs_number` is the number of outputs
- `outputs_script` is the serialized output scripts
- `paths` is an array containing the paths to the keys associated to each inputs

The example below show the expected format of the arguments.

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "sign_p2sh") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
var inputs = [
  [ "71f97fa2a21486ecd99674a8ae068d92acd2e9db49c199473be39984e6cbe0f6", "00000000" ],
  [ "171e6a969ff196a2cfaaba4780c292e33fc297672a065cc5c5c684727cf9e3ba", "00000001" ]
];
var scripts = [ 
  "52210289b4a3ad52a919abd2bdd6920d8a6879b1e788c38aa76f0440a6f32a9f1996d02103a3393b1439d1693b063482c04bd40142db97bdf139eedd1b51ffb7070a37eac321030b9a409a1e476b0d5d17b804fcdb81cf30f9b99c6f3ae1178206e08bc500639853ae",
  "522102afe2165371442437b86089a17e8d1c26d127e3723b19f568e9c11e326946111521032d139518b16c112d5f1a52157f1468c0b7a570c41673debee8cd2e53eb084df12103b13fe78b0320ceb77795c87ed72069f12edf64169d15f8f9827f0bb4fdbe760f53ae"
];    
var paths = [
  "44'/0'/0'/0/0/0/1",
  "44'/0'/0'/0/0/0/2",
];
var outputs_number = 2
var outputs_script = "40420f00000000001976a91496986c2703c6b311c884bf916d28621bc61e8b7a88acdc0c03000000000017a914ddf0a9f3e0c9822feef702d36dee6c0bd2bf7c6d87"
Ledger.signP2SH(inputs, scripts, outputs_number, outputs_script, paths);
```

If user cancels the signature request:

```json
{  
   "command":"p2sh",
   "success":false,
   "message":"Signature request declined"
}
```

If user confirms the signature request:

```json
{  
   "command":"sign_p2sh",
   "success":true,
   "signatures":[  
      "3044022012affaf1b44b4bd365a6ab45f0911ea0825cd621a3adef135f5877af013628ae0220745c106a9823e0b3fdcede7129605420213491b32b40abf2b9934a33614d296301",
      "304502210087f7c10e1f3390558e25dd2ed6c6d4cf6e0f86b2cdd065136b5ed4e3c3c36a3202200ce27357a2b36f7b3b102eeb4eb5b4937c5a84ecc4337f25c46e3704667a930a01"
   ]
}
```

> Nothing is broadcasted on the Bitcoin network.

> As it is a P2SH signature, the Ledger Nano won't ask for a second factor confirmation.

===

##### `Ledger.bitid(uri, silent)`

Request a [BitID](https://github.com/bitid/bitid) login to `uri`. If `silent` is `true` then the Chrome app will not post the signature to the host (you'll have to do it yourself in your JS app).

```javascript
function callback(event) {
  response = event.response;
  if (response.command == "bitid") {
    console.log(response);
  }
};
Ledger.init({ callback: callback });
Ledger.bitid('bitid://bitid.bitcoin.blue/callback?x=5f38d0fb45b25015&u=1');
```

If user cancels the authentication request:

```json
{  
   "command":"bitid",
   "success":false,
   "message":"Authentication cancelled"
}
```

If user confirms the authentication request:

```json
{  
   "command":"bitid",
   "success":true,
   "address":"1M7gUz4NRLBty5WUuNQPNNG5GE2x5t6Wbp",
   "signature":"H5/DFfbXP6tX9bNn/74l/HGC7jhInL5cKCFtLLUQ4nt6C1dB6hepuAlHSI5tG2TsLG6p6ox1qk1EUiMnFikDrEg=",
   "uri":"bitid://bitid.bitcoin.blue/callback?x=5f38d0fb45b25015&u=1"
}
```


## Roadmap

If you would like to see other API calls for your specific needs, please open an issue with a description of what you would like and we'll discuss adding this functionality on our roadmap.
