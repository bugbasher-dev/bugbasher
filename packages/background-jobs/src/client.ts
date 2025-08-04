import { tasks } from "@trigger.dev/sdk/v3"

export async function triggerVideoProcessing(payload: {
  videoUrl: string
  videoHeaders: Record<string, string>
  videoId: string
  noteId: string
  organizationId: string
  userId: string
}) {
  const handle = await tasks.trigger("video-processing", payload)
  return handle
}

export async function triggerImageProcessing(payload: {
  imageUrl: string
  imageHeaders: Record<string, string>
  imageId: string
  noteId: string
  organizationId: string
  userId: string
}) {
  const handle = await tasks.trigger("image-processing", payload)
  return handle
}