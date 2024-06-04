// This javascript will affect the index page
function onButtonClick() {
    timer()
}
function timer(){
    var sec = 0;
    var min = 0;
    var secString;
    var minString;
    var timer = setInterval(function(){
        
        sec++;
        while (sec > 60)
        {
            sec - 60
            min + 1
        }
        if (min < 10)
        {
            minString = "0" + min
        }
        if (sec < 10)
        {
            secString = "0" + sec
        }
        document.getElementById('timerDisplay').innerHTML= minString + ':' + secString;
        if (sec < 0) {
            clearInterval(timer);
        }
    }, 1000);
}