const theory = {
  data: function() {
    return {
      theory: null,
      loaded: false,
      editVoc: false,
      editFacts: false,
      editTitle: false
    }
  },
  methods: {
    /* general stuff */
    back: function() {
      router.push('/dashboard')
    },
    doneLoading: function() {
      this.loaded = true
      this.$nextTick(function () {
        feather.replace();
      })
    },
    saveTheory: function() {
      var updatedTheory = {
        name: this.theoryName,
        description: this.theoryDesc,
        content: this.theoryContent,
        vocabulary: this.theoryVoc,
        formalization: this.theoryFormalization
      }
      nai.$http.put('/theories/' + this.theoryId, updatedTheory).then(function(resp) {
        console.log(resp)
      }).catch(function(error) {
        console.log(error)
      })
      console.log('Updated theory')
      console.log(updatedTheory)
    },
    /* title/description stuff */
    doEditTitle: function() {
      this.editTitle = true;
    },
    finishedEditTitle: function() {
      this.editTitle = false;
    },
    toggleEditTitle: function() {
      (this.editTitle) ? this.finishedEditTitle() : this.doEditTitle();
    },
    /* vocabulary stuff */
    addLineToVoc: function() {
      this.theoryVoc.push({symbol: '', original: ''});
      this.$nextTick(function () {
        feather.replace();
      })
      this.doEditVoc();
    },
    doEditVoc: function() {
      this.editVoc = true;
    },
    finishedEditVoc: function() {
      this.editVoc = false;
    },
    toggleEditVoc: function() {
      (this.editVoc) ? this.finishedEditVoc() : this.doEditVoc();
    },
    vocDelButtonClick: function(index) {
      this.theoryVoc.splice(index,1)
    },
    /* fact stuff */
    addLineToFacts: function() {
      this.theoryFormalization.push({forumla: '', original: ''});
      this.$nextTick(function () {
        feather.replace();
      })
      this.doEditFacts();
    },
    doEditFacts: function() {
      this.editFacts = true;
    },
    finishedEditFacts: function() {
      this.editFacts = false;
    },
    toggleEditFacts: function() {
      (this.editFacts) ? this.finishedEditFacts() : this.doEditFacts();
    },
    factDelButtonClick: function(index) {
      this.theoryFormalization.splice(index,1)
    },
  },
  computed: {
    theoryName: function() {
      return this.theory.name
    },
    theoryId: function() {
      return this.theory._id
    },
    theoryLastUpdate: function() {
      return new Date(this.theory.lastUpdate);
    },
    theoryDesc: function() {
      return this.theory.description
    },
    theoryContent: function() {
      return this.theory.content
    },
    theoryVoc: function() {
      return this.theory.vocabulary
    },
    theoryFormalization: function() {
      return this.theory.formalization
    },
    vocDelButtonTitle: function() {
      if (this.editVoc) {
        return "Delete entry"
      } else {
        return "Enable edit mode for deleting"
      }
    },
    vocDelButtonStyle: function() {
      if (this.editVoc) {
        return ""
      } else {
        return "cursor: not-allowed"
      }
    },
    factDelButtonTitle: function() {
      if (this.editFacts) {
        return "Delete entry"
      } else {
        return "Enable edit mode for deleting"
      }
    },
    factDelButtonStyle: function() {
      if (this.editFacts) {
        return ""
      } else {
        return "cursor: not-allowed"
      }
    }
  },
  template: `
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
          <div class="sidebar-sticky">
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted" v-on:click="back" style="cursor:pointer">
              <span data-feather="arrow-left"></span>
              <a class="d-flex align-items-center text-muted">
                <span><b>Back to dashboard</b></span>
              </a>
            </h6>
            
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-3 mb-1 text-muted">
              <span>Contents</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link" href="#vocabulary">
                  <span data-feather="clipboard"></span>
                  Vocabulary
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#facts">
                  <span data-feather="book"></span>
                  Formalization
                </a>
              </li>
            </ul>
            
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-3 mb-1 text-muted">
              <span>Settings</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link">
                  <span data-feather="settings"></span>
                  Preferences
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
          <div v-if="!loaded">
            <h1>Loading theory ...</h1>
            <loading-bar v-if="!loaded"></loading-bar>
          </div>
          <div v-if="loaded">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-0 mb-0">
            <input-update class="h1" placeholder="Enter title" v-bind:edit="editTitle" v-model="theoryName"></input-update>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="saveTheory">
                <span data-feather="save"></span>
                Save</button>
                <button class="btn btn-sm btn-outline-primary">
                <span data-feather="download"></span>
                Export</button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditTitle" v-bind:class="{active : editTitle}" v-bind:aria-pressed="editTitle">
                <span data-feather="edit"></span>
                Edit title/description
              </button>
            </div>
          </div>
          <p style="margin:0" class="small border-bottom pb-2 mb-2"><em>Last updated: {{ theoryLastUpdate.toLocaleString() }}</em></p>
          <p>
          <textarea-update placeholder="Enter description of theory" v-bind:edit="editTitle" v-model="theoryDesc"></textarea-update>
          </p>
          
          <a name="vocabulary" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
            <h2>Vocabulary</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
              <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToVoc">
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
          <p class="small"><em>Defining the vocabulary explicitly is not strictly necessary, however strongly advised.
          It helps keeping an overview of the used symbols and their intended meaning for the
          fact base and queries. The contents of this table do not alter the formalization; they
          are used for extended GUI features.</em></p>
          <div class="">
            <table class="table table-striped table-sm" style="table-layout:fixed;width:100%">
              <thead>
                <tr>
                  <th style="width:5em">Symbol</th>
                  <th style="width:100%">Description</th>
                  <th style="width:5em;text-align: center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in theoryVoc" :key="item._id">
                  <td><input-update placeholder="Enter symbol" v-bind:edit="editVoc" v-model="item.symbol"></input-update></td>
                  <td><em><textarea-update placeholder="Enter description" v-bind:edit="editVoc" v-model="item.original"></textarea-update></em></td>
                  <td class="table-secondary" style="text-align: center">
                    <button type="button" class="btn btn-sm btn-danger" v-bind:disabled="!editVoc" v-bind:title="vocDelButtonTitle" v-bind:style="vocDelButtonStyle" v-on:click="vocDelButtonClick(index)"><span data-feather="x"></span></button>
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
          <p class="small"><em>A consistency check should be conducted prior to executing any further queries.</em></p>
          <div class="table-responsive">
            <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
              <thead>
                <tr>
                  <th style="width:2em">#</th>
                  <th style="width:60%">Statement</th>
                  <th style="width:40%">Formula</th>
                  <th style="width:10em; text-align: center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in theoryFormalization" :key="item._id">
                  <td>{{ index+1 }}</td>
                  <td><em><textarea-update placeholder="Enter Description (or leave empty if constructed from fact)" v-bind:edit="editFacts" v-model="item.original"></textarea-update></em></td>
                  <td><textarea-update placeholder="Enter fact" v-bind:edit="editFacts" v-model="item.formula"></textarea-update></td>
                  <td class="table-secondary" style="text-align: center">
                    <button title="Check for logical independence" type="button" class="btn btn-sm btn-secondary"><span data-feather="activity"></span></button>
                    <button title="Remove fact" type="button" class="btn btn-sm btn-danger" v-on:click="factDelButtonClick(index)" v-bind:disabled="!editFacts" v-bind:title="factDelButtonTitle" v-bind:style="factDelButtonStyle"><span data-feather="x"></span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
          
          <p>&nbsp;</p>
        </main>
        
      </div>
    </div>
  `,
  mounted: function() {
    feather.replace();
  },
  created: function () {
    console.log('theory view created')
    var self = this;
    var theoryId = this.$route.params.id
    if (!!theoryId) {
      nai.$http.get('/theories/' + theoryId).then(function(resp) {
        console.log("theory retrieved");
        self.theory = resp.data;
        self.doneLoading()
        console.log(self.theory);
        console.log(JSON.stringify(self.theory));
      }).catch(
        function(error) {
          if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
        }
      );
    } else {
      // error handling
      console.log('no theory id given');
      this.theory = {name: '', description: '', vocabulary: [{symbol: '', original: ''}], formalization: [{original: '', formula: ''}]}
      self.doneLoading();
      this.doEditTitle();
      this.doEditVoc();
      this.doEditFacts();
    }
  }
}
