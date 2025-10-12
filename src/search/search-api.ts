
import fetch from 'node-fetch'

interface SearchResponse {
    profiles: UserProfile[]
}

export interface UserProfile {
    profileId: number,
    steamId: string,
    name: string,
    country: string,
}

export class SearchApi {

    async searchProfiles(encodedQuery: string): Promise<SearchResponse> {
        const headers = new Headers()
        headers.append("Content-Type", "application/json")

        return fetch(`https://data.aoe2companion.com/api/profiles?search=${encodedQuery}&page=1`, {
            "headers": {
                "Origin": "https://www.aoe2companion.com",
                "accept-encoding": "gzip, deflate, br",
                "referer": "https://www.aoe2companion.com/",
                "Accept": "/*",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
            }
        })
        .then(response => {
                // console.log(response.headers)
                return response.text()
        })
        .then(jsonText => {
            try {
                return JSON.parse(jsonText)
            } catch (error) {
                console.log(jsonText)
                throw error
            }
        })
    }

    async search(query: string): Promise<UserProfile[]> {
        if (query.length < 3 || query.length > 50) {
            return Promise.reject("Invalid query")
        }

        const encodedQuery = encodeURIComponent(query)
        return this.searchProfiles(encodedQuery)
        .then(res => Promise.resolve(res.profiles))
        .catch(err =>{
            console.error(err)
            return Promise.reject("API error")
        })
    }

}