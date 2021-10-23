import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
	id: string;
	name: string;
	login: string;
	avatar_url: string;
};

type AuthContextData = {
	user: User | null;
	signInUrl: string;
	signOut: () => void;
};

export const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
	children: ReactNode;
};

type AuthResponse = {
	token: string;
	user: {
		id: string;
		name: string;
		avatar_url: string;
		login: string;
	};
};

export function AuthProvider(props: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);

	const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=50c46fe2a3015a8fd4cc`;

	async function signIn(githubCode: string) {
		const response = await api.post<AuthResponse>("authenticate", {
			code: githubCode,
		});

		const { token, user } = response.data;

		// Salva no navegador
		localStorage.setItem("@dowhile:token", token);

		api.defaults.headers.common.authorization = `Bearer ${token}`;

		setUser(user);
	}

	function signOut() {
		setUser(null);
		localStorage.removeItem("@dowhile:token");
	}

	// useEffect para manipulação do localStorage
	useEffect(() => {
		const token = localStorage.getItem("@dowhile:token");

		if (token) {
			// seta o token
			api.defaults.headers.common.authorization = `Bearer ${token}`;

			api.get<User>("profile").then((response) => {
				setUser(response.data);
			});
		}
	}, []);

	useEffect(() => {
		const url = window.location.href;
		const hasGithubCode = url.includes("?code=");

		if (hasGithubCode) {
			const [urlWithouCode, githubCode] = url.split("?code=");

			// Limpa a url
			window.history.pushState({}, "", urlWithouCode);
			signIn(githubCode);
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				signInUrl,
				user,
				signOut,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}
