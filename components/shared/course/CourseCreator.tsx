import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, User } from "lucide-react"
import { useState } from "react"

interface Creator {
  passwordModified: boolean
  id: string
  email: string
  fullName: string
}

const CourseCreator = ({ creator }: { creator: Creator }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!creator) {
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Thông tin giảng viên chưa có sẵn</p>
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

  const description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore animi ullam dignissimos doloremque ipsa facilis minima enim provident architecto repellendus. Pariatur ipsam facilis recusandae maxime illo. Minus corporis alias similique, impedit officia iusto at excepturi, obcaecati dolore aliquid a? Nesciunt, architecto voluptates expedita illum necessitatibus obcaecati iste consequuntur perspiciatis eveniet magnam ex quaerat, fugiat alias animi qui! Autem quidem tempore, rerum necessitatibus voluptatibus placeat. Voluptatum dolore quaerat iure labore, distinctio sequi. Illo atque aspernatur autem dignissimos quidem, impedit fugiat sit corporis hic deleniti iste harum porro excepturi, exercitationem temporibus placeat cupiditate voluptatem sunt nam laborum voluptatibus. Voluptatibus tempore blanditiis facilis dicta in. Amet possimus necessitatibus ea! Dicta iusto quam unde suscipit, beatae omnis voluptatibus, blanditiis dolorem ut fuga id quibusdam ipsa labore quisquam illum perferendis? Laudantium voluptates quidem autem voluptate illum eius expedita reiciendis nobis et quae sapiente debitis, ipsam amet repellendus, aperiam esse, architecto impedit dolorum ullam assumenda molestias vitae? Similique consequatur iste quidem eum mollitia nisi placeat itaque exercitationem eligendi quos laudantium corporis ratione odio soluta porro, pariatur nulla vitae nam explicabo. Nemo mollitia maxime voluptatem autem tempora id nesciunt ipsa ipsam. Commodi fuga, sint quibusdam eum adipisci suscipit esse, nam exercitationem rerum iste sequi nostrum voluptatem repudiandae!"

  const shortDescription = description.slice(0, 200) + "..."
  const shouldShowToggle = description.length > 200

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src="" alt={creator.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(creator.fullName)}
            </AvatarFallback>
          </Avatar>

          {/* Creator Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {creator.fullName}
              </h3>
              <Badge variant="destructive" className="mt-1">
                Giảng viên
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{creator.email}</span>
              </div>
            </div>

            {/* Additional Info */}
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseCreator