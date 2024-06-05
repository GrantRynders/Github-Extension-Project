    console.log("Script Injected");
    //CREATE BUTTONS and set their attributes
    var startButton = document.createElement('button');
    startButton.textContent = "\u25B6";
    startButton.id = "startButton";
    //var startIcon = document.createElement("img");
    //startIcon.src = "Images/play-button.png";
    var pauseButton = document.createElement('button');
    pauseButton.textContent = "| |"
    pauseButton.id = "pauseButton";
    var stopButton = document.createElement('button');
    stopButton.textContent = "X";
    stopButton.id = "stopButton";
    var timerDisplay = document.createElement('h1');
    timerDisplay.textContent = "DD:HH:MM:SS";
    timerDisplay.id = "timerDisplay";
    //Find the destination for our new content
    var destinationDiv = document.getElementById("js-repo-pjax-container");
    var textArea = document.getElementById("new_comment_field");
    var commentParent = document.getElementById("partial-new-comment-form-actions");//The parent element for the comment submit button, we use it to narrow our search for the button itself
    var commentButton = commentParent.getElementsByClassName("btn-primary btn")[0];//Finds all elements of this button class which is just gonna be the button we are looking for. Despite the list only having one, you still must specify the index
    var closeIssueButton = commentParent.getElementsByClassName("js-comment-and-button js-quick-submit-alternative btn BtnGroup-item flex-1")[0]; //same song and dance as the comment button, but this time for the close issue button
    //append instances of our new buttons to the page
    AppendAdditions();
    //find those instances we just created
    var startButtonInstance = document.getElementById("startButton");
    var pauseButtonInstance = document.getElementById("pauseButton");
    var stopButtonInstance = document.getElementById("stopButton");
    var timerDisplayInstance = document.getElementById("timerDisplay");
    //Numbers for our time variables
    var sec = 0;
    var min = 0;
    var hour = 0;
    var day = 0;
    //The formatted strings for our numbers
    var secString = "00";
    var minString = "00";
    var hourString = "00";
    var dayString = "00";
    var totalTimeString = "00:00:00:00";
    
    //Our interval timer for the app
    var timer;
    var isTimerActive = 0; //Essentially a bool for if the timer is running
    var isTimerPaused = 0;//a bool for if the timer is paused (different than it not being active)
    function startTimer(){ //Starts the set interval function if timer is not already started
        isTimerActive = 1;
        //DD:HH:MM:SS
        timer = setInterval(function(){
            sec +=1;
            console.log('Second: ' + sec);
            
            if (sec >= 60) //Convert Seconds to minutes
            {
                min += 1;
                sec -= 60;
            }
            secString = sec;
            if (sec < 10) //Format the string if there would be a leading 0 on the display, e.g. "05:03"
            {
                secString = "0" +sec;
            }
            if (min >= 60) //and so on and so forth
            {
                hour += 1;
                min -= 60;
            }
            minString = min
            if (min < 10)
            {
                minString = "0" + min;
            }
            if (hour >= 24)
            {
                day += 1;
                hour -= 24;
            }
            hourString = hour;
            if (hour < 10)
            {
                hourString = "0" + hour;
            }
            if (day >= 99)
            {
                StopTimer()
                timerDisplayInstance.textContent("Max Value Reached");
            }
            dayString = day;
            if (day < 10)
            {
                dayString = "0" + day;
            }
            //totalTimeString stores the formatted time for use all over the app
            totalTimeString = dayString + ":" + hourString + ':' + minString + ':' + secString;
            timerDisplayInstance.textContent = totalTimeString;
        }, 1000);
    }
    function StopTimer() //Stops the interval func
    {
        isTimerActive = 0;
        clearInterval(timer);
    }
    startButtonInstance.addEventListener('click',function ()
    {
        console.log("Start Button Clicked");
        if (isTimerActive == 0) //Can't start a timer that is already started
        {
            startTimer();
        }
        LogTime();
    }); 
    pauseButtonInstance.addEventListener('click',function ()
    {
        console.log("PAUSE Button Clicked");
        if (isTimerActive == 1 && isTimerPaused == 0) //You should not be able to pause when it is already paused
        {
            StopTimer();
            LogEndOfTimer();
        }
    }); 
    stopButtonInstance.addEventListener('click',function ()
    {
        console.log("STOP Button Clicked");
        LogEndOfTimer();
        StopTimer();
        ResetTimerValues();
    });
    if (closeIssueButton != null)
    {
        closeIssueButton.addEventListener('click',function () //Potentially overrides original functionality, needs testing
        {
            console.log("CLOSE ISSUE button Clicked");
            LogEndOfTimer();
            StopTimer();
            ResetTimerValues();
        });
    }
    else
    {
        console.log("CloseIssue button is null"); //error handling
    }
    function AppendAdditions() //Append new elements to the destination for the extension
    {
        if (destinationDiv != null)
        {
            destinationDiv.appendChild(timerDisplay);
            destinationDiv.appendChild(startButton);
            destinationDiv.appendChild(pauseButton);
            destinationDiv.appendChild(stopButton);
        }
        else
        {
            console.log("Destination div is null");
        }
        
    }
    function LogTime()
    {
        console.log(commentParent.tagName); //Logs the container element for the button
        console.log(commentParent.querySelectorAll(".btn-primary btn").tagName); //logs the button class (probably undefined)
        if (commentButton != null) //Make sure comment button is not null
        {
            textArea.textContent = "Start Date: " + new Date() + "\nTimer Start Value: " + totalTimeString; //Set the comment's text value
            console.log(totalTimeString);
            commentButton.disabled = false; //The button is naturally disabled for input, we need to change that
            console.log("Disabled");
            commentButton.click(); //Click the button programmatically
            console.log("Clicked");
            window.location.reload();
        }
        else 
        {
            console.log("Comment Button is null");//uh oh where'd our button go
        }
        //
    }
    function LogEndOfTimer()
    {
        //see LogTimer()
        console.log(commentParent.tagName);
        console.log(commentParent.querySelectorAll(".btn-primary btn").tagName);
        if (commentButton != null)
        {
            textArea.textContent = "End Date: " + new Date() + "\nTimer End Value: " + totalTimeString;
            console.log(totalTimeString);
            commentButton.disabled = false;
            console.log("Disabled");
            commentButton.click();
            console.log("Clicked");
        }
        else
        {
            console.log("Comment Button is null when attempting to end timer");
        }
        //
    }
    function ResetTimerValues()
    {
        //Resets everything to nothing
        sec = 0;
        min = 0;
        hour = 0;
        secString = "00";
        minString = "00";
        hourString = "00";
        dayString = "00";
        timerDisplayInstance.textContent = "00:00:00:00";
    }