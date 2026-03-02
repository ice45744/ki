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
    deleteDoc,
    initializeFirestore,
    persistentLocalCache
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({})
});

const storage = getStorage(app);

// --- Session Cache ---
const userCache = new Map();
let announcementsCache = null;

// --- User Data with Cache-First + Background Sync ---
export const getUserData = async (uid, useCache = true) => {
    try {
        if (useCache && userCache.has(uid)) {
            return { success: true, data: userCache.get(uid) };
        }
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            userCache.set(uid, data);
            return { success: true, data };
        }
        return { success: false, error: "User not found" };
    } catch (error) {
        console.error("Error getting user data:", error);
        return { success: false, error };
    }
};

// --- Announcements with Cache-First + Background Sync ---
export const getAnnouncements = async (limitCount = 10, useCache = true) => {
    try {
        if (useCache && announcementsCache) {
            return announcementsCache.slice(0, limitCount);
        }
        const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(limitCount));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        announcementsCache = data;
        return data;
    } catch (error) {
        console.error("Error getting announcements:", error);
        if (announcementsCache) return announcementsCache.slice(0, limitCount);
        return [];
    }
};

// --- Auth Functions ---
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

export const logout = async () => {
    try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// --- Features ---
export const submitGoodDeed = async (uid, name, description) => {
    try {
        const docRef = await addDoc(collection(db, "activities"), {
            userId: uid,
            userName: name,
            type: 'good_deed',
            description,
            timestamp: new Date(),
            status: 'pending'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error submitting good deed:", error);
        return { success: false, error };
    }
};

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

export const updateUserData = async (uid, data, imageFile) => {
    try {
        let photoURL = data.photoURL || "";
        if (imageFile) {
            const storageRef = ref(storage, `profiles/${uid}_${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            photoURL = await getDownloadURL(snapshot.ref);
        }
        const userRef = doc(db, "users", uid);
        const updatePayload = { ...data };
        if (photoURL) updatePayload.photoURL = photoURL;
        await updateDoc(userRef, updatePayload);
        if (userCache.has(uid)) userCache.set(uid, { ...userCache.get(uid), ...updatePayload });
        if (auth.currentUser) {
            const profileUpdate = { displayName: data.displayName };
            if (photoURL) profileUpdate.photoURL = photoURL;
            await updateProfile(auth.currentUser, profileUpdate);
        }
        return { success: true, photoURL };
    } catch (error) {
        console.error("Error updating user data:", error);
        return { success: false, error };
    }
};

export const register = async (name, id, pass, role = 'student') => {
    try {
        const email = `${id}@st-kaona.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        const userData = {
            displayName: name,
            studentId: id,
            role: role,
            createdAt: new Date().toISOString(),
            points: 0,
            wasteStamps: 0
        };
        await setDoc(doc(db, "users", user.uid), userData);
        return { success: true, user };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error };
    }
};

export const deleteReport = async (reportId) => {
    try {
        await deleteDoc(doc(db, "reports", reportId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting report:", error);
        return { success: false, error };
    }
};

export const getReports = async () => {
    try {
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting reports:", error);
        return [];
    }
};

export const updateReportStatus = async (reportId, status) => {
    try {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, { status });
        return { success: true };
    } catch (error) {
        console.error("Error updating report status:", error);
        return { success: false, error };
    }
};

export const addAdminReward = async (uid, points, wasteStamps, reason) => {
    try {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) return { success: false, error: "User not found" };

        const currentData = userDoc.data();
        const newPoints = (currentData.points || 0) + Number(points);
        const newWasteStamps = (currentData.wasteStamps || 0) + Number(wasteStamps);

        await updateDoc(userRef, {
            points: newPoints,
            wasteStamps: newWasteStamps
        });

        await addDoc(collection(db, "admin_rewards"), {
            userId: uid,
            points: Number(points),
            wasteStamps: Number(wasteStamps),
            reason,
            timestamp: new Date()
        });

        if (userCache.has(uid)) {
            userCache.set(uid, { ...currentData, points: newPoints, wasteStamps: newWasteStamps });
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding admin reward:", error);
        return { success: false, error };
    }
};

export { auth, db, storage };
