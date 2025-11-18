"use client"

import { useEffect, useState } from "react"

export type WeatherCondition = "clear" | "cloudy" | "rain" | "storm" | "snow" | "unknown"

export interface WeatherState {
    condition: WeatherCondition
    temperatureC: number | null
    loading: boolean
    error?: string
}

const DEFAULT_LAT = 10.8231
const DEFAULT_LON = 106.6297

export function useWeather(): WeatherState {
    const [state, setState] = useState<WeatherState>({
        condition: "unknown",
        temperatureC: null,
        loading: true,
    })

    useEffect(() => {
        let cancelled = false

        async function fetchWeather() {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}&current=temperature_2m,weather_code`
                const res = await fetch(url)
                if (!res.ok) throw new Error("Failed to fetch weather")
                const data = await res.json() as any

                const temp = typeof data?.current?.temperature_2m === "number" ? data.current.temperature_2m : null
                const code = data?.current?.weather_code as number | undefined
                const condition = mapWeatherCodeToCondition(code)

                if (cancelled) return

                setState({
                    condition,
                    temperatureC: temp,
                    loading: false,
                })
            } catch (err: any) {
                if (cancelled) return
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err?.message || "Không thể lấy dữ liệu thời tiết",
                }))
            }
        }

        fetchWeather()

        return () => {
            cancelled = true
        }
    }, [])

    return state
}

function mapWeatherCodeToCondition(code?: number): WeatherCondition {
    if (code == null) return "unknown"

    if (code === 0) return "clear" // trời quang
    if ([1, 2, 3].includes(code)) return "cloudy" // ít mây / có mây
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain" // mưa
    if ([95, 96, 99].includes(code)) return "storm" // giông bão
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow" // tuyết (hiếm)

    return "unknown"
}
