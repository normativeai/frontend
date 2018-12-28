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
  props: ['loading', 'progress'],
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
    <div v-if="loading" class="progress">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" v-bind:aria-valuenow="progress0" aria-valuemin="0" aria-valuemax="100" v-bind:style="progressStyle"></div>
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
            <button class="btn btn-sm btn-primary">
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
            <span data-feather="trash"></span>
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



////////////////////////////////////////////////////////////////////
// Obsolete dashboard-like stuff
////////////////////////////////////////////////////////////////////

Vue.component('example', {
  props: ['current', 'user', 'api'],
  data: function() {
    return {
      editVoc: false,
      editFacts: false
    }
  },
  computed: {
    loggedIn: function() {
      if (!!this.user) {
        if (!!this.user.auth) { return true; } else { return false; }
      } else return false;
    }
  },
  methods: {
    /* vocabulary stuff */
    addLineToVocabulary: function() {
      var voc = this.current.vocabulary;
      if (!!voc) {
        voc.push({vic: voc.length, symbol: '', desc: ''});
        this.$nextTick(function () {
          feather.replace();
        })
        this.doEditVoc();
      }
    },
    doEditVoc: function() {
      this.editVoc = true;
      console.log("toggled editVoc to " + this.editVoc);
    },
    finishedEditVoc: function() {
      this.editVoc = false;
      console.log("toggled editVoc to " + this.editVoc);
    },
    toggleEditVoc: function() {
      (this.editVoc) ? this.finishedEditVoc() : this.doEditVoc();
    },
    
    /* fact stuff */
    addLineToFacts: function() {
      var facts = this.current.facts;
      if (!!facts) {
        facts.push({fid: facts.length, symbol: '', desc: ''});
        this.$nextTick(function () {
          feather.replace();
        })
        this.doEditFacts();
      }
    },
    doEditFacts: function() {
      this.editFacts = true;
      console.log("toggled editfacts to " + this.editFacts);
    },
    finishedEditFacts: function() {
      this.editFacts = false;
      console.log("toggled editFacts to " + this.editFacts);
    },
    toggleEditFacts: function() {
      (this.editFacts) ? this.finishedEditFacts() : this.doEditFacts();
    },
    
    /* query stuff */
    addQuery0: function(t,d,a,g) {
      this.current.queries.push({ qid: ++this.current.lastQueryId, title: t, description: d, assumptions: a, goal: g })
    },
    addQuery: function() {
      this.addQuery0('','',[],'')
    },
    duplicateQuery: function(q) {
      console.log(q)
      var q2 = _.cloneDeep(q);
      this.addQuery0(q2.title,q2.description, q2.assumptions, q2.goal)
    },
    
    /* other stuff */
    saveEx: function() {
      console.log('saveEx');
      if (!this.loggedIn) return;
      var apicall = this.api + 'saveExample';
      var postdata = {auth: this.user.auth, data: this.current};
      console.log('POST ' + apicall + " " + JSON.stringify(postdata));
      var response = "OK"; /* later from backend call */
      console.log('Response: ' + JSON.stringify(response));
    },
    exportEx: function() {
      alert('Export');
    },
    runAllInEx: function() {
      alert('Run all in example');
    }
  },
  mounted: function () {
    
  },
  template: `
<div class="example">
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
    <h1 class="h1">{{ current.title }}</h1>
    <div class="btn-toolbar mb-2 mb-md-0">
      <div class="btn-group mr-2">
        <button class="btn btn-sm btn-outline-secondary" v-on:click="saveEx()">
        <span data-feather="save"></span>
        Save</button>
        <button class="btn btn-sm btn-outline-secondary" v-on:click="exportEx()">
        <span data-feather="download"></span>
        Export</button>
      </div>
      <button class="btn btn-sm btn-outline-primary" v-on:click="runAllInEx()">
        <span data-feather="play"></span>
        Run all
      </button>
    </div>
  </div>
  <p>
  <em>{{ current.comment }}</em>
  </p>
  
  <a name="vocabulary" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
    <h2>Vocabulary</h2>
    <div class="btn-toolbar mb-2 mb-md-0">
      <div class="btn-group mr-2">
      <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToVocabulary">
      <span data-feather="plus"></span>
      Add entry
      </button>
      </div>
      <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditVoc" v-bind:class="{active : editVoc}" v-bind:aria-pressed="editVoc">
      <span data-feather="edit"></span>
      Toggle edit
      </button>
    </div>
  </div>
  <p>Defining the vocabulary explicitly is not strictly necessarprimaryy, however strongly advised.
  It helps keeping an overview of the used symbols and their intended meaning for the
  fact base and queries. The contents of this table do not alter the formalization; they
  are used for extended GUI features.</p>
  <div class="">
    <table class="table table-striped table-sm" style="table-layout:fixed;width:50%">
      <thead>
        <tr>
          <th style="width:5em">Symbol</th>
          <th style="width:100%">Description</th>
          <th style="width:6em;text-align: center">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr ref="vocList" v-for="voc in current.vocabulary">
          <td><input-update placeholder="Enter symbol" v-bind:edit="editVoc" v-model="voc.symbol"></input-update></td>
          <td><textarea-update placeholder="Enter description" v-bind:edit="editVoc" v-model="voc.desc"></textarea-update></td>
          <td class="table-secondary" style="text-align: center">
            <button type="button" class="btn btn-sm btn-danger" v-on:click="current.vocabulary.splice(current.vocabulary.indexOf(voc), 1)"><span data-feather="x"></span></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <hr>
  <a name="facts" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
    <h2>Fact base</h2>
    <div class="btn-toolbar mb-2 mb-md-0">
      <div class="btn-group mr-2">
        <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToFacts">
          <span data-feather="plus"></span>
          Add fact
        </button>
      </div>
      <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditFacts" v-bind:class="{active : editFacts}" v-bind:aria-pressed="editFacts">
      <span data-feather="edit"></span>
      Toggle edit
      </button>
      <button class="btn btn-sm btn-outline-secondary float-right">
        <span data-feather="play"></span>
        Run consistency check
      </button>
    </div>
  </div> 
  <p><em>A consistency check should be conducted prior to executing any further queries.</em></p>
  <div class="table-responsive">
    <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
      <thead>
        <tr>
          <th style="width:2em">#</th>
          <th style="width:60%">Statement</th>
          <th style="width:40%">Fact</th>
          <th style="width:10em; text-align: center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fact in current.facts">
          <td>{{ current.facts.indexOf(fact)+1 }}</td>
          <td><textarea-update placeholder="Enter Description (or leave empty if constructed from fact)" v-bind:edit="editFacts" v-model="fact.desc"></textarea-update></td>
          <td style="font-family: monospace"><textarea-update placeholder="Enter fact" v-bind:edit="editFacts" v-model="fact.formalization"></textarea-update></td>
          <td class="table-secondary" style="text-align: center">
            <button title="Check for logical independence" type="button" class="btn btn-sm btn-secondary"><span data-feather="activity"></span></button>
            <button title="Remove fact" type="button" class="btn btn-sm btn-danger" v-on:click="current.facts.splice(current.facts.indexOf(fact), 1)"><span data-feather="x"></span></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <hr>
  <a name="queries" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
    <h2>Queries</h2>
    <div class="btn-toolbar mb-2 mb-md-0">
      <div class="btn-group mr-2">
        <button class="btn btn-sm btn-outline-primary" v-on:click="addQuery">
      <span data-feather="plus"></span>
      Add query
      </button>
      </div>
      <button class="btn btn-sm btn-outline-primary">
        <span data-feather="play"></span>
        Run all queries
      </button>
    </div>
  </div>
  
  <query v-for="q in current.queries" v-bind:ref="'q' + q.qid" v-bind:key="q.qid" v-bind:querydata="q"
  v-on:duplicate-query="duplicateQuery"></query>
</div>
  `
})

