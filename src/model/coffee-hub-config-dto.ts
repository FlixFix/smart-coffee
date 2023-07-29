export interface CoffeeHubConfigDto {
    scheduled: boolean,
    daysOn: number[],
    timesOn: string[],
    idleTime: number,
    singleBrewTime: number,
    doubleBrewTime: number,
    brewTemp: number,
    pidKP?: number,
    pidKI?: number
    pidKD?: number
}