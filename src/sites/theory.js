const theory = {
  data: function() {
    return {
      theory: null,
      loaded: false,
      editVoc: false,
      editFacts: false,
      theoryRest: {"content":"Content","vocabulary":[{"_id":"5c287fad512c9c3eaa4d25c2","symbol":"D","original":"Delivery"},{"_id":"5c287fad512c9c3eaa4d25c1","symbol":"I","original":"Insurance"}],"formalization":[{"_id":"5c287fad512c9c3eaa4d25c3","original":"Delivery means you should make Insurance","formula":"D => I"}]}
    }
  },
  methods: {
    back: function() {
      router.push('/dashboard')
    },
    /* vocabulary stuff */
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
    doneLoading: function() {
      this.loaded = true
      this.$nextTick(function () {
        feather.replace();
      })
    }
  },
  computed: {
    theoryName: function() {
      return this.theory.name
    },
    theoryId: function() {
      return this.theory._id
    },
    theoryDesc: function() {
      return this.theory.description
    },
    theoryContent: function() {
      return this.theoryRest.content
    },
    theoryVoc: function() {
      return this.theoryRest.vocabulary
    },
    theoryFormalization: function() {
      return this.theoryRest.formalization
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
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h1">{{ theoryName }}</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-secondary">
                <span data-feather="save"></span>
                Save</button>
                <button class="btn btn-sm btn-outline-secondary">
                <span data-feather="download"></span>
                Export</button>
              </div>
              <button class="btn btn-sm btn-outline-primary">
                <span data-feather="play"></span>
                Run all
              </button>
            </div>
          </div>
          <p>
          <em>{{ theoryDesc }}</em>
          </p>
          
          <a name="vocabulary" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3">
            <h2>Vocabulary</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
              <button class="btn btn-sm btn-outline-primary">
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
          <p>Defining the vocabulary explicitly is not strictly necessary, however strongly advised.
          It helps keeping an overview of the used symbols and their intended meaning for the
          fact base and queries. The contents of this table do not alter the formalization; they
          are used for extended GUI features.</p>
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
                  <td><textarea-update placeholder="Enter description" v-bind:edit="editVoc" v-model="item.original"></textarea-update></td>
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
                <button class="btn btn-sm btn-outline-primary">
                  <span data-feather="plus"></span>
                  Add fact
                </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary">
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
    }
  }
}
