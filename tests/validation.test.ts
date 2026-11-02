import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/seo/slug";
import {
  buildDetailsSchema,
  buildEmailSchema,
  buildProfileSchema,
  emptyProfileInput,
  normalizeSocialUrl,
  type ProfileFormInput,
  type ValidationT,
} from "@/lib/validation/profile";

// Translator stub: returns the key (tests assert on success/failure, not copy).
const t: ValidationT = (key) => key;

const validProfile: ProfileFormInput = {
  ...emptyProfileInput,
  displayName: "Ana García",
  cityId: 3,
  bio: "Certified personal trainer with 8 years of experience in strength training.",
  categoryIds: ["1", "2"],
  modalityIds: ["4"],
  instagramUrl: "@ana.fits",
  rateMin: "30",
  rateMax: "80",
};

describe("buildProfileSchema", () => {
  it("accepts a complete wizard submission and normalizes it", () => {
    const parsed = buildProfileSchema(t).safeParse(validProfile);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.categoryIds).toEqual([1, 2]);
    expect(parsed.data.modalityIds).toEqual([4]);
    expect(parsed.data.instagramUrl).toBe("https://www.instagram.com/ana.fits");
    expect(parsed.data.rateMin).toBe(30);
    expect(parsed.data.rateMax).toBe(80);
  });

  it("rejects a profile with no social link or website", () => {
    const parsed = buildProfileSchema(t).safeParse({ ...validProfile, instagramUrl: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues.some((i) => i.path[0] === "instagramUrl")).toBe(true);
  });

  it("passes with only a website as the public link", () => {
    const parsed = buildProfileSchema(t).safeParse({
      ...validProfile,
      instagramUrl: "",
      websiteUrl: "anafit.example.com",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.websiteUrl).toBe("https://anafit.example.com/");
  });

  it("rejects rateMin above rateMax", () => {
    const parsed = buildProfileSchema(t).safeParse({
      ...validProfile,
      rateMin: "90",
      rateMax: "50",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues.some((i) => i.path[0] === "rateMax")).toBe(true);
  });

  it("rejects a bio under 40 characters", () => {
    expect(buildProfileSchema(t).safeParse({ ...validProfile, bio: "Too short." }).success).toBe(
      false,
    );
  });

  it("requires a custom location when no city is picked", () => {
    expect(
      buildProfileSchema(t).safeParse({ ...validProfile, cityId: 0, customLocation: "" }).success,
    ).toBe(false);
    expect(
      buildProfileSchema(t).safeParse({
        ...validProfile,
        cityId: 0,
        customLocation: "Smalltown",
      }).success,
    ).toBe(true);
  });

  it("drops invalid taxonomy ids instead of failing", () => {
    const parsed = buildProfileSchema(t).safeParse({
      ...validProfile,
      categoryIds: ["1", "abc", "-2"],
      specialtyIds: ["9", "0", "nope"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.categoryIds).toEqual([1]);
      expect(parsed.data.specialtyIds).toEqual([9]);
    }
  });

  it("normalizes phone numbers by stripping spaces, parens and dashes", () => {
    const parsed = buildProfileSchema(t).safeParse({
      ...validProfile,
      whatsapp: "+34 612 345 678",
      phone: "(612) 345-678",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.whatsapp).toBe("+34612345678");
      expect(parsed.data.phone).toBe("612345678");
    }
  });

  it("rejects garbage phone numbers", () => {
    expect(buildProfileSchema(t).safeParse({ ...validProfile, whatsapp: "call me" }).success).toBe(
      false,
    );
  });
});

describe("buildEmailSchema", () => {
  it("trims and lowercases valid emails", () => {
    const parsed = buildEmailSchema(t).safeParse("  Ana@Test.COM ");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("ana@test.com");
  });

  it.each(["", "nope", "a@b", "@x.com"])("rejects %j", (email) => {
    expect(buildEmailSchema(t).safeParse(email).success).toBe(false);
  });
});

describe("normalizeSocialUrl", () => {
  it("turns @handles into canonical URLs", () => {
    expect(normalizeSocialUrl("instagram", "@ana.fits")).toBe("https://www.instagram.com/ana.fits");
    expect(normalizeSocialUrl("tiktok", "ana.fits")).toBe("https://www.tiktok.com/@ana.fits");
  });

  it("upgrades bare domains to https", () => {
    expect(normalizeSocialUrl("instagram", "instagram.com/ana.fits")).toBe(
      "https://instagram.com/ana.fits",
    );
  });

  it("rejects handles on the wrong network", () => {
    expect(normalizeSocialUrl("instagram", "https://twitter.com/ana")).toBeUndefined();
    expect(normalizeSocialUrl("tiktok", "https://instagram.com/ana")).toBeUndefined();
  });

  it("returns null for empty input", () => {
    expect(normalizeSocialUrl("instagram", "   ")).toBeNull();
  });
});

describe("buildDetailsSchema", () => {
  it("dedupes languages case-insensitively", () => {
    const parsed = buildDetailsSchema(t).safeParse({
      sessionTypeIds: ["1"],
      amenityIds: [],
      languages: ["English", " english ", "Español"],
      education: [{ degree: "BSc Sports Science", institution: "", year: "2018" }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.languages).toEqual(["English", "Español"]);
  });

  it("rejects education years out of range", () => {
    const parsed = buildDetailsSchema(t).safeParse({
      sessionTypeIds: [],
      amenityIds: [],
      languages: [],
      education: [{ degree: "BSc", institution: "", year: "1899" }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("slugify", () => {
  it("strips accents and produces url-safe slugs", () => {
    expect(slugify("Ana García López")).toBe("ana-garcia-lopez");
    expect(slugify("  João! Personal—Trainer  ")).toBe("joao-personal-trainer");
  });

  it("returns empty string for names with no latin chars", () => {
    expect(slugify("")).toBe("");
    expect(slugify("---")).toBe("");
  });
});
