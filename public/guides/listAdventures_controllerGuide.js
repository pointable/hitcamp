function startIntro(intro, app) {
  if (app !== "adventure") {
    return;
  }
  intro.setOptions({
    showStepNumbers: false,
    showBullets: false,
    steps: [
      {
        intro: "<center>Welcome<br/> to <br/> <b>Adventure Map Guide</b>! <br/><br/></center>"

      },
      {
        element: document.querySelector('.js-guide-am-map'),
        intro: "<b>Adventure Map</b><br/><br/> This  is the place where you plan your lesson by creating <b>activities.</b>"
      },
      {
        element: document.querySelector('.js-guide-am-wordlist'),
        intro: "<b>Word lists</b><br/><br/>\
                                      Categories with matching words <br/><br/>\
                                     They can be used in  <b>campfire apps</b>\
                                      and in the adventure map <b>activity</b>"
      },
      {
        element: document.querySelector('.js-guide-am-title'),
        intro: "You can edit the <b>map title</b> by clicking here",
        position: 'bottom'
      },
      {
        element: document.querySelector('.js-guide-new'),
        intro: 'Click <b>New Activity</b> to create your first activity for the adventure',
        position: 'top'
      },
      {
        element: document.querySelector('.horizontal-line'),
        intro: '<b>Path</b></br></br>\
                                       Indicates the flow between the activities<br/>\
                                      Only <b> one activity </b> will be active per path.<br/>\
                                      Once user complete that activity, neighbouring activites will be activated<br/><br/>\
                                      <b>Island Activity</b></br></br>\
                                      Activity by itself will be activated by default. ',
        position: 'bottom'
      },
      {
        element: document.querySelector('.js-guide-assign'),
        intro: 'After you are done, assign the lesson to the classroom that you have created\
                                     <br> Click <b>launch</b> to launch the classroom',
        position: 'left'
      }
    ]
  });

  intro.start();
}


