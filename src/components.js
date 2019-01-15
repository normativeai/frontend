////////////////////////////////////////////////////////////////////
// Updatable <input>
////////////////////////////////////////////////////////////////////

Vue.component('input-update', {
  props: ['placeholder', 'value', 'edit'],
  computed: {
    output: function() {
      if (!this.value || this.value == '') return this.placeholder
      else return this.value
    }
  },
  template: `
    <div class="input-update">
      <span v-if="!edit">{{ output }}</span>
      <input class="form-control form-control-sm" type="text" v-if="edit" v-bind:value="value" v-on:input="$emit('input', $event.target.value)" v-bind:placeholder="placeholder"></input>
    </div>
  `
})

////////////////////////////////////////////////////////////////////
// Updatable <textarea>
////////////////////////////////////////////////////////////////////

Vue.component('textarea-update', {
  props: ['placeholder', 'value', 'edit', 'rows'],
  computed: {
    output: function() {
      if (!this.value || this.value == '') return this.placeholder
      else return this.value
    },
    rows0: function() {
      if (!this.rows) return 3
      else return this.rows
    }
  },
  template: `
    <div class="input-update">
      <span v-if="!edit">{{ output }}</span>
      <textarea v-bind:rows="rows0" class="form-control form-control-sm" v-if="edit" v-bind:value="value" v-on:input="$emit('input', $event.target.value)" v-bind:placeholder="placeholder"></textarea>
    </div>
  `
})

////////////////////////////////////////////////////////////////////
// Login form with API call
////////////////////////////////////////////////////////////////////

Vue.component('login', {
  data: function () {
    return {
      login: '',
      password: '',
      error: false
    }
  },
  methods: {
    submit: function() {
      console.log('[login] login requested');
      // call api
      var data = {email: this.login, password: this.password};
      nai.login(data, this.loginSuccess, this.loginFailed);
    },
    loginSuccess: function(resp) {
      console.log('[login] ' + JSON.stringify(resp));
      // on success, bubble login to root component
      if (!!resp && !!resp.data && resp.data.token) {
        this.error = false;
        var user = {user: this.login, auth: resp.data.token};
        this.$root.$emit('login-event', user)
      } else {
        this.error = 'Unexpected answer from server.'
      }
    },
    loginFailed: function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        if (!!error.response.data[1]) {
          this.error = error.response.data[1].message;
        } else {
          this.error = 'Unexpected server response: ' + error.response.data
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        this.error = 'Cannot connect to logon server. Please contact server administrator.'
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        this.error = 'Unexpected error: ' + error.message
      }
      console.log(error.config);
    }
  },
  computed: {
    
  },
  template: `
<div class="login">
  <h2>User login</h2>
  <form>
    <div class="form-group">
      <label for="login">Email address</label>
      <input type="email" class="form-control form-control-sm" id="login" v-model="login" placeholder="Enter email" v-on:keyup.enter="submit">
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" class="form-control form-control-sm" id="password" v-model="password" placeholder="Password"  v-on:keyup.enter="submit">
    </div>
    <button type="button" class="btn btn-primary" v-on:click="submit">Submit</button>
  </form>
  <div class="alert alert-danger" v-if="error">Login failed. Reason: {{ error }}</div>
</div>
  `
})

////////////////////////////////////////////////////////////////////
// Register form with API call
////////////////////////////////////////////////////////////////////

Vue.component('register', {
  data: function () {
    return {
      name: '',
      email: '',
      password: '',
      error: false,
      successful: false
    }
  },
  methods: {
    submit: function() {
      console.log('registration requested');
      // call api
      var data = {name: this.name, email: this.email, password: this.password};
      nai.register(data, this.success, this.fail);
    },
    success: function(resp) {
      this.successful = true;
    },
    fail: function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        if (!!error.response.data) {
          this.error = error.response.data.errors[0].msg;
        } else {
          this.error = 'Unexpected server response: ' + error.response.data
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        this.error = 'Cannot connect to logon server. Please contact server administrator.'
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        this.error = 'Unexpected error: ' + error.message
      }
      console.log(error.config);
    }
  },
  computed: {
    
  },
  template: `
<div class="register">
  <h2>Register an account</h2>
  <form>
    <div class="form-group">
      <label for="register">Name</label>
      <input type="text" class="form-control form-control-sm" id="register" v-model="name" aria-describedby="namehelp" placeholder="Enter name" v-on:keyup.enter="submit">
    </div>
    <div class="form-group">
      <label for="login">Email address</label>
      <input type="email" class="form-control form-control-sm" id="email" v-model="email" aria-describedby="emailHelp" placeholder="Enter email" v-on:keyup.enter="submit">
      <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" class="form-control form-control-sm" id="password" v-model="password" placeholder="Password"  v-on:keyup.enter="submit">
    </div>
    <button type="button" class="btn btn-primary" v-on:click="submit">Register</button>
  </form>
  <div class="alert alert-danger" v-if="error">Registration failed. Reason: {{ error }}</div>
  <div class="alert alert-success" v-if="successful">Registration successful. Your user account has been created. You can now log in above using your password.</div>
</div>
  `
})

////////////////////////////////////////////////////////////////////
// General purpose loading animation
////////////////////////////////////////////////////////////////////

