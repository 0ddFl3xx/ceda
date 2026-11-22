import { describe, expect, it } from "vitest";
import { sanitizeSlugInput, toUrlSlug } from "./slugify";

describe("slugify helpers", () => {
  it("turns call titles with spaces, punctuation, and accents into clean URL slugs", () => {
    expect(toUrlSlug("Youth Innovation & Agritech Challenge 2027!")).toBe(
      "youth-innovation-and-agritech-challenge-2027",
    );
    expect(toUrlSlug("  Café   Entrepreneurs'   Fund  ")).toBe(
      "cafe-entrepreneurs-fund",
    );
  });

  it("caps slug length without leaving trailing hyphens", () => {
    const slug = toUrlSlug("a".repeat(119) + " extra words", 120);
    expect(slug.length).toBeLessThanOrEqual(120);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("replaces spaces with hyphens while typing without stripping trailing hyphen mid-word", () => {
    expect(sanitizeSlugInput("Youth Innovation ")).toBe("youth-innovation-");
    expect(sanitizeSlugInput("youth---2027!!")).toBe("youth-2027");
  });
});
