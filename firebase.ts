import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQDpVG8FwqfaPaPolwm1Eg79QslbumYL0",
  authDomain: "cadastro-de-clientes-fc2b3.firebaseapp.com",
  projectId: "cadastro-de-clientes-fc2b3",
  storageBucket: "cadastro-de-clientes-fc2b3.firebasestorage.app",
  messagingSenderId: "1001108009104",
  appId: "1:1001108009104:web:1a29de061c7d1aad5fa815"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);