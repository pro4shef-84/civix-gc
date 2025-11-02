"use client";

import { useState } from "react";
import { CloudArrowUpIcon, DocumentIcon } from "@/components/icons";

const acceptedTypes = ["application/pdf", "text/csv", "message/rfc822"];

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  status: "pending" | "processing" | "parsed" | "failed";
  uploadedAt: Date;
};

export function BidsPanel({ tradeScopeId }: { tradeScopeId: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const uploads = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      status: "processing" as const,
      uploadedAt: new Date()
    }));

    setFiles((current) => [...uploads, ...current]);
    // In a full implementation we would call an upload action and parse worker here.
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <CloudArrowUpIcon className="h-10 w-10 text-primary-500" aria-hidden />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Upload sub bids</h3>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Drag and drop PDF, email (.eml/.msg) or CSV files. The parser will automatically extract line items and
          flag anything we cannot read.
        </p>
        <label className="btn-primary mt-6 cursor-pointer">
          Select files
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <p className="mt-3 text-xs text-slate-400">Supports up to 30 files per upload batch.</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-700">Recent uploads</h4>
        {files.length === 0 ? (
          <p className="text-sm text-slate-500">
            No uploads yet. Files will appear here with parsing progress and confidence metrics.
          </p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · Uploaded {file.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-primary-600">{file.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
