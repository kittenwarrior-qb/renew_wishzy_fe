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

// Generic validators
export type Validator = (value: string, values?: Record<string, string>) => string | undefined

export const compose = (...rules: Validator[]): Validator => (v, values) => {
  for (const r of rules) {
    const err = r(v, values)
    if (err) return err
  }
  return undefined
}

export const required = (msg = "Trường này là bắt buộc"): Validator => (v) => {
  return (v ?? "").trim() ? undefined : msg
}

export const noWhitespaceOnly = (msg = "Không được chỉ chứa khoảng trắng"): Validator => (v) => {
  return (v ?? "").trim().length === 0 && (v ?? "").length > 0 ? msg : undefined
}

export const pattern = (re: RegExp, msg = "Giá trị không hợp lệ"): Validator => (v) => {
  const s = (v ?? "").trim()
  return s === "" || re.test(s) ? undefined : msg
}

export const minLength = (n: number, msg?: string): Validator => (v) => {
  const s = (v ?? "").trim()
  return s.length >= n || s.length === 0 ? undefined : (msg || `Phải có ít nhất ${n} ký tự`)
}

export const emailValidator = (msgRequired = "Email là bắt buộc", msgInvalid = "Email không hợp lệ"): Validator => (v) => {
  const s = (v ?? "").trim()
  if (!s) return msgRequired
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  return re.test(s) ? undefined : msgInvalid
}

export const strongPasswordValidator = (
  options?: {
    required?: boolean
    msgRequired?: string
    msgInvalid?: string
  }
): Validator => {
  const required = options?.required ?? true
  const msgRequired = options?.msgRequired ?? "Mật khẩu là bắt buộc"
  const msgInvalid = options?.msgInvalid ?? "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và tối thiểu 8 ký tự"
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  return (v) => {
    const s = (v ?? "").trim()
    if (!s) return required ? msgRequired : undefined
    if (!re.test(s)) return msgInvalid
    return undefined
  }
}

export const maxLength = (n: number, msg?: string): Validator => (v) => {
  const s = (v ?? "").trim()
  return s.length <= n ? undefined : (msg || `Không được vượt quá ${n} ký tự`)
}

export const lettersOnly = (msg = "Chỉ cho phép chữ cái"): Validator => (v) => {
  const s = (v ?? "").trim()
  return s === "" || /^[\p{L}\p{M} ]+$/u.test(s) ? undefined : msg
}

export const digitsOnly = (msg = "Chỉ cho phép số"): Validator => (v) => {
  const s = (v ?? "").trim()
  return s === "" || /^\d+$/.test(s) ? undefined : msg
}

export const isNumber = (msg = "Phải là số"): Validator => (v) => {
  if ((v ?? "").trim() === "") return undefined
  return Number.isFinite(Number(v)) ? undefined : msg
}

export const greaterThan = (min: number, msg?: string): Validator => (v) => {
  if ((v ?? "").trim() === "") return undefined
  const n = Number(v)
  if (!Number.isFinite(n)) return msg || "Phải là số"
  return n > min ? undefined : (msg || `Phải lớn hơn ${min}`)
}

export const greaterOrEqual = (min: number, msg?: string): Validator => (v) => {
  if ((v ?? "").trim() === "") return undefined
  const n = Number(v)
  if (!Number.isFinite(n)) return msg || "Phải là số"
  return n >= min ? undefined : (msg || `Phải lớn hơn hoặc bằng ${min}`)
}

export const inRange = (min: number, max: number, msg?: string): Validator => (v) => {
  if ((v ?? "").trim() === "") return undefined
  const n = Number(v)
  if (!Number.isFinite(n)) return msg || "Phải là số"
  return (n >= min && n <= max) ? undefined : (msg || `Giá trị phải trong khoảng ${min} - ${max}`)
}

export const percentRange = (msg?: string): Validator => inRange(1, 100, msg || "Phần trăm giảm phải từ 1 đến 100")

export const selectRequired = (msg = "Vui lòng chọn giá trị"): Validator => (v) => {
  const s = String(v ?? "").trim()
  return s ? undefined : msg
}

export const datesOrder = (startKey: string, endKey: string, msg = "Ngày kết thúc phải sau ngày bắt đầu"): Validator => (_v, values) => {
  if (!values) return undefined
  const start = values[startKey]
  const end = values[endKey]
  if (!start || !end) return undefined
  const sd = new Date(start)
  const ed = new Date(end)
  if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return undefined
  return ed.getTime() > sd.getTime() ? undefined : msg
}

// File validators
export type FileValidator = (file: File | null | undefined) => string | undefined

export const fileRequired = (msg = "Bắt buộc chọn file"): FileValidator => (f) => {
  return f ? undefined : msg
}

export const fileTypes = (mimes: string[], msg = "File không hợp lệ"): FileValidator => (f) => {
  if (!f) return undefined
  return mimes.includes(f.type) ? undefined : msg
}

export const fileMaxSize = (bytes: number, msg?: string): FileValidator => (f) => {
  if (!f) return undefined
  return f.size <= bytes ? undefined : (msg || "File quá lớn")
}

// Formatters
export type Formatter = (value: string, values?: Record<string, string>) => string

export const trim: Formatter = (v) => (v || "").trim()
export const collapseSpaces: Formatter = (v) => (v || "").replace(/\s+/g, " ")
export const toUpper: Formatter = (v) => (v || "").toUpperCase()
export const toUpperNoSpaces: Formatter = (v) => (v || "").toUpperCase().replace(/\s+/g, "")
export const onlyDigits: Formatter = (v) => (v || "").replace(/[^0-9]/g, "")
export const stripSpecial = (allowed: RegExp = /[\p{L}\p{M}0-9 ]/u): Formatter => (v) => Array.from(v || "").filter(ch => allowed.test(ch)).join("")
export const clampPercent: Formatter = (v) => {
  const d = onlyDigits(v)
  if (d === "") return d
  const n = Math.max(1, Math.min(100, Number(d)))
  return String(n)
}
