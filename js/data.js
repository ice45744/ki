// Authentication and Data Management for S.T. Progress
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Auth ---
export const login = async (studentId, password) => {
    try {
        const email = studentId.includes('@') ? studentId : `${studentId}@st-kaona.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error };
    }
};

export const register = async (name, id, pass, role = 'student') => {
    try {
        const email = `${id}@st-kaona.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
            displayName: name,
            studentId: id,
            role: role,
            createdAt: new Date().toISOString(),
            points: 0,
            wasteStamps: 0
        });

        return { success: true, user };
    } catch (error) {
        console.error("Registration error:", error);
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

// --- Announcements ---
export const getAnnouncements = async (limitCount = 10) => {
    try {
        const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting announcements:", error);
        return [];
    }
};

// --- Reports ---
export const reportIssue = async (issueData, imageFile) => {
    try {
        let imageUrl = "";
        if (imageFile) {
            const storageRef = ref(storage, `reports/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const docRef = await addDoc(collection(db, "reports"), {
            ...issueData,
            imageUrl,
            status: "pending",
            createdAt: new Date().toISOString(),
            timestamp: new Date()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error reporting issue:", error);
        return { success: false, error };
    }
};

export { auth, db, storage };
