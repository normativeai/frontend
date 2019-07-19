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
      registerResponse: {show: false, type: '', message: '', timeout: 0}
    }
  },
  methods: {
    submit: function() {
      // call api
      let data = {name: this.name, email: this.email, password: this.password};
      let self = this;
      nai.register(data, function(resp) {
        self.registerResponse = {show: true, type: 'success', message: `Registration successful. Your user account has been created.
           You can now log in above using your password.`, timeout: 4000};
      }, function(error) {
        if (!!error.response.data.error) {
          self.registerResponse = {show: true, type: 'danger', message: "Registration failed, reason: " + error.response.data.error};
        } else {
          self.registerResponse = {show: true, type: 'danger', message: "Registration failed, reason: " + error};
        }
      });
    }
  },
  template: `
<div class="register">
  <h2>Register an account</h2>
  <alert v-on:dismiss="registerResponse.show = false;registerResponse.timeout = null" :variant="registerResponse.type" v-show="registerResponse.show" :timeout="registerResponse.timeout" style="position:absolute;right:50px;">{{ registerResponse.message }}</alert>
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
    node.setAttribute('data-connective', data.connective.code);
    node.setAttribute('title', data.connective.name);
    return node;
  }

  static formats(node) {
    return {
      id: node.getAttribute('id'),
      connective: {
        code: node.getAttribute('data-connective'),
        name: node.getAttribute('title')
      }
    };
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
    node.addEventListener('mouseover', function(e) {nai.highlightTerm(data.term);});
    node.addEventListener('mouseout', function(e) {nai.unhighlightTerm(data.term);});
    node.setAttribute('title', data.term);
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


class GoalBlot extends Inline {
  static create(id) {
    let node = super.create();
    node.setAttribute('id', id);
    node.setAttribute('title', 'Goal');
    return node;
  }

  static formats(node) {
    return node.getAttribute('id');
  }
}
GoalBlot.blotName = 'goal';
GoalBlot.tagName = 'span';
GoalBlot.className = 'annotator-goal';


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
Inline.order.push('goal');

Quill.register(GoalBlot)
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
      options: {
        theme: "snow",
        modules: {
          history: {
            delay: 1000,
            userOnly: false
          },
          toolbar: {
           container: '#quilltoolbar',
           handlers: {
             'undo': function() {
               this.quill.history.undo();
             },
             'redo': function() {
               this.quill.history.redo();
             }
           }
         }
         }
       },
      termPrompt: false, termPromptData: null,
    }
  },
  props: ['value','maxheight', 'terms', 'connectives','allowTermCreation', 'goal'],
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
      let depth = this.getConnectiveDepth(origin.range);
      this.quill.formatText(origin.range.index, origin.range.length, 'term', data)
      this.$parent.$emit('theory-annotate', origin, info, depth);
    },
    hideTermPrompt: function() {
      this.termPrompt = false;
      this.termPromptData = null;
    },
    annotateConnective: function(conn) {
      var range = this.quill.getSelection()
      if (!!range) {
        if (range.length > 0) {
          let data = {id: this.generateUUID(), connective: conn};
          let depth = this.getConnectiveDepth(range);
          let format = 'connective-' + depth;
          this.quill.formatText(range.index, range.length, format, data)
          if (depth == 1) {
            let text = this.quill.getText(range.index, range.length);
            this.$parent.$emit('theory-annotate', {original: text, range: range}, {term: null}, depth);
          }
        }
      }
    },
    annotateGoal: function() {
      var range = this.quill.getSelection()
      if (!!range) {
        if (range.length > 0) {
          let id = this.generateUUID();
          let format = 'goal'
          this.quill.formatText(range.index, range.length, format, id)
          console.log('done goal:' + range.index + " " + range.length)
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
    },
    allowTermCreation0: function() {
      if (_.isNil(this.allowTermCreation)) {
        return true;
      } else {
        return this.allowTermCreation;
      }
    },
    goal0: function() {
      if (_.isNil(this.goal)) {
        return false;
      } else {
        return this.goal;
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
    /*this.quill.on('selection-change', function(range, oldRange, source) {
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
    });*/
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
        <span class="ql-formats">
          <button class="ql-undo position-relative" title="Undo">
            <svg style="width: 100%; height: 100%;" viewbox="0 0 18 18">
              <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
              <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
            </svg>
          </button>
          <button class="ql-redo position-relative" title="Redo">
            <svg style="width: 100%; height: 100%;" viewbox="0 0 18 18">
              <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
              <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
            </svg>
          </button>
        </span>
        <span class="ql-formats float-right">
          <button type="button" class="btn btn-primary-outline btn-sm mr-4" :disabled="annotateButtonsDisabled"
                  title="Clear annotations" style="border: 1px solid gray; width: unset"
                  v-on:click="removeAnnotations">
            <feather-icon icon="x-square"></feather-icon>
            <span class="small ml-1" style="font-variant:small-caps">Clear</span>
          </button>
          <button type="button" class="btn btn-primary-outline btn-sm mr-2" :disabled="annotateButtonsDisabled"
                  title="Annotate goal" style="border: 1px solid gray; width: unset"
                  v-on:click="annotateGoal" v-if="goal0">
            <feather-icon icon="target"></feather-icon>
            <span class="small ml-1" style="font-variant:small-caps">Goal</span>
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
              <a class="dropdown-item small" href="#" v-on:mousedown="annotateConnective(conn)" :data-tippy-content="conn.description" v-tippy='{placement : "top", delay : [300,0], offset : "-50, 0", theme : "light-border", distance : 5 }' v-for="conn in connectives">{{ conn.name }}</a>
            </div>
          </div>
        </span>
      </div>
      <div ref="editor" v-bind:style="styleObject"></div>
      <quill-term-prompt v-if="termPrompt" v-bind:data="termPromptData" @annotate-cancel="hideTermPrompt" @annotate-confirm="doneAnnotateTerm" v-bind:allowTermCreation="allowTermCreation0"></quill-term-prompt>
      <div ref="connectivedebug"></div>
    </div>
  `
})

