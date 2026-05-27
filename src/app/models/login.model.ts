export interface LoginRequest {
    usernama: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    username: string;
    email: string;
    roles: string[];
    expiresIn: number;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: string;
}

