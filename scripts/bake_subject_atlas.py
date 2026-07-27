from __future__ import annotations

import argparse
import base64
import contextlib
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright

FRAMES = 40
COLS = 8
ROWS = 5

BAKE_JS = r"""
async ({ videoUrl, maskUrl, mode, frames, cols, rows, tileWidth, tileHeight,
         posterWidth, posterHeight, quality }) => {
  const waitFor = (target, event) =>
    new Promise((resolve, reject) => {
      const onError = () => reject(new Error(`Failed while waiting for ${event}`));
      target.addEventListener(event, resolve, { once: true });
      target.addEventListener('error', onError, { once: true });
    });

  const mask = new Image();
  mask.src = maskUrl;
  await waitFor(mask, 'load');

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = videoUrl;
  document.body.appendChild(video);
  await waitFor(video, 'loadedmetadata');

  const seek = async (time) => {
    const safeTime = Math.min(Math.max(time, 0), Math.max(video.duration - 0.002, 0));
    if (Math.abs(video.currentTime - safeTime) < 0.0005 && video.readyState >= 2) {
      return;
    }
    const done = waitFor(video, 'seeked');
    video.currentTime = safeTime;
    await done;
  };

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = tileWidth;
  sourceCanvas.height = tileHeight;
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = tileWidth;
  maskCanvas.height = tileHeight;
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
  maskContext.imageSmoothingEnabled = true;
  maskContext.imageSmoothingQuality = 'high';

  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = tileWidth * cols;
  atlasCanvas.height = tileHeight * rows;
  const atlasContext = atlasCanvas.getContext('2d');
  const maskTileWidth = mask.naturalWidth / cols;
  const maskTileHeight = mask.naturalHeight / rows;
  const sqrt3 = Math.sqrt(3);

  const bakeFrame = (frameIndex, width, height) => {
    if (sourceCanvas.width !== width || sourceCanvas.height !== height) {
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;
      maskContext.imageSmoothingEnabled = true;
      maskContext.imageSmoothingQuality = 'high';
    }

    sourceContext.clearRect(0, 0, width, height);
    sourceContext.drawImage(video, 0, 0, width, height);

    const column = frameIndex % cols;
    const row = Math.floor(frameIndex / cols);
    maskContext.clearRect(0, 0, width, height);
    maskContext.drawImage(
      mask,
      column * maskTileWidth,
      row * maskTileHeight,
      maskTileWidth,
      maskTileHeight,
      0,
      0,
      width,
      height,
    );

    const source = sourceContext.getImageData(0, 0, width, height);
    const matte = maskContext.getImageData(0, 0, width, height);
    const output = sourceContext.createImageData(width, height);

    for (let offset = 0; offset < source.data.length; offset += 4) {
      const sourceRed = source.data[offset] / 255;
      const sourceGreen = source.data[offset + 1] / 255;
      const sourceBlue = source.data[offset + 2] / 255;
      let alpha;
      let red;
      let green;
      let blue;

      if (mode === 'dark') {
        alpha = matte.data[offset] / 255;
        const backgroundLevel = matte.data[offset + 1] / 255;
        if (alpha < 0.006) {
          alpha = 0;
          red = 0;
          green = 0;
          blue = 0;
        } else {
          const denominator = Math.max(alpha, 0.025);
          red = Math.max(
            sourceRed - (1 - alpha) * backgroundLevel * 1.96,
            0,
          ) / denominator;
          green = Math.max(
            sourceGreen - (1 - alpha) * backgroundLevel * 0.44,
            0,
          ) / denominator;
          blue = Math.max(
            sourceBlue - (1 - alpha) * backgroundLevel * 1.36,
            0,
          ) / denominator;
        }
      } else {
        const deltaRed = sourceRed - 0.945;
        const deltaGreen = sourceGreen - 0.941;
        const deltaBlue = sourceBlue - 0.976;
        const distance = Math.sqrt(
          deltaRed * deltaRed +
          deltaGreen * deltaGreen +
          deltaBlue * deltaBlue,
        ) / sqrt3;
        const normalized = Math.min(Math.max((distance - 0.05) / 0.09, 0), 1);
        const keyedAlpha = normalized * normalized * (3 - 2 * normalized);
        alpha = Math.max(keyedAlpha, matte.data[offset] / 255);
        red = sourceRed;
        green = sourceGreen;
        blue = sourceBlue;
      }

      output.data[offset] = Math.round(Math.min(Math.max(red, 0), 1) * 255);
      output.data[offset + 1] = Math.round(Math.min(Math.max(green, 0), 1) * 255);
      output.data[offset + 2] = Math.round(Math.min(Math.max(blue, 0), 1) * 255);
      output.data[offset + 3] = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
    }

    return output;
  };

  const posterFrame = Math.floor((frames - 1) / 2);
  let posterUrl = '';

  for (let frameIndex = 0; frameIndex < frames; frameIndex += 1) {
    const time = (frameIndex / Math.max(frames - 1, 1)) * video.duration;
    await seek(time);
    const frame = bakeFrame(frameIndex, tileWidth, tileHeight);
    atlasContext.putImageData(
      frame,
      (frameIndex % cols) * tileWidth,
      Math.floor(frameIndex / cols) * tileHeight,
    );

    if (frameIndex === posterFrame) {
      const posterFrameData = bakeFrame(frameIndex, posterWidth, posterHeight);
      const posterCanvas = document.createElement('canvas');
      posterCanvas.width = posterWidth;
      posterCanvas.height = posterHeight;
      posterCanvas.getContext('2d').putImageData(posterFrameData, 0, 0);
      posterUrl = posterCanvas.toDataURL('image/webp', Math.min(quality + 0.06, 0.94));
    }
  }

  return {
    atlasUrl: atlasCanvas.toDataURL('image/webp', quality),
    posterUrl,
    duration: video.duration,
    source: [video.videoWidth, video.videoHeight],
    mask: [mask.naturalWidth, mask.naturalHeight],
    atlas: [atlasCanvas.width, atlasCanvas.height],
  };
}
"""


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return


