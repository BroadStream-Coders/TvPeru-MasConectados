import JSZip from "jszip";

export async function saveAsZip(
  zipFilename: string,
  jsonData: unknown,
  files: { name: string; file: File }[],
  jsonFilename: string,
) {
  const zip = new JSZip();
  zip.file(jsonFilename, JSON.stringify(jsonData, null, 2));
  for (const item of files) zip.file(item.name, item.file);

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipFilename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export async function loadZipFile(file: File): Promise<JSZip> {
  try {
    return await JSZip.loadAsync(file);
  } catch (error) {
    throw new Error("No se pudo leer el archivo ZIP.", { cause: error });
  }
}
