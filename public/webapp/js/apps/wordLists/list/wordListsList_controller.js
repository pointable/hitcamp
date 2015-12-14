define(["app", "apps/wordLists/list/wordListsList_view", "bootbox", "bootstrap", "wordListsGuide"],
    function(LessonManager, View, bootbox, wordListsGuide) {
      LessonManager.module("WordListsApp.List", function(List, LessonManager, Backbone, Marionette, $, _) {
        var MAX_LENGTH = 12;

        List.Controller = {
          listWordLists: function(wordListsRegion) {
            //Server
//            if (options === undefined || options === null) {
              require(["entities/wordList/wordList_collection"], function() {
                var fetchingWordLists = LessonManager.request("wordList:entities");
                $.when(fetchingWordLists).done(function(wordLists) {
                  listView(wordLists,wordListsRegion);
                });
              });
              //HTML
//            }
//            else if (options.initialized) {
//              console.log("options.initialized");
//              require(["entities/wordList/wordList_collection"], function() {
//                var wordLists = LessonManager.request("wordList:entities:initialized");
//                listView(wordLists);
//              });
//              //Inner List call - need to pass wordLists
//            } else if (options.wordLists) {
//              listView(options.wordLists);
//              //Not used
//            }
          }
        };
        function listView(wordLists,wordListsRegion) {
          var wordListsListView = new View.WordLists({
            collection: wordLists
          });

//      //preload images
//      _.each(wordLists.models, function(activityModel) {
//        _.each(activityModel.get("elements").models, function(elementModel) {         
//          if (elementModel.get("isImage"))
//          
//            var resourceUrl=elementModel.get("resourceUrl");
//            console.log(resourceUrl);
//            window.imgPreloader.push(resourceUrl);
//          }
//        });
//      });

          wordListsRegion.show(wordListsListView);
//          var wordListHeader = document.querySelector('.wordListHeader');
//          var origOffsetY = wordListHeader.offsetTop;
//          //Customizing the navbar
//          function scroll() {
//            if ($(window).scrollTop() >= origOffsetY - 40) {
//              $('.wordListHeader').addClass('wordListHeaderFixed');
//            } else {
//              $('.wordListHeader').removeClass('wordListHeaderFixed');
//            }
//          }
//          document.onscroll = scroll;

          wordListsListView.on("childview:wordList:delete", function(wordList) {            
            bootbox.confirm("Delete Word List?", function(res) {
              if (res === true) {
//                console.log("delete word list");
                wordList.model.destroy();
              } else {
//                console.log("ignore");
                return;
              }
            });

            //Reset all the index attributes when one of them is being deleted and relist the items
            _.each(wordLists.models, function(wordListModel) {
              wordListModel.set("index", wordLists.indexOf(wordListModel) + 1);
            });
          });
          //TODO launching the modal for activites
          wordListsListView.on("childview:wordList:edit", function(wordList, target) {
            var words = wordList.model.get("words");
            var wordsString = combineWords(words);
            $(target).next(".list-edit-area").children("textarea.list-edit-textarea").multiline(wordsString);
            $(target).hide();
            $(target).next(".list-edit-area").show();
            $(target).next(".list-edit-area").children("textarea.list-edit-textarea").focus();
          });

          wordListsListView.on("wordList:new", function() {
            var newWordList = LessonManager.request("wordList:entity:new");
            newWordList.set("index", wordLists.length + 1);
            wordLists.create(newWordList);
            window.scrollTo(0, 0);
          });

          wordListsListView.on("wordlist:show:guide", function() {
            //alert($(args.view.el.target).text());
//            console.log("word list show guide");
            introJs().exit();
            var intro1 = introJs();
            startIntro1(intro1, "wordList");
          });
          wordListsListView.on("wordLists:show", function(args) {
//            console.log("view %O", args.view);
            var view = args.view;
            var isVisible = $(view.el).find(".isVisible");
            if (isVisible.length === 0) {
              $(view.el).css("z-index", 7);
              $(view.el).find(".wordLists-editor-wrapper").addClass("isVisible");
              $(view.el).find(".btn-wordLists-editor").addClass("word-list-open");
            } else {
              $(view.el).css("z-index", "auto");
              $(view.el).find(".wordLists-editor-wrapper").removeClass("isVisible");
              $(view.el).find(".btn-wordLists-editor").removeClass("word-list-open");
            }
//            console.log("isVisible", isVisible);
          });

          wordListsListView.on("childview:wordList:edit:cancel", function(wordList, target) {
            $(target).parent().hide();
            $(target).parent().prev(".list-text").show();
          });
          wordListsListView.on("childview:wordList:edit:save", function(view) {
            var wordList_model = view.model;
            var el = view.el;
            var listWords = $(el).find(".list-edit-textarea").val();
            var listWordsText = $(el).find(".list-edit-textarea").text();

            if (listWords.charCodeAt() === 10) {
//              console.log("spaces only");
              listWords = '';
              $(el).find(".list-text").text("");
            } else {
              listWords = listWords.trim();
              $(el).find(".list-text").text(listWords);
            }
            $(el).find(".list-edit-area").hide();
            $(el).find(".list-text").show();
            var words = listWords.split(/\r\n|\r|\n/g);
//            console.log("words"+words+".");

//            var listWords = $(target).prev("textarea.list-edit-textarea").val();
//            listWords = listWords.trim();
//            $(target).parent().prev(".list-text").text(listWords);
//            $(target).parent().hide();
//            $(target).parent().prev(".list-text").show();
//            var words = listWords.split(/\r\n|\r|\n/g);
            wordList_model.set("words", words);
            wordList_model.save();

          });

          wordListsListView.on("childview:wordList:title:edit", function(wordList, target) {
            $(target).hide();
            $(target).next(".title-edit-area").show();
            
            $(target).next(".title-edit-area").children("textarea").focus();
          });

          wordListsListView.on("childview:wordList:title:save", function(view) {
            var wordList_model = view.model;
            var el = view.el;
            var title = $(el).find(".title-edit-textarea").val();
            $(el).find(".list-title").text(title);
            $(el).find(".title-edit-area").hide();
            $(el).find(".js-title-edit").show();
            wordList_model.set("title", title);
            wordList_model.save();
          });

          wordListsListView.on("childview:wordList:title:enter", function(wordList, target) {
            var wordList_model = wordList.model;
            var title = $(target).val();
            $(target).prev(".list-title").text(title);
            $(target).hide();
            $(target).prev(".list-text").show();
            wordList_model.set("title", title);
            wordList_model.save();
          });

          wordListsListView.on("childview:wordList:title:cancel", function(wordList, target) {
            $(target).parent().hide();
            $(target).parent().prev(".list-title").show();
          });
          wordListsListView.on("childview:wordList:rename", function(args) {
            bootbox.prompt("Rename WordList Title", function(result) {
              if (result === null) {
                args.model.set("wordListTitle", "");
                args.model.save();
                return;
              } else if (result === '') {
                args.model.set("wordListTitle", "");
                args.model.save();
              } else {
                args.model.set("wordListTitle", result);
                args.model.save();
              }
            });
          });

          //hange words into textarea format with nextline between words 
          function combineWords(listWords) {
            var wordsString = '';
            _.each(listWords, function(listWord) {
              wordsString += listWord + "\n";
            });
            return wordsString;
          }

          //Replace '\n' with hex code to display next line in textarea
          $.fn.multiline = function(text) {
            this.text(text);
            this.html(this.html().replace(/\n/g, '&#13;&#10;'));
            return this;
          };
          //Dialog listener for custom message
          $(window.document).off('DialogUrl');

          $(window.document).on('DialogUrl', function(event, param) {
            var messageReceived = param.detail;
            switch (messageReceived.type)
            {
              //set all custom message type here
              case 'UrlUpdate':
                var url = messageReceived.resourceURL;
                LessonManager.trigger("dialog:show", url, messageReceived.title);
                break;
            }
          });
        }
//    var url ="https://docs.google.com/document/d/1HeNsERfR37ulbmshKaxvhWzkZFvoMIv5vB02YikswuQ/preview";
//    LessonManager.trigger("dialog:show", url);


      });
      return LessonManager.WordListsApp.List.Controller;
    });


