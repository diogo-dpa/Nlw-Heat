import axios from 'axios';


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
    access_token: string
}

interface IUserResponse {
    avatar_url: string,
    login: string,
    id: number,
    name: string
}

class AuthenticateUserService{
    async execute(code: string){
        const url =  "https://github.com/login/oauth/acess_token"

        const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            },
            headers: {
                "Accept": "application/json"
            }
        })

        const response = await axios.get<IUserResponse>("https://api.github.com/user", {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`
            }
        })

        return response.data;
    }

}

export {AuthenticateUserService}