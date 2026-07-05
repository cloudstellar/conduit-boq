'use client';

import Link from 'next/link';

export function MasterCatalogPrintToolbar({
  filename,
  versionId,
}: {
  filename: string;
  versionId: string;
}) {
  return (
    <div className="toolbar">
      <div>
        <strong>{filename}</strong>
        <span> | full dataset hash verified server-side</span>
      </div>
      <div className="toolbar-actions">
        <Link href={`/admin/master-catalog/versions/${versionId}`}>กลับ</Link>
        <button type="button" onClick={() => window.print()}>
          พิมพ์ / บันทึก PDF
        </button>
      </div>
    </div>
  );
}
