// Mixin from https://gist.github.com/ssorallen/7883081
var ModelUpdateMixin = {

  componentDidMount: function() {
    this._boundForceUpdate = this.forceUpdate.bind(this, null);
    this.getBackboneObject().on("all", this._boundForceUpdate, this);
  },

  componentWillUnmount: function() {
    this.getBackboneObject().off("all", this._boundForceUpdate);
  },

  getBackboneObject: function() {
    return this.props.collection || this.props.model;
  }

  /*
  componentWillMount: function(){
    this.props.model.on("change", (function() {
      console.log("in component will mount");
      this.forceUpdate();
    }.bind(this)));
  },

  componentWillUnmount: function(){
    console.log("in component will unmount");
    this.props.model.off("change");
  }
  */

};

var MoreMurals = React.createClass({
  handleClick: function() {
    this.props.collection.more(10);
  },
  render: function() {
    return (
      <button onClick={this.handleClick}>more</button>
    );
  }
});

var MuralItem = React.createClass({

  render: function() {
    return (
      <div className='row'>
        <div className='col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
          <div className='muralMeta mural-item'>
            <img src={this.props.url} width="100%" />
            <p>
              Photo taken {moment(this.props.created_at).fromNow()}
            </p>
          </div>
        </div>
      </div>
    );
  }
});

var MuralList = React.createClass({
  mixins: [ ModelUpdateMixin ],
  render: function() {
    var muralNodes = this.props.collection.map(function(mural) {
      return (
        <MuralItem key={mural.cid} url={mural.mainImage()} created_at={mural.created_at_iso()} />
      );
    });
    return (
      <div className="muralList container-fluid">
        {muralNodes}
        <MoreMurals collection={this.props.collection} />
      </div>
    );
  }
});

var AppHeader  = React.createClass({
  handleClick: function(ev) {
    ev.preventDefault();
    console.log('FIND ME!');
  },
  render: function() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-content">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">Public Art Finder</a>
          </div>
          <div className="collapse navbar-collapse" id="navbar-content">
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="map">Map</a>
              </li>
              <li>
                <a href="#" onClick={this.handleClick} className="find-me">Find Me</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});


