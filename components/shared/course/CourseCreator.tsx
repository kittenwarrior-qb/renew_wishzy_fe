import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useState } from "react"

interface Creator {
  passwordModified?: boolean
  id: string
  email: string
  fullName: string
  description?: string
  avatar?: string
}

const CourseCreator = ({ creator }: { creator: Creator }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!creator) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Thông tin giảng viên không khả dụng</p>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const description = creator.description || ""
  const shortDescription = description.slice(0, 200) + (description.length > 200 ? "..." : "")
  const shouldShowToggle = description.length > 200

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={creator.avatar} alt={creator.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(creator.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {creator.fullName}
              </h3>
              <Badge variant="destructive" className="mt-1">
                Giảng viên
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{creator.email}</span>
              </div>
            </div>

            {description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground leading-7">
                  {isExpanded ? description : shortDescription}
                </p>
                {shouldShowToggle && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 px-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
                  >
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseCreator
