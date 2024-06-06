    
    //SCRIPT TO BE INJECTED INTO https://github.com/*/*/issues/*
    
    console.log("Script Injected");
    //CREATE BUTTONS and set their attributes
    var startButton = document.createElement('button');
    startButton.textContent = "\u25B6"; //Unicode play button
    startButton.id = "startButton";
    //var startIcon = document.createElement("img");
    //startIcon.src = "Images/play-button.png";
    var pauseButton = document.createElement('button');
    pauseButton.textContent = "| |";
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
    var sec = 0;//Is always gonna be reset after 60
    var min = 0;
    var hour = 0;
    var day = 0;
    var totalSeconds = 0;//The total second count of the entire timer which we can store to convert and do equations with later
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
    //Dates to save
    var lastDate;
    var currentDate;
    InitializeTimer();
    //On initialize
    function InitializeTimer()
    {
        console.log("Initialize timer called")
        GetLocalStorage() //Get our local storage values if there are any, making sure nothing is null
        if (sec == null)
        {
            sec = 0;//Make sure seconds is valid
        }
        ConvertTimeToFormat(); //converts the seconds to a formatted string
        timerDisplayInstance.textContent = totalTimeString; //sets the timer display
        if (isTimerActive == 1) //If the timer was still going when the page was reloaded then restart it
        {
            console.log("Timer was active before reset");
            if (lastDate != null)
            {
                currentDate = Date();//gets current date
                console.log("Seconds before date difference: " + sec);
                console.log("Current Date: " + currentDate);
                console.log("Last date: " + lastDate);
                sec += Math.round((new Date(currentDate).getTime() - new Date(lastDate).getTime()) /1000); //We need to find how long this timer has been on for between when the user closed/reloaded the browser and now and add it to the timer
                console.log("New seconds after date difference: " + sec)
                if (sec < 0 || sec == null) //make sure the seconds variable is good
                {
                    sec = 0;
                }
            }
            else
            {
                console.log("Start Date for continuing timer is null")
            }
            startTimer()
        }
    }

    function startTimer(){ //Starts the set interval function if timer is not already started
        isTimerActive = 1;
        //DD:HH:MM:SS
        timer = setInterval(function(){
            sec +=1;
            totalSeconds +=1;
            localStorage.setItem("LastDate", Date());
            localStorage.setItem("CurrentTime", totalSeconds);
            localStorage.setItem("isTimerActive", 1);
            console.log('Second: ' + totalSeconds);
            ConvertTimeToFormat();//Converts our time variables into a formatted string
            timerDisplayInstance.textContent = totalTimeString; //Set the timer's display to our formatted time string
        }, 1000);
    }
    function ConvertTimeToFormat()
    {
            while (sec >= 60) //Convert Seconds to minutes
            {
                min += 1;
                sec -= 60;
            }
            secString = sec;
            if (sec < 10) //Format the string if there would be a leading 0 on the display, e.g. "05:03"
            {
                secString = "0" +sec;
            }
            while (min >= 60) //and so on and so forth
            {
                hour += 1;
                min -= 60;
            }
            minString = min
            if (min < 10)
            {
                minString = "0" + min;
            }
            while (hour >= 24)
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
    }
    function StopTimer() //Stops the interval func
    {
        isTimerActive = 0;
        localStorage.setItem("isTimerActive", 0);
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
            isTimerPaused = 1;
            localStorage.setItem("isTimerPaused", 1);
            StopTimer();
            LogEndOfTimer();
        }
    });
    stopButtonInstance.addEventListener('click',function ()
    {
        console.log("STOP Button Clicked");
        LogEndOfTimer(); //Create a comment detailing end timer stats
        StopTimer();
        ResetTimerValues();//Reset the timer
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
    }
    function ResetTimerValues()
    {
        //Resets everything to nothing
        totalSeconds +=1;
        sec = 0;
        min = 0;
        hour = 0;
        secString = "00";
        minString = "00";
        hourString = "00";
        dayString = "00";
        timerDisplayInstance.textContent = "00:00:00:00";
        ResetLocalStorage();
    }
    function GetLocalStorage() //checks records if they are null, sets their respective values in the code
    {
        console.log("Set Local Storage");
        if (localStorage.getItem("CurrentTime") != null)//Checks the record
        {
            sec = localStorage.getItem("CurrentTime"); //Set the seconds to the total seconds elapsed before the stop
            console.log("Local CurrentTime: " + sec);
        }
        else
        {
            localStorage.setItem("CurrentTime", 0); //Should always be a nonnullvalue
            sec = 0;
            console.log("Current time equals null, uh oh, reseting");
        }
        if (localStorage.getItem("isTimerPaused") != null)
        {
            isTimerPaused = localStorage.getItem("isTimerPaused");
            console.log("Local IsTimerPaused: " + isTimerPaused);
        }
        else
        {
            isTimerPaused = localStorage.setItem("isTimerPaused", 0);
            isTimerPaused = 0;
        }
        if (localStorage.getItem("isTimerActive") != null)
        {
            isTimerActive = localStorage.getItem("isTimerActive");
            console.log("Local IsTimerActive: " + isTimerActive);
        }
        else
        {
            isTimerActive = localStorage.setItem("isTimerActive", 0);
            isTimerActive = 0;
        }
        if (localStorage.getItem("LastDate") != null)
        {
            lastDate = localStorage.getItem("LastDate");
        }
        else
        {
            lastDate = Date();
            console.log("Last date does not exist");
        }

    }
    function ResetLocalStorage()
    {
        localStorage.setItem("CurrentTime", 0);//seconds
        localStorage.setItem("isTimerPaused", 0);//unpaused
        localStorage.setItem("isTimerActive", 0);//not active
        localStorage.setItem("lastDate", null);//Timer did not previously exist
    }
    //beforeunload
