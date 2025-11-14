"use client"

import * as React from "react"

export type SeoInput = {
  title: string
  slug: string
  content: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}

export type SeoIssue = { id: string; label: string; passed: boolean; weight: number }

export function useSeoScore(input: SeoInput) {
  const [score, setScore] = React.useState(0)
  const [issues, setIssues] = React.useState<SeoIssue[]>([])

  React.useEffect(() => {
    const list: SeoIssue[] = []
    const title = (input.metaTitle || input.title || "").trim()
    const desc = (input.metaDescription || input.excerpt || "").trim()
    const slug = (input.slug || "").trim()
    const content = (input.content || "").replace(/<[^>]*>/g, " ").trim()
    const words = content.split(/\s+/).filter(Boolean)
    const images = (input.content.match(/<img\b[^>]*>/gi) || []).length
    const h1Count = (input.content.match(/<h1\b[^>]*>/gi) || []).length

    list.push({ id: "title_len", label: "Tiêu đề 40-60 ký tự", passed: title.length >= 40 && title.length <= 60, weight: 10 })
    list.push({ id: "desc_len", label: "Mô tả 120-160 ký tự", passed: desc.length >= 120 && desc.length <= 160, weight: 10 })
    list.push({ id: "slug_ok", label: "Slug rõ ràng, có từ khoá", passed: slug.length > 0 && !/[A-Z\s]/.test(slug), weight: 8 })
    list.push({ id: "content_len", label: "Nội dung >= 300 từ", passed: words.length >= 300, weight: 15 })
    list.push({ id: "images", label: "Có ít nhất 1 ảnh", passed: images >= 1, weight: 6 })
    list.push({ id: "h1_once", label: "Chỉ một thẻ H1", passed: h1Count <= 1, weight: 6 })

    const kws = (input.keywords || []).map(k => k.toLowerCase().trim()).filter(Boolean)
    const hasKwInTitle = kws.length ? kws.some(k => title.toLowerCase().includes(k)) : true
    const hasKwInDesc = kws.length ? kws.some(k => desc.toLowerCase().includes(k)) : true
    list.push({ id: "kw_title", label: "Từ khoá trong tiêu đề", passed: hasKwInTitle, weight: 10 })
    list.push({ id: "kw_desc", label: "Từ khoá trong mô tả", passed: hasKwInDesc, weight: 8 })

    const total = list.reduce((t, i) => t + i.weight, 0)
    const gained = list.reduce((t, i) => t + (i.passed ? i.weight : 0), 0)
    const s = Math.round((gained / total) * 100)

    setIssues(list)
    setScore(s)
  }, [input.title, input.slug, input.content, input.excerpt, input.metaTitle, input.metaDescription, JSON.stringify(input.keywords)])

  return { score, issues }
}
