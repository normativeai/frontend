const query = {
  data: function() {
    return {
      query: null,
      lastSavedQuery: null,
      theories: null,
      //chosenTheory: null,
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

      annotationColors: ['#5C97BF','#00AA55','#F64747','#B381B3','#1BA39C','#FF00FF',
                         '#D252B2','#D46A43','#00A4A6','#D4533B','#939393','#AA8F00',
                         '#D47500','#E26A6A','#009FD4','#5D995D'],
      lastAnnotationColor: -1,
      connectives: null,
      activeTab: 0,

      showLargeNav: false
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
      let updatedTheory = (!!this.query.theory) ? this.query.theory : undefined;
      var updatedQuery = {
        _id: this.queryId,
        name: this.queryName,
        theory: updatedTheory,
        description: this.queryDesc,
        content: this.queryContent,
        assumptions: this.queryAssumptions,
        goal: this.query.goal
      }
      // Show save-in-progress icon
      this.saving = true;
      // Call API
      nai.saveQuery(updatedQuery, function(resp) {
        self.saveResponse = {show: true, type: 'success', message: 'Query successfully saved', timeout: 3000};
        nai.getQuery(self.queryId, function(resp) {
          nai.log('Save-get retrieved', '[Query]');
          self.query = resp.data.data;
          self.saving = false;
          self.lastSavedQuery = _.cloneDeep(self.query)
          nai.log('Update successful, response: ', '[Query]')
        }, function(error) {
          nai.log('save-get error', '[Query]'); // not too bad, just ignore
          self.saving = false;
          self.lastSavedQuery = _.cloneDeep(self.query)
          nai.log('Update successful, response: ', '[Query]')
        });
        if (!!onSuccess && onSuccess) { onSuccess() }
      }, function(error) {
        self.saveResponse = {show: true, type: 'warning', message: 'Query not saved, an error occurred: ' + error.response.data.error};
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
      if (!!this.query.theory) {
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
        nai.log('Legislation not chosen, query not possible', '[Query]');
        self.execResponse = {show: true, type: 'warning', message: 'Cannot execute query, please select legislation first.', timeout: 3000};
      }
    },
    exportQuery: function() {
      var self = this;
      if (!!this.query.theory) {
        self.execResponse = {show: false, type: '', message: '', timeout: 0};

        nai.exportQuery(this.queryId, function(resp) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resp.data.data));
		element.setAttribute('download', 'LEG+1.p');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	})
      } else {
        nai.log('Legislation not chosen, export not possible', '[Query]');
        self.execResponse = {show: true, type: 'warning', message: 'Cannot execute query, please select legislation first.', timeout: 3000};
      }
    },

    runQuery0: function() {
      var self = this;
      this.execRunning = true;
        nai.runQuery(this.queryId, function(resp) {
          if (!!resp.data) {
          let data = resp.data;
          let timeout = undefined;
          if (data.type == 'success') { timeout = 3000 }
          self.execResponse = {show: true, type: data.type, message: data.message, timeout: timeout};
        } else {
          self.execResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + resp};
        }
        self.execRunning = false
        }, function(error) {
          if (!!error.response.data) {
          let msg = error.response.data.error
          self.consistencyResponse = {show: true, type: 'danger', message: msg.replace(/\n/g,'<br>')};
        } else {
          self.execResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + resp};
        }
        self.execRunning = false
        });
    },
    runConsistencyCheck: function() {
      var self = this;
      this.consistencyCheckRunning = true;
      nai.checkQueryConsistency(this.queryId, function(resp) {
        if (!!resp.data) {
          let data = resp.data;
          let timeout = undefined;
          if (data.type == 'success') { timeout = 3000 }
          self.consistencyResponse = {show: true, type: data.type, message: data.message, timeout: timeout};
        } else {
          self.consistencyResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + resp};
        }
        self.consistencyCheckRunning = false
      }, function(error) {
        if (!!error.response.data) {
          let msg = error.response.data.error
          self.consistencyResponse = {show: true, type: 'danger', message: msg.replace(/\n/g,'<br>')};
        } else {
          self.consistencyResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + resp};
        }
        self.consistencyCheckRunning = false
      })
    },
    onAnnotate: function(origin, info, depth) {
      let original = origin.original;
      if (!!info.term) {
        // term annotation
        let term = info.term;

        let idx = _.findIndex(this.queryAutoVocabulary.concat(this.theoryVoc), function(voc) {
            return (voc.full == term);
         });
        if (idx < 0) {
          this.insertTermStyle(term);
          this.queryAutoVocabulary.push({original: original, full: term});
        }
        if (depth == 1) {
          // Also add as formula
          this.queryAutoAssumptions.push({original: original, formula: term})
        }
      } else {
        // connective annotation
        //if (depth != 1) return;
        //this.theoryAutoFormalization.push({original: original, formula: ''})
      }
    },
    insertTermStyle: function(term) {
      let color = this.nextAnnotationColor();
      this.auxStyles.insertRule('.annotator-term[data-term="'+ term +'"] { background-color: ' + color + '; }');
    },
    nextAnnotationColor: function() {
      this.lastAnnotationColor = (this.lastAnnotationColor + 1) % this.annotationColors.length;
      return this.annotationColors[this.lastAnnotationColor];
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
    queryTheoryId: function() {
      return this.query.theory._id;
    },
    queryLastUpdate: function() {
      return new Date(this.query.lastUpdate);
    },
    queryDesc: function() {
      return this.query.description
    },
    queryContent: function() {
      return this.query.content
    },
    queryAutoVocabulary: function() {
      return this.query.autoVocabulary;
    },
    queryEffectiveQueryVoc: function() {
      let qvoc = this.query.autoVocabulary;
      if (!!this.query.theory.autoVocabulary) {
        let tvoc = this.query.theory.autoVocabulary;
        return _.differenceBy(qvoc,tvoc, 'full')
      } else {
        return qvoc
      }
    },
    queryAutoAssumptions: function() {
      return this.query.autoAssumptions
    },
    queryAssumptions: function() {
      return this.query.assumptions
    },
    queryAutoGoal: function() {
      return this.query.autoGoal
    },
    queryGoal: function() {
      return this.query.goal
    },
    theoryVoc: function() {
      if (!!this.query.theory.autoVocabulary) {
        return this.query.theory.autoVocabulary.concat(this.query.theory.vocabulary)
      } else return [];
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
    },
    auxStyles: function() {
      return document.getElementById('additionalStyles').sheet;
    }
  },
  template: `
    <div class="container-fluid">
      <div class="row">
        <sidebar v-on:go-back="back" v-on:show-large-nav="showLargeNav=!showLargeNav">
          <template v-slot:smallNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 0">
                <feather-icon icon="book"></feather-icon>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 1">
                <feather-icon icon="zap"></feather-icon>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 2">
                <feather-icon icon="clipboard"></feather-icon>
              </a>
            </li>
          </template>

          <template v-slot:largeNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 0">
                <feather-icon icon="book"></feather-icon>
                Query editor
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 1">
                <feather-icon icon="zap"></feather-icon>
                Formalization
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 2">
                <feather-icon icon="clipboard"></feather-icon>
                Vocabulary
              </a>
            </li>
          </template>
        </sidebar>
        <main role="main" class="theory-query-main col-10" :class="{'show-large-nav' : showLargeNav}">
          <div v-if="!loaded">
            <h1>Loading query ...</h1>
            <loading-bar v-if="!loaded"></loading-bar>
          </div>
          <div v-if="loaded">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-0 mb-0">
            <input-update class="h1 mb-0" placeholder="Enter title" v-bind:edit="editTitle" v-model="query.name"></input-update>

            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <select class="form-control" v-model="query.theory._id">
                  <option disabled value=''>Choose legislation</option>
                  <option v-for="t in theories" v-bind:key="t._id" v-bind:value="t._id">{{ t.name }}</option>
                </select>
              </div>
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="saveQuery();" :disabled="saving">
                  <template v-if="!saving">
                    <feather-icon icon="save"></feather-icon>
                    Save
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>

                <button class="btn btn-sm btn-outline-primary"
                  v-on:click="exportQuery"
                  title="Export to QMLTP format">
		  <feather-icon icon="download"></feather-icon>
		  Export
                </button>

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
          <alert v-on:dismiss="saveResponse.show = false;saveResponse.timeout = null" :variant="saveResponse.type" v-show="saveResponse.show" :timeout="saveResponse.timeout" style="position:absolute; top:150px; right:100px">{{ saveResponse.message }}</alert>

          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a :class="{'nav-link': true, 'active': activeTab == 0}" href="#" @click="activeTab = 0;">Annotation</a>
            </li>
           <li class="nav-item">
              <a :class="{'nav-link': true, 'active': activeTab == 1}" href="#" @click="activeTab = 1;">Formalization</a>
            </li>
            <li class="nav-item">
              <a :class="{'nav-link': true, 'active': activeTab == 2}" href="#" @click="activeTab = 2;">Vocabulary</a>
            </li>
            <li class="nav-item">
              <a :class="{'nav-link': true, 'active': activeTab == 3}" href="#" @click="activeTab = 3;">Advanced formalization</a>
            </li>
          </ul>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 0">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-1">
              <h4>Query Editor</h4>
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-secondary float-right"
                  v-on:click="runConsistencyCheck" :disabled="consistencyCheckRunning"
                  title="Save query and run consistency check.">
                  <template v-if="!consistencyCheckRunning">
                    <feather-icon icon="play"></feather-icon>
                    Run consistency check
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
                </div>
                <button class="btn btn-sm btn-outline-primary"
                  v-on:click="runQuery" :disabled="execRunning"
                  title="Save query and run it.">
                  <template v-if="!execRunning">
                    <feather-icon icon="play"></feather-icon>
                    Execute query
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
              </div>
            </div>
            <alert v-on:dismiss="consistencyResponse.show = false;consistencyResponse.timeout = null" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
            <alert v-on:dismiss="execResponse.show = false;execResponse.timeout = null" :variant="execResponse.type" v-show="execResponse.show" :timeout="execResponse.timeout"><span v-html="execResponse.message"></span></alert>
            <quill ref="annotator" v-model="query.content" spellcheck="false" v-bind:terms="theoryVoc" v-bind:connectives="connectives" v-bind:allowTermCreation="true" v-bind:goal="true"></quill>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 1">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
              <h4>Logical representation (Formalization)</h4>
              <img v-if="consistencyCheckRunning" src="/img/loading.gif">
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-secondary float-right"
                  v-on:click="runConsistencyCheck" :disabled="consistencyCheckRunning"
                  title="Save query and run consistency check.">
                  <template v-if="!consistencyCheckRunning">
                    <feather-icon icon="play"></feather-icon>
                    Run consistency check
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
                </div>
                <button class="btn btn-sm btn-outline-primary"
                  v-on:click="runQuery" :disabled="execRunning"
                  title="Save query and run it.">
                  <template v-if="!execRunning">
                    <feather-icon icon="play"></feather-icon>
                    Execute query
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
              </div>
            </div>
            <p class="small"><em>A consistency check should be conducted prior to executing the query.</em></p>

            <alert v-on:dismiss="consistencyResponse.show = false;consistencyResponse.timeout = null" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
            <alert v-on:dismiss="execResponse.show = false;execResponse.timeout = null" :variant="execResponse.type" v-show="execResponse.show" :timeout="execResponse.timeout"><span v-html="execResponse.message"></span></alert>
            <h5>Assumptions</h5>
            <p class="small"><em>Assumptions are contextual information that apply to a certain
              situation only. This information is generated automatically from the annotations
              and cannot be edited directly.</em></p>
            <div class="table-responsive">
              <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
                <thead>
                  <tr>
                    <th style="width:2em;text-align:center;vertical-align:center;border-right:1px solid black">#</th>
                    <th style="width:50%">Description</th>
                    <th style="width:50%">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in queryAutoAssumptions" :key="item._id">
                    <td style="text-align:center; border-right:1px solid black">
                      {{ index + 1 }}
                    </td>
                    <td style="border-right:1px solid black">
                      <em>{{ item.original }}</em>
                    </td>
                    <td><code>{{ item.formula }}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h5>Goal</h5>
            <p class="small"><em>The goal is a formula that is assessed for logical consequence from
             the legislation and the contextual assumptions above.</em></p>
            <div style="border: 1px solid black; padding: 1em; font-family: monospace; font-size: large;">
              {{ queryAutoGoal.formula }}
            </div>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 2">
            <h4>Vocabulary</h4>
            <p class="small"><em>The vocabulary consists of all symbols that are used by the
              normalized representation. This information is generated automatically from
              the annotations of the underlying legislation and the annotation of the query,
              and cannot be edited directly.</em></p>
            <div class="">
              <h5>Legislation Vocabulary</h5>
              <table class="table table-striped table-sm" style="table-layout:fixed;width:100%">
                <thead>
                  <tr>
                    <th style="width:20%">Symbol</th>
                    <th style="width:80%">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="theoryVoc.length == 0"><td colspan="2" style="text-align:center"><em>No vocabulary</em></td></tr>
                  <tr v-for="(item, index) in theoryVoc" :key="item._id">
                    <td><code>{{ item.full }}</code></td>
                    <td><em>{{ item.original }}</em></td>
                  </tr>
                </tbody>
              </table>
              <h5>Query Vocabulary</h5>
              <table class="table table-striped table-sm" style="table-layout:fixed;width:100%">
                <thead>
                  <tr>
                    <th style="width:20%">Symbol</th>
                    <th style="width:80%">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="queryEffectiveQueryVoc.length == 0"><td colspan="2" style="text-align:center"><em>No vocabulary</em></td></tr>
                  <tr v-for="(item, index) in queryEffectiveQueryVoc" :key="item._id">
                    <td><code>{{ item.full }}</code></td>
                    <td><em>{{ item.original }}</em></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 3">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
              <h4>Advanced Settings</h4>
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                  <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToAssumptions">
                    <feather-icon icon="plus"></feather-icon>
                    Add assumption
                  </button>
                </div>
                <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditAssumptions" v-bind:class="{active : editAssumptions}" v-bind:aria-pressed="editAssumptions">
                <feather-icon icon="edit"></feather-icon>
                Toggle edit
                </button>
              </div>
            </div>
            <h5>Additional manual assumptions</h5>
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
            <h5>Manual goal</h5>
            <p class="small">
            Inputting a manual goal is optional. It will be overriden if there is any goal set using
            the annotator.
            </p>
            <div style="border: 1px solid black; padding: 1em; font-family: monospace; font-size: large;">
            <input-update v-model="query.goal" placeholder="No manual goal set" v-bind:edit="editAssumptions"></input-update>
            </div>
          </div>



          <p>&nbsp;</p>
        </div>
        </main>

      </div>
    </div>
  `,
  mounted: function() {
    this.$on('theory-annotate', this.onAnnotate);
  },
  created: function () {
    nai.log('Created', '[Query]')
    var self = this;
    var queryId = this.$route.params.id
    if (!!queryId) {
      nai.getQuery(queryId, function(resp) {
        nai.log('Data retrieved', '[Query]');
        nai.log(resp.data, '[Query]');
        self.query = resp.data.data;
        if (!!!self.query.theory) {
          self.query.theory = {'_id': ''};
        } else {
          //register all colors for already available vocabulary
          _.uniqBy(self.query.autoVocabulary, 'full').forEach(function(voc) {
           let term = voc.full;
           self.insertTermStyle(term);
        });
        }
        self.lastSavedQuery = _.cloneDeep(self.query)
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

        // get connetives for annotator
        nai.getConnectives(function(resp) {
          let connectives = resp.data.data;
          self.connectives = connectives
        }, nai.handleResponse());

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
