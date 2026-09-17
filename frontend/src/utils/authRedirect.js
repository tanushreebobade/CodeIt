// resolves where to send the user after a successful login / signup.
// only same-origin paths are accepted to avoid open redirects.
export const getPostAuthRedirect = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  let target = params.get("redirectTo");
  if (!target) {
    try {
      target = sessionStorage.getItem("redirectAfterAuth");
      sessionStorage.removeItem("redirectAfterAuth");
    } catch (e) {
      target = null;
    }
  }
  if (!target || !target.startsWith("/") || target.startsWith("//")) return "/";
  if (target.startsWith("/login") || target.startsWith("/signup")) return "/";
  return target;
};
