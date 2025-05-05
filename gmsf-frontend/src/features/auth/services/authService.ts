const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
    async login(datos: { correo: string; contrasena: string }) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
        });
        return await response.json();
    },

    async renovarToken(refreshToken: string) {
        const response = await fetch(`${API_URL}/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });
        return await response.json();
    },

    async recuperarContrasena(correo: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo }),
    });
    return await response.json();
},

    async restablecerContrasena(token: string, nuevaContrasena: string) {
    const response = await fetch(`${API_URL}/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nuevaContrasena }),
    });
    return await response.json();
},

    async obtenerPerfil(token: string) {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return await response.json();
},
};