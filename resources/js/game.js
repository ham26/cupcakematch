/*
  Level number should update when the player completes the whole game
  when player starts the whole game, the level 1 message should load first


*/


$(function () {
var $playerName;
var $maxChar = 7;
var maxPoints = [1000, 5000, 10000];
var levelMaxPoints;
var levelScore;
var totalPlayerScore = 0;
var disableClick = false;
var munchies = [12, 15, 18]; //this is player lives aka munchies
var levelMunchies;//remaining lives
var level = 0;
var levelPass; //check if player can move to the next level
var correctAttempts;
var totalAttempts;
var firstClickDone;
var cardsMatched;
var cardPrevFirst; //use this to save previous cards clicked
var cardPrevSecond; //use this to save previous cards clicked
var passedInitialClick = false;
var cardsFlippedToHide = false;//use this to prevent double execution of flipCardsToHide
var timeoutFlipCards; //use this var to stop timeout with clearTimeout(time)
var startGameHasLoaded; //this will be used to stop startGame() from loading multiple times
var assignedAcard = [];

//stars for level rating
var stars =["resources/images/stars/stars-0.png",
            "resources/images/stars/stars-1.png",
            "resources/images/stars/stars-2.png",
            "resources/images/stars/stars-3.png",
            ];

//use these cupcakes to compare with
var cupcakeCardsBWMain = [
                          "resources/images/cupcakes/card-bw-0.png",
                          "resources/images/cupcakes/card-bw-1.png",
                          "resources/images/cupcakes/card-bw-2.png",
                          "resources/images/cupcakes/card-bw-3.png",
                          "resources/images/cupcakes/card-bw-4.png",
                          "resources/images/cupcakes/card-bw-5.png",
                          "resources/images/cupcakes/card-bw-6.png",
                          "resources/images/cupcakes/card-bw-7.png",
                          ];

//use these cupcakes for the cards
var cupcakeCardsBW = ["resources/images/cupcakes/card-bw-0.png",
                      "resources/images/cupcakes/card-bw-1.png",
                      "resources/images/cupcakes/card-bw-2.png",
                      "resources/images/cupcakes/card-bw-3.png",
                      "resources/images/cupcakes/card-bw-4.png",
                      "resources/images/cupcakes/card-bw-5.png",
                      "resources/images/cupcakes/card-bw-6.png",
                      "resources/images/cupcakes/card-bw-7.png",
                      "resources/images/cupcakes/card-bw-0.png",
                      "resources/images/cupcakes/card-bw-1.png",
                      "resources/images/cupcakes/card-bw-2.png",
                      "resources/images/cupcakes/card-bw-3.png",
                      "resources/images/cupcakes/card-bw-4.png",
                      "resources/images/cupcakes/card-bw-5.png",
                      "resources/images/cupcakes/card-bw-6.png",
                      "resources/images/cupcakes/card-bw-7.png",
                      ];
//use these cupcakes for matched cards
var cupcakeCardsColored = ["resources/images/cupcakes/card-colored-0.png",
                          "resources/images/cupcakes/card-colored-1.png",
                          "resources/images/cupcakes/card-colored-2.png",
                          "resources/images/cupcakes/card-colored-3.png",
                          "resources/images/cupcakes/card-colored-4.png",
                          "resources/images/cupcakes/card-colored-5.png",
                          "resources/images/cupcakes/card-colored-6.png",
                          "resources/images/cupcakes/card-colored-7.png",
                          ];

//store shuffled deck here
var shuffledCards = [];


// level objects
var dataLevel = {
  score : 0 ,
  totalAttempts : 0,
  correctAttempts: 0,
}

  // style playername input box
  $("input").on("focus", function(){
    $("#maxChar").text($maxChar);
    $(this).attr("placeholder", '').css({"background-color": "#FFFFFF"}).attr('maxlength',$maxChar);
    //store the $maxChar value as a fixed value
    var $maxCharFixed = $maxChar;
    $(this).keyup("slow", function(){
      $(".player-btn1").removeAttr("disabled").removeClass(".player-button-style").addClass("main-button-style").css("opacity", "1");
      $playerName = $(this).val();
      if($maxChar > 0){
        //decrement remaining character count based on input length
        $maxChar = $maxCharFixed - $playerName.length;
        $("#maxChar").text($maxChar);
      }
      else {
        //if character is 0, stop decrementing on keyup
        $maxChar = 0;
      }
    });
  });

//move to level 1 intro
  var getPlayerName = function(){
    levelPass = true;
    $playerName = $("#get-player-name input").val();
    $(".player-name-display").text($playerName);
    levelLoader();
  }

  //invoke getPlayerName if button is clicked
  $(".player-btn1").on("click", getPlayerName);
  //invoke getPlayerName if enter key is pressed
  $("#get-player-name").keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        getPlayerName();
    }
});

