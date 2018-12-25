
nai = new function () { var lib = this;
  lib.API_URL = 'http://localhost:3000/api/';
  
  lib.$http = axios.create({
    baseURL: lib.API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });


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
      console.log('Logout successful!');
    }).catch(function(err) {
      console.log(err)
    });
  }
  
  lib.register = function(data, success, fail) {
    this.$http.post('/signup', data).then(success).catch(fail)
  }
}

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    // public access
    { path: '/', component: home },
    // restricted access
    { path: '/dashboard', component: dashboard, meta: { requiresAuth: true } },
    
    // default catch all
    { path: '*', redirect: '/' }
  ]
})

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
      console.log('login successful, set data')
      this.user = userdata;
      nai.setUserToken(userdata);
      router.push('/dashboard');
    },
    doLogout: function() {
      console.log('logout');
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
      router.push('dashboard');
    } else {
      // anything?
    }
  },
  created: function() {
    this.$on('login-event', this.onLogin);
  }
})