def decode_data_url(value: str) -> bytes:
    prefix, encoded = value.split(",", 1)
    if ";base64" not in prefix:
        raise ValueError("Expected a base64 data URL")
    return base64.b64decode(encoded)


def bake(
    source_dir: Path,
    public_dir: Path,
    mode: str,
    tile_width: int,
    tile_height: int,
    poster_width: int,
    poster_height: int,
    quality: float,
) -> None:
    video_name = "portrait-scrub-dark.mp4" if mode == "dark" else "portrait-scrub.mp4"
    mask_name = (
        "subject-mask-dark-atlas.png"
        if mode == "dark"
        else "subject-mask-light-atlas.png"
    )
    atlas_path = public_dir / f"subject-{mode}-frames.webp"
    poster_path = public_dir / f"subject-{mode}-poster.webp"

    handler = partial(QuietHandler, directory=str(source_dir))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            page.goto(f"{base_url}/", wait_until="domcontentloaded")
            result = page.evaluate(
                BAKE_JS,
                {
                    "videoUrl": f"{base_url}/{video_name}",
                    "maskUrl": f"{base_url}/{mask_name}",
                    "mode": mode,
                    "frames": FRAMES,
                    "cols": COLS,
                    "rows": ROWS,
                    "tileWidth": tile_width,
                    "tileHeight": tile_height,
                    "posterWidth": poster_width,
                    "posterHeight": poster_height,
                    "quality": quality,
                },
            )
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)

    atlas_path.write_bytes(decode_data_url(result.pop("atlasUrl")))
    poster_path.write_bytes(decode_data_url(result.pop("posterUrl")))
    print(
        f"{mode}: source={result['source']} mask={result['mask']} "
        f"atlas={result['atlas']} duration={result['duration']:.3f}s "
        f"atlas_bytes={atlas_path.stat().st_size} "
        f"poster_bytes={poster_path.stat().st_size}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Bake keyed hero subjects into transparent WebP frame atlases."
    )
    parser.add_argument(
        "--mode",
        choices=("light", "dark", "all"),
        default="all",
    )
    parser.add_argument("--tile-width", type=int, default=960)
    parser.add_argument("--tile-height", type=int, default=540)
    parser.add_argument("--poster-width", type=int, default=960)
    parser.add_argument("--poster-height", type=int, default=540)
    parser.add_argument("--quality", type=float, default=0.86)
    args = parser.parse_args()

    project_dir = Path(__file__).resolve().parent.parent
    source_dir = project_dir / "assets" / "hero-source"
    public_dir = project_dir / "public"
    modes = ("light", "dark") if args.mode == "all" else (args.mode,)
    for mode in modes:
        bake(
            source_dir,
            public_dir,
            mode,
            args.tile_width,
            args.tile_height,
            args.poster_width,
            args.poster_height,
            args.quality,
        )


if __name__ == "__main__":
    main()
