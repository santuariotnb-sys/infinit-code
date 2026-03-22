export interface Snippet {
  label: string;
  lang: string;
  code: string;
}

export const snippets: Snippet[] = [
  {
    label: 'React Card Component',
    lang: 'tsx',
    code: `function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}`,
  },
  {
    label: 'Tailwind Button',
    lang: 'tsx',
    code: `<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
  Click me
</button>`,
  },
  {
    label: 'CSS Flex Center',
    lang: 'css',
    code: `.center {
  display: flex;
  align-items: center;
  justify-content: center;
}`,
  },
  {
    label: 'useLocalStorage Hook',
    lang: 'tsx',
    code: `function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = React.useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? '') as T; }
    catch { return init; }
  });
  const set = (v: T) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, set] as const;
}`,
  },
  {
    label: 'HTML Base Template',
    lang: 'html',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Document</title>
</head>
<body>

</body>
</html>`,
  },
  {
    label: 'CSS Variables Theme',
    lang: 'css',
    code: `:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-accent: #5b6cf9;
  --radius: 8px;
  --font: system-ui, sans-serif;
}`,
  },
  {
    label: 'React useEffect Fetch',
    lang: 'tsx',
    code: `const [data, setData] = React.useState(null);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false); })
    .catch(() => setLoading(false));
}, []);`,
  },
];
