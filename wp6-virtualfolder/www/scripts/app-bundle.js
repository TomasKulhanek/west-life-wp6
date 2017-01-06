define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);

    this.message = 'Hello World!';
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('b2dropcontrol/acontrol',["exports", "aurelia-http-client"], function (exports, _aureliaHttpClient) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AControl = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var client = new _aureliaHttpClient.HttpClient();

    var AControl = exports.AControl = function () {
        function AControl() {
            _classCallCheck(this, AControl);

            this.heading = "connector";
            this.username = "";
            this.usertoken = "";
            this.status = "unknown";
            this.dialogstate = 1;
            this.dialogstateconnected, this.dialogstateconnecting = false;
            this.dialogstateentry = true;
            this.servicecontext = "";
            this.showbutton = false;
            client.configure(function (config) {
                config.withHeader('Accept', 'application/json');
                config.withHeader('Content-Type', 'application/json');
            });
        }

        AControl.prototype.updatestate = function updatestate(state) {
            this.dialogstate = state;
            this.dialogstateconnected = state == 3;
            this.dialogstateconnecting = state == 2;
            this.dialogstateentry = state == 1;
        };

        AControl.prototype.attached = function attached() {
            var _this = this;

            console.log("Acontrol.attached()");
            console.log("dialogstate:" + this.dialogstate);

            client.get("/metadataservice/" + this.servicecontext).then(function (data) {
                _this.status = "disconnected";
                _this.updatestate(1);

                if (data.response) {
                    var myresponse = JSON.parse(data.response);
                    if (myresponse.connected) {
                        _this.status = "OK";
                        _this.updatestate(3);
                    }
                }
            });
        };

        AControl.prototype.reconnect = function reconnect() {
            this.updatestate(1);
        };

        AControl.prototype.addservice = function addservice(servicename) {
            this.updatestate(2);
            var postdata = { username: this.username, securetoken: this.usertoken };

            var postdatajson = JSON.stringify(postdata);


            client.post("/metadataservice/" + servicename, postdatajson).then(function (data) {
                var myresponse = JSON.parse(data.response);
                if (myresponse.connected) {
                    okcallback();
                } else {
                    failcallback(myresponse);
                }
            });
        };

        AControl.prototype.failcallback = function failcallback() {
            console.log('acontrol.okcallback() should be overridden');
        };

        AControl.prototype.okcallback = function okcallback() {
            console.log('acontrol.okcallback() should be overridden');
        };

        AControl.prototype.parseQueryString = function parseQueryString(str) {
            var ret = Object.create(null);

            if (typeof str !== 'string') {
                return ret;
            }

            str = str.trim().replace(/^(\?|#|&)/, '');

            if (!str) {
                return ret;
            }

            str.split('&').forEach(function (param) {
                var parts = param.replace(/\+/g, ' ').split('=');

                var key = parts.shift();
                var val = parts.length > 0 ? parts.join('=') : undefined;

                key = decodeURIComponent(key);

                val = val === undefined ? null : decodeURIComponent(val);

                if (ret[key] === undefined) {
                    ret[key] = val;
                } else if (Array.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }
            });

            return ret;
        };

        return AControl;
    }();
});
define('b2dropcontrol/app',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);
  };
});
define('b2dropcontrol/b2dropcontrol',['exports', 'aurelia-http-client', './acontrol'], function (exports, _aureliaHttpClient, _acontrol) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.B2dropcontrol = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var client = new _aureliaHttpClient.HttpClient();

    var B2dropcontrol = exports.B2dropcontrol = function (_AControl) {
        _inherits(B2dropcontrol, _AControl);

        function B2dropcontrol() {
            _classCallCheck(this, B2dropcontrol);

            var _this = _possibleConstructorReturn(this, _AControl.call(this));

            _this.heading = "B2DROP connector";
            _this.servicecontext = "b2dropconnector";
            return _this;
        }

        B2dropcontrol.prototype.failcallback = function failcallback(myresponse) {
            this.updatestate(1);
            this.status = "fail:";
            if (myresponse.output) {
                this.status += myresponse.output;
            }
        };

        B2dropcontrol.prototype.okcallback = function okcallback() {
            this.status = "OK";
            this.updatestate(3);
        };

        return B2dropcontrol;
    }(_acontrol.AControl);
});
define('b2dropcontrol/dropboxcontrol',["exports", "./acontrol"], function (exports, _acontrol) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Dropboxcontrol = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Dropboxcontrol = exports.Dropboxcontrol = function (_AControl) {
        _inherits(Dropboxcontrol, _AControl);

        function Dropboxcontrol() {
            _classCallCheck(this, Dropboxcontrol);

            var _this = _possibleConstructorReturn(this, _AControl.call(this));

            _this.heading = "DROPBOX connector";
            _this.CLIENTID = "x5tdu20lllmr0nv";
            _this.showdropboxbutton = false;
            _this.servicecontext = "dropboxconnector";
            _this.dropBoxAuthUrl = "";
            return _this;
        }

        Dropboxcontrol.prototype.attached = function attached() {
            console.log('dropbox');
            console.log(Dropbox);
            if (this.isAuthenticated()) {
                this.showdropboxbutton = false;
                this.usertoken = this.getAccessTokenFromUrl();
                this.addservice('dropboxconnector');
            } else {
                console.log("dropboxcontrol.attached()");
                console.log(this.dialogstateentry);
                console.log(this.dialogstate);
                console.log(this.CLIENTID);
                this.showdropboxbutton = true;
                console.log(this.showdropboxbutton);

                var dbx = new Dropbox({ clientId: this.CLIENTID });
                console.log(dbx);
                var currentUrl = window.location.href;
                console.log('current url:' + currentUrl);
                this.dropBoxAuthUrl = dbx.getAuthenticationUrl(currentUrl);
                console.log(this.dropBoxAuthUrl);
            }
            _AControl.prototype.attached.call(this);
        };

        Dropboxcontrol.prototype.failcallback = function failcallback(myresponse) {
            this.updatedropboxstate(1);
            this.status = "fail:";
            if (myresponse.output) {
                this.status += myresponse.output;
            }
        };

        Dropboxcontrol.prototype.okcallback = function okcallback() {
            this.status = "OK";
            this.updatestate(3);
        };

        Dropboxcontrol.prototype.getAccessTokenFromUrl = function getAccessTokenFromUrl() {
            return this.parseQueryString(window.location.hash).access_token;
        };

        Dropboxcontrol.prototype.isAuthenticated = function isAuthenticated() {
            return !!this.getAccessTokenFromUrl();
        };

        return Dropboxcontrol;
    }(_acontrol.AControl);
});
define('b2dropcontrol/environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: false
  };
});
define('b2dropcontrol/main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.basicConfiguration();

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('b2dropcontrol/onedrivecontrol',['exports', 'aurelia-http-client', './acontrol'], function (exports, _aureliaHttpClient, _acontrol) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Onedrivecontrol = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var client = new _aureliaHttpClient.HttpClient();

  var Onedrivecontrol = exports.Onedrivecontrol = function (_AControl) {
    _inherits(Onedrivecontrol, _AControl);

    function Onedrivecontrol() {
      _classCallCheck(this, Onedrivecontrol);

      var _this = _possibleConstructorReturn(this, _AControl.call(this));

      _this.heading = "ONEDRIVE connector";
      _this.clientid = "xUfizTokQv6mAiZ9sgzQnm0";
      _this.servicecontext = "onedriveconnector";
      return _this;
    }

    return Onedrivecontrol;
  }(_acontrol.AControl);
});
define('filemanager/actions',['exports', 'aurelia-http-client'], function (exports, _aureliaHttpClient) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Actions = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var client = new _aureliaHttpClient.HttpClient();

    var Actions = exports.Actions = function () {
        function Actions() {
            _classCallCheck(this, Actions);

            client.configure(function (config) {
                config.withHeader('Accept', 'application/json');
                config.withHeader('Content-Type', 'application/json');
            });
        }

        Actions.prototype.attached = function attached() {};

        Actions.prototype.help = function help() {};

        Actions.prototype.menu = function menu() {};

        Actions.prototype.view = function view() {};

        Actions.prototype.edit = function edit() {};

        return Actions;
    }();
});
define('filemanager/app',["exports", "aurelia-http-client"], function (exports, _aureliaHttpClient) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var App = exports.App = function () {
        function App() {
            _classCallCheck(this, App);

            this.heading = "File manager";
            this.viewpanel1 = false;
            this.viewpanel2 = false;
            this.showhelp = false;
            this.fileurl = "test1";
            this.myKeypressCallback = this.keypressInput.bind(this);
        }

        App.prototype.activate = function activate() {
            window.addEventListener('keypress', this.myKeypressCallback, false);
        };

        App.prototype.deactivate = function deactivate() {
            window.removeEventListener('keypress', this.myKeypressCallback);
        };

        App.prototype.keypressInput = function keypressInput(e) {
            console.log('keypressed');
            if (e.key == 'F1') this.help();
            console.log(e);
        };

        App.prototype.doAction = function doAction(fileitem, panelid) {
            this.fileurl = fileitem.webdavuri;
            console.log('app.doaction()');
            console.log(this.fileurl);
            if (panelid == "filepanel1") {
                this.viewpanel2 = true;
                if (this.childview2) this.childview2.viewfile(fileitem.webdavuri);
            } else {
                this.viewpanel1 = true;
                if (this.childview) this.childview.viewfile(fileitem.webdavuri);
            }
        };

        App.prototype.close1 = function close1() {
            this.viewpanel1 = false;
        };

        App.prototype.close2 = function close2() {
            this.viewpanel2 = false;
        };

        App.prototype.help = function help() {
            this.showhelp = !this.showhelp;
        };

        return App;
    }();
});
define('filemanager/environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: false
  };
});
define('filemanager/filepanel',['exports', 'aurelia-http-client', 'aurelia-framework'], function (exports, _aureliaHttpClient, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.FilepanelCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var client = new _aureliaHttpClient.HttpClient();

    var FilepanelCustomElement = exports.FilepanelCustomElement = (0, _aureliaFramework.decorators)((0, _aureliaFramework.bindable)({ name: 'tableid', defaultBindingMode: _aureliaFramework.bindingMode.oneTime }), (0, _aureliaFramework.bindable)('allowDestruction')).on(function () {
        function _class() {
            _classCallCheck(this, _class);

            this.files = [];
            this.filescount = this.files.length;
            this.path = "";
            this.dynatable = {};

            client.configure(function (config) {
                config.withHeader('Accept', 'application/json');
                config.withHeader('Content-Type', 'application/json');
            });
        }

        _class.prototype.created = function created(owningView, myview) {
            this.parent = owningView;
        };

        _class.prototype.attached = function attached() {
            var _this = this;

            client.get("/metadataservice/sbfiles").then(function (data) {
                if (data.response) {
                    (function () {
                        _this.populateFiles(data.response);

                        _this.dynatable = $('#' + _this.tableid).dynatable({
                            dataset: {
                                records: _this.files
                            },
                            features: {
                                paginate: false,
                                search: false,
                                recordCount: false,
                                perPageSelect: false,
                                pushState: false

                            }
                        });

                        var a = _this;
                        var b = _this.parent.controller.viewModel;

                        _this.dynatable.on('click', 'tr', function () {
                            if (this.children[1].innerText.endsWith('DIR')) a.changefolder(this.firstChild.innerText);else {
                                var fileitem = this.firstChild.innerText;
                                var fileindex = a.files.map(function (e) {
                                    return e.name;
                                }).indexOf(fileitem);
                                console.log('fileitem');
                                console.log(fileitem);
                                console.log(fileindex);
                                b.doAction(a.files[fileindex], a.tableid);
                            }
                        });
                    })();
                }
            }).catch(function (error) {

                console.log('Error');
                console.log(error);
                _this.status = "unavailable";
                _this.showdialog = false;
                alert('Sorry, response: ' + error.statusCode + ':' + error.statusText + ' when trying to get: /metadataservice/sbfiles');
            });
        };

        _class.prototype.dateTimeReviver = function dateTimeReviver(key, value) {
            var a;
            if (typeof value === 'string') {
                a = /\/Date\(([\d\+]*)\)\//.exec(value);
                if (a) {
                    return new Date(parseInt(a[1])).toLocaleDateString('en-GB');
                }
            }
            return value;
        };

        _class.prototype.cdup = function cdup() {
            var sepIndex = this.path.lastIndexOf('/');
            this.path = this.path.substring(0, sepIndex);
        };

        _class.prototype.cddown = function cddown(subdir) {
            this.path += '/' + subdir;
        };

        _class.prototype.changefolder = function changefolder(folder) {
            var _this2 = this;

            if (!this.lock) {
                this.lock = true;
                if (folder) {
                    if (folder == '..') this.cdup();else this.cddown(folder);
                }
                client.get("/metadataservice/sbfiles/" + this.path).then(function (data) {
                    if (data.response) {
                        _this2.populateFiles(data.response);

                        var d = _this2.dynatable.data('dynatable');
                        d.settings.dataset.originalRecords = _this2.files;
                        d.process();
                        var a = _this2;
                    }
                    _this2.lock = false;
                }).catch(function (error) {
                    console.log('Error');
                    console.log(error);
                    alert('Sorry, response: ' + error.statusCode + ':' + error.statusText + ' when trying to get: /metadataservice/sbfiles' + _this2.path);
                    _this2.lock = false;
                });
            }
        };

        _class.prototype.refresh = function refresh() {
            this.changefolder();
        };

        _class.prototype.populateFiles = function populateFiles(dataresponse) {
            this.files = JSON.parse(dataresponse, this.dateTimeReviver);
            this.filescount = this.files.length;
            if (this.path.length > 0) {
                this.files.unshift({ name: "..", size: "UP DIR", date: "" });
            }
            this.files.forEach(function (item, index, arr) {
                if (arr[index].attributes & 16) arr[index].size = "DIR";
            });
            console.log(this.files);
        };

        _class.prototype.doAction = function doAction(fileitem) {
            console.log("filepane.doaction()");
            console.log(fileitem.children);
            this.parent.doAction(fileitem);
        };

        return _class;
    }());
});
define('filemanager/filesettings',['exports', 'aurelia-http-client', 'aurelia-framework'], function (exports, _aureliaHttpClient, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.FileSettings = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var FileSettings = exports.FileSettings = function FileSettings() {
        _classCallCheck(this, FileSettings);

        this.heading = "File View";
    };
});
define('filemanager/main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.standardConfiguration();

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('filemanager/viewpanel',['exports', 'aurelia-http-client'], function (exports, _aureliaHttpClient) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Viewpanel = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var client = new _aureliaHttpClient.HttpClient();

    var Viewpanel = exports.Viewpanel = function () {
        function Viewpanel() {
            _classCallCheck(this, Viewpanel);

            this.fileurl = "";
        }

        Viewpanel.prototype.attached = function attached() {
            console.log('viewpanel.attached()');

            if (this.bindingContext.viewpanel2) {
                this.bindingContext.childview2 = this;
                this.viewerdom = $('.fileviewer')[0];
                console.log(this.viewerdom);
            }
            if (this.bindingContext.viewpanel1) {
                this.bindingContext.childview = this;
                this.viewerdom = $(".fileviewer")[0];
                console.log(this.viewerdom);
            }
            if (this.bindingContext.fileurl) this.fileurl = this.bindingContext.fileurl;
            console.log(this.fileurl);
            var options = {
                width: 'auto',
                height: 'auto',
                antialias: true,
                quality: 'medium'
            };

            console.log(this);
            console.log(this.viewer);
            if (!this.viewer) this.viewer = pv.Viewer(this.viewerdom, options);
            if (this.fileurl) this.viewfile();
        };

        Viewpanel.prototype.bind = function bind(bindingContext, overrideContext) {
            console.log("bind(). fileurl:");
            console.log(this.fileurl);
            console.log(this.viewid);
            console.log(bindingContext);
            console.log(overrideContext);
            this.bindingContext = bindingContext;
        };

        Viewpanel.prototype.viewfile = function viewfile(fileurl) {
            if (fileurl) this.fileurl = fileurl;
            console.log("viewFile(). fileurl:");
            console.log(this.fileurl);
            if (this.fileurl && this.fileurl.endsWith('pdb')) {
                this.loadfromurl(this.fileurl);
            }
        };

        Viewpanel.prototype.created = function created(owningView, myview) {
            this.parent = owningView;
        };

        Viewpanel.prototype.process = function process(pdb) {

            var structure = pv.io.pdb(pdb);
            this.viewer.cartoon('protein', structure, { color: color.ssSuccession() });
            this.viewer.centerOn(structure);
        };

        Viewpanel.prototype.loadlocalpdbfile = function loadlocalpdbfile() {};

        Viewpanel.prototype.loadpdbfile = function loadpdbfile() {
            var url = 'http://files.rcsb.org/view/' + this.pdbentry + '.pdb';

            this.loadfromurl(url);
        };

        Viewpanel.prototype.loadfromurl = function loadfromurl(url) {
            var _this = this;

            client.get(url).then(function (data) {
                _this.process(data.response);
            }).catch(function (error) {
                console.log(error);
                alert('Sorry, response: ' + error.statusCode + ':' + error.statusText + ' when trying to get: ' + url);
            });
        };

        Viewpanel.prototype.loadfromredo = function loadfromredo() {
            this.loadfromurl('http://www.cmbi.ru.nl/pdb_redo/' + this.pdbentry2.substring(1, 3) + '/' + this.pdbentry2 + '/' + this.pdbentry2 + '_final.pdb');
        };

        return Viewpanel;
    }();
});
define('fileprovider/environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: false
  };
});
define('fileprovider/genericcontrol',["exports", "aurelia-http-client"], function (exports, _aureliaHttpClient) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Genericcontrol = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var client = new _aureliaHttpClient.HttpClient();

  var Genericcontrol = exports.Genericcontrol = function () {
    function Genericcontrol() {
      _classCallCheck(this, Genericcontrol);

      this.heading = "File Provider";
      this.CLIENTID = "x5tdu20lllmr0nv";
      this.showdropboxbutton = false;
      this.servicecontext = "providers";
      this.dropBoxAuthUrl = "";
      this.providers = [];
      this.selectedProvider = "";
      console.log('genericcontrol()');
      client.configure(function (config) {
        config.withHeader('Accept', 'application/json');
        config.withHeader('Content-Type', 'application/json');
      });
    }

    Genericcontrol.prototype.attached = function attached() {
      var _this = this;

      console.log('genericcontrol.attached()');
      console.log("dialogstate:" + this.dialogstate);

      client.get("/metadataservice/" + this.servicecontext).then(function (data) {
        console.log("data response");
        console.log(data);
        if (data.response) {
          _this.providers = JSON.parse(data.response);
        }
      });
    };

    Genericcontrol.prototype.failcallback = function failcallback(myresponse) {
      this.updatedropboxstate(1);
      this.status = "fail:";
      if (myresponse.output) {
        this.status += myresponse.output;
      }
    };

    Genericcontrol.prototype.okcallback = function okcallback() {
      this.status = "OK";
      this.updatestate(3);
    };

    Genericcontrol.prototype.getAccessTokenFromUrl = function getAccessTokenFromUrl() {
      return this.parseQueryString(window.location.hash).access_token;
    };

    Genericcontrol.prototype.isAuthenticated = function isAuthenticated() {
      return !!this.getAccessTokenFromUrl();
    };

    return Genericcontrol;
  }();
});
define('fileprovider/main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.basicConfiguration();

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('virtualfoldercontrol/app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function App() {
    _classCallCheck(this, App);

    this.message = 'Hello World!';
  };
});
define('virtualfoldercontrol/environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('virtualfoldercontrol/main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('virtualfoldercontrol/genericcontrol',["exports", "aurelia-http-client"], function (exports, _aureliaHttpClient) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Genericcontrol = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var client = new _aureliaHttpClient.HttpClient();

  var Genericcontrol = exports.Genericcontrol = function () {
    function Genericcontrol() {
      _classCallCheck(this, Genericcontrol);

      this.heading = "File Provider";
      this.CLIENTID = "x5tdu20lllmr0nv";
      this.showdropboxbutton = false;
      this.servicecontext = "providers";
      this.dropBoxAuthUrl = "";
      this.providers = [];
      this.selectedProvider = "";
      console.log('genericcontrol()');
      client.configure(function (config) {
        config.withHeader('Accept', 'application/json');
        config.withHeader('Content-Type', 'application/json');
      });
    }

    Genericcontrol.prototype.attached = function attached() {
      var _this = this;

      console.log('genericcontrol.attached()');
      console.log("dialogstate:" + this.dialogstate);

      client.get("/metadataservice/" + this.servicecontext).then(function (data) {
        console.log("data response");
        console.log(data);
        if (data.response) {
          _this.providers = JSON.parse(data.response);
        }
      });
    };

    Genericcontrol.prototype.failcallback = function failcallback(myresponse) {
      this.updatedropboxstate(1);
      this.status = "fail:";
      if (myresponse.output) {
        this.status += myresponse.output;
      }
    };

    Genericcontrol.prototype.okcallback = function okcallback() {
      this.status = "OK";
      this.updatestate(3);
    };

    Genericcontrol.prototype.getAccessTokenFromUrl = function getAccessTokenFromUrl() {
      return this.parseQueryString(window.location.hash).access_token;
    };

    Genericcontrol.prototype.isAuthenticated = function isAuthenticated() {
      return !!this.getAccessTokenFromUrl();
    };

    return Genericcontrol;
  }();
});
define('virtualfoldersetting/app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    function App() {
      _classCallCheck(this, App);

      this.showprovider = false;
    }

    App.prototype.newProvider = function newProvider() {
      this.showprovider = true;
    };

    App.prototype.addProvider = function addProvider() {
      console.log('addProvider: not yet implemented');
      this.showprovider = false;
    };

    return App;
  }();
});
define('virtualfoldersetting/environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('virtualfoldersetting/genericcontrol',['exports', 'aurelia-http-client', 'aurelia-framework'], function (exports, _aureliaHttpClient, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Genericcontrol = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  var _dec, _dec2, _dec3, _desc, _value, _class;

  var client = new _aureliaHttpClient.HttpClient();

  var Genericcontrol = exports.Genericcontrol = (_dec = (0, _aureliaFramework.computedFrom)('selectedProvider'), _dec2 = (0, _aureliaFramework.computedFrom)('selectedProvider'), _dec3 = (0, _aureliaFramework.computedFrom)('selectedProvider'), (_class = function () {
    function Genericcontrol() {
      _classCallCheck(this, Genericcontrol);

      this.heading = "File Provider";
      this.CLIENTID = "x5tdu20lllmr0nv";
      this.showdropboxbutton = false;
      this.servicecontext = "providers";
      this.dropBoxAuthUrl = "";
      this.providers = [];
      this.selectedProvider = "";
      console.log('genericcontrol()');
      client.configure(function (config) {
        config.withHeader('Accept', 'application/json');
        config.withHeader('Content-Type', 'application/json');
      });
    }

    Genericcontrol.prototype.attached = function attached() {
      var _this = this;

      console.log('genericcontrol.attached()');
      console.log("dialogstate:" + this.dialogstate);

      client.get("/metadataservice/" + this.servicecontext).then(function (data) {
        console.log("data response");
        console.log(data);
        if (data.response) {
          _this.providers = JSON.parse(data.response);
        }
      });
    };

    Genericcontrol.prototype.failcallback = function failcallback(myresponse) {
      this.updatedropboxstate(1);
      this.status = "fail:";
      if (myresponse.output) {
        this.status += myresponse.output;
      }
    };

    Genericcontrol.prototype.okcallback = function okcallback() {
      this.status = "OK";
      this.updatestate(3);
    };

    Genericcontrol.prototype.getAccessTokenFromUrl = function getAccessTokenFromUrl() {
      return this.parseQueryString(window.location.hash).access_token;
    };

    Genericcontrol.prototype.isAuthenticated = function isAuthenticated() {
      return !!this.getAccessTokenFromUrl();
    };

    _createClass(Genericcontrol, [{
      key: 'selectedDropbox',
      get: function get() {

        return this.selectedProvider == 'Dropbox';
      }
    }, {
      key: 'selectedB2Drop',
      get: function get() {
        return this.selectedProvider == 'B2Drop';
      }
    }, {
      key: 'selectedFileSystem',
      get: function get() {
        return this.selectedProvider == 'FileSystem';
      }
    }]);

    return Genericcontrol;
  }(), (_applyDecoratedDescriptor(_class.prototype, 'selectedDropbox', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'selectedDropbox'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'selectedB2Drop', [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, 'selectedB2Drop'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'selectedFileSystem', [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, 'selectedFileSystem'), _class.prototype)), _class));
});
define('virtualfoldersetting/main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('virtualfoldersetting/aliastable',['exports', 'aurelia-http-client'], function (exports, _aureliaHttpClient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Aliastable = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var client = new _aureliaHttpClient.HttpClient();

  var Aliastable = exports.Aliastable = function () {
    function Aliastable() {
      _classCallCheck(this, Aliastable);

      this.servicecontext = "files";
      console.log('genericcontrol()');
      client.configure(function (config) {
        config.withHeader('Accept', 'application/json');
        config.withHeader('Content-Type', 'application/json');
      });
    }

    Aliastable.prototype.attached = function attached() {
      var _this = this;

      console.log('genericcontrol.attached()');

      client.get("/metadataservice/" + this.servicecontext).then(function (data) {
        console.log("data response");
        console.log(data);
        if (data.response) {
          _this.providers = JSON.parse(data.response);
        }
      });
    };

    return Aliastable;
  }();
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <h1>${message}</h1>\n</template>\n"; });
define('text!b2dropcontrol/app.html', ['module'], function(module) { module.exports = "<template>\n\n    <require from=\"./b2dropcontrol\"></require>\n    <require from=\"./dropboxcontrol\"></require>\n    <require from=\"./onedrivecontrol\"></require>\n\n\n    <b2dropcontrol></b2dropcontrol>\n    <dropboxcontrol></dropboxcontrol>\n    <onedrivecontrol></onedrivecontrol>\n  <div class=\"w3-clear\"></div>\n\n</template>\n"; });
define('text!b2dropcontrol/b2dropcontrol.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"w3-third\">\n        <div class=\"w3-card-2 w3-sand w3-hover-shadow w3-round-large\">\n            <h3>${heading}</h3>\n            <p>B2DROP is academic secure and trusted data exchange service provided by EUDAT.\n                West-life portal uses B2DROP TO store, upload and download AND share the data files. </p>\n            <!-- form is showed only if the b2drop is not connected -->\n            <form show.bind=\"dialogstateentry\" submit.trigger=\"addservice('b2dropconnector')\">\n                <p>You need to create B2DROP account first at <a href=\"https://b2drop.eudat.eu/pwm/public/NewUser?\">b2drop.eudat.eu/pwm/public/NewUser?</a>\n                    Then ,if you have an existing account, fill in the B2DROP username and password here:</p>\n                <input type=\"text\" value.bind=\"username\">\n                <input type=\"password\" value.bind=\"usertoken\">\n                <button class=\"w3-btn w3-round-large\" type=\"submit\">Connect to B2DROP</button>\n                Status: <span>${status}</span>\n            </form>\n            <!-- if it is connected, then status info is showed and option to reconnect is showed-->\n            <form show.bind=\"dialogstateconnected\" submit.trigger=\"reconnect()\">\n                <span>B2Drop service connected.</span>\n                <button class=\"w3-btn w3-round-large\" type=\"submit\">reconnect</button>\n            </form>\n\n            <div show.bind=\"dialogstateconnecting\">\n                <span>B2Drop connecting ...</span>\n            </div>\n        </div>\n    </div>\n</template>"; });
define('text!b2dropcontrol/dropboxcontrol.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"w3-third\">\n    <div class=\"w3-card-2 w3-sand w3-hover-shadow w3-round-large\">\n        <h3>${heading}</h3>\n        <p>DROPBOX is a commercial data store and exchange service.\n            West-life portal can use your DROPBOX account to access and download your data files. </p>            <!-- form is showed only if the b2drop is not connected -->\n        <form show.bind=\"dialogstateentry\">\n            <p>You need to have existing DROPBOX account. </p>\n            <a show.bind=\"showdropboxbutton\" class=\"w3-btn w3-round-large\" href=\"${dropBoxAuthUrl}\" id=\"authlink\">Connect to DROPBOX</a>\n            <hr/>Status: <span>${status}</span>\n        </form>\n        <!-- if it is connected, then status info is showed and option to reconnect is showed-->\n        <form show.bind=\"dialogstateconnected\" submit.trigger=\"reconnect()\">\n            <span>DROPBOX service connected.</span>\n            <button class=\"w3-btn w3-round-large\" type=\"submit\">reconnect</button>\n        </form>\n\n        <div show.bind=\"dialogstateconnecting\">\n            <span>DROPBOX connecting ...</span>\n        </div>\n    </div>\n</div>\n</template>\n"; });
define('text!b2dropcontrol/onedrivecontrol.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"w3-third\">\n    <div class=\"w3-card-2 w3-sand w3-hover-shadow w3-round-large\">\n      <h3>${heading}</h3>\n      <p>ONEDRIVE is a commercial data store and exchange service.\n        West-life portal can use your ONEDRIVE account to access and download your data files. </p>            <!-- form is showed only if the b2drop is not connected -->\n      <form show.bind=\"dialogstateentry\">\n        <p>You need to have existing ONEDRIVE account. </p>\n        <a show.bind=\"showonedrivebutton\" class=\"w3-btn w3-round-large\" href=\"${oneDriveAuthUrl}\" id=\"authlink\">Connect to ONEDRIVE</a>\n        <hr/>Status: <span>${status}</span>\n      </form>\n      <!-- if it is connected, then status info is showed and option to reconnect is showed-->\n      <form show.bind=\"dialogstateconnected\" submit.trigger=\"reconnect()\">\n        <span>ONEDRIVE service connected.</span>\n        <button class=\"w3-btn w3-round-large\" type=\"submit\">reconnect</button>\n      </form>\n\n      <div show.bind=\"dialogstateconnecting\">\n        <span>ONEDRIVE connecting ...</span>\n      </div>\n    </div>\n  </div>\n</template>\n"; });
define('text!filemanager/actions.html', ['module'], function(module) { module.exports = "<template>\n</template>"; });
define('text!filemanager/app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"./filepanel\"></require>\n    <require from=\"./viewpanel\"></require>\n\n    <h4>${heading}</h4>\n    <div show.bind=\"showhelp\" class=\"w3-round-large w3-card w3-pale-blue\">\n        <p>This if VirtualFolder FileManager.</p>\n        <p>Use mouse to navigate the files.</p>\n        <p>Click on directory will change to the directory. Click on \"..\" will change to parent directory</p>\n        <p>Click on PDB file will visualize the PDB file in next panel.</p>\n    </div>\n    <div class=\"filepanel\">\n        <filepanel show.bind=\"!viewpanel1\" tableid=\"filepanel1\" ></filepanel>\n        <button class=\"w3-button\" show.bind=\"viewpanel1\" click.trigger=\"close1()\">X</button>\n        <viewpanel if.bind=\"viewpanel1\" viewid=\"view1\" fileurl.two-way=\"fileurl\"> </viewpanel>\n        <!-- TODO investigate correct binding -->\n\n        <filepanel show.bind=\"!viewpanel2\" tableid=\"filepanel2\" ></filepanel>\n        <button class=\"w3-button\" show.bind=\"viewpanel2\" click.trigger=\"close2()\">X</button>\n        <viewpanel if.bind=\"viewpanel2\" viewid=\"view2\" fileurl.two-way=\"fileurl\"> </viewpanel>\n    </div>\n    <div class=\"buttonline\">\n        <div class=\"w3-round-large w3-col\">\n            <button class=\"w3-btn w3-round-large\" click.trigger=\"help()\">F1 Help</button>\n            <!--button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F2 Menu</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F3 View</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F4 Edit</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F5 Copy</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F6 Move</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F7 Mkdir</button>\n            <button class=\"w3-btn w3-ripple  w3-light-blue w3-hover-blue w3-border w3-border-green w3-round-large\">F8 Delete</button-->\n        </div>\n    </div>\n</template>\n"; });
define('text!filemanager/filepanel.html', ['module'], function(module) { module.exports = "<template bindable=\"tableid\">\n<div class=\"w3-half\">\n    <div class=\"w3-card-2 w3-pale-blue w3-hoverable\">\n        <span>${path} contains ${filescount} items.<button click.delegate=\"refresh()\">refresh</button></span>\n        <table id=\"${tableid}\">\n            <thead>\n            <tr>\n                <th style=\"text-align:left\">name</th>\n                <th style=\"text-align:right\">size</th>\n                <th style=\"text-align:center\">date</th>\n            </tr>\n            </thead>\n        </table>\n    </div>\n</div>\n</template>"; });
define('text!filemanager/filesettings.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"./actions\"></require>\n    <require from=\"./filepanel\"></require>\n\n    <h4>${heading}</h4>\n    <div class=\"filepanel\">\n    <settings></settings>\n    <filepanel tableid=\"filepanel2\"></filepanel>\n    </div>\n</template>"; });
define('text!filemanager/viewpanel.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"w3-half\">\n        <div class=\"w3-card w3-white \">\n          <span>${fileurl}</span>\n            <form fileurl.call=\"viewfile\">\n              Load another entry from:\n                <ul>\n                  <li>\n                    <input id=\"pdbid\" title=\"type PDB id and press enter\" placeholder=\"1r6a\"\n                       maxlength=\"4\" size=\"4\" value.bind=\"pdbentry\"\n                       change.trigger=\"loadpdbfile()\"\n                />\n                    PDB database\n                  </li>\n                  <li>\n                    <input id=\"pdbid2\" title=\"type PDB id and press enter\" placeholder=\"1r6a\"\n                           maxlength=\"4\" size=\"4\" value.bind=\"pdbentry2\"\n                           change.trigger=\"loadfromredo()\"\n                    />\n                    PDB-REDO database\n                  </li>\n                  </ul>\n                </form>\n            <div class=\"fileviewer\" style=\"height: 100%; width: 100%\">\n            </div>\n        </div>\n    </div>\n</template>\n"; });
define('text!fileprovider/app.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./genericcontrol\"></require>\n\n  <h3>Virtual Folder Settings</h3>\n\n  <genericcontrol></genericcontrol>\n\n  <div class=\"w3-clear\"></div>\n\n</template>\n"; });
define('text!fileprovider/genericcontrol.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"w3-third\">\n    <div class=\"w3-card-2 w3-sand w3-hover-shadow w3-round-large\">\n      <h3>${heading}</h3>\n\n      <form>\n        <p>You need to have existing Provider account. </p>\n        <select class=\"w3-select\" name=\"option\" value.bind=\"selectedProvider\">\n          <option value=\"\" disabled selected>Choose provider</option>\n          <option repeat.for=\"provider of providers\" value.bind=\"provider\">${provider}</option>\n        </select>\n        <hr/>Status: <span>${status}</span>\n        Add new dialog:<input type=\"checkbox\" ref=\"newDialog\"/>\n      </form>\n      <!-- if it is connected, then status info is showed and option to reconnect is showed-->\n      <form show.bind=\"dialogstateconnected\" submit.trigger=\"reconnect()\">\n        <span>service connected.</span>\n        <button class=\"w3-btn w3-round-large\" type=\"submit\">reconnect</button>\n      </form>\n\n      <div show.bind=\"dialogstateconnecting\">\n        <span>connecting ...</span>\n      </div>\n\n    </div>\n  </div>\n  <!--genericcontrol if.bind=\"newDialog.checked\"></genericcontrol-->\n</template>\n"; });
define('text!virtualfoldercontrol/app.html', ['module'], function(module) { module.exports = "<template>\n  <h1>${message}</h1>\n</template>\n"; });
define('text!virtualfoldercontrol/genericcontrol.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"w3-third\">\n    <div class=\"w3-card-2 w3-sand w3-hover-shadow w3-round-large\">\n      <h3>${heading}</h3>\n\n      <form>\n        <p>You need to have existing Provider account. </p>\n        <select class=\"w3-select\" name=\"option\" value.bind=\"selectedProvider\">\n          <option value=\"\" disabled selected>Choose provider</option>\n          <option repeat.for=\"provider of providers\" value.bind=\"provider\">${provider}</option>\n        </select>\n        <hr/>Status: <span>${status}</span>\n        Add new dialog:<input type=\"checkbox\" ref=\"newDialog\"/>\n      </form>\n      <!-- if it is connected, then status info is showed and option to reconnect is showed-->\n      <form show.bind=\"dialogstateconnected\" submit.trigger=\"reconnect()\">\n        <span>service connected.</span>\n        <button class=\"w3-btn w3-round-large\" type=\"submit\">reconnect</button>\n      </form>\n\n      <div show.bind=\"dialogstateconnecting\">\n        <span>connecting ...</span>\n      </div>\n\n    </div>\n  </div>\n  <!--genericcontrol if.bind=\"newDialog.checked\"></genericcontrol-->\n</template>\n"; });
define('text!virtualfoldersetting/app.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./genericcontrol\"></require>\n  <require from=\"./aliastable\"></require>\n\n  <h3>Virtual Folder Settings</h3>\n\n  <form submit.trigger=\"newProvider()\">\n  <aliastable></aliastable>\n  </form>\n\n  <form submit.trigger=\"addProvider()\">\n  <genericcontrol show.bind=\"showprovider\"></genericcontrol>\n  </form>\n\n  <div class=\"w3-clear\"></div>\n</template>\n"; });
define('text!virtualfoldersetting/genericcontrol.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"w3-half\">\n    <div class=\"w3-card-2 w3-left-align w3-pale-blue w3-hover-shadow w3-round-large\">\n\n\n        <select class=\"w3-select\" name=\"option\" value.bind=\"selectedProvider\">\n          <option value=\"\" disabled selected>Choose provider</option>\n          <option repeat.for=\"provider of providers\" value.bind=\"provider\">${provider}</option>\n        </select>\n\n        <div show.bind=\"selectedProvider\">\n          Alias:<input type=\"text\" name=\"alias\" size=\"15\" maxlength=\"1024\"/><br/>\n          <p class=\"w3-tiny\">Alias is a unique name of the 'folder' under which the files will be accessible from virtual folder. </p>\n\n          <div show.bind=\"selectedB2Drop\">\n            Username:<input type=\"text\" name=\"username\" size=\"15\" maxlength=\"1024\"/><br/>\n            Password:<input type=\"password\" name=\"securetoken\" size=\"30\" maxlength=\"1024\"/>\n          </div>\n\n          <div show.bind=\"selectedDropbox\">\n          <span class=\"w3-tiny\">I know secure token </span>\n          <input type=\"checkbox\" ref=\"knownSecureToken\"/>\n          <div show.bind=\"knownSecureToken.checked\">Secure token:\n            <input type=\"text\" name=\"securetoken\" size=\"30\" maxlength=\"1024\"/>\n          </div>\n          </div>\n\n          <div show.bind=\"selectedFileSystem\">\n              Internal path to be linked:\n              <input type=\"text\" name=\"securetoken\" size=\"30\" maxlength=\"1024\"/>\n          </div>\n          <button class=\"w3-btn w3-round-large w3-right\" type=\"submit\">Add</button>\n        </div>\n        <hr/>Status: <span>${status}</span>\n\n\n    </div>\n  </div>\n  <!--genericcontrol if.bind=\"newDialog.checked\"></genericcontrol-->\n</template>\n"; });
define('text!virtualfoldersetting/aliastable.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"w3-half\">\n    <div class=\"w3-card-2 w3-pale-blue w3-hover-shadow w3-round-large\">\n      <table>\n        <thead>\n        <tr>\n          <th>Alias</th>\n          <th>Type</th>\n          <th valign=\"center\">Status</th>\n        </tr>\n        </thead>\n        <tbody>\n        <tr class=\"w3-hover-green\" repeat.for=\"provider of providers\">\n          <td>${provider.alias}</td><td>${provider.type}</td><td align=\"center\"><i class=\"fa fa-check\"></i></td>\n        </tr>\n        </tbody>\n        <tfoot>\n        <tr>\n          <td colspan=\"2\"></td><td><button  class=\"w3-btn w3-round-large\" type=\"submit\" class=\"w3-buttons\">Add new file provider</button></td>\n        </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map