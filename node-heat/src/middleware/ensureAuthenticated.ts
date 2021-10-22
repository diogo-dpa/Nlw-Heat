import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
	sub: string;
}

export function ensureAuthenticated(
	request: Request,
	response: Response,
	next: NextFunction
) {
	// Pega as informações do headers de authorization
	const authToken = request.headers.authorization;

	// se nao tiver informação
	if (!authToken) {
		return response.status(401).json({
			errorCode: "token.invalid",
		});
	}

	// Verifica se é válido
	const [, token] = authToken.split(" ");

	try {
		// se o token for inválido, lança uma exceção
		const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;

		request.user_id = sub;

		return next();
	} catch (err) {
		return response.status(401).json({
			errorCode: "token.expired",
		});
	}
}
