// Authentication management
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);

export const checkAuth = () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
};

export const login = async (studentId, password) => {
    try {
        // Map studentId to email for Firebase Auth
        const email = `${studentId}@st-kaona.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('isLoggedIn', 'true');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error };
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout error:", error);
    }
};