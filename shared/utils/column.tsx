import * as React from "react"
import type { Column } from "@/shared/types/table.type"

export type Render<T> = (row: T, rowIndex: number) => React.ReactNode

export function defineColumns<T>(cols: ReadonlyArray<Column<T>>): Column<T>[] {
  return cols.slice() as Column<T>[]
}

export function col<T>(c: Column<T>): Column<T> {
  return c
}

export function makeRenderer<T>() {
  return (fn: Render<T>): Render<T> => fn
}