// Start Game ====================

var levelMessage; //set the levelMessage to display
var levelLoader = function(){
  if(levelPass){
    level +=1;
  }
  levelMunchies = munchies[level-1];
  // alert("level: " + level);
  //clear all messages before loading the next level;
  hideMessages();
  if(level==1){
    levelMessage = $("#level1-msg-intro");
  }
  else if(level==2){

    levelMessage = $("#level2-msg-intro");
  }
  else if(level==3){
    levelMessage = $("#level3-msg-intro");
  }
  else{
    levelMessage = $("#level-msg-complete-game");
  }
    $(".level-munchies").text(levelMunchies);
    levelMessage.removeClass("hide");
    levelMessage.on("click", "button", loadGame);
    levelMessage.keypress(function(event){
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(keycode == '13'){
          loadGame();
      }
  });
}



function loadGame(){
  $(".level-munchies").text("");
  loadGameboarCanvas($("#messages"), levelMessage, $("#gameboard"));
  startGameHasLoaded = false;//This is intended to keep startGame() from loading multiple times.
  startGame();
}


  // go to the next page upon button click
  function nextPage(x, y){
    x.addClass("hide");//hide
    y.removeClass("hide");// show element
  }

  function loadGameboarCanvas(x, y, z){
    x.addClass("hide");//hide outer canvas
    y.addClass("hide");// hide element
    z.removeClass("hide");// show element
  }
var loadCount = 0;//check how many times startGame() loads
  // shuffle cards
function startGame(){
    //startGameHasLoaded condition is not working
    if(startGameHasLoaded == false){
      startGameHasLoaded = true;
      removeStars();
      resetCards();
      resetAllData();
      shuffledCards = shuffle(cupcakeCardsBW);
      updateDisplayData();
      assignCards();
      loadCount +=1;
      // alert("Loadcount: " + loadCount);
    }
    clickedCard();
  }

  //This removes all card images including the back of card
  function resetCards(){
    // alert("card being reset");
    $(".card-container-inner").children("img").remove();
  }

  function resetAllData(){
    passedInitialClick = false;
    firstClickDone = false;
    disableClick = false;
    levelMaxPoints = maxPoints[level-1];
    correctAttempts = 0;
    totalAttempts = 0;
    levelScore = 0;
    cardPrevFirst = undefined; //clear previous cards
    cardPrevSecond = undefined; //clear previous cards
    //render the number of munchies images for this level
    assignedAcard = [
      false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false,
    ];
    clearMunchies();
    loadMunchies();
  }

  // shuffle cards
  function shuffle(o) {
  	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  	return o;
  };


//assign cards by getting the image source and assigning matching data-cardNumber
function assignCards(){
  for(var i = 0; i < 16; i++){
    var image = $("<img>");
    image.attr({"src" : "resources/images/cupcakes/card-back.jpg", "id" : "card-" + i, "alt" : "card", "data-cardPosition": i});
    $("#card-container-" + i).append(image);
  }
  // var matchCount = 0; //test the number of pairs
  // alert("start assign cards");
  for(var i = 0; i < shuffledCards.length; i++){
    for(var j = 0; j < cupcakeCardsBWMain.length; j++) {
      if(shuffledCards[i] == cupcakeCardsBWMain[j]){
        // matchCount = matchCount + 1;
        // alert("i: " + shuffledCards[i] + " J: " + cupcakeCardsBW[j] + " count: " + matchCount);
        $("#card-" + i).attr("data-cardNumber", j);
        break;
      }
    }
  }
}//end function

