
const dashboard = {
  data: function() {
    return {
      dashboardLoaded: false,
      theories: [],
      queries: [],
      error: null,
      showModal: false,
      // Sorting
      ascDescT: 'asc',
      orderByT: 'name',
      ascDescQ: 'asc',
      orderByQ: 'name',

      paintSplotchColors: ['#A40E1A', '#DB8144', '#DFC63D', '#76A653', '#3582B8', '#433368'],
      lastSplotchColor: -1,
    }
  },
  methods: {
    ////////////////////////////////////////////////
    // Theory stuff
    createTheory: function() {
      nai.createFreshTheory(this.onTheoryCreateSuccess, this.onTheoryCreateFail);
    },
    onTheoryCreateSuccess: function(resp) {
      nai.log('Theory created', '[App]');
      nai.log(resp, '[App]');
      if (!!resp.data) {
        var id = resp.data.data._id;
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
    },
    onTheoryClone: function(theory) {
      nai.cloneTheory(theory, this.onTheoryCloneSuccess(theory), this.onTheoryCloneError)
    },
    onTheoryCloneSuccess: function(theory) {
      var self = this
      return function(resp) {
        nai.log('Theory created', '[App]');
        nai.log(resp, '[App]');
        if (!!resp.data) {
          var newTheory = {
            name: theory.name + " (Clone)",
            description: theory.description,
            _id: resp.data.data.theory._id,
            lastUpdate: new Date()
          };
          self.theories.push(newTheory);
        } else {
          // error handling, unexpected return
          nai.log('unexpected theory creation response', '[App]')
        }
      }
    },
    onTheoryCloneError: function(error) {
      nai.handleResponse()(error)
    },
    ////////////////////////////////////////////////
    // Query stuff
    createQuery: function() {
      nai.createFreshQuery(this.onQueryCreateSuccess, this.onQueryCreateFail);
    },
    onQueryCreateSuccess: function(resp) {
      nai.log('Query created', '[App]');
      nai.log(resp, '[App]');
      if (!!resp.data) {
        var id = resp.data.data._id;
        router.push({ path: '/query/'+id, query: { edit: true } })
      } else {
        // error handling, unexpected return
        nai.log('query creation failed', '[App]')
      }
    },
    onQueryCreateFail: function(error) {
      nai.log(error, '[App]')
    },
    onQueryDelete: function(query) {
      nai.deleteQuery(query, this.onQueryDeleteSuccess(query), this.onQueryDeleteError)
    },
    onQueryDeleteSuccess: function(query) {
      var self = this
      return function(resp) {
        // reflect update locally
        self.queries.splice(self.queries.indexOf(query),1)
        nai.log('Query ' + query.name + ' deleted', '[App]');
      }
    },
    onQueryDeleteError: function(error) {
      nai.handleResponse()(error)
    },
    /////////////////////
    /////////////////////
    onCloneModalFinish: function() {
      nai.log("modal finish");

      this.showModal = false;
    },
    onCloneModalCancel: function() {
      nai.log("modal cancel");
      this.showModal = false;
    },
    showTheoryCloneWindows: function() {
      //this.showModal = true;
    },
    ///////////////////////////////////
    // Sorting Stuff
    onSort: function(sortEvent, type) {
      if(type === 'theory') {
        this.orderByT = sortEvent[0];
        this.ascDescT = sortEvent[1];
      } else {
        this.orderByQ = sortEvent[0];
        this.ascDescQ = sortEvent[1];
      }
    },
    orderedTheories: function() {
      return _.orderBy(this.theories, this.orderByT, this.ascDescT);
    },
    orderedQueries: function() {
      return _.orderBy(this.queries, this.orderByQ, this.ascDescQ);
    },
    nextSplotchColor: function() {
      this.lastSplotchColor = (this.lastSplotchColor + 1) % this.paintSplotchColors.length;
      return this.paintSplotchColors[this.lastSplotchColor];
    },
    insertSplotchColor: function() {
      var qTheories = Object.keys(_.groupBy(this.queries, 'theory'));
      for(var i = 0; i < qTheories.length; i++){
        let color = this.nextSplotchColor();
        let auxStyles = document.getElementById('additionalStyles').sheet;
        auxStyles.insertRule('.qt'+ qTheories[i] +' { background-color: ' + color + '; }', auxStyles.cssRules.length);
      }
    }
  },
  computed: {
    theoryRows: function() {
      return Math.ceil(this.orderedTheories().length / 3);
    },
    queryRows: function() {
      return Math.ceil(this.orderedQueries().length / 3);
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
                  Legislations
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#queries">
                  <span data-feather="cpu"></span>
                  Queries
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
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-0">
            <h1>Dashboard</h1>
            <!--<span>Logged in as: {{ user.name }}</span>-->
          </div>
          <hr class="mt-0">

          <alert variant="danger" v-show="error" :dismissible="false">
            <span v-html="error"></span>
          </alert>


          <div v-if="theories">
            <a name="legislatures" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-4">
              <h3>Legislations</h3>
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                  <button class="btn btn-sm btn-outline-primary" v-on:click="createTheory">
                    <span data-feather="plus"></span>
                    Create new
                  </button>
                </div>
                <button class="btn btn-sm btn-outline-secondary float-right mr-2" v-on:click="showTheoryCloneWindows">
                  <span data-feather="corner-right-down"></span>
                  Import
                </button>
                <sort-button @order-by="onSort($event,'theory')" type="theory"></sort-button>
              </div>
            </div>

            <loading-bar v-if="!dashboardLoaded"></loading-bar>
            <div v-if="dashboardLoaded">
              <p v-if="theories.length == 0"><em>No legislatures formalized yet. Click on "create new" above,
              to create a new formalization or import a publicly available one.</em></p>
              <div class="row" v-for="i in theoryRows" style="margin-bottom: 2em">
                <div class="col-sm-4" v-for="t in orderedTheories().slice((i-1) * 3, i * 3)">
                  <theory-card v-bind:theory="t" :key="t._id"></theory-card>
                </div>
              </div>
            </div>
          </div>

          <div v-if="queries">
            <hr>
            <a name="queries" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center mb-4">
              <h3>Queries</h3>
              <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                  <button class="btn btn-sm btn-outline-primary" v-on:click="createQuery">
                    <span data-feather="plus"></span>
                    Create new
                  </button>
                </div>
                <sort-button @order-by="onSort($event, 'query')" type="query"></sort-button>
              </div>
            </div>

            <loading-bar v-if="!dashboardLoaded"></loading-bar>
            <div v-if="dashboardLoaded">
              <p v-if="queries.length == 0"><em>No queries yet. Click on "create new" above,
              to create a new query or import a publicly available one.</em></p>
              <div class="row" v-for="i in queryRows" style="margin-bottom: 2em">
                <div class="col-sm-4" v-for="q in orderedQueries().slice((i-1) * 3, i * 3)">
                  <query-card v-bind:query="q" :key="q._id"></query-card>
                </div>
              </div>
            </div>
          </div>

        </main>

      </div>
      <modal v-if="showModal" name="clone"></modal>
    </div>
  `,
  created: function () {
    this.$on('delete-theory', this.onTheoryDelete);
    this.$on('clone-theory', this.onTheoryClone);
    this.$on('delete-query', this.onQueryDelete);
    this.$on('modal-ok', this.onCloneModalFinish);
    this.$on('modal-cancel', this.onCloneModalCancel);
    nai.log('Dashboard mounted', '[App]')
    var self = this;
    nai.initDashboard(function(resp) {
      nai.log('User infos loaded', '[App]');
      nai.log(resp.data, '[App]')
      if (!!resp.data.data) {
        self.theories = resp.data.data.theories;
        self.queries = resp.data.data.queries;
        self.dashboardLoaded = true;
        self.insertSplotchColor(); // Needs to happen after data is loaded.
      } else {
        nai.log('could not retrieve user data', '[App]')
      }
    }, nai.handleResponse(null, function(error) {
        self.dashboardLoaded = true;
        self.error = `<b>Error</b>: Could not connect to NAI back-end.
                     Please try to reload and contact the system
                     administrator if this problem persists.`
        self.queries = null;
        self.theories = null
      }, null))
  },
}
