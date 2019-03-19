import firebase from "firebase";
let database;

export const init = () => {
    let config = {
        apiKey: "AIzaSyAxAIAw4fT25bJMPtXGys8glzFCI2ZYoNE",
        authDomain: "space-invaders-58004.firebaseapp.com",
        databaseURL: "https://space-invaders-58004.firebaseio.com",
        projectId: "space-invaders-58004",
        storageBucket: "space-invaders-58004.appspot.com",
        messagingSenderId: "75205087127"
    };
    firebase.initializeApp(config);
    database = firebase.database();
};

export const getHighScores = () => {
    return new Promise(resolve => {
        database
            .ref()
            .once("value")
            .then(snapshot => {
                resolve(snapshot.val());
            });
    });
};

export const addScore = (user, points) => {
    return new Promise(resolve => {
        database.ref().push({
            points: points,
            user: user
        });
        resolve();
    });
};
