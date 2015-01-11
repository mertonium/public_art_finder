var Artwork = Backbone.Model.extend({
  idAttribute: "_id",
  mainImage: function() {
    return this.get('image_urls')[0];
  }
});

var Artworks = Backbone.Collection.extend({
  url: 'artwork',
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
    var startkey = this.last().get('_id'),
        limit = how_many || 5;

    this.fetch({
      limit: limit,
      startkey_docid: startkey,
      remove: false
    });
  }
});


