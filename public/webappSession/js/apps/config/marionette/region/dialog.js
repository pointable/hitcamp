define(["jquery", "underscore", "marionette", "bootstrap"], function($, _, Marionette) {
  Marionette.Region.Dialog = Marionette.Region.extend({
    el: "#dialog-region",
    constructor: function() {
      this.on("show", this.showModal, this);
    },
    showModal: function(view) {
      console.log("showModal");
      var self = this;
      var configureDialog = function() {
        self.$el.children().first().modal('show');
        self.$el.children().first().on('hidden.bs.modal', function(event) {
          self.closeDialog();
        });
      };
      configureDialog();      
    },
    hideModal: function() {
      console.log("hidemodal");
      this.$el.children().first().modal('hide');
      $('body').removeClass("modal-open");
      $('.modal-backdrop').remove();
    },
    closeDialog: function() {
      this.stopListening();
      this.hideModal();
      this.empty();
    }
  });
  return Marionette.Region.Dialog;
});
