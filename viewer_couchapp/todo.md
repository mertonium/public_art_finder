X Add 'next' link, make it work

X Fix the collection query. It looks like since the backbone-couchdb lib makes
  you use the name of the model as the key we are kind of screwed when it
  comes to ordering the images by created_at date. We need to test if the key
  in the byCollction.js view can be an array with both the model name, and the
  created at timestamp.

* Take a second look at the ModelUpdateMixin to make sure it is doing exactly
  what we want it to do. It seems like a hammer at the moment.

* Update the image processor to create thumbnails & medium size images.

* Style the list view

* Redo the map view

* Add an about page

* Refactor the details view
