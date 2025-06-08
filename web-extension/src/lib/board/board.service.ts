import { API_BASE_URL } from "$lib/api"
import { AuthUtils } from "$lib/auth/auth.utils"
import type { BoardResponse } from "./board.types"

class BoardService {
    private static readonly ENDPOINT = `${API_BASE_URL}/boards`

    static async getBoards(): Promise<BoardResponse[]> {
        const authHeader = await AuthUtils.getAuthHeader()
        if (!authHeader) {
            return [];
        }

        const response = await fetch(this.ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch boards: ${response.statusText}`)
        }

        return response.json()
    }
}

export { BoardService }

