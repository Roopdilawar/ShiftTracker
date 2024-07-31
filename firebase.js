// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from your GoogleService-Info.plist
const firebaseConfig = {
  apiKey: 'AIzaSyCJ-nqSH-AEMRVhizg89iVBzCNwJVLSaKY',
  authDomain: 'shifttracker-dd7af.firebaseapp.com',
  projectId: 'shifttracker-dd7af',
  storageBucket: 'shifttracker-dd7af.appspot.com',
  messagingSenderId: '1008673155769',
  appId: '1:1008673155769:ios:f609a21fd5005acc14c968',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
