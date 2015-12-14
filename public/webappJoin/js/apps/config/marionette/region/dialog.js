define(["jquery","underscore","marionette","bootstrap"], function($,_,Marionette) {
    Marionette.Region.Dialog = Marionette.Region.extend({
        el:"#dialog-region",
        constructor:function(){
//          _.bindAll(this,'showModal','hideModal','closeDialog');
          Backbone.Marionette.Region.prototype.constructor.apply(this,arguments);
          this.on("show",this.showModal,this);
        },
        showModal: function(view) {
          console.log("showModal");
          $("#dialog-region").show();
          $("#mymodal").modal('show');
          this.listenTo(view, "dialog:close", function(){
            console.log("dialog:close");
            this.hideModal();
          });
                   
          //view.on("close",this.hideModal(),this);
          //Have to differentiate the modal view next time.
//          this.$el.find("#myModal").modal('show');
          
//            var self = this;
//            this.$el.dialog({
//                modal: true,
//                title: view.title,
//                width: "auto",
//                close: function(e, ui) {
//                    self.closeDialog();
//                }
//            });
        },
        hideModal:function(){ 
          console.log("hideModal");
          this.$el.modal('hide');
          $('body').removeClass("modal-open");
          $('.modal-backdrop').remove();
          this.stopListening();
          this.close();
        },
        closeDialog: function() {
            $("#dialog-region").hide();
            this.stopListening();
            this.close();
            this.$el.dialog("destroy");
            
        }
    });
    return Marionette.Region.Dialog;
});
