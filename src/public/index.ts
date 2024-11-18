import { Profile } from "./front-end-api-models";

let profileTemplate: HandlebarsTemplateDelegate<Profile>

function createProfileHtml(profile: Profile, query: string): HTMLElement {
    const queryIndexStart = profile.name.toLowerCase().indexOf(query.toLowerCase())
    if (queryIndexStart != -1) {
        const queryIndexEnd = queryIndexStart + query.length
        const name = profile.name
        profile.name = [name.slice(0, queryIndexStart), "<b>", name.slice(queryIndexStart, queryIndexEnd), "</b>", name.slice(queryIndexEnd)].join('');
    }
    const htmlString = profileTemplate(profile)    
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()
    return div.firstChild as HTMLElement
}

function createTextRow(text: string): HTMLElement {
    return createProfileHtml({
        profileId: 0,
        steamId: "",
        name: text,
        country: "",
    }, "")
}

window.onload = async function () {
    const playerTemplateSource = document.getElementById("profile-template")!.innerHTML;
    profileTemplate = Handlebars.compile(playerTemplateSource)

    const dropdownDetails = document.getElementById("dropdown-details")!
    const dropdownUl = document.getElementById("dropdown-ul")!
    const input = document.getElementById("search-input") as HTMLInputElement

    let timeoutId: number
    input.addEventListener('input', function() {
        const query = input.value 
        dropdownUl.innerHTML = ""
        if (typeof query === "string" && query.length > 2 && query.length < 50) {
            dropdownDetails.toggleAttribute("open", true)
            const row = createTextRow("Loading...")
            dropdownUl.appendChild(row)
            window.clearTimeout(timeoutId)
            timeoutId = window.setTimeout(function() {
                search(query).then(profiles => {
                    dropdownUl.innerHTML = ""
                    if (profiles) {
                        profiles.slice(0, 10).forEach(it => {
                            const row = createProfileHtml(it, query)
                            row.addEventListener("click", function() {
                                window.location.href = "player?playerId=" + it.profileId
                            })
                            dropdownUl.appendChild(row)
                        })
                    } else {
                        const row = createTextRow("No results, enter at least 3 letters")
                        dropdownUl.appendChild(row)
                    }
                }).catch(err => {
                    dropdownUl.innerHTML = ""
                    console.error(err)
                    const row = createTextRow("Error occurred, check console")
                    dropdownUl.appendChild(row)
                })
            }, 500)
        } else {
            const row = createTextRow("No results, enter at least 3 letters")
            dropdownUl.appendChild(row)
        }
    })
}

async function search(query: string): Promise<Profile[]> {
    return fetch("api/search?query=" + query).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    })
}