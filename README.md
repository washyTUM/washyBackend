# washyBackend

This is the Backend for the washy scheduling system for washing machines.
It's a basic NodeJS instance running Aeolus as a web framework.

## Usage

To run this server locally you'll need to have NodeJS and npm installed and run:

```Bash
$ npm install
$ npm start
```

## Running In Docker

This repo includes a Dockerfile. To run this inside docker simply use:

```Bash
$ docker build -t washybackend .
$ docker run -p 8080:8080 washybackend
```

## MongoDB

All the information required to connect to the database should be editable in *dburl.js* and can be changed to any other MongoDB instance.

To run a MongoDB instance in Docker we recommend:

```Bash
$ docker run -p 27017:27017 -d mongo
```

## API

Here is a simplified API reference

### GET

#### /HelloWorld

returns "Hello" to confirms the server is running.

#### /user?{number|facebook|telegram}={id}

returns the object of a user corresponding any of the given services.

#### /times/{day-string}

returns all the possible timeslots for a given day

#### /conversation/{id}/state

returns all the state information stored by a bot conversation

### POST

#### /reserve/{start-date}

will reserve a Machine with the start-date for 2 hours.
If succesfull it will return the machine. If not it will return false.

#### /room/{id}/machine

Will add a machine to the room with the given id.

#### /room/{id}/identify?url={url}

Will check if the person in the image in the url has a reserved machine in the room with the given ID.
If that's the case it will return the name of the person. If not it will give a reason for failing.

#### /user/pic?{number|facebook|telegram}={id}&url={url}

Will reference the picture in url to the user and train the Faces API.

#### /users?name={name}&number={number}&[{facebook|telegram}={id}]

Will create a user with the name and the phone number and reference them to any other given service id's.

### PUT

#### /conversation/{id}/state?[date={date}|user={user}|state={state}]

Will store the date and or user and or state information to the state object for persistency in the Bot. It will only override the given attributes and none more.

#### /user/{number}?{facebook|telegram}={id}

Will associate any external service id to the user with the number number.