Vue.component('loading-bar', {
  props: ['progress'],
  computed: {
    progress0: function() {
      if (!!this.progress) {
        return this.progress
      } else {
        return 100
      }
    },
    progressStyle: function() {
      return "width: " + this.progress0 + "%";
    }
  },
  template: `
    <div class="progress">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" v-bind:aria-valuenow="progress0" aria-valuemin="0" aria-valuemax="100" v-bind:style="progressStyle"></div>
    </div>
  `
})

Vue.component('alert', {
  props: {
    variant: {
      type: String,
      default: 'info' // warning, danger, etc. according to bootstrap
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    timeout: {
      type: Number,
      default: null
    }
  },
  data: function() {
    return {
      show0: this.hasMessage
    }
  },
  computed: {
    alertClass: function() {
      return 'alert-' + this.variant
    }
  },
  methods: {
    hideAlert: function() {
      this.$emit('dismiss')
    }
  },
  watch: {
    timeout(newValue) {
      if (!!newValue && newValue > 0) {
        setTimeout(this.hideAlert, this.timeout)
      }
    }
  },
  template: `
    <div class="alert" v-bind:class="alertClass" role="alert">
      <slot></slot>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close" style="margin-left:1.25rem" v-on:click="hideAlert" v-if="dismissible">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `
})

////////////////////////////////////////////////////////////////////
// Theory card for dashboard
////////////////////////////////////////////////////////////////////

Vue.component('theory-card', {
  props: ['theory'],
  data: function() {
    return {
      deleteRequested: false
    }
  },
  methods: {
    deleteMe: function() {
      this.$parent.$emit('delete-theory', this.theory)
    },
    requestDelete: function() {
      this.deleteRequested = true;
      this.$nextTick(function () {
      feather.replace();
    })
    },
    cancelDelete: function() {
      this.deleteRequested = false;
      this.$nextTick(function () {
        feather.replace();
      })
    },
    open: function() {
      router.push('/theory/'+this.theory._id)
    }
  },
  computed: {
    date: function() {
      return new Date(this.theory.lastUpdate);
    },
    updated: function() {
      return this.date.toLocaleString();
    },
    descLimit: function() {return 80 },
    description: function() {
      var desc = this.theory.description;
      if (desc.length > this.descLimit) {
        return desc.substr(0,this.descLimit) + "...";
      } else {
        return desc;
      }
    }
  },
  created: function () {
    this.$nextTick(function () {
      feather.replace();
    })
  },
  template: `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">{{ theory.name }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">Last edited: {{ updated }}</h6>
        <p class="card-text">{{ description }}</p>
        
        <div class="btn-toolbar mb-2 mb-md-0 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
          <div class="btn-group mr-2">
            <button class="btn btn-sm btn-primary" v-on:click="open">
              <span data-feather="book-open"></span>
              Open
            </button>
          </div>
          <button class="btn btn-sm btn-outline-danger" v-on:click="requestDelete" v-if="!deleteRequested">
          <span data-feather="trash"></span>
          Remove
          </button>
          
          <div class="btn-group ml-2" v-if="deleteRequested">
            <button class="btn btn-sm btn-danger" v-on:click="deleteMe">
            <span data-feather="check"></span>
            Confirm
            </button>
            <button class="btn btn-sm btn-secondary" v-on:click="cancelDelete">
            <span data-feather="x"></span>
            Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})

////////////////////////////////////////////////////////////////////
// Obsolete? query entry
////////////////////////////////////////////////////////////////////

Vue.component('query', {
  props: ['querydata'],
  data: function() {
    return {
      edit: false
    }
  },
  methods: {
    doEdit: function() {
      this.edit = true;
    },
    finishedEdit: function() {
      this.edit = false;
    },
    toggleEdit: function() {
      (this.edit) ? this.finishedEdit() : this.doEdit();
    },
    addAssumption: function() {
      this.querydata.assumptions.push('');
      this.doEdit();
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      feather.replace();
    })
  },
  template: `
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
          <h5>Query {{querydata.qid}}: <input-update style="display:inline" v-bind:edit="edit" placeholder="Enter title" v-model="querydata.title"></input-update></h5>
          <div class="btn-toolbar mb-2 mb-md-0">
            <button class="btn btn-sm btn-outline-primary">
              <span data-feather="play"></span>
              Run
            </button>
            <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEdit" v-bind:class="{active : edit}" v-bind:aria-pressed="edit">
              <span data-feather="edit"></span>
              Edit
            </button>
            <button class="btn btn-sm btn-outline-secondary" v-on:click="$emit('duplicate-query', querydata)">
              <span data-feather="copy"></span>
              Duplicate
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <h5 class="card-title">Description</h5>
        <textarea-update class="card-text" v-bind:edit="edit" placeholder="Enter description" v-model="querydata.description"></textarea-update>
        <h5 class="card-title">Assumptions <button class="btn btn-sm btn-outline-secondary" v-on:click="addAssumption" >
              <span data-feather="plus"></span></button></h5>
        <p class="card-text">
        <ul>
          <li v-for="(as,index) in querydata.assumptions">
          <input-update class="card-text" v-bind:edit="edit" placeholder="Enter assumption" v-model="querydata.assumptions[index]"></input-update></li>
        </ul>
        </p>
        <h5 class="card-title">Goal</h5>
        <input-update class="card-text" v-bind:edit="edit" placeholder="Enter goal" v-model="querydata.goal"></input-update>
      </div>
    </div>
  `
})

