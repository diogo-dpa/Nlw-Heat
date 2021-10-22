import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

/**
 * Recebe o codigo
 * Recuperar o access_token no github
 * Recuperar infos do user no github
 * Verificar se o usuario existe no banco
 *  Se sim
 *      Gera token
 *  Se nao
 *      Cria no DB
 *  Retornar o token com os dados do usuario logado
 */

interface IAccessTokenResponse {
	access_token: string;
}

interface IUserResponse {
	avatar_url: string;
	login: string;
	id: number;
	name: string;
}

class AuthenticateUserService {
	async execute(code: string) {
		const url = "https://github.com/login/oauth/access_token";

		const { data: accessTokenResponse } =
			await axios.post<IAccessTokenResponse>(url, null, {
				params: {
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
				},
				headers: {
					Accept: "application/json",
				},
			});

		const response = await axios.get<IUserResponse>(
			"https://api.github.com/user",
			{
				headers: {
					authorization: `Bearer ${accessTokenResponse.access_token}`,
				},
			}
		);

		const { login, id, avatar_url, name } = response.data;

		// Busca o usuario no banco
		let user = await prismaClient.user.findFirst({
			where: {
				github_id: id,
			},
		});

		// Caso o user não exista, crie no banco
		if (!user) {
			user = await prismaClient.user.create({
				data: {
					github_id: id,
					login,
					avatar_url,
					name,
				},
			});
		}

		// cria token
		// 1º parametro é o payload
		// 2º parametro é o secret
		// 3º parametro é o subject (geralmente é o id do usuario)
		const token = sign(
			{
				user: {
					name: user.name,
					avatar_url: user.avatar_url,
					id: user.id,
				},
			},
			process.env.JWT_SECRET,
			{
				subject: user.id,
				expiresIn: "1d", // expiração 1 dia
			}
		);

		return { token, user };
	}
}

export { AuthenticateUserService };
