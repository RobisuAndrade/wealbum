// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Adicionado para o Banco de Dados

// As credenciais do seu projeto WE-ALBUM
const firebaseConfig = {
  apiKey: "AIzaSyAdcOG88cJW3DO5OtjOzKrrEJMjRg4vMWs",
  authDomain: "we-album.firebaseapp.com",
  projectId: "we-album",
  storageBucket: "we-album.firebasestorage.app",
  messagingSenderId: "396719409653",
  appId: "1:396719409653:web:849db5110ac0e5600e78bc",
  measurementId: "G-52J65SHWJ1"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Analytics (opcional, bom ter)
const analytics = getAnalytics(app);

// Inicializando o Banco de Dados (Firestore) e exportando para usarmos no app
export const db = getFirestore(app);