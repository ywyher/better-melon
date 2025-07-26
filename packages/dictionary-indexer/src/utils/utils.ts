import { extensions } from "../lib/constants";
import path from 'path'
import type { LocalFile, RemoteFile, File, SupportedExtension } from "../types";

export function isRemoteFile(file: File): file is RemoteFile {
  return file.source === "remote";
}

export function isLocalFile(file: File): file is LocalFile {
  return file.source === "local";
}

export function validateExtension(extension: string): asserts extension is SupportedExtension {
  if (!extensions.includes(extension as SupportedExtension)) {
    throw new Error(`Unsupported file extension: ${extension}`)
  }
}

export function getFilePath(folder: string, filename: string, extension: string): string {
  return path.join(folder, `${filename}.${extension}`)
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const exists = await Bun.file(filePath).exists()
    return exists ? true : false;
  } catch {
    return false;
  }
}

export function validateRequiredParams(params: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      throw new Error(`${key} is required`);
    }
  }
}

export function addIncrementalIds<T extends Record<string, unknown>>(
  data: T[], 
  idField: string = 'id', 
  startFrom: number = 1
): (T & Record<string, number>)[] {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  return data.map((item, index) => ({
    ...item,
    [idField]: startFrom + index
  }));
}