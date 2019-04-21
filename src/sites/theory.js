const theory = {
  data: function() {
    return {
      theory: null,
      loaded: false,
      lastSavedTheory: null,

      editTitle: false,
      editVoc: false,
      editFacts: false,

      saving: false,
      saveResponse: {show: false, type: '', message: '', timeout: 0},

      consistencyCheckRunning: false,
      consistencyResponse: {show: false, type: '', message: '', timeout: 0},
      
      showAnnotateWindow: false,
      annotationWindowData: null,
      annotationColors: ['#5C97BF','#00AA55','#F64747','#B381B3','#1BA39C','#FF00FF',
                         '#D252B2','#D46A43','#00A4A6','#D4533B','#939393','#AA8F00',
                         '#D47500','#E26A6A','#009FD4','#5D995D'],
      lastAnnotationColor: -1
    }
  },
  methods: {
    /* general stuff */
    back: function() {
      if (!_.isEqual(this.theory, this.lastSavedTheory)) {
        nai.log("Theory was changed", "[Theory]")
        var response = window.confirm("You have unsaved changed. Are you sure you want to leave this page?")
        if (response) {
         window.removeEventListener("beforeunload", unloadHandler);
         nai.log("Event listener removed", "[Theory]");
         router.push('/dashboard')
        }
      } else {
        nai.log("Theory unchanged", "[Theory]")
        window.removeEventListener("beforeunload", unloadHandler);
        nai.log("Event listener removed", "[Theory]");
        router.push('/dashboard')
      }
    },
    doneLoading: function() {
      this.loaded = true
      this.$nextTick(function () {
        feather.replace();
      })
    },
    saveTheory: function(onSuccess, onError) {
      var self = this;
      var updatedTheory = {
        _id: this.theoryId,
        name: this.theoryName,
        description: this.theoryDesc,
        content: this.theoryContent,
        vocabulary: this.theoryVoc,
        formalization: this.theoryFormalization
      }
      // Show save-in-progress icon
      this.saving = true;
      // Call API
      nai.log('is saved equal to before updated? ' + _.isEqual(self.lastSavedTheory, self.theory))
      nai.saveTheory(updatedTheory, function(resp) {
        self.saveResponse = {show: true, type: 'success', message: 'Theory successfully saved', timeout: 3000};
        self.saving = false;
        self.lastSavedTheory = _.cloneDeep(self.theory)
        nai.log('Update successful, response: ', '[Theory]')
        nai.log(resp, '[Theory]')
        if (!!onSuccess) { onSuccess() } // Run passed callback if existent
      }, function(error) {
        self.saveResponse = {show: true, type: 'warning', message: 'Theory not saved, an error occurred: ' + error};
        self.saving = false;
        nai.log('Update error, response: ', '[Theory]')
        nai.log(error, '[Theory]')
        if (!!onError) { onError() } // Run passed callback if existent
      });
      // Disable all editing
      this.finishedEditTitle()
      this.finishedEditVoc()
      this.finishedEditFacts()
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
    toggleSelectAll: function() {
      var toggle = this.$refs.selectAllBox.checked
      for (let f of this.theoryFormalization) {
        f.active = toggle
      }
    },
    addLineToFacts: function() {
      this.theoryFormalization.push({forumla: '', original: '', active: true});
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
    runConsistencyCheck: function() {
      var self = this;
      // Hide previous response if still showing
      self.consistencyResponse = {show: false, type: '', message: '', timeout: 0};
      // check if we need to save the theory first
      if (!_.isEqual(this.theory, this.lastSavedTheory)) {
        // latest version not saved to backend, so update first
        this.saveTheory(function() {
            self.runConsistencyCheck0();
          },
          function() {
            var msg = 'Consistency check cannot be conducted because there was an error during saving.';
            self.consistencyResponse = {show: true, type: 'danger', message: msg};
          }
        );
      } else {
        // no local changes, so run consistency check
        this.runConsistencyCheck0();
      }
    },
    runConsistencyCheck0: function() {
      var self = this;
      this.consistencyCheckRunning = true;
      nai.checkConsistency(this.theoryId, function(resp) {
        nai.log(resp, '[Theory]')
        var data = resp.data.data;
        if (! _.isUndefined(data.consistent)) {
          if (data.consistent) {
            var msg = '<b>Consistency check succeeded</b>: Normalization is logically consistent';
            self.consistencyResponse = {show: true, type: 'success', message: msg, timeout: 3000};
          } else {
            var msg = '<b>Consistency check succeeded</b>: Normalization is inconsistent (an intrinsic contradiction could be derived).';
            self.consistencyResponse = {show: true, type: 'warning', message: msg, timeout: 3000};
          }
        } else {
          var msg = '<b>Consistency check failed</b>: Got unexpected response. ' + data;
          self.consistencyResponse = {show: true, type: 'info', message: msg, timeout: 3000};
        }
        self.consistencyCheckRunning = false
      }, function(error) {
        nai.log(error.response, '[Theory]')
        self.consistencyResponse = {show: true, type: 'danger', message: '<b>Error</b>: ' + error.response.data.err};
        self.consistencyCheckRunning = false
      })
    },
    onTheoryAnnotateRequest: function(range, text) {
      console.log("annotate from theory: " + text)
      var data = { original: text, range: range }
      this.annotationWindowData = data
      this.showAnnotateWindow = true
    },
    onTheoryAnnotate: function(data, formalization) {
      console.log('Confirm annotation')
      this.theoryFormalization.push({formula: formalization, original: data.original, active: true});
      this.$nextTick(function () {
        feather.replace();
      })
      this.showAnnotateWindow = false
      this.lastAnnotationColor = (this.lastAnnotationColor+1) % this.annotationColors.length
      this.$refs.quillel.confirmAnnotation(data.range, this.annotationColors[this.lastAnnotationColor])
      console.log('done')
    },
    onTheoryAnnotateCancel: function() {
      this.showAnnotateWindow = false
    }
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

            <!--<h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-3 mb-1 text-muted">
              <span>Settings</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link">
                  <span data-feather="settings"></span>
                  Preferences
                </a>
              </li>
            </ul>-->
          </div>
        </nav>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
          <div v-if="!loaded">
            <h1>Loading theory ...</h1>
            <loading-bar v-if="!loaded"></loading-bar>
          </div>
          <div v-if="loaded">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-0 mb-0">
            <input-update class="h1 mb-0" placeholder="Enter title" v-bind:edit="editTitle" v-model="theory.name"></input-update>

            <img v-if="saving" src="/img/loading.gif">

            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="saveTheory();" :disabled="saving">
                  <template v-if="!saving">
                    <icon-save></icon-save>
                    Save
                  </template>
                  <template v-else>
                    <div class="spinner-border text-primary" role="status">
                      <span class="sr-only">Saving...</span>
                    </div>
                  </template>
                </button>
                <button class="btn btn-sm btn-outline-primary" disabled>
                <span data-feather="download"></span>
                Export</button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditTitle" v-bind:class="{active : editTitle}" v-bind:aria-pressed="editTitle">
                <span data-feather="edit"></span>
                Edit title/description
              </button>
            </div>
          </div>
          <p style="margin:0" class="small border-bottom pb-0 mb-1"><em>Last updated: {{ theoryLastUpdate.toLocaleString() }}</em></p>
          <p>
          <textarea-update placeholder="Enter description of theory" v-bind:edit="editTitle" v-model="theory.description"></textarea-update>
          </p>
          <alert v-on:dismiss="saveResponse.show = false;" :variant="saveResponse.type" v-show="saveResponse.show" :timeout="saveResponse.timeout" style="position:absolute; top:150px; right:100px">{{ saveResponse.message }}</alert>
          
          <annotateview v-if="showAnnotateWindow" v-bind:data="annotationWindowData" style="position:fixed; top:200px; left:15%; z-index:1000"></annotateview>
          
          <a name="original" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <h2>Text input</h2>
          <quill ref="quillel" v-model="theory.content" maxheight="300px"></quill>

          <hr>
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
                  <th style="width:7em">Symbol</th>
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
            <img v-if="consistencyCheckRunning" src="/img/loading.gif">
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
              <button class="btn btn-sm btn-outline-secondary float-right" v-on:click="runConsistencyCheck">
                <span data-feather="play"></span>
                Run consistency check
              </button>
            </div>
          </div>
          <p class="small"><em>A consistency check should be conducted prior to executing any further queries.</em></p>

          <alert v-on:dismiss="consistencyResponse = {};" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>

          <div class="table-responsive">
            <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
              <thead>
                <tr>
                  <th style="width:2em;text-align:center;vertical-align:center;border-right:1px solid black"><input type="checkbox" v-on:click="toggleSelectAll" checked="checked" ref="selectAllBox" title="Toggle select all"></th>
                  <th style="width:60%">Description</th>
                  <th style="width:40%">Formula</th>
                  <th style="width:10em; text-align: center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in theoryFormalization" :key="item._id" v-bind:class="{'tr-disabled': !item.active}">
                  <td style="padding:0;border-right:1px solid black">
                    <span style="display:block;font-size:xx-small">
                      <span style="padding:1px;border-right: 1px solid gray; border-bottom: 1px solid gray;">{{ index+1 }}</span>
                    </span>
                    <span style="display:block;margin-top:0.2em;margin-left:0.5em">
                      <input class="form-check" type="checkbox" v-model="item.active">
                    </span>
                  </td>
                  <td style="border-right:1px solid black">
                    <em><textarea-update placeholder="Enter Description (or leave empty if constructed from fact)" v-bind:edit="editFacts" v-model="item.original"></textarea-update></em>
                  </td>
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
    
    this.$on('theory-annotate', this.onTheoryAnnotateRequest);
    this.$on('annotate-confirm', this.onTheoryAnnotate);
    this.$on('annotate-cancel', this.onTheoryAnnotateCancel);
  },
  created: function () {
    nai.log('Created', '[Theory]')
    var self = this;
    var theoryId = this.$route.params.id
    if (!!theoryId) {
      nai.getTheory(theoryId, function(resp) {
        nai.log('Data retrieved', '[Theory]');
        nai.log(resp.data, '[Theory]');
        self.theory = resp.data.data;
        self.lastSavedTheory = _.cloneDeep(self.theory)
        // if theory was freshly created, edit=true is set as GET parameter
        // so enable edit mode for all contents
        if (self.$route.query.edit) {
          self.doEditTitle();
          self.doEditVoc();
          self.doEditFacts();
        }
        self.doneLoading()
      }, nai.handleResponse())
    } else {
      // This should not happen
      nai.log('No id given, aborting.', '[Theory]');
    }
    unloadHandler = function(event) {
      if (!_.isEqual(self.theory, self.lastSavedTheory)) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    window.addEventListener("beforeunload", unloadHandler);
    nai.log('Unload handler created', '[Theory]')
  }
}

