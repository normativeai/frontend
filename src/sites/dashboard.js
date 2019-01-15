const dashboard = {
  data: function() {
    return {
      theories: [],
      theoriesLoaded: false,
      queries: [],
      queriesLoaded: false
    }
  },
  methods: {
    createTheory: function() {
      nai.createFreshTheory(this.onTheoryCreateSuccess, this.onTheoryCreateFail);
    },
    onTheoryCreateSuccess: function(resp) {
      nai.log('Theory created', '[App]');
      nai.log(resp, '[App]');
      if (!!resp.data) {
        var id = resp.data._id;
        router.push({ path: '/theory/'+id, query: { edit: true } })
      } else {
        // error handling, unexpected return
        nai.log('theory creation failed', '[App]')
      }
    },
    onTheoryCreateFail: function(error) {
      console.log(error)
    },
    onTheoryDelete: function(theory) {    
      nai.deleteTheory(theory, this.onTheoryDeleteSuccess(theory), this.onTheoryDeleteError)
    },
    onTheoryDeleteSuccess: function(theory) {
      var self = this
      return function(resp) {
        // reflect update locally
        self.theories.splice(self.theories.indexOf(theory),1)
        nai.log('Theory ' + theory.name + ' deleted', '[App]');
      }
    },
    onTheoryDeleteError: function(error) {
      nai.handleResponse()(error)
    }
  },
  computed: {
    theoryRows: function() {
      return Math.ceil(this.theories.length / 3);
    }
  },
  template: `
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
          <div class="sidebar-sticky">
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted">
              <span>Dashboard</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link" href="#legislatures">
                  <span data-feather="book"></span>
                  Legislatures
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#queries">
                  <span data-feather="cpu"></span>
                  Queries
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
          <h1>Dashboard</h1>
          <hr>
          
          <a name="legislatures" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-4">
            <h3>Legislatures</h3>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary" v-on:click="createTheory">
                  <span data-feather="plus"></span>
                  Create new
                </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary float-right">
                <span data-feather="copy"></span>
                Import
              </button>
            </div>
          </div>
          
          <loading-bar v-if="!theoriesLoaded"></loading-bar>
          <div v-if="theoriesLoaded">
            <p v-if="theories.length == 0"><em>No legislatures formalized yet. Click on "create new" above,
            to create a new formalization or import a publicly available one.</em></p>
            <div class="row" v-for="i in theoryRows" style="margin-bottom: 2em">
              <div class="col-sm-4" v-for="t in theories.slice((i-1) * 3, i * 3)">
                <theory-card v-bind:theory="t" :key="t._id"></theory-card>
              </div>
            </div>
          </div>
          
          <hr>
          <a name="queries" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
            <h3>Queries</h3>
            <div class="btn-toolbar mb-2 mb-md-0">
              <div class="btn-group mr-2">
                <button class="btn btn-sm btn-outline-primary">
                  <span data-feather="plus"></span>
                  Create new
                </button>
              </div>
              <button class="btn btn-sm btn-outline-secondary">
              <span data-feather="trash"></span>
              Remove
              </button>
              <button class="btn btn-sm btn-outline-secondary float-right">
                <span data-feather="copy"></span>
                Import
              </button>
            </div>
          </div>
          <p>None yet</p>
          
          <p>&nbsp;</p>
        </main>
        
      </div>
    </div>
  `,
  created: function () {
    this.$on('delete-theory', this.onTheoryDelete);
    nai.log('Dashboard mounted', '[App]')
    var self = this;
    nai.initDashboard(function(resp) {
      nai.log('User infos loaded', '[App]');
      nai.log(resp.data, '[App]')
      if (!!resp.data.user) {
        if (!!resp.data.user.theories) {
          self.theories = resp.data.user.theories;
          self.theoriesLoaded = true;
        } else {
          nai.log('could not retrieve theory data', '[App]')
          // error handling
        }
      } else {
        nai.log('could not retrieve user data', '[App]')
      }
    }, nai.handleResponse())
  }
}
