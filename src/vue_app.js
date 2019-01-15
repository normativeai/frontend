/*
 Copyright 2018 Alexander Steen and Tomer Libal

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

///////////
// The nai object collects all utility functions
// related to functionality of the front-end.
///////////

nai = new function () { var lib = this;
  lib.API_URL = 'http://localhost:3000/api/';
  lib.DEBUG = true;
  
  lib.$http = axios.create({
    baseURL: lib.API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  //////////////////////////////////////////////////////
  // General purpose stuff BEGIN
  lib.log = function(message, group) { 
    if (this.DEBUG) {
      if (!!group) { console.log(group, message); }
      else { console.log(message) }
    }
  }
  
  lib.handleResponse = function(onErrorResponse, onNoResponse, onUnexpected) {
    return function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (!!onErrorResponse) { onErrorResponse(error.response); }
        else { 
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        if (!!onNoReponse) { onNoResponse(error.request); }
        else { console.log(error.request) }
      } else {
        // Something happened in setting up the request that triggered an Error
        if (!!onUnexpected) { onUnexpected(error.message); }
        else { console.log('Error', error.message) }
      }
      console.log(error.config);
    }
  }
  // General purpose stuff END
  //////////////////////////////////////////////////////
  
  //////////////////////////////////////////////////////
  // Login/register stuff BEGIN
  lib.getUserToken = function() {
    return localStorage.getItem('user');
  }
  
  lib.setUserToken = function(data) {
    var enc = JSON.stringify(data);
    localStorage.setItem('user', enc);
    this.setAPIToken(data.auth);
  }
  
  lib.setAPIToken = function(token) {
    this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  lib.isLoggedIn = function() {
    var auth = localStorage.getItem('user');
    return !!auth;
  }
  
  lib.login = function(data, success, failed) {
    this.$http.post('/login', data).then(success).catch(failed);
  }

  lib.logout = function() {
    localStorage.removeItem('user');
    this.$http.defaults.headers.common['Authorization'] = '';
    this.$http.get('/logout').then(function(resp) {
      // nothing
      this.log('Logout successful', '[App]');
    }).catch(function(err) {
      this.log(err, '[App]')
    });
  }
  
  lib.register = function(data, success, fail) {
    this.log('Registration called', '[App]');
    this.$http.post('/signup', data).then(success).catch(fail)
  }
  // Login/register stuff END
  //////////////////////////////////////////////////////
  
  //////////////////////////////////////////////////////
  // Dashboard-related queries BEGIN
  lib.initDashboard = function(success, fail) {
    this.log('Init Dashboard', '[App]');
    this.$http.get('/users').then(success).catch(fail)
  }
  // Dashboard-related queries END
  //////////////////////////////////////////////////////
  
  //////////////////////////////////////////////////////
  // Theory-related queries BEGIN
  lib.createFreshTheory = function(success, fail) {
    this.log('Create fresh theory', '[Theory]')
    var freshTheory = { 
                    name: 'New Theory', 
                    description: '', 
                    vocabulary: [{symbol: '', original: ''}], 
                    formalization: [{original: '', formula: ''}]
                  }
    this.$http.post('/theories', freshTheory).then(success).catch(fail)
  }
  
  lib.getTheory = function(theoryId, success, fail) {
    this.log('Get theory ' + theoryId, '[Theory]')
    this.$http.get('/theories/' + theoryId).then(success).catch(fail)
  }
  
  lib.saveTheory = function(theory, success, fail) {
    var theoryId = theory._id;
    this.log('Save theory ' + theoryId, '[Theory]')
    this.$http.put('/theories/' + theoryId, theory).then(success).catch(fail)
  }
  
  lib.deleteTheory = function(theory, success, fail) {
    this.log('Delete theory ' + theory._id, '[Theory]');
    this.$http.delete('/theories/' + theory._id).then(success).catch(fail)
  }
  
  lib.checkConsistency = function(theoryId, success, fail) {
    this.log('Check consistency of ' + theoryId, '[Theory]');
    nai.$http.get('/theories/' + theoryId + '/consistency').then(success).catch(fail)
  }
  // Theory-related queries ENDs
}

///////////
// Set-up routing.
// All paths are linked to specific components that are set-up
// in the respective src/pages/*.js
// Paths with "requireAuth: true" will require the user to be logged in for being accessed
// and route to a login page if not logged in (with subsequent forwarding to the initially
// requested page).
///////////
Vue.use(VueRouter);

// The paths
const router = new VueRouter({
  mode: 'history',
  routes: [
    // public access
    { path: '/', component: home },
    // restricted access
    { path: '/dashboard', component: dashboard, meta: { requiresAuth: true } },
    { path: '/theory', component: theory, meta: { requiresAuth: true } },
    { path: '/theory/:id', component: theory, meta: { requiresAuth: true } },
    
    // default catch all
    { path: '*', redirect: '/' }
  ]
})

// Check for login on protected sites
router.beforeEach((to, from, next) => {
  if (!to.matched.some(record => record.meta.requiresAuth) || nai.isLoggedIn()) {
    next()
  } else {
    next({
        path: '/#login',
        query: { redirect: to.fullPath }
      })
  }
})

///////////
// The main vue object of the front end application.
///////////
var app = new Vue({
  el: '#root',
  data: {
    user: null 
  },
  router,
  computed: {
    loggedIn: function() {
      return (!!this.user && !!this.user.auth);
    }
  },
  methods: {
    onLogin: function(userdata) {
      nai.log('Login successful, set data', '[App]')
      this.user = userdata;
      nai.setUserToken(userdata);
      router.push('/dashboard');
    },
    doLogout: function() {
      nai.log('Logout', '[App]');
      // reset data
      this.user = null;
      nai.logout();
      // go to non-protected site if logout-location is protected
      if (!!this.$route.meta.requiresAuth) {
        router.push('/');
      }
    }
  },
  beforeMount: function() {
    // 1: check if user is logged-in
    if (nai.isLoggedIn()) {
      try {
        var data = JSON.parse(nai.getUserToken());
        this.user = data 
        nai.setAPIToken(data.auth);
      } catch(e) {
        console.log(e)
        nai.logout();
      }
    }
    
    if (this.loggedIn && this.$route.path == '/') {
      router.push('/dashboard');
    } else {
      // anything?
    }
  },
  created: function() {
    this.$on('login-event', this.onLogin);
  }
})

