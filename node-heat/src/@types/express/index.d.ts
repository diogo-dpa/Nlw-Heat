// Esse arquivo está sobrescrevendo o arquivo de tipos do node_modules

declare namespace Express {
	export interface Request {
		user_id: string;
	}
}
