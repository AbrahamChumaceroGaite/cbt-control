// Public layout — no auth header (login + portal pages)
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
