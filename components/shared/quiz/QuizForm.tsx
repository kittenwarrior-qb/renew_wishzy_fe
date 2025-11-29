"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type QuizFormAnswerOptionValue = {
    optionText: string
    isCorrect: boolean
}

export type QuizFormQuestionValue = {
    questionText: string
    points: number | string
    answerOptions: QuizFormAnswerOptionValue[]
}

export type QuizFormValue = {
    title: string
    description?: string
    isPublic: boolean
    isFree: boolean
    price: number | string
    timeLimit: number | string
    questions: QuizFormQuestionValue[]
}

export type QuizFormError = {
    title?: string
    price?: string
    timeLimit?: string
    questions?: string
}

interface QuizFormProps {
    value: QuizFormValue
    onChange: (value: QuizFormValue) => void
    error?: QuizFormError
    mode?: "create" | "edit"
}

export function QuizForm({ value, onChange, error, mode = "create" }: QuizFormProps) {
    const updateField = (field: keyof QuizFormValue, v: any) => {
        onChange({ ...value, [field]: v })
    }

    const updateQuestion = (index: number, q: Partial<QuizFormQuestionValue>) => {
        const next = value.questions.map((item, i) => (i === index ? { ...item, ...q } : item))
        updateField("questions", next)
    }

    const addQuestion = () => {
        updateField("questions", [
            ...value.questions,
            {
                questionText: "",
                points: "",
                answerOptions: [
                    { optionText: "", isCorrect: true },
                    { optionText: "", isCorrect: false },
                ],
            },
        ])
    }

    const removeQuestion = (index: number) => {
        const next = value.questions.filter((_, i) => i !== index)
        updateField("questions", next)
    }

    const updateAnswer = (
        qIndex: number,
        aIndex: number,
        patch: Partial<QuizFormAnswerOptionValue>,
    ) => {
        const nextQuestions = value.questions.map((q, qi) => {
            if (qi !== qIndex) return q
            const answerOptions = q.answerOptions.map((a, ai) =>
                ai === aIndex ? { ...a, ...patch } : a,
            )
            return { ...q, answerOptions }
        })
        updateField("questions", nextQuestions)
    }

    const addAnswer = (qIndex: number) => {
        const nextQuestions = value.questions.map((q, qi) => {
            if (qi !== qIndex) return q
            return {
                ...q,
                answerOptions: [...q.answerOptions, { optionText: "", isCorrect: false }],
            }
        })
        updateField("questions", nextQuestions)
    }

    const removeAnswer = (qIndex: number, aIndex: number) => {
        const nextQuestions = value.questions.map((q, qi) => {
            if (qi !== qIndex) return q
            return {
                ...q,
                answerOptions: q.answerOptions.filter((_, ai) => ai !== aIndex),
            }
        })
        updateField("questions", nextQuestions)
    }

    const toggleCorrect = (qIndex: number, aIndex: number) => {
        const nextQuestions = value.questions.map((q, qi) => {
            if (qi !== qIndex) return q
            const nextAnswers = q.answerOptions.map((a, ai) => ({
                ...a,
                isCorrect: ai === aIndex ? !a.isCorrect : a.isCorrect,
            }))
            return { ...q, answerOptions: nextAnswers }
        })
        updateField("questions", nextQuestions)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Input
                    placeholder="Tiêu đề bài kiểm tra"
                    value={value.title}
                    onChange={(e) => updateField("title", e.target.value)}
                />
                {error?.title && <p className="text-xs text-red-500">{error.title}</p>}
            </div>

            <Textarea
                placeholder="Mô tả (tuỳ chọn)"
                value={value.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Thời gian làm (phút)</label>
                    <Input
                        type="number"
                        value={value.timeLimit}
                        onChange={(e) => updateField("timeLimit", e.target.value)}
                    />
                    {error?.timeLimit && (
                        <p className="text-xs text-red-500">{error.timeLimit}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Giá (VNĐ)</label>
                    <Input
                        type="number"
                        value={value.price}
                        onChange={(e) => updateField("price", e.target.value)}
                    />
                    {error?.price && <p className="text-xs text-red-500">{error.price}</p>}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-semibold">Câu hỏi</span>
                    <Button type="button" size="sm" onClick={addQuestion}>
                        Thêm câu hỏi
                    </Button>
                </div>
                {error?.questions && (
                    <p className="text-xs text-red-500">{error.questions}</p>
                )}
                <div className="space-y-4">
                    {value.questions.map((q, qi) => (
                        <Card key={qi} className="border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium">
                                    Câu hỏi {qi + 1}
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(qi)}
                                >
                                    Xoá
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Input
                                    placeholder="Nội dung câu hỏi"
                                    value={q.questionText}
                                    onChange={(e) =>
                                        updateQuestion(qi, { questionText: e.target.value })
                                    }
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="Điểm"
                                    value={q.points}
                                    onChange={(e) => updateQuestion(qi, { points: e.target.value })}
                                />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Đáp án</span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addAnswer(qi)}
                                        >
                                            Thêm đáp án
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {q.answerOptions.map((a, ai) => (
                                            <div
                                                key={ai}
                                                className="flex items-center gap-2"
                                            >
                                                <button
                                                    type="button"
                                                    className={`px-2 py-1 text-xs rounded border ${a.isCorrect
                                                            ? "bg-green-500 text-white border-green-500"
                                                            : "border-muted-foreground/40"
                                                        }`}
                                                    onClick={() => toggleCorrect(qi, ai)}
                                                >
                                                    Đúng
                                                </button>
                                                <Input
                                                    className="flex-1"
                                                    placeholder={`Đáp án ${ai + 1}`}
                                                    value={a.optionText}
                                                    onChange={(e) =>
                                                        updateAnswer(qi, ai, {
                                                            optionText: e.target.value,
                                                        })
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeAnswer(qi, ai)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
