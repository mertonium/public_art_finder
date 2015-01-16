var Artwork = Backbone.Model.extend({
  idAttribute: "_id",
  mainImage: function() {
    return this.get('image_urls')[0];
  },

  created_at_iso: function() {
    return this.get('created_at').replace(/(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
  }
});

var Artworks = Backbone.Collection.extend({
  url: 'artwork',
  db: {
    view: 'recent-items'
  },
  model: Artwork,
  comparator: function(a, b) {
    if(b.get('created_at') < a.get('created_at')) {
      return -1;
    }
    if(b.get('created_at') > a.get('created_at')) {
      return 1;
    }
    return 0;
  },

  more: function(how_many) {
    var startkey = this.last().get('created_at'),
        startkey_docid = this.last().get('_id'),
        limit = how_many || 5;

    this.fetch({
      limit: limit,
      startkey: startkey,
      startkey_docid: startkey_docid,
      descending: true,
      remove: false
    });
  }
});


