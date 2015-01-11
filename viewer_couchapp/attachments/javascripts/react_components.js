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

var MuralItem = React.createClass({

  render: function() {
    return (
      <div className='muralItem'>
        <img src={this.props.url} />
        <div className='muralMeta'>
          <h3>{this.props.children}</h3>
          <em>Photo taken on {this.props.created_at}</em>
        </div>
      </div>
    );
  }
});

var MuralList = React.createClass({
  mixins: [ ModelUpdateMixin ],
  render: function() {
    console.log(this.props);
    var muralNodes = this.props.collection.map(function(mural) {
      return (
        <MuralItem key={mural.cid} url={mural.mainImage()} created_at={mural.get('created_at')}>
          {mural.get('artist')}
        </MuralItem>
      );
    });
    return (
      <div className="muralList">
        {muralNodes}
      </div>
    );
  }
});


