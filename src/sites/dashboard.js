const dashboard = {
  data: function() {
    return {
      current: null,
      examples: [],
    }
  },
  methods: {
    getExamples: function() {
      console.log('getExamples');
      if (!this.loggedIn) return;
      var apicall = API + 'getExamples';
      var postdata = {auth: this.user.auth};
      console.log('POST ' + apicall + " " + JSON.stringify(postdata));
      var response = [ex1, ex2]; /* later from backend call */
      console.log('Response: ' + JSON.stringify(response));
      this.examples = response; 
    },
  
    setCurrentEx: function(example) {
      this.current = example;
    },
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
                <a class="nav-link">
                  <span data-feather="book"></span>
                  Legislatures
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link">
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
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
            <h3>Legislatures</h3>
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
          
          <div class="row">
            <div class="col-sm-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Theory 1</h5>
                  <h6 class="card-subtitle mb-2 text-muted">Some Subtitle</h6>
                  <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  <a href="#" class="card-link">Open and edit</a>
                </div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Theory 2</h5>
                  <h6 class="card-subtitle mb-2 text-muted">Some Subtitle</h6>
                  <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  <a href="#" class="card-link">Open and edit</a>
                </div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Theory 3</h5>
                  <h6 class="card-subtitle mb-2 text-muted">Some Subtitle</h6>
                  <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  <a href="#" class="card-link">Open and edit</a>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Theory 4</h5>
                  <h6 class="card-subtitle mb-2 text-muted">Some Subtitle</h6>
                  <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  <a href="#" class="card-link">Open and edit</a>
                </div>
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
  mounted: function () {
    feather.replace();
  }
}
