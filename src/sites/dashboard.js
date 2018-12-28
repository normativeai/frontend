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
    onTheoryDelete: function(theory) {
      
      nai.deleteTheory(theory, this.onTheoryDeleteSuccess(theory), this.onTheoryDeleteError)
    },
    onTheoryDeleteSuccess: function(theory) {
      var self = this
      return function(resp) {
        // reflect update locally
        self.theories.splice(self.theories.indexOf(theory),1)
        console.log('Theory ' + theory.name + ' deleted');
      }
    },
    onTheoryDeleteError: function(error) {
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
                <button class="btn btn-sm btn-outline-primary">
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
    ////feather.replace();
    
    this.$on('delete-theory', this.onTheoryDelete);
    
    
    console.log('dashboard mounted')
    var self = this;
    /*nai.$http.get('/users').then(function(resp) {console.log(resp.data)}).catch(
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
    );*/
    
    nai.$http.get('/theories').then(function(resp) {
      console.log("theories loaded");
      self.theories = resp.data;
      self.theoriesLoaded = true;
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
  }
}