// identify clicked cards
function clickedCard(){
  var firstCard;
  var firstCardData;
  var secondCard;
  var secondCardData;
  var clicks = 0;
  $("img").click(function() {
    // alert("disableClick: " + disableClick);
    if(!disableClick){
      if(firstClickDone == false){

        // alert("click1");
        //flip back if previous cards do not matchCount
        if(cardsMatched == false && passedInitialClick == true){
          //add here if an opened card is clicked again hide the other card
          cardsFlippedToHide = true; //subtituted with clearTimeout
          clearTimeout(timeoutFlipCards);
          flipCardsToHide();
        }
        firstClickDone = true;
        //open new card
        firstCard = $(this);
        firstCardData = $(this).attr("data-cardNumber");
        checkCardsIfPresent(firstCard, firstCardData);
        // alert("end of first click");
      }
      else {
        // alert("click2");
        passedInitialClick = true;
        totalAttempts += 1;
        cardsFlippedToHide = false;
        firstClickDone = false;
        secondCard = $(this);
        secondCardData = $(this).attr("data-cardNumber");
        //test if card is present
        checkCardsIfPresent(secondCard, secondCardData);
        checkMatch(firstCardData, secondCardData, firstCard, secondCard);

      }
    }
  }); //click ends
}

function checkCardsIfPresent(card, cardData){
  var cardPosition = card.attr("data-cardPosition");
  // alert("cardPosition: " + cardPosition);
  if(assignedAcard[cardPosition] == false){
    // alert("cards not present");
    getBWcard(card, cardData);
  }
  //error is steming from this... card is not showing on click because of this..
  //why is this loading if above is false?
  else {
      card.addClass("hide");
      card.next().next().removeClass("hide");
      // alert("cards are present");
  }
}

//if card is not yet present load getBWcard() function
function getBWcard(card, cardData){
  var imageBW = $("<img>");
  var imageColored = $("<img>");
  // alert("lets get bw image");
  for(var i=0; i<cupcakeCardsBWMain.length; i++){
    if(cardData == i){
      imageBW.attr("src", cupcakeCardsBWMain[i]).attr({"data-cardNumber" : i, "data-cardType" : "img-bw"});
      imageColored.attr("src", cupcakeCardsColored[i]).attr({"data-cardNumber" : i, "data-cardType" : "img-colored"}).addClass("hide");
      card.after(imageBW);
      card.addClass("hide");
      card.after(imageColored);
      var cardPosition = card.attr("data-cardPosition");
      assignedAcard[cardPosition] = true;
      // alert("assignedAcard[" + cardPosition + "]: " + assignedAcard);
      break;
    }
  }
}

function checkMatch(firstData, secondData, firstCard, secondCard){
  if(firstData == secondData) {
    cardsMatched=true;
    //display colored cards
    firstCard.next().next().addClass("hide");
    firstCard.next().removeClass("hide");
    firstCard.parent().addClass("rubberBand");
    secondCard.next().next().addClass("hide");
    secondCard.next().removeClass(" hide");
    secondCard.parent().addClass("rubberBand");
    checkLevelComplete(firstCard, secondCard);
  }
  else{
    cardsMatched = false;
    firstCard.parent().addClass("tada");
    secondCard.parent().addClass("tada");
    //assign first and second to a new variable to make way for new cards
    cardPrevFirst = firstCard;
    cardPrevSecond = secondCard;
    if(cardsFlippedToHide==false){
      var timeoutTada = setTimeout(removeTada, 1000);
      timeoutFlipCards = setTimeout(flipCardsToHide, 2000);
      updateLevelMunchies();
    }
  } //end else
  updateDisplayData();
  //remove the class tada to parent containers of cards
function removeTada(){
  firstCard.parent().removeClass("tada");
  secondCard.parent().removeClass("tada");
  }
}//end of checkMatch()




//hide unmatched cards
function flipCardsToHide(){
    cardPrevFirst.removeClass("hide");
    cardPrevSecond.removeClass("hide");
    cardPrevFirst.next().next().addClass("hide");
    cardPrevSecond.next().next().addClass("hide");
    cardsFlippedToHide = true;
}

