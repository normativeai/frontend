const home = {
  props: ["loggedIn"],
  data: function() {
    return {
      showReg: false
    }
  },
  methods: {
    showRegForm: function() {
      this.showReg = true;
      this.$nextTick(function () {
        this.$refs.showRegLink.click()
      })
      
    }
  },
  template: `
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
          <div class="sidebar-sticky">
            <div v-if="!loggedIn">
              <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-1 mb-1 text-muted">
                <span>Account</span>
              </h6>
              <ul class="nav flex-column mb-2">
                <li class="nav-item">
                  <a class="nav-link" href="#thelogin">
                    <span data-feather="log-in"></span>
                    Log in
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#theregistration" v-on:click="showReg = true" ref="showRegLink">
                    <span data-feather="clipboard"></span>
                    Register
                  </a>
                </li>
              </ul>
            </div>
          
            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-3 mb-1 text-muted">
              <span>Introduction</span>
            </h6>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <a class="nav-link" href="#gettingstarted">
                  <span data-feather="book"></span>
                  Getting started
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#furtherinfo">
                  <span data-feather="info"></span>
                  Further information
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
          <h1>Normative Reasoning</h1>
          <hr>
          
          <a name="thelogin" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <login v-if="!loggedIn"></login>
          <p>Don't have an account? <a href="#register" v-on:click="showRegForm"><b>Click to register</b></a></p>
          
          <div v-if="!loggedIn && showReg">
            <hr>
            <a name="theregistration" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
            <register></register>
          </div>
          
          <hr>
          <a name="intro" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <h2>Introduction</h2>
          <p>yada yada</p>
          
          <a name="gettingstarted" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <h3>Getting started</h3>
          <p>yada yada</p>
          
          <a name="furtherinfo" style="display:block;visibility:hidden;position:relative;top:-3em"></a>
          <h3>Further information</h3>
          <p>yada yada</p>
        </main>
        
      </div>
    </div>
  `,
  mounted: function () {
    feather.replace();
  },
}
