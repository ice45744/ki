// Authentication management
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);

export const login = async (email, password) => {
    try {
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