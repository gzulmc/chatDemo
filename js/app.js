'use strict';
/*
 * Before start chatting you need to follow this steps:
 * 1. Initialize ConnectyCube SDK ( ConnectyCube.init() );
 * 2. Create user session (ConnectyCube.createSession());
 * 3. Connect to the chat in the create session callback (ConnectyCube.chat.connect());
 * 4. Set listeners;
 */

function App(cc_credentials, cc_config, cc_users) {
    this._cc_credentials = cc_credentials;
    this._cc_config = cc_config;
    this._cc_users = cc_users;

    this.user = null;
    this.token = null;
    this.isDashboardLoaded = false;
    this.room = null;
    // Elements
    this.page = document.querySelector('#page');
    this.sidebar = null;
    this.content = null;
    this.userListConteiner = null;

    this.init(this._cc_credentials, this._cc_config, this._cc_users);

    this.loading = true;
}

// Before start working with JS SDK you nead to init it.

App.prototype.init = function (credentials, config, users) {

    if (credentials.appId == '' || credentials.authKey == '' || credentials.authSecret == '') {
        var error = "The config.js file should contain your ConnectyCube app credentials. Register new account and application at https://admin<your_app>.connectycube.com and then put Application credentials from Overview page.";
        alert(error);
        throw error;
    }

    if (users.length < 2){
        var error = "The config.js file should contain at least 2 users. Please go to https://admin<your_app>.connectycube.com and create users in 'Users' module.";
        alert(error);
        throw error;
    }

    // Step 1. ConnectyCube SDK initialization.
    ConnectyCube.init(credentials, config);
};

App.prototype.renderDashboard = function (activeTabName) {
    var self = this,
        renderParams = {
            user: self.user,
            tabName: ''
        };

    if(activeTabName){
        renderParams.tabName = activeTabName;
    }

    helpers.clearView(app.page);

    self.page.innerHTML = helpers.fillTemplate('tpl_dashboardContainer', renderParams);

    var logoutBtn = document.querySelector('.j-logout');
    loginModule.isLoginPageRendered = false;
    self.isDashboardLoaded = true;
    self.content = document.querySelector('.j-content');
    self.sidebar = document.querySelector('.j-sidebar');

    dialogModule.init();

    self.loadWelcomeTpl();

    listeners.setListeners();

    logoutBtn.addEventListener('click', function () {
        ConnectyCube.logout(function(err){
            loginModule.isLogin = false;
            app.isDashboardLoaded = false;

            localStorage.removeItem('user');
            helpers.clearCache();

            ConnectyCube.chat.disconnect();
            ConnectyCube.destroySession();

            router.navigate('#!/login');
        });
    });

    this.tabSelectInit();
};

App.prototype.loadWelcomeTpl = function () {

    var content = document.querySelector('.j-content'),
        welcomeTpl = helpers.fillTemplate('tpl_welcome');

    helpers.clearView(content);
    content.innerHTML = welcomeTpl;
};

App.prototype.tabSelectInit = function () {
    var self = this,
        tabs = document.querySelectorAll('.j-sidebar__tab_link');

    _.each(tabs, function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            if (!self.checkInternetConnection()) {
                return false;
            }

            var tab = e.currentTarget;
            self.loadChatList(tab);
        });
    });
};

App.prototype.loadChatList = function (tab) {
    return new Promise(function(resolve, reject){
        var tabs = document.querySelectorAll('.j-sidebar__tab_link');

        if (tab.classList.contains('active')) {
            return false;
        }

        _.each(tabs, function (elem) {
            elem.classList.remove('active');
        });

        tab.classList.add('active');

        helpers.clearView(dialogModule.dialogsListContainer);
        dialogModule.dialogsListContainer.classList.remove('full');

        dialogModule.loadDialogs(tab.dataset.type).then(function(dialogs) {
            resolve(dialogs);
        }).catch(function(error){
            reject(error);
        });
    });
};

App.prototype.buildCreateDialogTpl = function () {
    var self = this,
        createDialogTPL = helpers.fillTemplate('tpl_newGroupChat');

    helpers.clearView(self.content);

    self.content.innerHTML = createDialogTPL;

    var backToDialog = self.content.querySelector('.j-back_to_dialog');

    backToDialog.addEventListener('click', self.backToDialog.bind(self));

    self.userListConteiner = self.content.querySelector('.j-group_chat__user_list');

    document.forms.create_dialog.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!self.checkInternetConnection()) {
            return false;
        }

        if (document.forms.create_dialog.create_dialog_submit.disabled) return false;

        document.forms.create_dialog.create_dialog_submit.disabled = true;

        var users = self.userListConteiner.querySelectorAll('.selected'),
            type = users.length > 2 ? 2 : 3,
            name = document.forms.create_dialog.dialog_name.value,
            occupants_ids = [];

        _.each(users, function (user) {
            if (+user.id !== self.user.id) {
                occupants_ids.push(user.id);
            }
        });

        if (!name && type === 2) {
            var userNames = [];

            _.each(occupants_ids, function (id) {
                if (id === self.user.id) {
                    userNames.push(self.user.name || self.user.login);
                } else {
                    userNames.push(userModule._cache[id].name);
                }
            });
            name = userNames.join(', ');
        }

        var params = {
            type: type,
            occupants_ids: occupants_ids.join(',')
        };

        if (type !== 3 && name) {
            params.name = name;
        }

        dialogModule.createDialog(params);
    });

    document.forms.create_dialog.dialog_name.addEventListener('input', function(e){
        var titleText = document.forms.create_dialog.dialog_name.value,
            sylmbolsCount = titleText.length;
        if(sylmbolsCount > 40) {
            document.forms.create_dialog.dialog_name.value = titleText.slice(0, 40);
        }
    });
    userModule.initGettingUsers();
};

App.prototype.backToDialog = function (e) {
    var self = this;
    self.sidebar.classList.add('active');
    document.querySelector('.j-sidebar__create_dialog').classList.remove('active');

    if (dialogModule.dialogId) {
        router.navigate('/dialog/' + dialogModule.dialogId);
    } else {
        router.navigate('/dashboard');
    }
};

App.prototype.noInternetMessage = function () {
    var notifications = document.querySelector('.j-notifications');

    notifications.classList.remove('hidden');
    notifications.innerHTML = helpers.fillTemplate('tpl_lost_connection');
};

App.prototype.checkInternetConnection = function () {
    if (!navigator.onLine) {
        alert('No internet connection!');
        return false;
    }
    return true;
};

// ConnectyCubeconfig was loaded from config.js file
var app = new App(CC_CREDENTIALS, CC_CONFIG, CC_USERS);