Vue.component('quill-term-prompt', {
  props: ['data','allowTermCreation'],
  data: function() {
    return {
      selectedTerm: '',
      newTerm: '',
      checked: '' // Default name checkbox.
      }
  },
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
    },
    updateDefaultName: function() { // Called on checkbox change.
      if(this.checked) {
        let highlightedTextArr = this.data.original.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '').trim().split(' ').slice(0,3);
        this.newTerm = highlightedTextArr.join('_');
      } else {
        this.newTerm = '';
      }
    }
  },
  computed: {
    termSelectDisabled: function() {
      return this.newTerm != '';
    },
    checkboxDisabled: function() {
      return this.termSelectDisabled && !this.checked;
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
              <option v-for="term in _.uniqBy(data.terms, 'full')" v-bind:title="term.original">{{ term.full }}</option>
            </select>
          </div>
        </div>
        <div class="row" v-if="allowTermCreation">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-center">... or <label for="annotateview-newterm" class="font-weight-bold">add new term</label>:</div></div>
        </div>
        <div class="form-group row" v-if="allowTermCreation">
          <div class="col-sm-2">
            <span class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="annotate-term-checkbox" v-model="checked" @change="updateDefaultName" :disabled="checkboxDisabled">
              <label class="form-check-label" for="annotate-term-checkbox">
                Default Term Name
              </label>
            </span>
          </div>
          <div class="col-sm-10">
            <input type="text" class="form-control form-control-sm" id="annotateview-newterm" v-model="newTerm" placeholder="Type new term name ...">
          </div>
        </div>

        <!--<div class="row">
          <div class="col-sm-2"></div>
          <div class="col-sm-10"><div class="float-right">... or <a>add new term</a></div></div>
        </div>-->
        <div class="btn-toolbar mt-1">
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
