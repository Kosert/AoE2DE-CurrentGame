import { Query } from "express-serve-static-core";

export function parseIntParam(query: Query, paramName: string): number | undefined {
    try {
        const asString = parseStringParam(query, paramName)
        if (asString) {
            const parsed = parseInt(asString)
            if (Number.isInteger(parsed)) {
                return parsed
            }
        }
        return undefined
    } catch (error) {
        return undefined
    }
}

export function parseStringParam(query: Query, paramName: string): string | undefined {
    try {
        const value = query[paramName]
        if (typeof value === "string" && value.length > 0) {
            return value
        }
        return undefined
    } catch (error) {
        return undefined
    }
}