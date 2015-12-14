function startIntro1(intro, app) {
  if (app !== "wordList") {
    return;
  }

  var steps = [
    {
      intro: "<center><b>Word lists</b></center><br/><br/>\
                                       Resources that  can be used with the <b> campfire apps </b> or a <b>compatible activity</b> in the adventure."
    },
    {
      element: document.querySelector('.js-guide-am-wordlist'),
      intro: "Click here to access your <b> word lists for this adventure</b>"
    },
    {
      element: document.querySelector('.guide-wl-new'),
      intro: "Click here to create a <b>new word list</b>  "
    }

  ];

  var steps2 = [
    {
      element: document.querySelectorAll('.js-title-edit')[0],
      intro: "Edit the title here"
    },
    {
      element: document.querySelectorAll('.js-list-text')[0],
      intro: "Click here to edit the words/sentences<br/><br/>\
                                  <b>Space</b> is accepted as part of a sentence.<br/>\
                                  <b>Enter</b> for new word or sentence. <br/><br/>\
                                  Example:<br/><br/>\
                                  <b>Jump is a verb( sentence)</b><br/> \
                                  <b>Swim</b>(word)<br/>\
                                  <b>Run fast</b>(multiple word)<br/> \
                                  <b>Dance</b>(multiple word)<br/> <br/>\
                                   In total there are<b> 4 items</b> in this word list ",
      position: 'bottom'
    }
  ];

    if ($(".js-list-edit-area").length !==0) { 
      steps.push.apply(steps, steps2);
 
    }
  
  intro.setOptions({
    showStepNumbers: false,
    showBullets: false,
    steps: steps
  });


  intro.start();
}