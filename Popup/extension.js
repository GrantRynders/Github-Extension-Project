// window.onload = () => {
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
    var isTimerActive = 0; //Essentially a bool for timer activity
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
            if (min >= 60)
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
        if (isTimerActive == 0)
        {
            startTimer();
        }
        LogTime();
    }); 
    pauseButtonInstance.addEventListener('click',function ()
    {
        console.log("PAUSE Button Clicked");
        if (isTimerActive == 1)
        {
            StopTimer();
            LogEndOfTimer();
        }
    }); 
    stopButtonInstance.addEventListener('click',function ()
    {
        console.log("STOP Button Clicked");
        if (isTimerActive == 1)
        {
            ResetTimerValues();
            StopTimer();
            LogEndOfTimer();
        }
    });
    function AppendAdditions() //Append new elements to the destination for the extension
    {
        if (destinationDiv != null)
        {
            destinationDiv.appendChild(timerDisplay);
            destinationDiv.appendChild(startButton);
            //startButton.appendChild(startIcon);
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
            textArea.textContent = "Timer Start: " + totalTimeString; //Set the comment's text value
            console.log(totalTimeString);
            commentButton.disabled = false;
            console.log("Disabled");
            commentButton.click();
            console.log("Clicked");
        }
        else 
        {
            console.log("Comment Button is null");
        }
        //
    }
    function LogEndOfTimer()
    {
        console.log(commentParent.tagName);
        console.log(commentParent.querySelectorAll(".btn-primary btn").tagName);
        if (commentButton != null)
        {
            textArea.textContent = "Timer Stopped at: " + totalTimeString;
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
        sec = 0;
        min = 0;
        hour = 0;
        secString = "00";
        minString = "00";
        hourString = "00";
        dayString = "00";
        timerDisplayInstance.textContent = "00:00:00:00";
    }
    // "web_accessible_resources": [
    //     {
    //       "resources": ["Popup/Images/*"],
    //       "matches": ["https://github.com/*/*/issues/*"]
    //     }
    //   ]