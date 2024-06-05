// window.onload = () => {
    console.log("Script Injected");
    
    //CREATE BUTTONS and set their attributes
    var startButton = document.createElement('button');
    startButton.textContent = "<";
    startButton.id = "startButton";
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
    //append instances of our new buttons to the page
    AppendAdditions();
    //find those instances we just created
    var startButtonInstance = document.getElementById("startButton");
    var pauseButtonInstance = document.getElementById("pauseButton");
    var stopButtonInstance = document.getElementById("stopButton");
    var timerDisplayInstance = document.getElementById("timerDisplay");
    var sec = 0;
    var min = 0;
    var hour = 0;
    var day = 0;
    var secString = "00";
    var minString = "00";
    var hourString = "00";
    var dayString = "00";
    var timer;
    var isTimerActive = 0;
    function startTimer(){
        isTimerActive = 1;
        //DD:HH:MM:SS
        timer = setInterval(function(){
            sec +=1;
            console.log('Second: ' + sec);
            
            if (sec >= 60)
            {
                min += 1;
                sec -= 60;
            }
            secString = sec;
            if (sec < 10)
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
            timerDisplayInstance.textContent = dayString + ":" + hourString + ':' + minString + ':' + secString;
        }, 1000);
    }
    function StopTimer()
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
        
    }); 
    pauseButtonInstance.addEventListener('click',function ()
    {
        console.log("PAUSE Button Clicked");
        StopTimer();
    }); 
    stopButtonInstance.addEventListener('click',function ()
    {
        console.log("STOP Button Clicked");
        sec = 0;
        min = 0;
        hour = 0;
        timerDisplayInstance.textContent = "00:00:00:00";
        StopTimer();
    });
    function AppendAdditions()
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