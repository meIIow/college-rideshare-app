Project by: Joey Button, Robert Bracken, Hanna Nowicki, Jack Desmarias, Mohamed Houtti, Andrew Hwang, Marisa Dreher, David Cromwell, Max White

Initial ReadMe Below
------------------------------------------------------------------------

This is the ReadMe for Developers of NUbeRC

Currently, to run locally navigate to desired location then:

~~git clone http://cliff.cs.middlebury.edu/jbutton/NUbeRC.git~~

    git clone https://gitlab.com/jbutton/rideShare.git
    cd NUbeRC/src/NUbeRC/
    npm start

Then you can Navigate to http://localhost:3000/ in browser, this will immediately display the page from public/index.html as the home page.


Download Mongodb and start the app on your computer:

  For Macs:

    sudo chown *username* /usr/local
    brew update
    brew install mongodb
    mongod --dbpath *path to NUbeRC/userData*

  For PC:

    Look it up


Once Mongodb is started, go look at http://localhost:3000/userlist
All the developers should already be in the database, and are currently displayed here. Go look at NUbeRC/views/userlist.jade to see where this is generated. Using jade will be super helpful for us to construct our front end, auto generating html for us.
