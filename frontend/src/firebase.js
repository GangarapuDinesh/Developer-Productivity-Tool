import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAbs6874pTvUnMa1OcGItJSE5BQR7g6eCA",
  authDomain: "dev-tool-dfab1.firebaseapp.com",
  projectId: "dev-tool-dfab1",
  storageBucket: "dev-tool-dfab1.firebasestorage.app",
  messagingSenderId: "525157337934",
  appId: "1:525157337934:web:aa1ca01d104f0e8e976c1f",
  measurementId: "G-8X5X01R2B0"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
