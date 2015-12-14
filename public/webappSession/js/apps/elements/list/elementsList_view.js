define(["app",
        "text!apps/elements/list/templates/elements_dialog.html",
        "text!apps/elements/list/templates/elements_item.html"],
  function(TeacherSession,elementsDialogTpl,elementsItemTpl){
    TeacherSession.module("ElementsApp.List.View",
      function(View,TeacherSession,Backbone,Marionette,$,_){

        View.Element= Marionette.ItemView.extend({
          template:_.template(elementsItemTpl),
          className:function(){
            return 'element '+this.model.get("color");  
          },
          triggers:{
           // 'click .js-show':"element:show"
          },events:{
            'click .js-show':"elementShowClicked"
          },elementShowClicked:function(event){
            event.preventDefault();
            this.trigger("element:show",this.model);
          }
        });

        View.Elements = Marionette.CompositeView.extend({
          template:_.template(elementsDialogTpl),
          childView:View.Element,
          childViewContainer:".elements-wrapper",
          className:"modal custom fade js-modal",
          id:"myModal",

          attributes:{
            "tabindex":"-1",
            "role":"dialog",
            "aria-labelledby":"myModalLabel",
            "aria-hidden":"true"
          },          
          events :{
            'keypress .js-modal':"escapeKeyPressed"       
          },
          triggers:{
            'click .js-close':"element:list:close",
            'keypress .js-modal':"element:list:escape"
          },
          initialize: function(){
//            this.listenTo(this.collection,"add",function(collectionView,childView,index){
//              this.attachHtml(function(collectionView,childView,index){                
//                collectionView.$el.find("#addOne").before(childView.el);
//              });
//            });
          },
          escapeKeyPressed: function(e){
            console.log("escape key pressed");
            console.log(e.target)
          }
        });
    });
    return TeacherSession.ElementsApp.List.View;
});
