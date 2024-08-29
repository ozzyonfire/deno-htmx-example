const isDev = Deno.env.get("DENO_ENV") === "development";

export function Main(props: { count: number }) {
  const { count } = props;
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="styles.css" rel="stylesheet" />
        {isDev && <script defer src="/hmr.js"></script>}
        <script src="https://unpkg.com/htmx.org/dist/htmx.js"></script>
        <title>Document</title>
      </head>
      <body class="bg-blue-200 m-4">
        <Counter count={count} />
        <button
          class="bg-slate-700 rounded-lg text-white p-2"
          hx-post="/count"
          hx-target="#count"
        >
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
