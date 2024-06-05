An extension for Github issues that allows users to manage the amount of timer spent on a given issue through a built in timer. Timer data will be written to the description of the issue, for easy tracking.

```mermaid
---
title: Database Diagram
---
classDiagram
Issues --|> Timers
Users --|> Timers 
class Issues{
    +int IssueId PK
    +VarChar(50) IssueName
}
class Users{
    +int UserId Pk
    +Varchar(50) UserName
}
class Timers{
    +int TimerId PK
    +int IssueId FK
    +int UserId FK
}

```

