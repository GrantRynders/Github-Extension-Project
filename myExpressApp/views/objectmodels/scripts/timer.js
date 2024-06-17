async function ModelData()
{
    const data = await GetData();
    var destinationDiv = document.getElementsByTagName("body")[0];
    for (const key in data)
    {
        var objectLink = document.createElement("a");
        objectLink.textContent(key + ": " + obj[key]);
        if (key = "id")
        {
            objectLink.href("http://localhost:5220/timermodel/" + obj[key]);
        }
        destinationDiv.appendChild(objectLink);
    }
}
async function GetData()
{
    const returnData = await fetch("http://localhost:5220/timer", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer",
    })
    .catch( function() {
            console.log("Unable to fetch timers");
    });
    return returnData;
}
