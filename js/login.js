'use strict';

function Login(сс_users) {
    this._users = сс_users;
    this.isLoginPageRendered = false;
    this.isLogin = false;
}

Login.prototype.init = function(){
    var self = this;

    return new Promise(function(resolve, reject) {
        // var user = localStorage.getItem('user');
        var user = null;
        if(user && !app.user){
            var savedUser = JSON.parse(user);
            app.room = savedUser.tag_list;
            self.login(savedUser)
                .then(function(){
                    resolve(true);
                }).catch(function(error){
                reject(error);
            });
        } else {
            resolve(false);
        }
    });
};

Login.prototype.login = function (user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(!self.isLoginPageRendered){
            self.renderLoadingPage();
        }

        var loggingInTitle = document.getElementsByClassName('logging-in-label')[0];
        loggingInTitle.setAttribute("style", "");

        ConnectyCube.createSession(function(csErr, csRes) {
            var userRequiredParams = {
                'login':user.login,
                'password': user.password
            };
            if (csErr) {
                loginError(csErr);
            } else {
                app.token = csRes.token;
                ConnectyCube.login(userRequiredParams, function(loginErr, loginUser){
                  if (loginErr) {
                      loginError(loginErr);
                  } else {
                      loginSuccess(loginUser);
                  }
                });
            }
        });

        function loginSuccess(userData){
            app.user = userModule.addToCache(userData);
            app.user.user_tags = userData.user_tags;
            ConnectyCube.chat.connect({userId: app.user.id, password: user.password}, function(err, roster){
                if (err) {
                    document.querySelector('.j-login__button').innerText = 'Login';
                    console.error(err);
                    reject(err);
                } else {
                    self.isLogin = true;
                    resolve();
                }
            });
        }

        function loginError(error){
          var loggingInTitle = document.getElementsByClassName('logging-in-label')[0];
          loggingInTitle.setAttribute("style", "display: none;");

          self.renderLoginPage();
          console.error(error);
          alert(error + "\n" + error.detail);
          reject(error);
        }
    });

};

Login.prototype.renderLoginPage = function(){
    var self = this;

    helpers.clearView(app.page);

    app.page.innerHTML = helpers.fillTemplate('tpl_login', {
        version: ConnectyCube.version,
        users: self._users
    });

    this.isLoginPageRendered = true;
    this.setListeners();
};

Login.prototype.renderLoadingPage = function(){
    helpers.clearView(app.page);
    app.page.innerHTML = helpers.fillTemplate('tpl_loading');
};

Login.prototype.setListeners = function(){
    var self = this;

    var loginButtons = document.getElementsByClassName('m-login__button');

    _.each(loginButtons, function(b){

        b.addEventListener('click', function(e){

          var user;
          _.each(self._users, function(u){
            if(u.id == e.target.value){
              user = u;
            }
          });

          localStorage.setItem('user', JSON.stringify(user));

          self.login(user).then(function(){
              router.navigate('/dashboard');
          }).catch(function(error){
              console.error(error);
          });
        });
    });
};

var loginModule = new Login(CC_USERS);
