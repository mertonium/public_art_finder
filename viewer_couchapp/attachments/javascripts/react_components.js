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
  render: function() {
    console.log(this.props);
    var muralNodes = this.props.murals.map(function(mural) {
      return (
        <MuralItem url={mural['image_urls'][0]} created_at={mural['created_at']}>
          {mural['artist']}
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


