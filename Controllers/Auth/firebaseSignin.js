const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { initializeApp } = require("firebase/app");

//not used by app, created for getting auth token temporarily
const signinWithFirebase = async (req, res) => {
    const firebaseConfig = {
        apiKey: "AIzaSyBdppX8xWao2sNFCVMbwLMjt4TUQVpphAg",
        authDomain: "dev-passenger.firebaseapp.com",
        projectId: "dev-passenger",
        storageBucket: "dev-passenger.appspot.com",
        messagingSenderId: "756544806467",
        appId: "1:756544806467:web:9302082066085d443cbef6",
        measurementId: "G-RX5QD1ZLBZ"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const { email, password } = req.body;
    console.log(email);

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return res.send(user);
        }).catch((error) => {
            console.log("Catch");
            console.log(error);

        })
}
module.exports = { signinWithFirebase }