export const AVATAR_UPDATED_EVENT = "appric-avatar-updated"

export function dispatchAvatarUpdated(url: string | null) {
  window.dispatchEvent(
    new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { url } })
  )
}
