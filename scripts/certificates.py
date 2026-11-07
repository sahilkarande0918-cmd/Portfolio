"""Certificate ingestion: python scripts/certificates.py [source_folder]

Reads every PDF/PNG/JPG in the source folder, de-duplicates by SHA-256, renders a
thumbnail and a full-size preview (WebP), publishes a web copy of the document and
writes content/certificates.generated.json. Titles, issuers and dates live in
content/certificates.ts (keyed by original filename); new files appear in the gallery
automatically with a "needs review" flag until they are described there.

Redactions: REDACT maps a filename to text that must be masked in the public preview
(student IDs etc.). Redacted files never publish their original document.
"""
import hashlib, json, os, sys
import fitz  # PyMuPDF
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", "Certificates")
PUB = os.path.join(ROOT, "public", "certificates")
OUT_JSON = os.path.join(ROOT, "content", "certificates.generated.json")
MAX_PDF = 2_000_000  # larger originals are republished as a compact, rasterised PDF
REDACT = {"Cisco Internship Certificate .pdf": ["Student ID"]}


def slugify(name: str) -> str:
    s = "".join(c.lower() if c.isalnum() else "-" for c in os.path.splitext(name)[0])
    return "-".join(p for p in s.split("-") if p)


def render(path: str, dpi: int) -> tuple[Image.Image, list]:
    if path.lower().endswith(".pdf"):
        doc = fitz.open(path)
        page = doc[0]
        pix = page.get_pixmap(dpi=dpi)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        boxes = []
        for needle in REDACT.get(os.path.basename(path), []):
            for r in page.search_for(needle):
                # mask the whole line from the label to the right edge of the text block
                boxes.append((r.x0 * dpi / 72 - 4, r.y0 * dpi / 72 - 4, page.rect.width * dpi / 72 * 0.62, r.y1 * dpi / 72 + 4))
        return img, boxes
    return Image.open(path).convert("RGB"), []


def main() -> None:
    os.makedirs(os.path.join(PUB, "thumbs"), exist_ok=True)
    os.makedirs(os.path.join(PUB, "full"), exist_ok=True)
    os.makedirs(os.path.join(PUB, "files"), exist_ok=True)
    seen, items = {}, []
    for name in sorted(os.listdir(SRC)):
        if not name.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
            continue
        path = os.path.join(SRC, name)
        data = open(path, "rb").read()
        digest = hashlib.sha256(data).hexdigest()
        if digest in seen:
            print(f"duplicate: {name} == {seen[digest]}")
            continue
        seen[digest] = name
        slug = slugify(name)
        full, boxes = render(path, 150)
        if boxes:
            d = ImageDraw.Draw(full)
            for b in boxes:
                d.rectangle(b, fill="white")
        full.thumbnail((1800, 1800))
        full.save(os.path.join(PUB, "full", f"{slug}.webp"), quality=82, method=6)
        thumb = full.copy()
        thumb.thumbnail((640, 640))
        thumb.save(os.path.join(PUB, "thumbs", f"{slug}.webp"), quality=78, method=6)

        doc_url = None
        if not boxes:
            ext = os.path.splitext(name)[1].lower()
            dest = os.path.join(PUB, "files", f"{slug}{ext}")
            if ext == ".pdf" and len(data) > MAX_PDF:
                # a 40 MB scan is not a web document: republish the page as a compact PDF
                pdf = fitz.open()
                img_path = os.path.join(PUB, "full", f"{slug}.webp")
                src = fitz.open(path)[0]
                page = pdf.new_page(width=src.rect.width, height=src.rect.height)
                jpg = full.convert("RGB")
                tmp = dest + ".jpg"
                jpg.save(tmp, quality=85)
                page.insert_image(page.rect, filename=tmp)
                os.remove(tmp)
                pdf.save(dest, garbage=4, deflate=True)
            else:
                open(dest, "wb").write(data)
            doc_url = f"/certificates/files/{slug}{ext}"

        items.append({
            "file": name,
            "slug": slug,
            "sha256": digest[:16],
            "thumb": f"/certificates/thumbs/{slug}.webp",
            "full": f"/certificates/full/{slug}.webp",
            "width": full.width,
            "height": full.height,
            "document": doc_url,
            "redacted": bool(boxes),
        })
        print(f"ok: {name}{' (redacted)' if boxes else ''}")
    with open(OUT_JSON, "w", encoding="utf8") as f:
        json.dump(items, f, indent=2)
    print(f"{len(items)} certificates -> {OUT_JSON}")


if __name__ == "__main__":
    main()
