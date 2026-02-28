// Firebase and Data Management for S.T. Progress
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    orderBy,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const storage = getStorage(app);

// Helpdesk / Reports System
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
            status: "pending", // pending, fixed
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error reporting issue:", error);
        return { success: false, error };
    }
};

export const getReports = async () => {
    try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        console.error("Error updating report:", error);
        return { success: false, error };
    }
};

// Gift Inventory System
export const addReward = async (rewardData, imageFile) => {
    try {
        let imageUrl = "";
        if (imageFile) {
            const storageRef = ref(storage, `rewards/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const docRef = await addDoc(collection(db, "rewards"), {
            ...rewardData,
            imageUrl,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding reward:", error);
        return { success: false, error };
    }
};

export const getRewards = async () => {
    try {
        const q = query(collection(db, "rewards"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting rewards:", error);
        return [];
    }
};

export const updateReward = async (rewardId, updateData) => {
    try {
        const rewardRef = doc(db, "rewards", rewardId);
        await updateDoc(rewardRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("Error updating reward:", error);
        return { success: false, error };
    }
};

export const deleteReward = async (rewardId) => {
    try {
        await deleteDoc(doc(db, "rewards", rewardId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting reward:", error);
        return { success: false, error };
    }
};
