import { Profile } from "./front-end-api-models";

let profileTemplate: HandlebarsTemplateDelegate<Profile>

function createProfileHtml(profile: Profile): HTMLElement {
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
    })
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
                            const row = createProfileHtml(it)
                            row.addEventListener("click", function() {
                                window.location.href = "player?playerId=" + it.profileId
                            })
                            dropdownUl.appendChild(row)
                        })
                    } else {
                        const row = createTextRow("No results. Enter at least 3 characters.")
                        dropdownUl.appendChild(row)
                    }
                }).catch(err => {
                    dropdownUl.innerHTML = ""
                    console.error(err)
                    const row = createTextRow("Error occurred, check console for details.")
                    dropdownUl.appendChild(row)
                })
            }, 500)
        } else {
            const row = createTextRow("No results. Enter at least 3 characters.")
            dropdownUl.appendChild(row)
        }
    })
}

async function search(query: string): Promise<Profile[]> {
    return fetch("/api/search?query=" + query).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    })
}