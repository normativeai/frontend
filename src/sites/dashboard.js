const dashboard = {
  data: function() {
    return {
      dashboardLoaded: false,
      theories: [],
      queries: [],
      error: null,
      showModal: false,
      showLargeNav: false,
      // Sort
      ascDescT: 'asc',
      orderByT: 'name',
      ascDescQ: 'asc',
      orderByQ: 'name',
      /* https://www.schemecolor.com/rainbow-twilight.php and https://www.schemecolor.com/pastel-rainbow.php */
      paintSplotchColors: ['#A40E1A', '#DB8144', '#DFC63D', '#76A653', '#3582B8', '#433368', '#CC99C9', '#9EC1CF', '#9EE09E', '#FDFD97', '#FEB144', '#FF6663'],
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
    onShowLargeNav: function() {
      this.showLargeNav = !this.showLargeNav;
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
      window.localStorage.setItem('strSortSettings', JSON.stringify({
        ascDescT: this.ascDescT,
        orderByT: this.orderByT,
        ascDescQ: this.ascDescQ,
        orderByQ: this.orderByQ,
      }));
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
      let auxStyles = document.getElementById('additionalStyles').sheet;
      for(var i = 0; i < this.theories.length; i++){
        let color = this.nextSplotchColor();
        auxStyles.insertRule('.qt'+ this.theories[i]._id +' { background-color: ' + color + '; }', auxStyles.cssRules.length);
      }
    },
    // Called on mount if applicable loads the users last sort settings.
    loadSortSettings: function() {
      let self = this;
      try {
        var strSortSettings = JSON.parse(window.localStorage.getItem('strSortSettings'));
        if(!!strSortSettings){
          self.ascDescT = strSortSettings.ascDescT;
          self.orderByT = strSortSettings.orderByT;
          self.ascDescQ = strSortSettings.ascDescQ;
          self.orderByQ = strSortSettings.orderByQ;
        }
      } catch(e) { }
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

        <sidebar page="dashboard" v-on:show-large-nav="onShowLargeNav">
          <template v-slot:returnToDashboard><span></span></template>
          <template v-slot:smallNavLinks>
              <li class="nav-item">
                <a class="nav-link" href="#legislatures">
                <feather-icon icon="book" class=""></feather-icon>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#queries">
                <feather-icon icon="cpu"></feather-icon>
                </a>
              </li>
          </template>
          <template v-slot:largeNavHeading>
            <span>Dashboard</span>
          </template>
          <template v-slot:largeNavLinks>
            <li class="nav-item">
              <a class="nav-link" href="#legislatures">
                <feather-icon icon="book"></feather-icon>
                Legislations
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#queries">
                <feather-icon icon="cpu"></feather-icon>
                Queries
              </a>
            </li>
          </template>
        </sidebar>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4" :class="{'show-small-nav': !showLargeNav}">
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
  mounted: function() {
    this.loadSortSettings();
  }
}
