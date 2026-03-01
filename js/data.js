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

// --- Discord Webhooks ---
const WEBHOOKS = {
    good_deed: "https://discord.com/api/webhooks/1466822348358422671/B9-tLA3AMnfReZ-88GKnkQFFQTCFfpcPha4glXFPanCBfCJfs3KGQlQiXf_ZM1mxjeqZ",
    report: "https://discord.com/api/webhooks/1466822966867132460/OnSF_IeBbhIj7WahZkX-JSnzXWfOEL0j9n6YXwpSPxYD525vGrSn2fFWTyCf0ROMKs3k",
    admin_action: "https://discord.com/api/webhooks/1466822976207847556/NizRwGIGkL3EqyQEAKDrnl4H_f6UiGKvj1sqwKCWpm30HWcIg0OQ0Bvgf2VZrVq0cdue",
    qr_scan: "https://discord.com/api/webhooks/1467136460506271863/McED-tyn4MGH53q1smhHqDf2phVOL9xK3KYUU6IGVeMPvvF6skpIEAt5Y9qPbhkbYHiy",
    exchange: "https://discord.com/api/webhooks/1467911314536927363/TvoSxnqi71xqhcYzPrmGmSX1HKj89CBvJr5VvkAYTz3mPfBohTKQUFU_gqI9Pgo0pXYF",
    new_user: "https://discord.com/api/webhooks/1477690061880426769/3kRf7dMZuem5JBtmEXZa6P1ILxoXonA5lJhz_wuWn-cogvLXOG5swe8pCu1JYMCGbRRf"
};

const sendDiscordLog = async (webhookUrl, content, embed = null) => {
    try {
        const payload = { content };
        if (embed) payload.embeds = [embed];
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Discord log error:", error);
    }
};

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
        
        const userData = {
            displayName: name,
            studentId: id,
            role: role,
            createdAt: new Date().toISOString(),
            points: 0,
            wasteStamps: 0
        };
        await setDoc(doc(db, "users", user.uid), userData);

        await sendDiscordLog(WEBHOOKS.new_user, `🆕 **ผู้ลงทะเบียนใหม่**`, {
            title: "ข้อมูลสมาชิกใหม่",
            color: 3447003,
            fields: [
                { name: "ชื่อ", value: name, inline: true },
                { name: "รหัสนักเรียน", value: id, inline: true },
                { name: "สถานะ", value: role, inline: true }
            ],
            timestamp: new Date().toISOString()
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

// --- Activities ---
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

        await sendDiscordLog(WEBHOOKS.good_deed, `✨ **บันทึกความดีใหม่**`, {
            title: "รายละเอียดความดี",
            color: 16776960,
            fields: [
                { name: "ผู้ทำความดี", value: name, inline: true },
                { name: "รายละเอียด", value: description }
            ],
            timestamp: new Date().toISOString()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error submitting good deed:", error);
        return { success: false, error };
    }
};

export const addReward = async (uid, rewardName, cost) => {
    try {
        await sendDiscordLog(WEBHOOKS.exchange, `🎁 **การแลกของรางวัล**`, {
            title: "รายละเอียดการแลก",
            color: 15105570,
            fields: [
                { name: "รหัสผู้ใช้", value: uid, inline: true },
                { name: "ของรางวัล", value: rewardName, inline: true },
                { name: "จำนวนแต้มที่ใช้", value: `${cost} แสตมป์`, inline: true }
            ],
            timestamp: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding reward:", error);
        return { success: false, error };
    }
};

export const scanQRCode = async (uid, name, type) => {
    try {
        const webhookUrl = type === 'morning' ? WEBHOOKS.qr_scan : WEBHOOKS.good_deed;
        const title = type === 'morning' ? '☀️ เช็คชื่อยามเช้า' : '✨ สแกนกิจกรรม';
        
        await sendDiscordLog(webhookUrl, `📸 **การสแกน QR Code**`, {
            title: title,
            color: 3066993,
            fields: [
                { name: "ผู้สแกน", value: name, inline: true },
                { name: "ประเภท", value: type, inline: true }
            ],
            timestamp: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("QR scan log error:", error);
        return { success: false, error };
    }
};

export const logAdminAction = async (adminName, action, target) => {
    try {
        await sendDiscordLog(WEBHOOKS.admin_action, `🛠️ **การกระทำของแอดมิน**`, {
            title: "บันทึกการทำงานแอดมิน",
            color: 9807270,
            fields: [
                { name: "แอดมิน", value: adminName, inline: true },
                { name: "การกระทำ", value: action, inline: true },
                { name: "เป้าหมาย", value: target || "ไม่ระบุ", inline: true }
            ],
            timestamp: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Admin log error:", error);
        return { success: false, error };
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

        await sendDiscordLog(WEBHOOKS.report, `🚨 **แจ้งปัญหาใหม่**`, {
            title: `หัวข้อ: ${issueData.title}`,
            color: 15158332,
            fields: [
                { name: "หมวดหมู่", value: issueData.category, inline: true },
                { name: "รายละเอียด", value: issueData.description }
            ],
            image: imageUrl ? { url: imageUrl } : null,
            timestamp: new Date().toISOString()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error reporting issue:", error);
        return { success: false, error };
    }
};

// --- User Profile ---
export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        }
        return { success: false, error: "User not found" };
    } catch (error) {
        console.error("Error getting user data:", error);
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
        
        // Also update Firebase Auth profile
        if (auth.currentUser) {
            const profileUpdate = {
                displayName: data.displayName
            };
            if (photoURL) profileUpdate.photoURL = photoURL;
            await updateProfile(auth.currentUser, profileUpdate);
        }

        return { success: true, photoURL };
    } catch (error) {
        console.error("Error updating user data:", error);
        return { success: false, error };
    }
};

// --- Admin Functions ---
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
        
        await sendDiscordLog(WEBHOOKS.admin_action, `📝 **อัปเดตสถานะการแจ้งเหตุ**`, {
            title: "การแก้ไขข้อมูลโดยแอดมิน",
            color: 3447003,
            fields: [
                { name: "ไอดีรายงาน", value: reportId, inline: true },
                { name: "สถานะใหม่", value: status, inline: true }
            ],
            timestamp: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating report status:", error);
        return { success: false, error };
    }
};

export const getRewards = async () => {
    try {
        const snapshot = await getDocs(collection(db, "rewards"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting rewards:", error);
        return [];
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

export const addAdminReward = async (rewardData) => {
    try {
        const docRef = await addDoc(collection(db, "rewards"), {
            ...rewardData,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding reward:", error);
        return { success: false, error };
    }
};

export const deleteReport = async (reportId) => {
    try {
        const reportRef = doc(db, "reports", reportId);
        const reportSnap = await getDoc(reportRef);
        const reportData = reportSnap.exists() ? reportSnap.data() : null;

        await deleteDoc(reportRef);

        if (reportData) {
            await sendDiscordLog(WEBHOOKS.admin_action, `🗑️ **ลบรายการแจ้งปัญหา**`, {
                title: "การลบข้อมูลโดยแอดมิน",
                color: 15158332,
                fields: [
                    { name: "หัวข้อ", value: reportData.title, inline: true },
                    { name: "หมวดหมู่", value: reportData.category, inline: true }
                ],
                timestamp: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error deleting report:", error);
        return { success: false, error };
    }
};

export { auth, db, storage };
