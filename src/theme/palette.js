// Every hard-coded color in the customer pages became a CSS variable named
// --c-<hex>.  Light value = the ORIGINAL color (light mode looks exactly as before),
// dark value = what it becomes in dark mode.
//
// Roles:  text #111/#222/#333 -> light text   |  muted #555-#AAA -> softer light text
//         surface #FFF -> dark page          |  soft #F4F2F0.. -> dark panels
//         borders/dividers -> dark borders
export const PALETTE = {
  "--c-111111": ["#111111", "#F5F0EB"],
  "--c-222222": ["#222222", "#F5F0EB"],
  "--c-333333": ["#333333", "#E6DFD8"],
  "--c-444444": ["#444444", "#E6DFD8"],
  "--c-555555": ["#555555", "#C9BEB4"],
  "--c-666666": ["#666666", "#BDB1A7"],
  "--c-6b6b6b": ["#6B6B6B", "#BDB1A7"],
  "--c-777777": ["#777777", "#B8AAA0"],
  "--c-888888": ["#888888", "#B8AAA0"],
  "--c-8a8a8a": ["#8A8A8A", "#B8AAA0"],
  "--c-999999": ["#999999", "#A39588"],
  "--c-9a9a9a": ["#9A9A9A", "#A39588"],
  "--c-aaaaaa": ["#AAAAAA", "#A39588"],
  "--c-cccccc": ["#CCCCCC", "#554940"],
  "--c-d6cfc8": ["#D6CFC8", "#554940"],
  "--c-d8cfc6": ["#D8CFC6", "#554940"],
  "--c-d9d2ca": ["#D9D2CA", "#554940"],
  "--c-d9d4cf": ["#D9D4CF", "#554940"],
  "--c-d9d9d9": ["#D9D9D9", "#554940"],
  "--c-d9dadb": ["#D9DADB", "#554940"],
  "--c-dddddd": ["#DDDDDD", "#554940"],
  "--c-dedbd5": ["#DEDBD5", "#403832"],
  "--c-e2e2e2": ["#E2E2E2", "#403832"],
  "--c-e4e4e4": ["#E4E4E4", "#403832"],
  "--c-e4e4e8": ["#E4E4E8", "#403832"],
  "--c-e5e0db": ["#E5E0DB", "#403832"],
  "--c-e5e5e5": ["#E5E5E5", "#403832"],
  "--c-e8e0d6": ["#E8E0D6", "#403832"],
  "--c-eeeeee": ["#EEEEEE", "#403832"],
  "--c-f4f2f0": ["#F4F2F0", "#292421"],
  "--c-f4f3f1": ["#F4F3F1", "#292421"],
  "--c-f5ede6": ["#F5EDE6", "#292421"],
  "--c-f6f4f2": ["#F6F4F2", "#292421"],
  "--c-f8f8f8": ["#F8F8F8", "#332D28"],
  "--c-f8f9fb": ["#F8F9FB", "#332D28"],
  "--c-fbf8f5": ["#FBF8F5", "#332D28"],
  "--c-ffffff": ["#FFFFFF", "#1C1917"]
};

export const DARK_PAGE = "#1C1917";
