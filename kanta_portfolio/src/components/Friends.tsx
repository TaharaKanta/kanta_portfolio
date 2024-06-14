import Link from "next/link";

export default function Friends() {
  return (
    <section>
      <h3 className="font-bold">Friends</h3>
      <p>friends portfolio links:</p>
      <ul>
        <li>
          <Link href="https://taku-app.github.io/taku_portfolio/"> Takuya Hiraoka </Link>
        </li>
      </ul>
    </section>
  )
}