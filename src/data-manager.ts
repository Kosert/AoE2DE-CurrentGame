import dataJson from "./data/data.json"
import stringsJson from "./data/strings.json"

export class DataManager {

    private bonusesMap = new Map()

    constructor() {
        this.prepareData()
    }

    prepareData() {
        const helpTextIds = dataJson.civ_helptexts
        Object.keys(helpTextIds).forEach(civName => {
            // @ts-expect-error
            const textId = helpTextIds[civName]
            // @ts-expect-error
            const helpText = stringsJson[textId]
            const teamBonusIndex = helpText.lastIndexOf("<b>Team Bonus:</b>")
            const bonuses = helpText.substring(teamBonusIndex).split("\n")
            bonuses.shift()
            const bonusesText = bonuses.join("<br>")
            this.bonusesMap.set(civName, bonusesText)
        })
    }

    getBonuses(civNames: string[]): string[] {
        return civNames.map(it => this.bonusesMap.get(it))
    }
}