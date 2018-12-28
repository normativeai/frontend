const theory = {
  data: function() {
    return {
      theory: null,
      loaded: false
    }
  },
  methods: {
  },
  computed: {
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
          <h1>Theory {{ $route.params.id }}</h1>
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
          
          <loading-bar v-if="!loaded"></loading-bar>
          <div v-if="loaded">
            {{ theory.name }}
          </div>
          
          <p>&nbsp;</p>
        </main>
        
      </div>
    </div>
  `,
  created: function () {    
    console.log('theory view created')
    var self = this;
    var theoryId = this.$route.params.id
    if (!!theoryId) {
      nai.$http.get('/theories/' + theoryId).then(function(resp) {
        console.log("theory retrieved");
        self.theory = resp.data;
        self.loaded = true;
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
