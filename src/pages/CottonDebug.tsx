import { useRef, useState } from 'react';

export default function CottonDebug() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResponse('');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      try {
        // Resize first
        const img = new Image();
        img.src = dataUrl;
        await new Promise((r) => { img.onload = r; });

        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resized = canvas.toDataURL('image/jpeg', 0.7);

        const res = await fetch('/api/cotton', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: resized }),
        });

        const text = await res.text();
        setResponse(`Status: ${res.status}\n\n${text}`);
      } catch (err: any) {
        setResponse(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-enter p-4">
      <h1 className="text-2xl font-bold">Cotton API Debug</h1>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="mt-4"
      />
      {loading && <p className="mt-4">Loading...</p>}
      {response && (
        <pre className="mt-4 overflow-auto rounded-lg bg-black/10 p-4 text-xs">
          {response}
        </pre>
      )}
    </div>
  );
      }
