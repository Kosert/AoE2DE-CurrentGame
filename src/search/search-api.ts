
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
        return fetch(`https://data.aoe2companion.com/api/profiles?search=${encodedQuery}&page=1`)
            .then(response => response.json())
    }

    async search(query: string): Promise<UserProfile[]> {

        if (query.length < 3 || query.length > 50) {
            return Promise.reject("Invalid query")
        }

        const encodedQuery = encodeURIComponent(query)
        return this.searchProfiles(encodedQuery)
        .then(res => Promise.resolve(res.profiles))
        .catch(err => {
            console.log(err)
            return Promise.reject("API error")
        })
    }

}