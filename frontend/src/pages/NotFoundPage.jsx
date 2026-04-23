import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="container success-page">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go home</Link>
    </main>
  );
}
