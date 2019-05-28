////////////////////////////////////////////////////////////////////
// Feather icon wrapper
////////////////////////////////////////////////////////////////////

Vue.component('feather-icon', {
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  template: `
    <svg class="feather">
      <use v-bind:xlink:href="'/img/feather-sprite.svg#' + icon"/>
    </svg>
  `
})

////////////////////////////////////////////////////////////////////
// Wrapper for bootstrap (save/load) spinner
////////////////////////////////////////////////////////////////////

Vue.component('bs-spinner', {
  props: {
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    spinnerClass: function() {
      return 'spinner-border spinner-border-sm text-' + this.variant
    }
  },
  template: `
    <div :class="spinnerClass" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  `
})

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
        if (!!error.response.data) {
          this.error = error.response.data.err;
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
          this.error = error.response.data.err;
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

////////////////////////////////////////////////////////////////////
// General purpose dismissable alert box
////////////////////////////////////////////////////////////////////

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
    <transition name="slide-fade">
    <div class="alert" v-bind:class="alertClass" role="alert">
      <slot></slot>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close" style="margin-left:1.25rem" v-on:click="hideAlert" v-if="dismissible">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    </transition>
  `
})

////////////////////////////////////////////////////////////////////
// General purpose modal
////////////////////////////////////////////////////////////////////

Vue.component('modal', {
  props: ['name'],
  template: `
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-default-button" @click="$parent.$emit('modal-ok', this.name)">
                OK
              </button>
              <button class="modal-default-button" @click="$parent.$emit('modal-cancel', this.name)">
                Cancel
              </button>
            </slot>
          </div>
        </div>
      </div>
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
    },
    clone: function() {
      this.$parent.$emit('clone-theory', this.theory)
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
    <div class="card" style="background-color:#f4f4f4">
      <div class="card-body">
        <h4 class="card-title">{{ theory.name }}</h4>
        <h6 class="card-subtitle small mb-0 text-muted">Last edited: {{ updated }}</h6>
        <hr class="my-1">
        <p class="card-text">{{ description }}</p>
        
        <div class="btn-toolbar mb-2 mb-md-0 d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
          <button class="btn btn-sm btn-outline-secondary mb-1" v-on:click="clone">
          <span data-feather="copy"></span>
          Clone
          </button>
          <button class="btn btn-sm btn-outline-danger mb-1" v-on:click="requestDelete" v-if="!deleteRequested">
          <span data-feather="trash"></span>
          Remove
          </button>
          
          <div class="btn-group btn-group-sm" v-if="deleteRequested">
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
        <div class="btn-toolbar" role="toolbar">
          <div class="btn-group btn-block" role="group">
            <button type="button" class="btn btn-primary btn-block" v-on:click="open">
              <span data-feather="book-open"></span> Open
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})


////////////////////////////////////////////////////////////////////
// query card for dashboard
////////////////////////////////////////////////////////////////////

