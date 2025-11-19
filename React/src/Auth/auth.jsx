export function getCurrentUser() {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("token");  

}