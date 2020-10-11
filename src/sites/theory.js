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

      independenceCheckRunning: false,
      independenceResponse: {show: false, type: '', message: '', timeout: 0},

      annotationColors: ['#5C97BF','#00AA55','#F64747','#B381B3','#1BA39C','#FF00FF',
                         '#D252B2','#D46A43','#00A4A6','#D4533B','#939393','#AA8F00',
                         '#D47500','#E26A6A','#009FD4','#5D995D'],
      lastAnnotationColor: -1,
      connectives: null,
      activeTab: 0,

      showSidePanelComponent: false,
      showLargeNav: false,
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
    toggleSidePanelComponent: function() {
      this.showSidePanelComponent = !this.showSidePanelComponent;
    },
    doneLoading: function() {
      this.loaded = true
    },
    saveTheory: function(onSuccess, onError) {
      var self = this;
      var updatedTheory = {
        _id: this.theoryId,
        name: this.theoryName,
        description: this.theoryDesc,
        content: this.theoryContent,
        comment: this.theoryComment,
        vocabulary: this.theoryVoc,
        formalization: this.theoryFormalization
      }
      // Show save-in-progress icon
      this.saving = true;
      // Call API
      //nai.log('is saved equal to before updated? ' + _.isEqual(self.lastSavedTheory, self.theory))
      nai.saveTheory(updatedTheory, function(resp) {
        self.saveResponse = {show: true, type: 'success', message: 'Theory successfully saved', timeout: 3000};
        nai.getTheory(self.theoryId, function(resp) {
          nai.log('Save-get retrieved', '[Theory]');
          self.theory = resp.data.data;
          self.saving = false;
          self.lastSavedTheory = _.cloneDeep(self.theory)
          nai.log('Update successful', '[Theory]')
        }, function(error) {
          nai.log('save-get error', '[Theory]'); // not too bad, just ignore
          self.saving = false;
          self.lastSavedTheory = _.cloneDeep(self.theory)
          nai.log('Update successful', '[Theory]')
        });
        if (!!onSuccess) { onSuccess() } // Run passed callback if existent
      }, function(error) {
        if (!!error.response && !!error.response.data.error) {
          self.saveResponse = {show: true, type: 'danger', message: 'Theory not saved: ' + error.response.data.error};
        } else {
          self.saveResponse = {show: true, type: 'danger', message: 'Theory not saved, an error occurred: ' + error};
        }
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
      // remove from fact list
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
          self.consistencyResponse = {show: true, type: 'danger', message: '<b>Unexpected error</b>: ' + error};
        }
        self.consistencyCheckRunning = false
      })
    },
    runIndependenceCheck: function(item) {
      var self = this;
      // Hide previous response if still showing
      self.independenceCheckResponse = {show: false, type: '', message: '', timeout: 0};
      // check if we need to save the theory first
      if (!_.isEqual(this.theory, this.lastSavedTheory)) {
        // latest version not saved to backend, so update first
        this.saveTheory(function() {
            self.runIndependenceCheck0(item);
          },
          function() {
            var msg = 'Consistency check cannot be conducted because there was an error during saving.';
            self.independenceCheckResponse = {show: true, type: 'danger', message: msg};
          }
        );
      } else {
        // no local changes, so run consistency check
        this.runIndependenceCheck0(item);
      }
    },
    runIndependenceCheck0: function(item) {
      var self = this
      this.independenceCheckRunning = true
      nai.checkIndependence(this.theoryId, item._id,  function(resp) {
        if (!!resp.data) {
          let data = resp.data;
          let timeout = undefined;
          if (data.type == 'success') { timeout = 3000 }
          self.independenceResponse = {show: true, type: data.type, message: data.message, timeout: timeout};
        } else {
          self.independenceResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + resp};
        }
        self.independenceCheckRunning = false
      }, function(error) {
        if (!!error.response.data) {
          let msg = error.response.data.error
          self.consistencyResponse = {show: true, type: 'danger', message: msg.replace(/\n/g,'<br>')};
        } else {
          self.independenceResponse = {show: true, type: 'warning', message: '<b>Unexpected reponse</b>: ' + error};
        }
        self.independenceCheckRunning = false
      })
    },
    onAnnotate: function(origin, info, depth) {
      let original = origin.original;
      if (!!info.term) {
        // term annotation
        let term = info.term;

        let idx = _.findIndex(this.theoryAutoVoc, function(voc) {
            return (voc.symbol == term);
         });
        if (idx < 0) {
          this.insertTermStyle(term);
          this.theoryAutoVoc.push({original: original, full: term});
        }
        if (depth == 1) {
          // Also add as formula
          this.theoryAutoFormalization.push({original: original, formula: term})
        }
      } else {
        // connective annotation
        if (depth != 1) return;
        this.theoryAutoFormalization.push({original: original, formula: ''})
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
    /*registerAnnotator: function() {
      var self = this;
      // debug test
      this.$refs.annotator.get.on('selection-change', function(range, oldRange, source) {
      if (range) {
        if (range.length == 0) {
          document.getElementById('debug').innerHTML = 'click (index: '+ range.index +')'
        } else {
          var text = self.$refs.annotator.get.getText(range.index, range.length);
          //document.getElementById('debug').innerHTML = text;
          document.getElementById('debug').innerHTML = text + ' (index: '+range.index+', length: '+range.length+')';
        }
      }
    });
    // debug test end
    }
    */
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
    theoryComment: function() {
      return this.theory.comment
    },
    theoryVoc: function() {
      return this.theory.vocabulary
    },
    theoryAutoVoc: function() {
      return this.theory.autoVocabulary
    },
    theoryFormalization: function() {
      return this.theory.formalization
    },
    theoryAutoFormalization: function() {
      return this.theory.autoFormalization
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
    },
    auxStyles: function() {
      return document.getElementById('additionalStyles').sheet;
    }
  },
  template: `
    <div class="d-flex" style="padding-right: 0px;">
      <div class="split-left mr-auto ml-auto">

        <sidebar page="theory" v-on:go-back="back" v-on:show-large-nav="showLargeNav=!showLargeNav">
          <template v-slot:smallNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 0" title="Legislation">
                <feather-icon icon="book"></feather-icon>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 1" title="Formalization">
                <feather-icon icon="zap"></feather-icon>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 2" title="Vocabulary">
                <feather-icon icon="clipboard"></feather-icon>
              </a>
            </li>
          </template>
          <template v-slot:largeNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="activeTab = 0">
                <feather-icon icon="book"></feather-icon>
                Legislation
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

        <main role="main" key="main" class="theory-query-main col-10" :class="{'show-large-nav' : showLargeNav}">
          <div v-if="!loaded">
            <h1>Loading theory ...</h1>
            <loading-bar v-if="!loaded"></loading-bar>
          </div>
          <div v-if="loaded">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-0 mb-0">
            <input-update class="h1 mb-0" placeholder="Enter title" v-bind:edit="editTitle" v-model="theory.name"></input-update>

            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="saveTheory();" :disabled="saving">
                  <template v-if="!saving">
                    <feather-icon icon="save"></feather-icon>
                    Save
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
                <button class="btn btn-sm btn-outline-primary" disabled>
                <feather-icon icon="download"></feather-icon>
                Export</button>
              </div>
              <button class="btn btn-sm btn-outline-secondary mr-2 mt-1" v-on:click="toggleEditTitle" v-bind:class="{active : editTitle}" v-bind:aria-pressed="editTitle">
                <feather-icon icon="edit"></feather-icon>
                Edit title/description
              </button>
            </div>
          </div>
          <p style="margin:0" class="small border-bottom pb-0 mb-1"><em>Last updated: {{ theoryLastUpdate.toLocaleString() }}</em></p>
          <p>
          <textarea-update placeholder="Enter description of theory" v-bind:edit="editTitle" v-model="theory.description"></textarea-update>
          </p>
          <alert v-on:dismiss="saveResponse.show = false;saveResponse.timeout = null" :variant="saveResponse.type" v-show="saveResponse.show" :timeout="saveResponse.timeout" style="position:absolute; top:150px; right:150px">{{ saveResponse.message }}</alert>

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
              <a :class="{'nav-link': true, 'active': activeTab == 3}" href="#" @click="activeTab = 3;">Advanced</a>
            </li>
          </ul>
          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 0">
            <a name="original" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-2">
              <h4>Legislation Editor</h4>
              <img v-if="independenceCheckRunning" src="/img/loading.gif">
              <div class="btn-toolbar mb-2 mb-md-0">
                <button class="btn btn-sm btn-outline-secondary float-right"
                  v-on:click="runConsistencyCheck" :disabled="consistencyCheckRunning"
                  title="Save theory and run consistency check.">
                  <template v-if="!consistencyCheckRunning">
                    <feather-icon icon="play"></feather-icon>
                    Run consistency check
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
              </div>
            </div>
            <alert v-on:dismiss="consistencyResponse.show = false;consistencyResponse.timeout = null" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
            <quill ref="annotator" v-model="theory.content" spellcheck="false" v-bind:terms="theoryAutoVoc.concat(theoryVoc)" v-bind:connectives="connectives"></quill>
            <div id="debug" class="force-quill-size" ></div>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 1">
             <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
              <h4>Logical representation (Formalization)</h4>
              <img v-if="independenceCheckRunning" src="/img/loading.gif">
              <div class="btn-toolbar mb-2 mb-md-0">
                <button class="btn btn-sm btn-outline-secondary float-right"
                  v-on:click="runConsistencyCheck" :disabled="consistencyCheckRunning"
                  title="Save theory and run consistency check.">
                  <template v-if="!consistencyCheckRunning">
                    <feather-icon icon="play"></feather-icon>
                    Run consistency check
                  </template>
                  <template v-else>
                    <bs-spinner type="primary"></bs-spinner>
                  </template>
                </button>
              </div>
            </div>
            <p class="small"><em>A consistency check should be conducted prior to executing any further queries based
             on this formalization.</em></p>

            <alert v-on:dismiss="consistencyResponse.show = false;consistencyResponse.timeout = null" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
            <alert v-on:dismiss="independenceResponse.show = false;independenceResponse.timeout = null" :variant="independenceResponse.type" v-show="independenceResponse.show" :timeout="independenceResponse.timeout"><span v-html="independenceResponse.message"></span></alert>

            <div class="table-responsive">
              <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
                <thead>
                  <tr>
                    <th style="width:2em;text-align:center;vertical-align:center;border-right:1px solid black">#</th>
                    <th style="width:50%">Description</th>
                    <th style="width:50%">Formula</th>
                    <th style="width:5em; text-align: center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in theoryAutoFormalization" :key="item._id">
                    <td style="text-align:center; border-right:1px solid black">
                      {{ index + 1 }}
                    </td>
                    <td style="border-right:1px solid black">
                      <em>{{ item.original }}</em>
                    </td>
                    <td v-if="item.cnl"><code>{{ item.cnl }}</code></td>
                    <td v-else><em>Save theory to update formalization</em></td>
                    <td class="table-secondary" style="text-align: center">
                      <button title="Check for logical independence" type="button" class="btn btn-sm btn-secondary" v-on:click="runIndependenceCheck(item)" :disabled="independenceCheckRunning"><feather-icon icon="activity"></feather-icon></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 2">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
            <h4>Vocabulary</h4>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
              <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToVoc">
              <feather-icon icon="plus"></feather-icon>
              Add entry
              </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditVoc" v-bind:class="{active : editVoc}" v-bind:aria-pressed="editVoc">
              <feather-icon icon="edit"></feather-icon>
              Toggle edit
              </button>
            </div>
            </div>
            <p class="small"><em>The vocabulary consists of all symbols that are used by the
              normalized representation. This information is generated automatically from
              the annotations.</em></p>
            <div class="">
              <table class="table table-striped table-sm" style="table-layout:fixed;width:100%">
                <thead>
                  <tr>
                    <th style="width:30%">Symbol</th>
                    <th style="width:70%">Description</th>
                    <th style="width:5em;text-align: center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in theoryAutoVoc" :key="item._id">
                    <td><code>{{ item.full }}</code></td>
                    <td><em>{{ item.original }}</em></td>
                    <td class="table-secondary" style="text-align: center">
                      <button type="button" class="btn btn-sm btn-danger" disabled title="Cannot delete this entry; it was automatically generated from the systen." style="cursor:not-allowed"><feather-icon icon="x"></feather-icon></button>
                    </td>
                  </tr>
                  <tr v-for="(item, index) in theoryVoc" :key="item._id">
                    <td><code><input-update placeholder="Enter symbol" v-bind:edit="editVoc" v-model="item.symbol"></input-update></code></td>
                    <td><em><textarea-update placeholder="Enter description" v-bind:edit="editVoc" v-model="item.original"></textarea-update></em></td>
                    <td class="table-secondary" style="text-align: center">
                      <button type="button" class="btn btn-sm btn-danger" v-bind:disabled="!editVoc" v-bind:title="vocDelButtonTitle" v-bind:style="vocDelButtonStyle" v-on:click="vocDelButtonClick(index)"><feather-icon icon="x"></feather-icon></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="nav-content" style="padding:1rem .5rem;" v-if="activeTab == 3">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
              <h4>Advanced Settings</h4>
              <img v-if="consistencyCheckRunning" src="/img/loading.gif">
              <img v-if="independenceCheckRunning" src="/img/loading.gif">
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                  <button class="btn btn-sm btn-outline-primary" v-on:click="addLineToFacts">
                    <feather-icon icon="plus"></feather-icon>
                    Add fact
                  </button>
                </div>
                <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleEditFacts" v-bind:class="{active : editFacts}" v-bind:aria-pressed="editFacts">
                <feather-icon icon="edit"></feather-icon>
                Toggle edit
                </button>
                <button class="btn btn-sm btn-outline-secondary float-right" v-on:click="runConsistencyCheck">
                  <feather-icon icon="play"></feather-icon>
                  Run consistency check
                </button>
              </div>
            </div>
            <p class="small"><em>A consistency check should be conducted prior to executing any further queries based
             on this formalization.</em></p>

            <alert v-on:dismiss="consistencyResponse.show = false;" :variant="consistencyResponse.type" v-show="consistencyResponse.show" :timeout="consistencyResponse.timeout"><span v-html="consistencyResponse.message"></span></alert>
            <alert v-on:dismiss="independenceResponse.show = false;" :variant="independenceResponse.type" v-show="independenceResponse.show" :timeout="independenceResponse.timeout"><span v-html="independenceResponse.message"></span></alert>

            <div class="table-responsive">
              <table class="table table-striped table-sm table-hover" style="table-layout:fixed;">
                <thead>
                  <tr>
                    <th style="width:2em;text-align:center;vertical-align:center;border-right:1px solid black"><input type="checkbox" v-on:click="toggleSelectAll" checked="checked" ref="selectAllBox" title="Toggle select all"></th>
                    <th style="width:60%">Description</th>
                    <th style="width:40%">Formula</th>
                    <th style="width:8em; text-align: center">Actions</th>
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
                    <td><code><textarea-update placeholder="Enter formula ..." v-bind:edit="editFacts" v-model="item.formula"></textarea-update></code></td>
                    <td class="table-secondary" style="text-align: center">
                      <button title="Check for logical independence" type="button" class="btn btn-sm btn-secondary" v-on:click="runIndependenceCheck(item)"><feather-icon icon="activity"></feather-icon></button>
                      <button title="Remove fact" type="button" class="btn btn-sm btn-danger" v-on:click="factDelButtonClick(index)" v-bind:disabled="!editFacts" v-bind:title="factDelButtonTitle" v-bind:style="factDelButtonStyle"><feather-icon icon="x"></feather-icon></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

          <p>&nbsp;</p>
        </main>
      </div>
      <span id="toggleSidePanel" class="semi-circle d-none d-sm-flex" :class="{'toggle-side-panel-transform position-sticky' : showSidePanelComponent, 'position-fixed' : !showSidePanelComponent}" v-on:click="toggleSidePanelComponent" title="Open comments panel.">
        <feather-icon class="message-circle-icon" icon="message-square"></feather-icon>
        <div class="bg-light position-absolute" style="height: 38px; width: 2px; background-color:black; right:-2px;"></div>
      </span>
      <keep-alive>
        <side-panel-component v-model="theory.comment" v-if="showSidePanelComponent"></side-panel-component>
      </keep-alive>
    </div>
  `,
  mounted: function() {
    this.$on('theory-annotate', this.onAnnotate);
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
        //register all colors for already available vocabulary
        _.uniqBy(self.theoryAutoVoc, 'full').forEach(function(voc) {
           let term = voc.full;
           self.insertTermStyle(term);
        });
        // get connetives for annotator
        nai.getConnectives(function(resp) {
          let connectives = resp.data.data;
          self.connectives = connectives
          self.doneLoading()
        }, nai.handleResponse());
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
