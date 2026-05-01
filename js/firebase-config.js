const firebaseConfig = {
  apiKey: "AIzaSyC2XCtphVOeLYLot7hNmcg2tdsyCvkgyIE",
  authDomain: "helloprifirebase.firebaseapp.com",
  databaseURL: "https://helloprifirebase-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "helloprifirebase",
  storageBucket: "helloprifirebase.firebasestorage.app",
  messagingSenderId: "424429517594",
  appId: "1:424429517594:web:9667fa35b1d87eeafe4aa3",
  measurementId: "G-GELG7GLBP4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
