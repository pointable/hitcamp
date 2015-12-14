define(["app",
  "text!apps/wordLists/list/templates/wordLists_item.html",
  "text!apps/wordLists/list/templates/wordLists_template.html"],
    function(LessonManager, wordListsItemTpl, wordListsTpl) {
      LessonManager.module("WordListsApp.List.View", function(View, LessonManager, Backbone, Marionette, $, _) {
        View.WordList = Marionette.ItemView.extend({
          className: "listWrapper col-md12 col-xs-12 col-lg-12",
          template: _.template(wordListsItemTpl),
          events: {
            'click .js-edit': 'editWordListClicked',
            'click .js-delete': 'deleteWordListClicked',
            'click .js-rename': 'renameWordListClicked',
            'click .js-list-text': 'listTextClicked',
            'click .js-cancel': 'listTextEditCancelClicked',            
            'click .js-title-edit': 'listTitleEditClicked',            
            'click .js-title-cancel': 'listTitleCancelClicked',
            'keydown ': 'titleEditAreaEnter'
          },
          triggers:{
            'click .js-title-save':'wordList:title:save',
            'click .js-save':'wordList:edit:save'
          },
          deleteWordListClicked: function() {
            this.trigger("wordList:delete", this.model);
          },
          editWordListClicked: function(e) {
            e.preventDefault();
            this.trigger("activity:edit", this.model);
          },
          renameWordListClicked: function(e) {
            this.trigger("activity:rename", this.model);
          },
          listTextClicked: function(event) {
            event.preventDefault();
            this.trigger("wordList:edit", event.target, this.model);
          },
          listTextEditCancelClicked: function(event) {
            event.preventDefault();
            this.trigger("wordList:edit:cancel", event.target, this.model);
          },
          listTitleEditClicked: function(event) {
            event.preventDefault();
            this.trigger("wordList:title:edit", event.target, this.model);
          },
          listTitleCancelClicked: function(event) {
            event.preventDefault();
            this.trigger("wordList:title:cancel", event.target, this.model);
          },
          titleEditAreaEnter: function(event) {
            if (event.which === 13) {
              var classes = event.target.className.split(" ");
              if (_.contains(classes, 'js-title-edit-area')) {
                console.log("contains");
                event.preventDefault();
                this.trigger("wordList:title:enter", event.target, this.model);
              }
              ;
            }
          },
          remove: function() {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          initialize: function() {
//            this.model.on('change', this.render);
          }
        });

        View.WordLists = Marionette.CompositeView.extend({
          className: "wordList-editor-area",
          template: _.template(wordListsTpl),
          childView: View.WordList,
          childViewContainer: "#wordListsView",
          initialize: function() {               

          },
          onCompositeCollectionRendered: function() {
            this.appendHtml = function(collectionView, childView, index) {
              collectionView.$el.find("#wordListsView").prepend(childView.el);
            };
          },
          triggers: {
            'click .js-new': 'wordList:new',
            'click .js-guide': 'wordlist:show:guide',
            'click .js-show-wordLists':'wordLists:show'
          },
          events: {
          }
        });

      });
      return LessonManager.WordListsApp.List.View;
    });