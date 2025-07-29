import dynamic from 'next/dynamic';
import Script from 'next/script';

const ExcalidrawWrapper = dynamic(
  async () => (await import('./ExcalidrawWrapper')).default,
  { ssr: false }
);

export default function SketchCanvas({ problemId }) {
  return (
    <>
      <Script id="excalidraw-assets" strategy="beforeInteractive">
        {`window.EXCALIDRAW_ASSET_PATH = location.origin + '/';`}
      </Script>
      <div className="h-full w-full border rounded-lg">
        <ExcalidrawWrapper problemId={problemId} />
      </div>
    </>
  );
}