Vue.component('query-card', {
  props: ['query'],
  data: function() {
    return {
      deleteRequested: false
    }
  },
  methods: {
    deleteMe: function() {
      this.$parent.$emit('delete-query', this.query)
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
      router.push('/query/'+this.query._id)
    }
  },
  computed: {
    date: function() {
      return new Date(this.query.lastUpdate);
    },
    updated: function() {
      return this.date.toLocaleString();
    },
    descLimit: function() {return 80 },
    description: function() {
      var desc = this.query.description;
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
    <div class="card" style="background-color:#f4f4f4">
      <div class="card-body">
        <h4 class="card-title">{{ query.name }}</h4>
        <h6 class="card-subtitle small mb-0 text-muted">Last edited: {{ updated }}</h6>
        <hr class="my-1">
        <p class="card-text">{{ description }}</p>
        
        <div class="btn-toolbar mb-2 mb-md-0 d-flex flex-wrap flex-md-nowrap align-items-center">
          <button class="btn btn-sm btn-outline-danger mb-1" v-on:click="requestDelete" v-if="!deleteRequested">
          <span data-feather="trash"></span>
          Remove
          </button>
          
          <div class="btn-group mb-1" v-if="deleteRequested">
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
        <div class="btn-toolbar" role="toolbar">
          <div class="btn-group btn-block" role="group">
            <button type="button" class="btn btn-primary btn-block" v-on:click="open">
              <span data-feather="book-open"></span> Open
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})

////////////////////////////////////////////////////////////////////
// Quill component
////////////////////////////////////////////////////////////////////

let Inline = Quill.import('blots/inline');

class ConnectiveBlot extends Inline {
  static create(data) {
    let node = super.create();
    node.setAttribute('id', data.id);
    node.classList.add('annotator-connective');
    node.setAttribute('data-connective', data.connective);
    return node;
  }
  
  static formats(node) {
    return {id: node.getAttribute('id'),
        connective: node.getAttribute('data-connective')};
  }
  
  formatAt(index, length, name, value) {
    super.formatAt(index, length, name, value)
  }
  
  optimize(context) {
    super.optimize(context);
    //console.log('opt on ' + this.domNode.innerHTML);
    if (this.prev) {
      if (this.prev.statics.blotName == this.statics.blotName) {
        if (this.prev.domNode.getAttribute('id') == this.domNode.getAttribute('id')) {
          //console.log('move:');
           // console.log('prev: ' + this.prev.domNode.innerHTML);
          this.moveChildren(this.prev)
        }
      }
    }
    //console.log('done opt on ' + this.domNode.innerHTML);
  }
}
ConnectiveBlot.tagName = 'span';

class ConnectiveBlot1 extends ConnectiveBlot {}
ConnectiveBlot1.blotName = 'connective-1';
ConnectiveBlot1.className = 'connective-depth-1';
class ConnectiveBlot2 extends ConnectiveBlot {}
ConnectiveBlot2.blotName = 'connective-2';
ConnectiveBlot2.className = 'connective-depth-2';
ConnectiveBlot2.requiredContainer = ConnectiveBlot1;
class ConnectiveBlot3 extends ConnectiveBlot {}
ConnectiveBlot3.blotName = 'connective-3';
ConnectiveBlot3.className = 'connective-depth-3';
ConnectiveBlot3.requiredContainer = ConnectiveBlot2;
class ConnectiveBlot4 extends ConnectiveBlot {}
ConnectiveBlot4.blotName = 'connective-4';
ConnectiveBlot4.className = 'connective-depth-4';
ConnectiveBlot4.requiredContainer = ConnectiveBlot3;
class ConnectiveBlot5 extends ConnectiveBlot {}
ConnectiveBlot5.blotName = 'connective-5';
ConnectiveBlot5.className = 'connective-depth-5';
ConnectiveBlot5.requiredContainer = ConnectiveBlot4;
class ConnectiveBlot6 extends ConnectiveBlot {}
ConnectiveBlot6.blotName = 'connective-6';
ConnectiveBlot6.className = 'connective-depth-6';
ConnectiveBlot6.requiredContainer = ConnectiveBlot5;
class ConnectiveBlot7 extends ConnectiveBlot {}
ConnectiveBlot7.blotName = 'connective-7';
ConnectiveBlot7.className = 'connective-depth-7';
ConnectiveBlot7.requiredContainer = ConnectiveBlot6;
class ConnectiveBlot8 extends ConnectiveBlot {}
ConnectiveBlot8.blotName = 'connective-8';
ConnectiveBlot8.className = 'connective-depth-8';
ConnectiveBlot8.requiredContainer = ConnectiveBlot7;
class ConnectiveBlot9 extends ConnectiveBlot {}
ConnectiveBlot9.blotName = 'connective-9';
ConnectiveBlot9.className = 'connective-depth-9';
ConnectiveBlot9.requiredContainer = ConnectiveBlot8;
class ConnectiveBlot10 extends ConnectiveBlot {}
ConnectiveBlot10.blotName = 'connective-10';
ConnectiveBlot10.className = 'connective-depth-10';
ConnectiveBlot10.requiredContainer = ConnectiveBlot9;
/*
class ConnectiveBlot2 extends Inline {
  static create(data) {
    let node = super.create();
    node.setAttribute('id', data.id);
    node.classList.add('annotator-connective');
    node.setAttribute('data-connective', data.connective);
    return node;
  }
  
  static formats(node) {
    return {id: node.getAttribute('id'),
        connective: node.getAttribute('data-connective')};
  }
  
  formatAt(index, length, name, value) {
    super.formatAt(index, length, name, value)
  }
  
  
  optimize(context) {
    super.optimize(context);
    //console.log('opt on ' + this.domNode.innerHTML);
    if (this.prev) {
      if (this.prev.statics.blotName == this.statics.blotName) {
        if (this.prev.domNode.getAttribute('id') == this.domNode.getAttribute('id')) {
          //console.log('move:');
           // console.log('prev: ' + this.prev.domNode.innerHTML);
          this.moveChildren(this.prev)
        }
      }
    }
    //console.log('done opt on ' + this.domNode.innerHTML);
  }
}
ConnectiveBlot2.blotName = 'connective-2';
ConnectiveBlot2.tagName = 'span';
ConnectiveBlot2.className = 'connective-depth-2';
ConnectiveBlot2.requiredContainer = ConnectiveBlot1;
*/
class TermBlot extends Inline {
  static create(data) {
    let node = super.create();
    node.setAttribute('id', data.id);
    node.setAttribute('data-term', data.term);
    return node;
  }
  
  static formats(node) {
    return {id: node.getAttribute('id'),
            term: node.getAttribute('data-term')};
  }
}
TermBlot.blotName = 'term';
TermBlot.tagName = 'span';
TermBlot.className = 'annotator-term';



Inline.order.push('term');
Inline.order.push('connective-10');
Inline.order.push('connective-9');
Inline.order.push('connective-8');
Inline.order.push('connective-7');
Inline.order.push('connective-6');
Inline.order.push('connective-5');
Inline.order.push('connective-4');
Inline.order.push('connective-3');
Inline.order.push('connective-2');
Inline.order.push('connective-1'); // See https://stackoverflow.com/questions/43267123/quilljs-parchment-controlling-nesting-order


Quill.register(TermBlot)
Quill.register(ConnectiveBlot1)
Quill.register(ConnectiveBlot2)
Quill.register(ConnectiveBlot3)
Quill.register(ConnectiveBlot4)
Quill.register(ConnectiveBlot5)
Quill.register(ConnectiveBlot6)
Quill.register(ConnectiveBlot7)
Quill.register(ConnectiveBlot8)
Quill.register(ConnectiveBlot9)
Quill.register(ConnectiveBlot10)


Vue.component('quill', {
  data: function() {
    return {
      quill: null,
      content0: '',
      options: { theme: "snow", modules: {toolbar: '#quilltoolbar'} },
      termPrompt: false, termPromptData: null,
    }
  },
  props: ['value','maxheight', 'terms', 'connectives'],
  methods: {
    annotateTerm: function() {
      var range = this.quill.getSelection()
      if (!!range) {
        if (range.length > 0) {
          var text = this.quill.getText(range.index, range.length);
          var bounds = this.quill.getBounds(range.index, range.length);
          this.termPromptData = {original: text, terms: this.terms, range: range, bounds: bounds};
          this.termPrompt = true;
        }
      }
    },
    doneAnnotateTerm: function(origin, info) {
      this.hideTermPrompt();
      let data = {id: this.generateUUID(), term: info.term};
      this.quill.formatText(origin.range.index, origin.range.length, 'term', data)
      this.$parent.$emit('theory-annotate', origin, info);
    },
    hideTermPrompt: function() {
      this.termPrompt = false;
      this.termPromptData = null;
    },
    annotateConnective: function(conn) {
      console.log('annotation')
      var range = this.quill.getSelection()
      if (!!range) {
        if (range.length > 0) {
          let data = {id: this.generateUUID(), connective: conn};
          let format = 'connective-' + this.getConnectiveDepth(range)
          this.quill.formatText(range.index, range.length, format, data)
          console.log('done annotation:' + range.index + " " + range.length)
        }
      }
    },
    removeAnnotations: function() {
      var range = this.quill.getSelection()
      if (!!range) {
        if (range.length > 0) {
          this.quill.removeFormat(range.index, range.length);
        }
      }
    },
    showConnectiveDropdown: function() {
      this.$refs.editorConnectiveDropdown.style.display = 'block'
    },
    hideConnectiveDropdown: function() {
      this.$refs.editorConnectiveDropdown.style.display = 'none'
    },
    generateUUID: function() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    },
    getConnectiveDepth: function(range) {
      if (!!range) {
        let format = this.quill.getFormat(range.index, range.length);
        if (format['connective-10']) return undefined;
        if (format['connective-9']) return 10;
        if (format['connective-8']) return 9;
        if (format['connective-7']) return 8;
        if (format['connective-6']) return 7;
        if (format['connective-5']) return 6;
        if (format['connective-4']) return 5;
        if (format['connective-3']) return 4;
        if (format['connective-2']) return 3;
        if (format['connective-1']) return 2;
        return 1;
      } else undefined
    }
  },
  computed: {
    get: function() { return this.quill }, // Quill API port by passing quill object to the outside
    styleObject: function() {
      if (!!this.maxheight) {
        return { maxHeight: this.maxheight, overflowY: "auto" }
      } else {
        return { height: "290px"}
      }
    },
    /*connectives: function() {
      return [
        {name: 'neg', description: 'Negation', symbol: '~', arity: 1},
        {name: 'perm', description: 'Permission', symbol: 'Pm', arity: 1},
        {name: 'ob', description: 'Obligation', symbol: 'Ob', arity: 1},
        {name: 'id', description: 'Ideality', symbol: 'Id', arity: 1},
        {name: 'oimpl', description: 'Ought-implies', symbol: 'O>', arity: 2},
        {name: 'pimpl', description: 'permittedly-implies', symbol: 'P>', arity: 2},
        {name: 'conj', description: 'Conjunction', symbol: 'And', arity: 2},
        {name: 'disj', description: 'Disjunction', symbol: 'Or', arity: 2},
        {name: 'impl', description: 'Implication', symbol: 'Implies', arity: 2},
        {name: 'iff', description: 'Equivalence', symbol: 'Iff', arity: 2}
      ];
    },*/
    annotateButtonsDisabled: function() { 
      if (!!this.quill) {
        var range = this.quill.getSelection()
        if (!!range) {
          return !(range.length > 0);
        } else return true;
      }
    }
  },
  mounted: function() {
    var self = this;
    this.quill = new Quill(this.$refs.editor, this.options)
    quill = this.quill
    this.quill.enable(false)
    if (this.value) { this.quill.pasteHTML(this.value) }
    this.quill.enable(true)
    
    this.quill.on('text-change', (delta, oldDelta, source) => {
            let html = this.$refs.editor.children[0].innerHTML
            const quill = this.quill
            const text = this.quill.getText()
            if (html === '<p><br></p>') html = ''
            this.content0 = html
            this.$emit('input', this.content0)
          })
    // Disable text editing in annotated text parts. This would only cause trouble.
    // We don't like trouble.
    this.quill.on('selection-change', function(range, oldRange, source) {
      if (!!range) {
        //self.$refs.connectivedebug.innerHTML = 'connective depth:'+ self.getConnectiveDepth(range);
        if (range.length > 0) {
          // use getContent to see if any part with annotations is overlapped. if yes, forbid editing
          var ops = self.quill.getContents(range.index, range.length).ops;
          if (_.some(ops, function(e){return _.has(e, 'attributes.fact')})) { self.quill.disable() }
          else { self.quill.enable(); self.quill.focus() }
        } else {
          // use getFormat to see if at the cursor position we are inside a annotation. if yes, forbig editing
          var format = self.quill.getFormat(range, 0);
          if (!!format.fact) { self.quill.disable() }
          else { self.quill.enable(); self.quill.focus() }
        }
      }
    });
  },
  beforeDestroy: function() {
    this.quill = null
    delete this.quill
  },
  watch: {
    value(newVal,oldVal) {
      if (newVal && newVal !== this.content0) {
        this.content0 = newVal
        this.quill.pasteHTML(newVal)
      }
    }
  },
  template: `
    <div>
      <div id="quilltoolbar" >
        <span class="ql-formats">
          <select class="ql-header" title="Headings">
            <option value="1"></option>
            <option value="2"></option>
            <option value="3"></option>
            <option selected></option>
          </select>
        </span>
        <span class="ql-formats">
          <button class="ql-bold" title="Bold"></button>
          <button class="ql-italic" title="Italic"></button>
          <button class="ql-underline" title="Underline"></button>
          <button class="ql-strike" title="Strike"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered" title="Ordered list"></button>
          <button class="ql-list" value="bullet" title="Bullet list"></button>
          <button class="ql-indent" value="-1" title="Decrease indent"></button>
          <button class="ql-indent" value="+1" title="Increase indent"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-script" value="sub" title="Subscript"></button>
          <button class="ql-script" value="super" title="Superscript"></button>
        </span>
        <span class="ql-formats float-right">
          <button type="button" class="btn btn-primary-outline btn-sm mr-4" :disabled="annotateButtonsDisabled"
                  title="Clear annotations" style="border: 1px solid gray; width: unset"
                  v-on:click="removeAnnotations">
            <feather-icon icon="x-square"></feather-icon>
            <span class="small ml-1" style="font-variant:small-caps">Clear</span>
          </button>
          <button type="button" class="btn btn-primary-outline btn-sm mr-2" :disabled="annotateButtonsDisabled"
                  title="Specify as term" style="border: 1px solid gray; width: unset"
                  v-on:click="annotateTerm">
            <feather-icon icon="bookmark"></feather-icon>
            <span class="small ml-1" style="font-variant:small-caps">Term</span>
          </button>
          <div class="dropdown" style="display: inline-block">
            <button @click="showConnectiveDropdown" @blur.prevent="hideConnectiveDropdown" :disabled="annotateButtonsDisabled" class="btn btn-primary-outline btn-sm dropdown-toggle" type="button" style="width:unset; border: 1px solid gray" title="Annotate as complex statement">
               <feather-icon icon="git-commit"></feather-icon> <span class="small ml-1" style="font-variant:small-caps">Connective</span>
            </button>
            <div ref="editorConnectiveDropdown" class="dropdown-menu dropdown-menu-right" style="top: 30px">
              <h6 class="dropdown-header">Connectives</h6>
              <a class="dropdown-item small" href="#" v-on:mousedown="annotateConnective(conn.code)" v-for="conn in connectives">{{ conn.name }}</a>
            </div>
          </div>
        </span>
      </div>
      <div ref="editor" v-bind:style="styleObject"></div>
      <quill-term-prompt v-if="termPrompt" v-bind:data="termPromptData" @annotate-cancel="hideTermPrompt" @annotate-confirm="doneAnnotateTerm"></quill-term-prompt>
      <div ref="connectivedebug"></div>
    </div>
  `
})

Vue.component('quill-term-prompt', {
  data: function() {
    return {
      selectedTerm: '',
      newTerm: ''
      }
  },
  props: ['data'],
  methods: {
    confirm: function() {
      let info = {};
      if (!!this.newTerm) {
          info.term = this.newTerm;
          info.fresh = true;
        } else {
          info.term = this.selectedTerm;
          info.fresh = false;
        }
      this.$emit('annotate-confirm', this.data, info)
    },
    cancel: function() {
      this.$emit('annotate-cancel')
    }
  },
  computed: {
    termSelectDisabled: function() {
      return this.newTerm != '';
    }
  },
  template: `
   <div class="card w-50" style="position:fixed; top:200px; left:15%; z-index:1000">
      <div class="card-body">
        <h6 class="card-title mb-0 font-weight-bold">Annotate as term</h6>
        <hr class="my-1 mb-2">
        <div class="form-group row">
          <label for="annotateview-original" class="col-sm-2 col-form-label">Text</label>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-original" :value="data.original" readonly>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label for="annotateview-term" class="col-sm-2 col-form-label">Term</label>
          <div class="col-sm-10">
            <select class="form-control form-control-sm" id="annotateview-term" :disabled="termSelectDisabled" v-model="selectedTerm">
              <option selected value="">Choose from existing terms ... </option>
              <option v-for="term in data.terms" v-bind:title="term.original">{{ term.symbol }}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-center">... or <label for="annotateview-newterm" class="font-weight-bold">add new term</label>:</div></div>
        </div>
        <div class="form-group row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-newterm" v-model="newTerm" placeholder="Type new term name ...">
          </div>
        </div>
        <!--<div class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-right">... or <a>add new term</a></div></div>
        </div>-->
        <div class="btn-toolbar">
          <div class="btn-group mr-2">
            <button class="btn btn-small btn-success" v-on:click="confirm">Annotate</button>
          </div>
          <div class="btn-group">
            <button class="btn btn-small btn-outline-danger" v-on:click="cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div> 
  `
});

Vue.component('annotateview', {
  data: function() {
    return {
      active: 'term',
      selectedTerm: '',
      newTerm: '',
      selectedConnective: ''
    }
  },
  props: ['data'],
  methods: {
    confirm: function() {
      let info = {typ: this.active};
      switch (this.active) {
        case 'term':
          if (!!this.newTerm) {
            info.term = this.newTerm;
            info.fresh = true;
          } else {
            info.term = this.selectedTerm;
            info.fresh = false;
          }
          break;
        case 'connective':
          info.connective = this.selectedConnective
          break
      }
      this.$parent.$emit('annotate-confirm', info, this.data)
    },
    cancel: function() {
      this.$parent.$emit('annotate-cancel')
    },
    switchTo: function(tab) {
      this.active = tab
    }
  },
  computed: {
    termSelectDisabled: function() {
      return this.newTerm != '';
    },
    connectives: function() {
      return [
        {description: 'Negation', symbol: '~', arity: 1},
        {description: 'Permission', symbol: 'Pm', arity: 1},
        {description: 'Obligation', symbol: 'Ob', arity: 1},
        {description: 'Ideality', symbol: 'Id', arity: 1},
        {description: 'Ought-implies', symbol: 'O>', arity: 2},
        {description: 'permittedly-implies', symbol: 'P>', arity: 2},
        {description: 'Conjunction', symbol: 'And', arity: 2},
        {description: 'Disjunction', symbol: 'Or', arity: 2},
        {description: 'Implication', symbol: 'Implies', arity: 2},
        {description: 'Equivalence', symbol: 'Iff', arity: 2}
      ];
    }
  },
  created: function() {
    if (!!this.data.active) {
      this.active = this.data.active;
    }
  },
  template: `
    <div class="card w-50" >
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a v-on:click="switchTo('term')" v-bind:class="{'nav-link': true, 'active': active == 'term'}" style="cursor:pointer"><feather-icon icon="bookmark"></feather-icon> Term</a>
          </li>
          <li class="nav-item">
            <a v-on:click="switchTo('connective')" v-bind:class="{'nav-link': true, 'active': active == 'connective'}" style="cursor:pointer"><feather-icon icon="git-commit"></feather-icon> Connective</a>
          </li>
        </ul>
      </div>
      <div class="card-body" v-if="active == 'term'">
        <h6 class="card-title mb-0 font-weight-bold">Annotate as term</h6>
        <hr class="my-1 mb-2">
        <div class="form-group row">
          <label for="annotateview-original" class="col-sm-2 col-form-label">Text</label>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-original" :value="data.original" readonly>
          </div>
        </div>
        <div class="form-group row mb-0">
          <label for="annotateview-term" class="col-sm-2 col-form-label">Term</label>
          <div class="col-sm-10">
            <select class="form-control form-control-sm" id="annotateview-term" :disabled="termSelectDisabled" v-model="selectedTerm">
              <option selected value="">Choose from existing terms ... </option>
              <option v-for="term in data.terms" v-bind:title="term.original">{{ term.symbol }}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-center">... or <label for="annotateview-newterm" class="font-weight-bold">add new term</label>:</div></div>
        </div>
        <div class="form-group row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-newterm" v-model="newTerm" placeholder="Type new term name ...">
          </div>
        </div>
        <!--<div class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-right">... or <a>add new term</a></div></div>
        </div>-->
        <div class="btn-toolbar">
          <div class="btn-group mr-2">
            <button class="btn btn-small btn-success" v-on:click="confirm">Annotate</button>
          </div>
          <div class="btn-group">
            <button class="btn btn-small btn-outline-danger" v-on:click="cancel">Cancel</button>
          </div>
        </div>
      </div>
      <div class="card-body" v-if="active == 'connective'">
        <h6 class="card-title mb-0 font-weight-bold">Annotate as connective</h6>
        <hr class="my-1 mb-2">
        <div class="form-group row">
          <label for="annotateview-original" class="col-sm-2 col-form-label">Text</label>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-original" :value="data.original" readonly>
          </div>
        </div>
        <div class="form-group row">
          <label for="annotateview-connective" class="col-sm-2 col-form-label">Connective</label>
          <div class="col-sm-10">
            <select class="form-control form-control-sm" id="annotateview-connective" v-model="selectedConnective">
              <option selected value="">Choose connective ... </option>
              <option v-for="(conn,index) in connectives" :value="index" v-bind:title="conn.description">{{ conn.symbol }}</option>
            </select>
          </div>
        </div>
        <template v-if="selectedConnective">
        <div class="form-group row mb-0" v-for="i in connectives[selectedConnective].arity">
          <label for="annotateview-connective-argument" class="col-sm-2 col-form-label">Argument {{ i }}</label>
          <div class="col-sm-10">
            <select class="form-control form-control-sm" id="annotateview-connective-argument">
              <option selected value="">Choose from existing terms ... </option>
              <option v-for="term in data.terms" v-bind:title="term.original">{{ term.symbol }}</option>
            </select>
          </div>
        </div>
        </template>
        <div class="btn-toolbar mt-3">
          <div class="btn-group mr-2">
            <button class="btn btn-small btn-success" v-on:click="confirm">Annotate</button>
          </div>
          <div class="btn-group">
            <button class="btn btn-small btn-outline-danger" v-on:click="cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>`
})