function checkLevelComplete(firstCard, secondCard){
  var timeoutRubberBand = setTimeout(rubberBandRemove, 1000);
  function rubberBandRemove(){
    firstCard.parent().removeClass("rubberBand");
    secondCard.parent().removeClass("rubberBand");
  }

  correctAttempts += 1;
  //check if player wins the level
  if (correctAttempts >= 8){
    disableClick = true;
    levelPass = true;
    var timeOutLevelComplete = setTimeout(changeGameboardToMessageCanvas, 1200);
}
else {
  if(level == 2){
    var timeoutAnimateCardsOuter = setTimeout(animateCardsOuter, 1000);
  }
  else if (level ==3) {
    var timeoutAnimateCardsOuter = setTimeout(animateCardsOuter, 1000);
    var timeoutAnimateCardsInner = setTimeout(animateCardsInner, 1500);
  }
}

  updateDisplayData();

} //end checkLevelComplete()

//revise this
function changeGameboardToMessageCanvas(){
  $("#messages").removeClass("hide");
  $("#gameboard").addClass("hide");
  loadMessage();
}

function loadMessage(){
  //win the level
  if(correctAttempts >= 8){
    $("#level-msg-win").removeClass("hide");
    displayTotalScore();
  }
  //lose the level
  else{
    $("#level-msg-lose").removeClass("hide");
    // levelFailed();
  }
}





//=========================Look at this!=====================================

//event handlers for goToLevelLoader
$("#level-restart-btn, #next-level-btn").on("click", levelLoader); //clicking the button will load levelFailed
//pressing enter will load levelFailed
$("#level-msg-win, #level-msg-lose").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
      // goToLevelLoader();
      levelLoader();
  }
});

//try to hide canvasses
function hideMessages(){
  $("#get-player-name").addClass("hide");
  $("#level1-msg-intro").addClass("hide");
  $("#level2-msg-intro").addClass("hide");
  $("#level3-msg-intro").addClass("hide");
  $("#level-msg-lose").addClass("hide");
  $("#level-msg-win").addClass("hide");
  $("#level-msg-complete-game").addClass("hide");

}

// store last level data
function saveLevelData(){

}

function clearMunchies(){
  $(".munchies-outer-container").children("img").remove();
  //remove all munchies from canvas
}

function updateLevelMunchies(){
  if(levelMunchies>0){
    levelMunchies -=1;
    if(levelMunchies<=0){
      levelPass=false;
      disableClick = true;
      levelMunchies = 0;
      $(".munchies-outer-container").addClass("hide");
      var changeBoardTimeout = setTimeout(changeGameboardToMessageCanvas, 1200);
    }
    $(".munchies-outer-container img:last-child").remove();

  }
}

//load munchies images
function loadMunchies(){
  // levelMunchies = munchies[level-1];
  // alert("Munchies: " + levelMunchies);
  $(".munchies-outer-container").removeClass("hide");
  var counter = levelMunchies;
  while(counter > 0){
    /*var image and image.attr has to be nested within the while
    to create multiple instances*/
    var image = $("<img>");
    image.attr("src", "resources/images/icons/munchies.png").addClass("munchies");
    $(".munchies-outer-container").append(image);
    counter -=1;
  }
}

// update right canvas
function updateDisplayData(){
  $(".level-number").text(level);
  $("#correct-attempts").text(correctAttempts);
  $("#total-attempts").text(totalAttempts);
  $("#munchies-left").text(levelMunchies);

  //Get Total Score to Display
}

function displayTotalScore(){
  var correctPercentage = levelMunchies/munchies[level-1];
  levelScore = Math.round(correctPercentage * levelMaxPoints);
  totalPlayerScore = totalPlayerScore + levelScore;
  //add comma to numbers
  var totalScoreForDisplay = totalPlayerScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  $(".total-score").text(totalScoreForDisplay).addClass("bounceIn");
  var levelScoreDisplay = levelScore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  $("#level-score").text(levelScoreDisplay);
  displayStar(correctPercentage);
}

