export const normalizeSpaces = (s: string) => (s || "").replace(/\s+/g, " ").trim()

export type TextValidationOptions = {
  minLength?: number
  forbidDigitsOnly?: boolean
  allowedPattern?: RegExp
  maxConsecutiveSpaces?: number // e.g. 1 = không cho quá 1 space liên tiếp
  blacklist?: RegExp // chặn ký tự/chuỗi cụ thể (VD: /[@#$%]/ hoặc /(cấm|banned)/i)
  messages?: Partial<{
    minLength: string
    digitsOnly: string
    allowedPattern: string
    spaces: string
    blacklist: string
  }>
}

export const validateText = (raw: string, opts?: TextValidationOptions): string => {
  const {
    minLength = 6,
    forbidDigitsOnly = true,
    allowedPattern = /^[\p{L}\p{M}0-9 ]+$/u,
    maxConsecutiveSpaces = 1,
    blacklist,
    messages = {},
  } = opts || {}

  const t = (raw || "").trim()
  if (t.length < minLength) return messages.minLength || `Phải có ít nhất ${minLength} ký tự`
  if (forbidDigitsOnly && /^\d+$/.test(t)) return messages.digitsOnly || "Không được chỉ gồm số"
  if (maxConsecutiveSpaces >= 1 && new RegExp(` {${maxConsecutiveSpaces + 1},}`).test(t))
    return messages.spaces || `Không được có quá ${maxConsecutiveSpaces} khoảng trắng liên tiếp`
  if (allowedPattern && !allowedPattern.test(t)) return messages.allowedPattern || "Chỉ được chứa chữ, số và khoảng trắng"
  if (blacklist && blacklist.test(t)) return messages.blacklist || "Chứa ký tự/chuỗi không được phép"
  return ""
}

export const validateCategoryName = (raw: string): string => {
  const err = validateText(raw, {
    minLength: 6,
    forbidDigitsOnly: true,
    // Cho phép chữ, số, khoảng trắng và các ký tự '/', '-', ','
    allowedPattern: /^[\p{L}\p{M}0-9 \/,\-]+$/u,
    maxConsecutiveSpaces: 1,
    messages: {
      minLength: "Tên phải có ít nhất 6 ký tự",
      digitsOnly: "Tên không được chỉ gồm số",
      allowedPattern: "Tên chỉ được chứa chữ, số, khoảng trắng và các ký tự '/', '-', ','",
      spaces: "Tên không được có quá 1 khoảng trắng liên tiếp",
    },
  })
  if (err) return err
  const t = normalizeSpaces(raw)
  // Không cho phép các ký tự đặc biệt nêu trên xuất hiện liên tiếp (//, --, ,,)
  if (/(\/{2,}|-{2,}|,{2,})/.test(t)) return "Tên không được chứa ký tự đặc biệt liên tiếp"
  const hasLetter = /\p{L}/u.test(t)
  if (hasLetter && t === t.toUpperCase()) return "Tên không được toàn chữ IN HOA"
  return ""
}
