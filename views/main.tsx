export function Main(props: { count: number }) {
  const { count } = props;
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org/dist/htmx.js"></script>
        <title>Document</title>
      </head>
      <body>
        <div id="counter">
          <Counter count={count} />
        </div>
        <button hx-post="/count" hx-target="#counter">
          Increment
        </button>
      </body>
    </html>
  );
}

export function Counter(props: { count: number }) {
  const { count } = props;
  return <div id="count">Count: {count}</div>;
}

export function Form() {
  return <form hx-post="/contact"></form>;
}
