const query = {
  data: function() {
    return {
      query: null,
      lastSavedQuery: null,
      theories: null,
      chosenTheory: '',
      loadedQuery: false,
      loadedTheories: false,

      editTitle: false,
      editAssumptions: false,
      editGoal: false,

      saving: false,
      saveResponse: {show: false, type: '', message: '', timeout: 0},

      execRunning: false,
      execResponse: {show: false, type: '', message: '', timeout: 0},

      consistencyCheckRunning: false,
      consistencyResponse: {show: false, type: '', message: '', timeout: 0},
    }
  },
  methods: {
    /* general stuff */
    back: function() {
      if (!_.isEqual(this.query, this.lastSavedQuery)) {
        nai.log("Query was changed", "[Query]")
        var response = window.confirm("You have unsaved changed. Are you sure you want to leave this page?")
        if (response) {
         window.removeEventListener("beforeunload", unloadHandler);
         nai.log("Event listener removed", "[Query]");
         router.push('/dashboard')
        }
      } else {
        nai.log("Query unchanged", "[Query]")
        window.removeEventListener("beforeunload", unloadHandler);
        nai.log("Event listener removed", "[Query]");
        router.push('/dashboard')
      }
    },
    saveQuery: function(onSuccess, onError) {
      var self = this;
      var updatedQuery = {
        _id: this.queryId,
        name: this.queryName,
        theory: this.chosenTheory,
        description: this.queryDesc,
        assumptions: this.queryAssumptions,
        goal: this.queryGoal
      }
      nai.log('save query:')
      nai.log(updatedQuery);
      // Show save-in-progress icon
      this.saving = true;
      // Call API
      nai.saveQuery(updatedQuery, function(resp) {
        self.saveResponse = {show: true, type: 'success', message: 'Query successfully saved', timeout: 3000};
        self.saving = false;
        self.lastSavedQuery = _.cloneDeep(self.query)
        nai.log('Update successful, response: ', '[Query]')
        nai.log(resp, '[Query]')
        if (!!onSuccess && onSuccess) { onSuccess() }
      }, function(error) {
        self.saveResponse = {show: true, type: 'warning', message: 'Query not saved, an error occurred: ' + error};
        self.saving = false;
        nai.log('Update error, response: ', '[Query]')
        nai.log(error, '[Query]')
        if (!!onError && onError) { onError() }
      });
      // Disable all editing
      this.finishedEditTitle()
      this.finishedEditAssumptions()
      this.finishedEditGoal()
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
    /* assumptions stuff */
    addLineToAssumptions: function() {
      this.queryAssumptions.push('');
      this.doEditAssumptions();
    },
    doEditAssumptions: function() {
      this.editAssumptions = true;
    },
    finishedEditAssumptions: function() {
      this.editAssumptions = false;
    },
    toggleEditAssumptions: function() {
      (this.editAssumptions) ? this.finishedEditAssumptions() : this.doEditAssumptions();
    },
    assumptionsDelButtonClick: function(index) {
      this.queryAssumptions.splice(index,1)
    },
    /* goal stuff */
    doEditGoal: function() {
      this.editGoal = true;
    },
    finishedEditGoal: function() {
      this.editGoal = false;
    },
    toggleEditGoal: function() {
      (this.editGoal) ? this.finishedEditGoal() : this.doEditGoal();
    },
    runQuery: function() {
      var self = this;
      if (!!this.chosenTheory) {
        self.execResponse = {show: false, type: '', message: '', timeout: 0};
        if (!_.isEqual(this.query, this.lastSavedQuery)) {
          this.saveQuery(function() {
            self.runQuery0();
          },
          function() {
            var msg = 'Query cannot be executed because there was an error during saving.';
            self.execResponse = {show: true, type: 'warning', message: msg};
          });
        } else {
          this.runQuery0();
        }
      } else {
        nai.log('Theory not chosen, query not possible', '[Query]');
        self.execResponse = {show: true, type: 'warning', message: 'Cannot execute query, please select theory first.', timeout: 3000};
      }
    },
    runQuery0: function() {
      var self = this;
      this.execRunning = true;
        nai.runQuery(this.queryId, function(resp) {
          nai.log(resp, '[Query]')
          var data = resp.data.data;
          if (!!data.result) {
            if (data.result == 'Theorem') {
              var msg = 'Goal is a <b>Theorem</b>: It logically follows from the theory and the assumptions.';
              self.execResponse = {show: true, type: 'success', message: msg};
            } else if (data.result == 'Non-Theorem') {
              var msg = 'Goal is <b>counter-satisfiable</b>: It does not logically follow from the theory and the assumptions.';
              self.execResponse = {show: true, type: 'info', message: msg};
            } else {
              var msg = 'Got unexpected response: ' + resp.data.data.result;
              self.execResponse = {show: true, type: 'warning', message: msg};
            }
          } else {
           var msg = 'Got unexpected response: ' + resp.data.data.result;
           self.execResponse = {show: true, type: 'warning', message: msg};
          }
          self.execRunning = false
        }, function(error) {
          nai.log(error.response, '[Query]')
          self.execResponse = {show: true, type: 'danger', message: '<b>Error</b>: ' + error.response.data.err};
          self.execRunning = false
        });
    },
    runConsistencyCheck: function() {
      var self = this;
      this.consistencyCheckRunning = true;
      nai.checkQueryConsistency(this.queryId, function(resp) {
        nai.log(resp, '[Query]')
        var data = resp.data.data;
        if (! _.isUndefined(data.consistent)) {
          if (data.consistent) {
            var msg = '<b>Consistency check succeeded</b>: Normalization and query assumptions are logically consistent';
            self.consistencyResponse = {show: true, type: 'success', message: msg, timeout: 3000};
          } else {
            var msg = '<b>Consistency check succeeded</b>: Normalization and query assumptions are inconsistent (an intrinsic contradiction could be derived).';
            self.consistencyResponse = {show: true, type: 'warning', message: msg, timeout: 3000};
          }
        } else {
          var msg = '<b>Consistency check failed</b>: Got unexpected response. ' + data;
          self.consistencyResponse = {show: true, type: 'info', message: msg, timeout: 3000};
        }
        self.consistencyCheckRunning = false
      }, function(error) {
        nai.log(error.response, '[Query]')
        self.consistencyResponse = {show: true, type: 'danger', message: '<b>Error</b>: ' + error.response.data.err};
        self.consistencyCheckRunning = false
      })
    }
  },
  computed: {
    loaded: function() {
      return this.loadedQuery && this.loadedTheories;
    },
    queryName: function() {
      return this.query.name
    },
    queryId: function() {
      return this.query._id
    },
    queryTheory: function() {
      return this.query.theory
    },
    queryTheoryId: function() {
      return this.query.theory._id;
    },
    queryLastUpdate: function() {
      return new Date(this.query.lastUpdate);
    },
    queryDesc: function() {
      return this.query.description
    },
    queryAssumptions: function() {
      return this.query.assumptions
    },
    queryGoal: function() {
      return this.query.goal
    },
    assumptionsDelButtonTitle: function() {
      if (this.editAssumptions) {
        return "Delete entry"
      } else {
        return "Enable edit mode for deleting"
      }
    },
    assumptionsDelButtonStyle: function() {
      if (this.editAssumptions) {
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
              <feather-icon icon="arrow-left"></feather-icon>
              <a class="d-flex align-items-center text-muted">
                <span><b>Back to dashboard</b></span>
              </a>
            </h6>

            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-3 mb-1 text-muted">
              <span>Contents</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link" href="#assumptions">
                  <feather-icon icon="clipboard"></feather-icon>
                  Assumptions
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#goal">
                  <feather-icon icon="book"></feather-icon>
                  Goal
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
          <div v-if="!loaded">
            <h1>Loading query ...</h1>
            <loading-bar v-if="!loaded"></loading-bar>
          </div>
          <div v-if="loaded">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-0 mb-0">
            <input-update class="h1" placeholder="Enter title" v-bind:edit="editTitle" v-model="query.name"></input-update>

            <img v-if="saving" src="/img/loading.gif">

            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <select class="form-control" v-model="chosenTheory">
                  <option disabled value=''>Choose theory</option>
                  <option v-for="t in theories" v-bind:key="t._id" v-bind:value="t._id">{{ t.name }}</option>
                </select>
              </div>
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="saveQuery();">
                <feather-icon icon="save"></feather-icon>
                Save</button>
                <button class="btn btn-sm btn-outline-primary">
                <feather-icon icon="download"></feather-icon>
                Export</button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditTitle" v-bind:class="{active : editTitle}" v-bind:aria-pressed="editTitle">
                <feather-icon icon="edit"></feather-icon>
                Edit title/description
              </button>
            </div>
          </div>
          <p style="margin:0" class="small border-bottom pb-2 mb-2"><em>Last updated: {{ queryLastUpdate.toLocaleString() }}</em></p>
          <p>
          <textarea-update placeholder="Enter description of query" v-bind:edit="editTitle" v-model="query.description"></textarea-update>
          </p>
          <alert v-on:dismiss="saveResponse = {};" :variant="saveResponse.type" v-show="saveResponse.show" :timeout="saveResponse.timeout">{{ saveResponse.message }}</alert>

          <a name="assumptions" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
            <h2>Assumptions</h2>
            <img v-if="consistencyCheckRunning" src="/img/loading.gif">
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
              <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToAssumptions">
              <feather-icon icon="plus"></feather-icon>
              Add entry
              </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditAssumptions" v-bind:class="{active : editAssumptions}" v-bind:aria-pressed="editAssumptions">
              <feather-icon icon="edit"></feather-icon>
              Toggle edit
              </button>
              <button class="btn btn-sm btn-outline-secondary float-right" v-on:click="runConsistencyCheck">
                <feather-icon icon="play"></feather-icon>
                Run assumptions consistency check
              </button>
            </div>
          </div>
          <p class="small"><em>Assumptions are contextual information that apply to a certain
          situation only.</em></p>
          <alert v-on:dismiss="consistencyResponse = {};" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
          <div class="">
            <table class="table table-striped table-sm" style="table-layout:fixed;width:100%">
              <thead>
                <tr>
                  <th style="width:5em">#</th>
                  <!--<th style="width:60%">Description</th>-->
                  <th style="width:100%">Formula</th>
                  <th style="width:5em;text-align: center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in queryAssumptions">
                  <td>{{ index+1 }}</td>
                  <!--<td><em><textarea-update placeholder="Enter description" v-bind:edit="editAssumptions"></textarea-update></em></td>-->
                  <td><textarea-update placeholder="Enter formula" v-bind:edit="editAssumptions" v-model="queryAssumptions[index]"></textarea-update></td>
                  <td class="table-secondary" style="text-align: center">
                    <button type="button" class="btn btn-sm btn-danger" v-bind:disabled="!editAssumptions" v-bind:title="assumptionsDelButtonTitle" v-bind:style="assumptionsDelButtonStyle" v-on:click="assumptionsDelButtonClick(index)"><feather-icon icon="x"></feather-icon></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr>
          <a name="goal" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
            <h2>Goal</h2>
            <img v-if="execRunning" src="/img/loading.gif">
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="runQuery" title="Save query and run it.">
                  <feather-icon icon="play"></feather-icon>
                  Execute query
                </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditGoal" v-bind:class="{active : editGoal}" v-bind:aria-pressed="editGoal">
              <feather-icon icon="edit"></feather-icon>
              Toggle edit
              </button>
            </div>
          </div>
          <p class="small"><em>The goal is a formula that is assessed for logical consequence from
           the theory and the contextual assumptions above.</em></p>

          <alert v-on:dismiss="execResponse = {};" :variant="execResponse.type" v-show="execResponse.show" :timeout="execResponse.timeout"><span v-html="execResponse.message"></span></alert>

          <div style="border: 1px solid black; padding: 1em; font-family: monospace; font-size: large;">
            <textarea-update placeholder="Enter goal" v-bind:edit="editGoal" v-model="query.goal"></textarea-update>
          </div>
        </div>

          <p>&nbsp;</p>
        </main>

      </div>
    </div>
  `,
  created: function () {
    nai.log('Created', '[Query]')
    var self = this;
    var queryId = this.$route.params.id
    if (!!queryId) {
      nai.getQuery(queryId, function(resp) {
        nai.log('Data retrieved', '[Query]');
        nai.log(resp.data, '[Query]');
        self.query = resp.data.data;
        self.lastSavedQuery = _.cloneDeep(self.query)
        if (!!self.query.theory) {
          console.log('theory set');
          self.chosenTheory = self.query.theory._id;
        } else {
          console.log('theory not set')
          self.query.theory = '';
        }
        // if theory was freshly created, edit=true is set as GET parameter
        // so enable edit mode for all contents
        if (self.$route.query.edit) {
          self.doEditTitle();
          self.doEditAssumptions();
          self.doEditGoal();
        }
        self.loadedQuery = true;
      }, nai.handleResponse())

      nai.getTheories(function(resp) {
        nai.log('Theory Data retrieved', '[Query]');
        nai.log(resp.data, '[Query]');
        self.theories = resp.data.data;
        self.loadedTheories = true;
      }, function(error) {
        nai.log(error, '[Query]')
      });
    } else {
      // This should not happen
      nai.log('No id given, aborting.', '[Query]');
    }

    unloadHandler = function(event) {
      if (!_.isEqual(self.query, self.lastSavedQuery)) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    window.addEventListener("beforeunload", unloadHandler);
    nai.log('Unload handler created', '[Query]')
  }
}

