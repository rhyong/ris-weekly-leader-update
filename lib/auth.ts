export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error("Login error:", error)
    return false
  }
}
