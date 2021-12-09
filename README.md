# DistributedPlayerManagementSystem

Through this project we intend to digitize and simplify the ways in which cricket players’ statistics are analyzed and maintained. The major objective of this application is to minimize the cumbersome process that usually takes place while analyzing and maintaining the stats. This reduces the hard manual paperwork and makes the process trouble free.
The project contains a vast database with a few Collections. One Collection holds the information about the players (Name, player id, region), the second table holds the statistics of the player (matches, innings, runs, highest score, average, 50’s, 100’s, wickets, economy, strike rate), the third table holds the information about players’ personal details (date of birth, age, birth place).

---
## System Features
- ### Stats man dashboard:
        - Take notes in the app in form of mini microblogging
        - Continuously keep track of the cricket player & match statistics
        - Make schedule of the matches

- ### Selection Committe dashboard
        - Access to players personal information (mobile number, email, etc.)
        - View access to cricket player & match stats
        - View access of the cricket schedule

- ### Enthusiast dashboard
        - View access to cricket player & match stats
        - View access of the cricket schedule

---
## Requirements

For development, you will only need Node.js installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v12.21.0

    $ npm --version
    8.0.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

---

## Install

    $ git clone https://github.com/Nuthi-Sriram/DistributedPlayerManagementSystem.git
    $ cd DistributedPlayerManagementSystem
    $ npm install
    


## Running the Application

    $ nodemon start
