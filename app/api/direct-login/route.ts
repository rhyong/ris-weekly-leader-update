import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByCredentials, createSession } from "@/lib/auth-db";
import { hashPassword } from "@/lib/db";
import { headers } from "next/headers";

// Handler for POST request
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string || "/";

    console.log(`Direct login attempt for username: ${username}`);
    
    // Log request headers for debugging
    const headersList = headers();
    console.log(`Request headers: ${Array.from(headersList.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}`);

    if (!username || !password) {
      return new Response("Username and password required", { status: 400 });
    }

    // Find user by credentials
    const user = await findUserByCredentials(username, password);
    
    if (!user) {
      console.log(`Direct login failed for ${username}: Invalid credentials`);
      return NextResponse.redirect(new URL(`/login?error=invalid_credentials&username=${encodeURIComponent(username)}`, request.url));
    }
    
    console.log(`Direct login successful for ${username} (ID: ${user.id})`);

    // Create a session
    const session = await createSession(user.id);
    
    if (!session) {
      console.log(`Failed to create session for ${username}`);
      return NextResponse.redirect(new URL(`/login?error=session_failure&username=${encodeURIComponent(username)}`, request.url));
    }

    // Set a session cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: "session_id",
      value: session.id,
      httpOnly: true,
      expires: session.expires,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    // For debugging: Log all cookies after setting
    const allCookies = cookieStore.getAll();
    console.log(`Cookies after setting: ${allCookies.map(c => c.name).join(', ')}`);
    
    // Double-check the session cookie was set
    const sessionCookie = cookieStore.get("session_id");
    if (sessionCookie) {
      console.log(`Confirmed session cookie set: ${sessionCookie.value.substring(0, 8)}... with path ${sessionCookie.path}`);
    } else {
      console.log(`WARNING: Failed to set session cookie!`);
    }
    
    console.log(`Set cookie session_id with value ${session.id.substring(0, 8)}... for user ${user.id}`);

    // Set a localStorage flag as backup (via a script that will run on client)
    const html = `
    <html>
      <head>
        <title>Logging in...</title>
        <script>
          // Create a diagnostic log that will persist across page loads
          const diagnosticLog = [];
          
          function log(message, data = null) {
            const timestamp = new Date().toISOString();
            const entry = { timestamp, message, data };
            
            // Add to in-memory log
            diagnosticLog.push(entry);
            
            // Also log to console
            if (data) {
              console.log(\`[LOGIN_DEBUG] \${timestamp} - \${message}\`, data);
            } else {
              console.log(\`[LOGIN_DEBUG] \${timestamp} - \${message}\`);
            }
            
            // Save to localStorage
            try {
              const existingLog = JSON.parse(localStorage.getItem("login_diagnostic_log") || "[]");
              const updatedLog = [...existingLog, entry].slice(-50); // Keep last 50 entries
              localStorage.setItem("login_diagnostic_log", JSON.stringify(updatedLog));
            } catch (e) {
              console.error("Error saving diagnostic log:", e);
            }
          }
          
          log("Login page loaded, starting authentication process");
          
          // Clear any existing auth data first to prevent conflicts
          log("Clearing existing localStorage auth data");
          localStorage.removeItem("logged_in");
          localStorage.removeItem("user_data");
          localStorage.removeItem("session_id");
          
          // Store login state in localStorage before redirect
          log("Setting localStorage auth data");
          localStorage.setItem("logged_in", "true");
          
          const userData = ${JSON.stringify({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            email: user.email
          })};
          
          localStorage.setItem("user_data", JSON.stringify(userData));
          log("User data stored in localStorage", userData);
          
          // Also store session ID in localStorage for persistence
          localStorage.setItem("session_id", "${session.id}");
          log("Session ID stored in localStorage: ${session.id.substring(0, 8)}...");
          
          // Check existing cookies
          log("Current cookies", document.cookie);
          
          // Function to check if the user object is available in the app after redirect
          function verifyLoginState() {
            log("Running login verification check");
            
            // Check what page we're on
            log("Current location", {
              pathname: window.location.pathname,
              href: window.location.href
            });
            
            // If we've been redirected to login again, something went wrong
            if (window.location.pathname === '/login') {
              log("Detected redirect back to login page - login failed");
              
              // Log current localStorage state
              log("localStorage state during failed login", {
                userData: localStorage.getItem("user_data"),
                sessionId: localStorage.getItem("session_id") ? localStorage.getItem("session_id").substring(0, 8) + "..." : null,
                loggedIn: localStorage.getItem("logged_in")
              });
              
              // Try direct navigation as a fallback
              log("Attempting direct navigation to dashboard");
              setTimeout(() => {
                window.location.href = "${redirectTo}";
              }, 1000);
              return;
            }
            
            // We're on the correct page, verify we have user data
            const userData = localStorage.getItem("user_data");
            const sessionId = localStorage.getItem("session_id");
            
            log("Login verification status", {
              atCorrectPage: window.location.pathname !== '/login',
              hasUserData: !!userData,
              hasSessionId: !!sessionId,
              userData: userData ? JSON.parse(userData) : null,
              sessionIdPrefix: sessionId ? sessionId.substring(0, 8) + "..." : null,
              cookies: document.cookie
            });
            
            // Add a data attribute to the body for inspection
            document.body.setAttribute('data-auth-status', 'checked');
            document.body.setAttribute('data-has-session', sessionId ? 'yes' : 'no');
          }
          
          log("Preparing to redirect to: ${redirectTo}");
          
          // Redirect to the dashboard after a short delay
          setTimeout(() => {
            log("Executing redirect to dashboard");
            window.location.href = "${redirectTo}";
            
            // Set a timer to verify login state after redirect
            setTimeout(() => {
              verifyLoginState();
            }, 2000);
          }, 200);
        </script>
      </head>
      <body>
        <p>Logging in, please wait...</p>
        <div id="debug-output"></div>
      </body>
    </html>
    `;

    // Create the response with the HTML content
    const response = new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      }
    });
    
    // Explicitly set the session cookie on the response
    response.headers.append(
      "Set-Cookie", 
      `session_id=${session.id}; HttpOnly; Path=/; SameSite=Lax; Expires=${session.expires.toUTCString()}`
    );
    
    console.log(`Added explicit Set-Cookie header to response for session ${session.id.substring(0, 8)}...`);
    
    return response;
  } catch (error) {
    console.error("Direct login error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}