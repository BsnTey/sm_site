import { defineStore } from 'pinia';
import axios from "axios";

const baseUrl = import.meta.env.VITE_ZENNO_API_URL;


export const useAuthStore = defineStore('auth', {
    state: () => ({
        apiKey: localStorage.getItem('ZENNO_API_KEY') || null,
        isLoggedIn: false,
        isLoading: false,
        isError: false,
        errorMessage: '',
    }),
    actions: {
        async login(apiKey: string) {
            this.isLoading = true;

            try {
                const response = await axios.post(baseUrl + 'auth/login', {
                    key: apiKey,
                });

                if (response.status === 200) {
                    this.apiKey = apiKey;
                    localStorage.setItem('ZENNO_API_KEY', apiKey);
                    this.isLoggedIn = true;
                } else {
                    this.isError = true;
                    this.errorMessage = 'Ошибка авторизации. Проверьте API Key.';
                }
            } catch (error) {
                console.error(error);
                this.isError = true;
                this.errorMessage = 'Ошибка авторизации. Попробуйте позже.';
            } finally {
                this.isLoading = false;
            }
        },
    },
});