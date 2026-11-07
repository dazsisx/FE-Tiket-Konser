(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/utils/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API client terpusat buat komunikasi ke backend Tiket Konser.
 * ------------------------------------------------------------
 * WAJIB: buat file .env.local di root project FE, isi:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000/api
 * (sesuaikan port dengan PORT yang dipakai backend kamu — ingat app.js
 * backend default PORT=3000, SAMA kayak port default Next.js. Ubah salah
 * satu, misal set PORT=5000 di .env backend, biar gak tabrakan.)
 */ __turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "API_ORIGIN",
    ()=>API_ORIGIN,
    "createOfflineOrder",
    ()=>createOfflineOrder,
    "createOrder",
    ()=>createOrder,
    "deleteAdminArtist",
    ()=>deleteAdminArtist,
    "deleteAdminEvent",
    ()=>deleteAdminEvent,
    "deleteTicketCategory",
    ()=>deleteTicketCategory,
    "fetchAdminDashboard",
    ()=>fetchAdminDashboard,
    "fetchAdminOrders",
    ()=>fetchAdminOrders,
    "fetchAllOfflineOrders",
    ()=>fetchAllOfflineOrders,
    "fetchArtists",
    ()=>fetchArtists,
    "fetchEventById",
    ()=>fetchEventById,
    "fetchEvents",
    ()=>fetchEvents,
    "fetchMyOrder",
    ()=>fetchMyOrder,
    "fetchOfflineDashboard",
    ()=>fetchOfflineDashboard,
    "fetchOfflineOrdersPage",
    ()=>fetchOfflineOrdersPage,
    "fetchProfile",
    ()=>fetchProfile,
    "forgotPassword",
    ()=>forgotPassword,
    "formatJam",
    ()=>formatJam,
    "formatRupiah",
    ()=>formatRupiah,
    "formatTanggal",
    ()=>formatTanggal,
    "getCurrentUser",
    ()=>getCurrentUser,
    "getHargaTermurah",
    ()=>getHargaTermurah,
    "getImageUrl",
    ()=>getImageUrl,
    "getToken",
    ()=>getToken,
    "isLoggedIn",
    ()=>isLoggedIn,
    "loginUser",
    ()=>loginUser,
    "logout",
    ()=>logout,
    "registerUser",
    ()=>registerUser,
    "resendResetOtp",
    ()=>resendResetOtp,
    "resetPassword",
    ()=>resetPassword,
    "saveAdminArtist",
    ()=>saveAdminArtist,
    "saveAdminEvent",
    ()=>saveAdminEvent,
    "saveAuth",
    ()=>saveAuth,
    "saveTicketCategory",
    ()=>saveTicketCategory,
    "setAdminEventStatus",
    ()=>setAdminEventStatus,
    "updateStoredUser",
    ()=>updateStoredUser,
    "uploadAvatar",
    ()=>uploadAvatar,
    "uploadPaymentProof",
    ()=>uploadPaymentProof,
    "validateTicket",
    ()=>validateTicket,
    "verifyAdminOrder",
    ()=>verifyAdminOrder,
    "verifyResetOtp",
    ()=>verifyResetOtp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_ORIGIN = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:5000";
const API_BASE_URL = `${API_ORIGIN}/api`;
async function apiFetch(path, init) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...token ? {
                Authorization: `Bearer ${token}`
            } : {},
            ...init?.headers ?? {}
        },
        cache: "no-store"
    });
    if (!res.ok) {
        const body = await res.json().catch(()=>null);
        throw new Error(body?.message || `Request gagal (status ${res.status})`);
    }
    return res.json();
}
async function apiFetchForm(path, method, body) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body,
        cache: "no-store"
    });
    if (!res.ok) {
        const responseBody = await res.json().catch(()=>null);
        throw new Error(responseBody?.message || `Request gagal (status ${res.status})`);
    }
    return res.json();
}
async function fetchEvents() {
    const res = await apiFetch("/event");
    return res.data;
}
async function fetchEventById(id) {
    const res = await apiFetch(`/event/${id}`);
    return res.data;
}
async function fetchAdminDashboard() {
    const res = await apiFetch("/dashboard");
    return res.data;
}
async function fetchArtists() {
    const res = await apiFetch("/artis");
    return res.data;
}
async function saveAdminArtist(id, body) {
    const path = id === null ? "/artis" : `/artis/${id}`;
    const method = id === null ? "POST" : "PUT";
    const res = await apiFetchForm(path, method, body);
    return res.data;
}
async function deleteAdminArtist(id) {
    await apiFetch(`/artis/${id}`, {
        method: "DELETE"
    });
}
async function fetchAdminOrders() {
    const res = await apiFetch("/pesanan");
    return res.data;
}
async function saveAdminEvent(id, body) {
    const path = id === null ? "/event" : `/event/${id}`;
    const method = id === null ? "POST" : "PUT";
    const res = await apiFetchForm(path, method, body);
    return res.data;
}
async function deleteAdminEvent(id) {
    await apiFetch(`/event/${id}`, {
        method: "DELETE"
    });
}
async function setAdminEventStatus(id, status) {
    const action = status === "buka" ? "buka" : "tutup";
    const res = await apiFetch(`/event/${id}/${action}`, {
        method: "PATCH"
    });
    return res.data;
}
async function saveTicketCategory(eventId, categoryId, payload) {
    const path = categoryId === null ? "/kategori-tiket" : `/kategori-tiket/${categoryId}`;
    const method = categoryId === null ? "POST" : "PUT";
    const body = categoryId === null ? {
        event_id: eventId,
        ...payload
    } : payload;
    const res = await apiFetch(path, {
        method,
        body: JSON.stringify(body)
    });
    return res.data;
}
async function deleteTicketCategory(id) {
    await apiFetch(`/kategori-tiket/${id}`, {
        method: "DELETE"
    });
}
async function verifyAdminOrder(id, action) {
    const res = await apiFetch(`/pesanan/${id}/verifikasi`, {
        method: "PATCH",
        body: JSON.stringify({
            aksi: action
        })
    });
    return res.data;
}
async function fetchOfflineDashboard() {
    const res = await apiFetch("/offline/dashboard");
    return res.data;
}
async function fetchOfflineOrdersPage(page = 1, limit = 200) {
    return apiFetch(`/offline/pesanan?page=${page}&limit=${limit}`);
}
async function fetchAllOfflineOrders() {
    const limit = 200;
    const byId = new Map();
    let page = 1;
    let total = 0;
    do {
        const res = await fetchOfflineOrdersPage(page, limit);
        total = res.total;
        if (!res.data.length) break;
        // Map: transaksi baru di tengah paging bisa menggeser offset dan menduplikasi baris.
        res.data.forEach((order)=>byId.set(order.id, order));
        page += 1;
    }while (byId.size < total && page <= 50)
    return Array.from(byId.values());
}
async function createOfflineOrder(payload) {
    const res = await apiFetch("/offline/pesanan", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
}
async function registerUser(payload) {
    const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
}
async function loginUser(payload) {
    const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
}
async function fetchProfile() {
    const res = await apiFetch("/auth/profile");
    return res.data;
}
async function uploadAvatar(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: "POST",
        headers: token ? {
            Authorization: `Bearer ${token}`
        } : {},
        body: formData,
        cache: "no-store"
    });
    if (!res.ok) {
        const body = await res.json().catch(()=>null);
        throw new Error(body?.message || `Upload avatar gagal (status ${res.status})`);
    }
    const body = await res.json();
    return body.data;
}
async function forgotPassword(payload) {
    return apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
async function verifyResetOtp(payload) {
    const res = await apiFetch("/auth/verify-reset-otp", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
}
async function resendResetOtp(payload) {
    return apiFetch("/auth/resend-reset-otp", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
async function resetPassword(payload) {
    return apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
// ===== Penyimpanan sesi login (localStorage / sessionStorage) =====
const TOKEN_KEY = "drstar_token";
const USER_KEY = "drstar_user";
// Flag ini SELALU disimpan di localStorage (cuma penanda pilihan user,
// bukan data sensitif) supaya bisa dibaca lagi walau browser sudah ditutup
// dan dibuka ulang, sebelum kita tahu mau baca token dari storage yang mana.
const REMEMBER_KEY = "drstar_remember";
/** true = pakai localStorage (persist), false = pakai sessionStorage (per-tab, hilang saat browser ditutup) */ function isRemembered() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(REMEMBER_KEY) !== "0";
}
function getStorage() {
    return isRemembered() ? window.localStorage : window.sessionStorage;
}
function saveAuth(data, remember = true) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const { token, ...user } = data;
    localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    const activeStorage = remember ? localStorage : sessionStorage;
    const staleStorage = remember ? sessionStorage : localStorage;
    activeStorage.setItem(TOKEN_KEY, token);
    activeStorage.setItem(USER_KEY, JSON.stringify(user));
    // Bersihkan sisa sesi lama di storage yang tidak lagi dipakai
    staleStorage.removeItem(TOKEN_KEY);
    staleStorage.removeItem(USER_KEY);
}
function updateStoredUser(user) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    getStorage().setItem(USER_KEY, JSON.stringify(user));
}
function getToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return getStorage().getItem(TOKEN_KEY);
}
function getCurrentUser() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = getStorage().getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
function isLoggedIn() {
    return getToken() !== null;
}
function logout() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
}
function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_ORIGIN}/${clean}`;
}
function formatRupiah(value) {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (Number.isNaN(num)) return "Rp0";
    return `Rp${Math.round(num).toLocaleString("id-ID")}`;
}
function formatTanggal(iso) {
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
function formatJam(iso) {
    return new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    }) + " WIB";
}
function getHargaTermurah(kategoriTiket) {
    if (!kategoriTiket || kategoriTiket.length === 0) return "Belum tersedia";
    const min = Math.min(...kategoriTiket.map((k)=>parseFloat(k.harga)));
    return formatRupiah(min);
}
async function createOrder(payload) {
    const res = await apiFetch("/pesanan", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
}
async function fetchMyOrder(id) {
    const res = await apiFetch(`/pesanan/${id}`);
    return res.data;
}
async function uploadPaymentProof(id, file) {
    const body = new FormData();
    body.append("bukti_bayar", file);
    const res = await apiFetchForm(`/pesanan/${id}/bayar`, "POST", body);
    return res.data;
}
async function validateTicket(qr, mode) {
    const token = getToken();
    let res;
    try {
        res = await fetch(`${API_BASE_URL}/tiket/validasi`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            },
            body: JSON.stringify({
                qr,
                mode
            }),
            cache: "no-store"
        });
    } catch  {
        throw new Error("Tidak dapat terhubung ke server. Coba lagi.");
    }
    const body = await res.json().catch(()=>null);
    if (body && typeof body.hasil === "string") return body;
    throw new Error(body?.message || `Request gagal (status ${res.status})`);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])()) {
                setUser((0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentUser"])());
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = (data, remember = true)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAuth"])(data, remember);
        const { token, ...userData } = data;
        setUser(userData);
    };
    const logout = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
        setUser(null);
        window.location.href = "/";
    };
    const updateUser = (userData)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateStoredUser"])(userData);
        setUser(userData);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            logout,
            updateUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider");
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/navbar/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Navbar() {
    _s();
    const { user, isLoading, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [scrolled, setScrolled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [profileMenuOpen, setProfileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchValue, setSearchValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const profileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const handleScroll = {
                "Navbar.useEffect.handleScroll": ()=>{
                    setScrolled(window.scrollY > 50);
                    setProfileMenuOpen(false);
                }
            }["Navbar.useEffect.handleScroll"];
            window.addEventListener("scroll", handleScroll, {
                passive: true
            });
            return ({
                "Navbar.useEffect": ()=>window.removeEventListener("scroll", handleScroll)
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const handleClickOutside = {
                "Navbar.useEffect.handleClickOutside": (e)=>{
                    if (profileRef.current && !profileRef.current.contains(e.target)) {
                        setProfileMenuOpen(false);
                    }
                }
            }["Navbar.useEffect.handleClickOutside"];
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "Navbar.useEffect": ()=>document.removeEventListener("mousedown", handleClickOutside)
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    const initials = user?.nama ? user.nama.split(" ").map((n)=>n[0]).slice(0, 2).join("").toUpperCase() : "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            profileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                "aria-label": "Tutup menu profil",
                onClick: ()=>setProfileMenuOpen(false),
                className: "fixed inset-0 z-40 hidden bg-[#1F2937]/20 backdrop-blur-[1px] md:block"
            }, void 0, false, {
                fileName: "[project]/components/navbar/index.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed top-0 right-0 left-0 z-50 flex justify-center px-4 transition-all duration-500 ${scrolled ? "pt-3" : "pt-4"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: `relative flex h-16 items-center gap-4 transition-all duration-500 ${scrolled ? "navbar-liquid-glass w-[95%] max-w-[1000px] rounded-full px-6" : "w-full max-w-[1200px] bg-transparent px-5"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "group flex shrink-0 items-center gap-2.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: "/logobaru.png",
                                alt: "DRStar",
                                width: 180,
                                height: 180,
                                priority: true,
                                className: "h-34 w-34 object-contain transition-transform duration-200 group-hover:scale-105"
                            }, void 0, false, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/navbar/index.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden flex-1 items-center justify-between rounded-full border border-[#E5E7EB] bg-white pl-5 pr-1.5 shadow-sm md:flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: searchValue,
                                    onChange: (e)=>setSearchValue(e.target.value),
                                    placeholder: "Cari di DRStar",
                                    className: "w-full bg-transparent py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 81,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    "aria-label": "Cari",
                                    className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-transform hover:scale-105 hover:bg-[#0D9488]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 15
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 92,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/navbar/index.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden shrink-0 items-center gap-4 md:flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/pembelian",
                                    className: "text-sm font-semibold text-[#1F2937] transition-colors hover:text-[#6EE7B7]",
                                    children: "Pembelian"
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, this),
                                isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-9 w-9 animate-pulse rounded-full bg-[#E5E7EB]"
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this) : user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    ref: profileRef,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setProfileMenuOpen(!profileMenuOpen),
                                            className: "flex items-center gap-2 rounded-full border-[1.5px] border-[#E5E7EB] py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-[#0F766E]",
                                            children: [
                                                user.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: user.avatar_url,
                                                    alt: "Avatar",
                                                    width: 28,
                                                    height: 28,
                                                    className: "h-7 w-7 rounded-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 114,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white",
                                                    children: initials
                                                }, void 0, false, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "max-w-[100px] truncate text-sm font-semibold text-[#1F2937]",
                                                    children: user.nama
                                                }, void 0, false, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 118,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 14,
                                                    className: `text-[#6B7280] transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`
                                                }, void 0, false, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `absolute right-0 top-full z-50 mt-2 w-52 origin-top-right rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-[0_12px_32px_rgba(15,118,110,0.15)] transition-all duration-200 ${profileMenuOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/profile",
                                                    onClick: ()=>setProfileMenuOpen(false),
                                                    className: "mb-1 flex items-center gap-3 rounded-xl border-b border-[#E5E7EB] px-3 py-3 transition-colors hover:bg-[#ECFDF5]",
                                                    children: [
                                                        user.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            src: user.avatar_url,
                                                            alt: "Avatar",
                                                            width: 40,
                                                            height: 40,
                                                            className: "h-10 w-10 rounded-full object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 142,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white",
                                                            children: initials
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 144,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "min-w-0",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "truncate text-sm font-bold text-[#1F2937]",
                                                                    children: user.nama
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/navbar/index.tsx",
                                                                    lineNumber: 147,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "truncate text-xs text-[#9CA3AF]",
                                                                    children: "Lihat profil kamu"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/navbar/index.tsx",
                                                                    lineNumber: 148,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/profile",
                                                    onClick: ()=>setProfileMenuOpen(false),
                                                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 156,
                                                            columnNumber: 21
                                                        }, this),
                                                        "Profil Saya"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 19
                                                }, this),
                                                user.role === "admin" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/admin",
                                                    onClick: ()=>setProfileMenuOpen(false),
                                                    className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 165,
                                                            columnNumber: 23
                                                        }, this),
                                                        "Dashboard Admin"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setProfileMenuOpen(false);
                                                        logout();
                                                    },
                                                    className: "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/navbar/index.tsx",
                                                            lineNumber: 176,
                                                            columnNumber: 21
                                                        }, this),
                                                        "Keluar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/navbar/index.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 129,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/login",
                                            className: "rounded-full border-[1.5px] border-[#0F766E] px-5 py-2 text-sm font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#F59E0B] hover:bg-[#FFFBEB] hover:text-[#F59E0B]",
                                            children: "Masuk"
                                        }, void 0, false, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 183,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/register",
                                            className: "rounded-full bg-[#0F766E] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,118,110,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] hover:shadow-[0_10px_26px_rgba(15,118,110,0.30)]",
                                            children: "Daftar"
                                        }, void 0, false, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/navbar/index.tsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "ml-auto flex flex-col items-center justify-center gap-1.5 p-2 md:hidden",
                            onClick: ()=>setMobileMenuOpen(!mobileMenuOpen),
                            "aria-label": "Buka atau tutup menu",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${mobileMenuOpen ? "translate-y-2 rotate-45" : ""}`
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 205,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 210,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""}`
                                }, void 0, false, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 215,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/navbar/index.tsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/navbar/index.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/navbar/index.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed inset-0 z-40 transition-all duration-300 md:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-[#1F2937]/[0.08] backdrop-blur-sm",
                        onClick: ()=>setMobileMenuOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/navbar/index.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `absolute top-20 right-4 left-4 rounded-3xl border border-[#E5E7EB] bg-white/[0.97] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${mobileMenuOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-95 opacity-0"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4 flex items-center rounded-full bg-[#FFFBF5] px-4 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        value: searchValue,
                                        onChange: (e)=>setSearchValue(e.target.value),
                                        placeholder: "Cari di DRStar",
                                        className: "w-full bg-transparent text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 16,
                                        className: "text-[#9CA3AF]"
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 251,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/pembelian",
                                onClick: ()=>setMobileMenuOpen(false),
                                className: "block w-full rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]",
                                children: "Pembelian"
                            }, void 0, false, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 254,
                                columnNumber: 11
                            }, this),
                            user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/profile",
                                onClick: ()=>setMobileMenuOpen(false),
                                className: "flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]",
                                children: [
                                    user.avatar_url ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: user.avatar_url,
                                        alt: "Avatar",
                                        width: 28,
                                        height: 28,
                                        className: "h-7 w-7 rounded-full object-cover"
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 269,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white",
                                        children: initials
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 271,
                                        columnNumber: 17
                                    }, this),
                                    "Profil Saya"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, this),
                            user?.role === "admin" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin",
                                onClick: ()=>setMobileMenuOpen(false),
                                className: "flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/components/navbar/index.tsx",
                                        lineNumber: 283,
                                        columnNumber: 15
                                    }, this),
                                    "Dashboard Admin"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 278,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4",
                                children: isLoading ? null : user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        setMobileMenuOpen(false);
                                        logout();
                                    },
                                    className: "flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#DC2626] px-5 py-3 text-center text-base font-semibold text-[#DC2626] transition-all duration-200 hover:bg-red-50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 297,
                                            columnNumber: 17
                                        }, this),
                                        "Keluar"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/navbar/index.tsx",
                                    lineNumber: 290,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/login",
                                            onClick: ()=>setMobileMenuOpen(false),
                                            className: "w-full rounded-2xl border-[1.5px] border-[#0F766E] px-5 py-3 text-center text-base font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#F59E0B] hover:bg-[#FFFBEB] hover:text-[#F59E0B]",
                                            children: "Masuk"
                                        }, void 0, false, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 302,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/register",
                                            onClick: ()=>setMobileMenuOpen(false),
                                            className: "w-full rounded-2xl bg-[#0F766E] px-5 py-3 text-center text-base font-bold text-white shadow-[0_10px_26px_rgba(15,118,110,0.30)] transition-all duration-200 hover:bg-[#0D9488]",
                                            children: "Daftar"
                                        }, void 0, false, {
                                            fileName: "[project]/components/navbar/index.tsx",
                                            lineNumber: 309,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/components/navbar/index.tsx",
                                lineNumber: 288,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/navbar/index.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/navbar/index.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Navbar, "f6oSeR3UynWShkFM7ZhQ+JsVHXM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/navbar/conditional-navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConditionalNavbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navbar$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/navbar/index.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const HIDDEN_ROUTES = [
    "/auth/login",
    "/auth/register",
    "/terms",
    "/privacy",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-otp",
    "/pembelian/email",
    "/pembelian/nomor",
    "/profile"
];
function ConditionalNavbar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const isHidden = HIDDEN_ROUTES.includes(pathname) || pathname.startsWith("/admin");
    if (isHidden) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$navbar$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/components/navbar/conditional-navbar.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
_s(ConditionalNavbar, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = ConditionalNavbar;
var _c;
__turbopack_context__.k.register(_c, "ConditionalNavbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0tdiuuc._.js.map