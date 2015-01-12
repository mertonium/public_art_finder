var AppRouter = Backbone.Router.extend({
  initialize: function(options) {
    console.log(options);
  },

  routes: {
    ""      : "listingPage",
    "list"  : "listingPage",
    "map"   : "mapPage",
    "about" : "aboutPage"
  },

  listingPage: function() {
    app.clearPages();

    if(app.RecentArtworks.length) {
      app.renderListPage();
    } else {
      app.RecentArtworks.fetch({
        limit: 10,
        descending: true,
        reset: true,
        success: app.renderListPage
      });
    }
  },

  mapPage: function() {
    app.clearPages();
    app.showPage('map-page');
    console.log('map page');
  },

  aboutPage: function() {
    app.clearPages();
    app.showPage('about-page');
    console.log('about page');
  }

});


