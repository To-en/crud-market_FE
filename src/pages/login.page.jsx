// Without auth and db do not redirect to this page now
// It will be the only time this app will redirect (Multi-page in SPA)

export default function LoginPage() {
  return <div className="app"><header><h1>Login</h1></header></div>;
}
