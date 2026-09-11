import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { ComposerBanner } from "./ComposerBanner";

describe("ComposerBanner.Surface", () => {
  it("casts attached drawer shadows away from the composer seam", () => {
    const markup = renderToStaticMarkup(<ComposerBanner.Surface />);

    expect(markup).toContain("before:shadow-[0_-8px_24px_-18px_rgb(0_0_0/45%)]");
    expect(markup).not.toContain("before:shadow-[0_12px_28px_-18px_rgb(0_0_0/40%)]");
  });

  it("keeps the downward shadow on floating surfaces", () => {
    const markup = renderToStaticMarkup(<ComposerBanner.Surface placement="floating" />);

    expect(markup).toContain("before:shadow-[0_12px_28px_-18px_rgb(0_0_0/40%)]");
  });
});
