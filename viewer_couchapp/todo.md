* Add 'next' link, make it work

* Fix the collection query. It looks like since the backbone-couchdb lib makes
  you use the name of the model as the key we are kind of screwed when it
  comes to ordering the images by created_at date. We need to test if the key
  in the byCollction.js view can be an array with both the model name, and the
  created at timestamp.
