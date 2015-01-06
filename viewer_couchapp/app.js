var couchapp = require('couchapp'),
    path = require('path'),
    ddoc = {};

ddoc._id = "_design/viewer";
ddoc.language = "javascript";

ddoc.rewrites = [
  {
    "to": "favicon.ico",
    "from": "favicon.ico"
  },
  {
    "to": "stylesheets/*",
    "from": "stylesheets/*"
  },
  {
    "to": "javascripts/*",
    "from": "javascripts/*"
  },
  {
    "from":"vendor/*",
    "to": "vendor/*"
  },
  {
    "to": "images/*",
    "from": "images/*"
  },
  {
    "from": "dbimgs/*",
    "to": "../../*"
  },
  {
    "from": "/assetid",
    "to": "_list/jsonp/assetid"
  },
  {
    "to": "index.html",
    "from": "/"
  },
  {
    "from":"details.html",
    "to":"details.html"
  },
  {
    "from":"/appcache",
    "to":"_show/cache/"
  },
  {
    "from": "/data",
    "to": "../../_design/geo/_spatial/_list/geojson/full"
  },
  {
    "from": "/config",
    "to":"_list/jsonp/config"
  },
  {
    "to": "./",
    "from": "ddoc"
  },
  {
    "to": "../../",
    "from": "api"
  },
  {
    "to": "../../*",
    "from": "api/*"
  },
  {
    "from": "/all",
    "to": "../../_design/geo/_spatiallist/geojson/full",
    "query": {
      "bbox": "-180,-90,180,90"
    }
  },
  {
    "to": "../../_design/geo/_spatiallist/kml/full",
    "from": "/kml",
    "query": {
      "bbox": "-180,-90,180,90"
    }
  }
];

ddoc.views = {
  assetid: {
    map: function(doc) {
        emit(doc._id, doc);
    }
  },
  'attach-count': {
    map: function(doc) {
      if(doc.source =='San Francisco Arts Commission') {
          if(doc._attachments) emit(null, Object.keys(Object(doc._attachments)).length);
      }
    }
  },
  config: {
    map: function(doc) {
      if(doc.doc_type && doc.doc_type === "config") {
        emit(doc._id, doc);
      }
    }
  },
  'recent-items': {
    map: function(doc) {
      if (doc.created_at) {
        emit(doc.created_at, doc);
      }
    }
  },
  sfonly: {
    map: function(doc) { 
        if(doc.source =='San Francisco Arts Commission') emit(doc.accession_id, doc); 
    }
  }
};

ddoc.lists = {
  asset: function(head, req) {
      var row, out, sep = '\n';

      // Send the same Content-Type as CouchDB would
      if (req.headers.Accept.indexOf('application/json')!=-1)
        start({"headers":{"Content-Type" : "application/json"}});
      else
        start({"headers":{"Content-Type" : "text/plain"}});

      if ('callback' in req.query) send(req.query['callback'] + "(");


      while (row = getRow()) {
          out = JSON.stringify(row.value);
          send(out);
      }
      if ('callback' in req.query) send(")");

  },
  jsonp: function(head, req) {
    var row, out, sep = '\n';

    // Send the same Content-Type as CouchDB would
    if (req.headers.Accept.indexOf('application/json')!=-1) {
      start({"headers":{"Content-Type" : "application/json"}});
    } else {
      start({"headers":{"Content-Type" : "text/plain"}});
    }

    if ('callback' in req.query) send(req.query['callback'] + "(");

    while (row = getRow()) {
      out = JSON.stringify(row.value);
      send(out);
    }
    
    if ('callback' in req.query) send(")");
  },
  sum: function(head, req) {
    var row, out, sum = 0, sep = '\n';

    // Send the same Content-Type as CouchDB would
    if (req.headers.Accept.indexOf('application/json')!=-1)
      start({"headers":{"Content-Type" : "application/json"}});
    else
      start({"headers":{"Content-Type" : "text/plain"}});

    if ('callback' in req.query) send(req.query['callback'] + "(");


    while (row = getRow()) {
      sum += parseFloat(row.value);
    }

    out = JSON.stringify(sum);
    send(out);

    if ('callback' in req.query) send(")");
  }
};

ddoc.shows = {
  cache: function(head, req) {
    var manifest = "";
    var i = 0;
    var the_files = [
      'stylesheets/images/ajax-loader.png',
      'stylesheets/images/icons-18-white.png',
      'stylesheets/jquery.mobile-1.0a4.1.min.css',
      'images/mural-dialogue-box.png',
      'images/mural-icon-pin-32.png',
      'images/mosaic_header.png',
      'images/mosaic-marker.png',
      'images/location-icon-pin-32.png',
      'images/noimage.png',
      'javascripts/jquery.mobile-1.0a4.1.min.js',
      'javascripts/infobox_packed.js',
      'javascripts/jquery-1.5.2.min.js',
    ];
    for (; i < the_files.length; i += 1) {
      manifest += ("/" + the_files[i] + "\n");
    }
    return { 
      "headers": { "Content-Type": "text/cache-manifest"}, 
      "body": "CACHE MANIFEST\n" + manifest +"NETWORK:\n*"
    };
  }
};

couchapp.loadAttachments(ddoc, path.join(__dirname, 'attachments'));

module.exports = ddoc;