function displayStar(percentage){
  //The number of stars to display is dependent on the remaining munchies / total available munchies
  var starsToDisplay;
  if(percentage >= 0.50){
    starsToDisplay = stars[3];
  }
  else if (percentage >= 0.40) {
    starsToDisplay = stars[2];
  }
  else if (percentage >= 0.20) {
    starsToDisplay = stars[1];
  }
  else{
    starsToDisplay = stars[0];
  }
  $("#stars-image-small").attr("src", starsToDisplay).removeClass("hide").addClass("bounceIn");
  $("#stars-image-large").attr("src", starsToDisplay).removeClass("hide").addClass("bounceIn");
}

function removeStars(){
  $("#stars-image-small").attr("src", "").addClass("hide");
}
// animate outer cards clockwise
function animateCardsOuter(){
  // alert("animate outer cards");
  $(".card-container-outer-1").prepend($("#card-container-0"));
  $(".card-container-outer-2").prepend($("#card-container-1"));
  $(".card-container-outer-3").prepend($("#card-container-2"));
  $(".card-container-outer-7").prepend($("#card-container-3"));
  $(".card-container-outer-11").prepend($("#card-container-7"));
  $(".card-container-outer-15").prepend($("#card-container-11"));
  $(".card-container-outer-14").prepend($("#card-container-15"));
  $(".card-container-outer-13").prepend($("#card-container-14"));
  $(".card-container-outer-12").prepend($("#card-container-13"));
  $(".card-container-outer-8").prepend($("#card-container-12"));
  $(".card-container-outer-4").prepend($("#card-container-8"));
  $(".card-container-outer-0").prepend($("#card-container-4"));

  for(i = 0; i < 16; i++){
    if(i == 1 || i == 2 || i == 3 || i == 7 || i == 11 || i == 15 ||
        i == 14 || i == 13 || i == 12 || i == 8 || i == 4 || i == 0 ){
          $(".card-container-outer-"+ i +" .card-container-inner").attr("id", "card-container-" + i);
        }
  }
  //============== tried this for outer cards but 4 and 8 are not appending ===============
  // I WILL APPRECIATE IF SOMEONE CAN EXPLAIN TO ME WHAT'S GOING ON AND HOW TO FIX IT

  // for(i = 0; i < 16; i++){
  //   var j;
  //   //move top row right
  //   if(i == 1 || i == 2 || i == 3){
  //     j = i - 1;
  //   }
  //   //move right column down
  //   else if(i == 7 || i == 11 || i == 15) {
  //     j = i - 4;
  //   }
  //   //move bottom row left
  //   else if(i == 14 || i == 13 || i == 12) {
  //     j = i + 1;
  //   }
  //   else if(i == 8 || i == 4 || i ==0){
  //     j = i + 4;
  //   }
  //   //move inner cards
  //   $(".card-container-outer-" + i).append($("#card-container-" + j));
  //   //rename inner card-container ID to match outer container ID
  //   // $(".card-container-outer-" + i + "#card-container-" + j ).attr("id", "#card-container-" + i);
  // }

} //end animate outer cards




// animate innercards counter clockwise
function animateCardsInner(){
  //rotate innercards counter-clockwise for each matched cards
  $(".card-container-outer-5").prepend($("#card-container-6"));
  $(".card-container-outer-6").prepend($("#card-container-10"));
  $(".card-container-outer-10").prepend($("#card-container-9"));
  $(".card-container-outer-9").prepend($("#card-container-5"));

  //change id of #card-container
  for(i = 0; i < 16; i++){
    if(i == 5 || i == 6 || i == 10 || i == 9){
          $(".card-container-outer-"+ i +" .card-container-inner").attr("id", "card-container-" + i);
        }
    }
}

//restart level

$("#game-restart-btn").on("click", restartGame); //clicking the button will load levelFailed
//pressing enter will load levelFailed
$("#level-msg-complete").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
      // goToLevelLoader();
      restartGame();
  }
});

function restartGame(){
  level = 0;
  levelPass = true;
  totalPlayerScore = 0;
  levelLoader();
}

}); //end script
