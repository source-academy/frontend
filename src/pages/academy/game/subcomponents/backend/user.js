let userRole = undefined;
export function setUserRole(role) {
    userRole = role;
}

export function isStudent() {
    return userRole === "student";
}