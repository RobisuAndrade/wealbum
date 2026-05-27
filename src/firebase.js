// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // IMPORTANTE: Adicione esta linha

const firebaseConfig = {
  apiKey: "AIzaSyAdcOG88cJW3DO5OtjOzKrrEJMjRg4vMWs",
  authDomain: "we-album.firebaseapp.com",
  databaseURL: "https://we-album-default-rtdb.firebaseio.com",
  projectId: "we-album",
  storageBucket: "we-album.firebasestorage.app",
  messagingSenderId: "396719409653",
  appId: "1:396719409653:web:849db5110ac0e5600e78bc",
  measurementId: "G-52J65SHWJ1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// EXPORTANDO O BANCO DE DADOS
export const db = getFirestore(app);