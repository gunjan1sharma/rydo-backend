var admin = require("firebase-admin");
var serviceAccountDriver = require("../Config/dev-driver-8dfb0-firebase-adminsdk-49l20-6bf1bc9ed7.json");
var serviceAccountPassenger = require("../Config/dev-passenger-firebase-adminsdk-nvrgt-6c157d8d49.json");




const firebaseConfig = (flag) => {
    console.log("flag");
    console.log(flag);
    if (flag == 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountDriver),
        });
        // const driver = admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccountDriver),
        // }, 'driver');
        

    } else if (flag == 1) {

        // admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccountPassenger),
        // });
        const passenger = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPassenger),
         
        }, 'user');

}
}
// var admin = require("firebase-admin");

// var serviceAccount = require("./ride-hailing.json");


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// })

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccountPassenger),
// }, 'user');
// const driver = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccountDriver),
// },);


module.exports ={firebaseConfig}