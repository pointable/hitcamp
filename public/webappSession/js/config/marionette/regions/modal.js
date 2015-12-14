define(["jquery","underscore","backbone","marionette"],function($,_,Backbone,Marionette){
  Marionette.Region.Dialog = Marionette.Region.extend({
    el:"#dialog-region",
    constructor: function(){
//      _.bindAll(this);
      Backbone.Marionette.Region.prototype.constructor.apply(this,arguments);
      this.on("view:show",this.showModal,this);
    },
    showModal: function(view){
      view.on("close",this.hideModal,this);
      this.$el.modal('show');
    },
    hideModal: function(){
      console.log("Hide called");
      this.$el.modal('hide');
    }
            
//    onShow:function(view){
//      this.listenTo(view,"dialog:close",this.closeDialog);    
//    },
//    closeDialog:function(){
//      this.stopListening();
//      this.close();
//    }
  });
  return Marionette.Region.Dialog;
});

